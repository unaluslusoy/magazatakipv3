import ApiService from './ApiService';
import StorageService from './StorageService';
import DownloadManager from './DownloadManager';
import { SYNC_CONFIG } from '@config/constants';
import type { SyncStatus, Playlist, Content } from '@types/index';

/**
 * Sync Manager
 * Yeni API ile senkronizasyon yönetimi
 *
 * Akış:
 * 1. Heartbeat gönder -> sync_required kontrolü
 * 2. sync_required ise -> syncPlaylist çağır
 * 3. İçerikleri indir
 * 4. Senkronizasyonu onayla (confirmSync)
 */
class SyncManager {
  private syncInterval: NodeJS.Timeout | null = null;
  private isSyncing = false;
  private currentVersion = 0;
  private playlistVersion = 0;

  /**
   * Auto sync başlat (heartbeat döngüsü)
   */
  startAutoSync(runImmediately = true): void {
    if (this.syncInterval) {
      return;
    }

    console.log('[SyncManager] Auto sync başlatıldı');

    // Her 30 saniyede bir heartbeat gönder
    this.syncInterval = setInterval(() => {
      this.heartbeatAndSync();
    }, 30000); // 30 saniye

    // İlk senkronizasyon
    if (runImmediately) {
      this.sync();
    }
  }

  /**
   * Auto sync durdur
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('[SyncManager] Auto sync durduruldu');
    }
  }

  /**
   * Heartbeat gönder ve gerekirse senkronize et
   */
  async heartbeatAndSync(): Promise<void> {
    try {
      const heartbeatResponse = await ApiService.sendHeartbeat();

      // Bekleyen komutlar varsa işle
      if (heartbeatResponse.pending_commands && heartbeatResponse.pending_commands.length > 0) {
        try {
          const CommandProcessor = require('./CommandProcessor').default;
          await CommandProcessor.processPendingCommands(heartbeatResponse.pending_commands);
        } catch (cmdError) {
          // Komut hatası kritik değil
        }
      }

      // Senkronizasyon gerekli mi?
      if (heartbeatResponse.sync_required) {
        console.log('[SyncManager] Senkronizasyon başlatılıyor...');
        await this.sync();
      }
    } catch (error: any) {
      // Heartbeat hatası kritik değil, sessizce devam et
    }
  }

  /**
   * Manuel senkronizasyon
   */
  async sync(): Promise<SyncStatus> {
    if (this.isSyncing) {
      console.log('[SyncManager] Senkronizasyon zaten devam ediyor');
      const status = await StorageService.getSyncStatus();
      return status || this.getDefaultSyncStatus();
    }

    this.isSyncing = true;
    const startTime = Date.now();

    try {
      console.log('[SyncManager] Senkronizasyon başladı');

      // 1. Bağlantı kontrolü
      const isOnline = await ApiService.healthCheck();
      if (!isOnline) {
        console.log('[SyncManager] Çevrimdışı mod - senkronizasyon atlandı');
        return this.getDefaultSyncStatus();
      }

      // 2. Playlist'i al (sync/playlist endpoint'i)
      let playlist: Playlist | null = null;
      let contents: Content[] = [];
      let syncVersion = 0;

      try {
        const playlistData = await ApiService.syncPlaylist();

        // API yanıtını Playlist tipine dönüştür
        playlist = ApiService.convertToPlaylist(playlistData);
        syncVersion = playlistData.sync_version || 0;

        // İçerikleri çıkar
        if (playlist.contents && playlist.contents.length > 0) {
          contents = playlist.contents.map((pc: any) => {
            const content = pc.content || pc;
            return {
              ...content,
              duration: pc.duration_override || content.duration || content.duration_seconds,
            };
          });
        }

        console.log(`[SyncManager] Playlist alındı: ${playlist.name}, ${contents.length} içerik`);

        // Debug: içerik tiplerini logla
        contents.forEach((c: any) => {
          console.log(`[SyncManager] İçerik: ${c.name} (${c.type}), URL: ${c.file_url || c.url}`);
        });

      } catch (error: any) {
        console.log('[SyncManager] Playlist alınamadı:', error?.message || error);

        // Mevcut playlist'i kullanmayı dene
        try {
          const currentPlaylistData = await ApiService.getCurrentPlaylist();
          playlist = ApiService.convertToPlaylist(currentPlaylistData);

          if (playlist.contents) {
            contents = playlist.contents.map((pc: any) => pc.content || pc);
          }
        } catch {
          console.log('[SyncManager] Mevcut playlist de alınamadı');
        }
      }

      // 3. Storage'a kaydet
      if (playlist) {
        await StorageService.savePlaylists([playlist]);
      }

      if (contents.length > 0) {
        await StorageService.saveContents(contents);
      }

      // 4. İçerikleri indir
      const pendingDownloads = contents.filter((c: any) => {
        const url = c.file_url || c.url;
        return url && !c.local_path;
      });

      if (pendingDownloads.length > 0) {
        console.log(`[SyncManager] ${pendingDownloads.length} dosya indiriliyor...`);
        try {
          await DownloadManager.downloadPlaylistContents(pendingDownloads);
        } catch (downloadError: any) {
          console.log('[SyncManager] İndirme hatası (kritik değil):', downloadError?.message);
        }
      }

      // 5. Senkronizasyonu onayla
      if (playlist && syncVersion > 0) {
        try {
          const confirmResult = await ApiService.confirmSync(syncVersion, playlist.id);
          console.log('[SyncManager] Senkronizasyon onaylandı:', confirmResult.synced_at);
          this.currentVersion = confirmResult.confirmed_version;
        } catch (confirmError: any) {
          console.log('[SyncManager] Onay hatası (kritik değil):', confirmError?.message);
        }
      }

      // 6. Sync status kaydet
      const syncStatus: SyncStatus = {
        last_sync_at: new Date().toISOString(),
        is_syncing: false,
        playlists_count: playlist ? 1 : 0,
        contents_count: contents.length,
        schedules_count: 0,
        pending_downloads: DownloadManager.getAllProgress().filter(p => p.status !== 'completed').length,
      };

      await StorageService.saveSyncStatus(syncStatus);

      const duration = Date.now() - startTime;
      console.log(`[SyncManager] Senkronizasyon tamamlandı (${duration}ms)`);

      return syncStatus;

    } catch (error: any) {
      console.error('[SyncManager] Senkronizasyon hatası:', error);
      const status = await StorageService.getSyncStatus();
      return status || this.getDefaultSyncStatus();
    } finally {
      this.isSyncing = false;
    }
  }


  /**
   * Senkronizasyon durumunu getir
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

