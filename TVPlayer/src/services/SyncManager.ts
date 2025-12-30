import ApiService from './ApiService';
import StorageService from './StorageService';
import DownloadManager from './DownloadManager';
import { SYNC_CONFIG } from '@config/constants';
import type { SyncStatus } from '@types/index';

/**
 * Sync Manager
 * Synchronization between server and local storage
 */
class SyncManager {
  private syncInterval: NodeJS.Timeout | null = null;
  private isSyncing = false;

  /**
   * Start auto sync
   */
  startAutoSync(runImmediately = true): void {
    if (this.syncInterval) {
      return;
    }

    console.log('Auto sync started');
    this.syncInterval = setInterval(() => {
      this.sync();
    }, SYNC_CONFIG.INTERVAL);

    // Initial sync
    if (runImmediately) {
      this.sync();
    }
  }

  /**
   * Stop auto sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Auto sync stopped');
    }
  }

  /**
   * Manual sync
   */
  async sync(): Promise<SyncStatus> {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      const status = await StorageService.getSyncStatus();
      return status || this.getDefaultSyncStatus();
    }

    this.isSyncing = true;
    const startTime = Date.now();

    try {
      console.log('Sync started');

      // Check connection
      const isOnline = await ApiService.healthCheck();
      if (!isOnline) {
        console.log('Offline mode - skipping sync');
        return this.getDefaultSyncStatus();
      }

      // Send heartbeat
      await ApiService.sendHeartbeat();

      // Fetch playlists
      const playlists = await ApiService.getPlaylists();
      await StorageService.savePlaylists(playlists);

      // Fetch contents
      const contents = await ApiService.getContents();
      await StorageService.saveContents(contents);

      // Fetch schedules
      const schedules = await ApiService.getActiveSchedules();
      await StorageService.saveSchedules(schedules);

      // Download new content files
      const pendingDownloads = contents.filter(c => c.file_url && !c.local_path);
      if (pendingDownloads.length > 0) {
        console.log(`Downloading ${pendingDownloads.length} files...`);
        await DownloadManager.downloadPlaylistContents(pendingDownloads);
      }

      // Process offline queue
      await this.processOfflineQueue();

      // Save sync status
      const syncStatus: SyncStatus = {
        last_sync_at: new Date().toISOString(),
        is_syncing: false,
        playlists_count: playlists.length,
        contents_count: contents.length,
        schedules_count: schedules.length,
        pending_downloads: DownloadManager.getAllProgress().filter(p => p.status !== 'completed').length,
      };

      await StorageService.saveSyncStatus(syncStatus);

      const duration = Date.now() - startTime;
      console.log(`Sync completed in ${duration}ms`);

      return syncStatus;
    } catch (error: any) {
      console.error('Sync failed:', error);
      
      // Return last known status
      const status = await StorageService.getSyncStatus();
      return status || this.getDefaultSyncStatus();
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Process offline queue
   */
  private async processOfflineQueue(): Promise<void> {
    const queue = await StorageService.getOfflineQueue();
    if (queue.length === 0) return;

    console.log(`Processing ${queue.length} offline actions`);

    for (const action of queue) {
      try {
        // Process based on action type
        if (action.type === 'log') {
          await ApiService.sendLog(action.data);
        }
        // Add more action types as needed
      } catch (error) {
        console.error('Failed to process offline action:', error);
      }
    }

    // Clear queue after processing
    await StorageService.clearOfflineQueue();
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    const status = await StorageService.getSyncStatus();
    return status || this.getDefaultSyncStatus();
  }

  private getDefaultSyncStatus(): SyncStatus {
    return {
      is_syncing: false,
      playlists_count: 0,
      contents_count: 0,
      schedules_count: 0,
      pending_downloads: 0,
    };
  }
}

export default new SyncManager();
