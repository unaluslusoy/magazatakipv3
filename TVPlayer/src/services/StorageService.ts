import { MMKV } from 'react-native-mmkv';
import { STORAGE_KEYS } from '@config/constants';
import type { Device, Playlist, Content, Schedule, AuthToken, SyncStatus } from '@types/index';

// MMKV Storage Instance (Ultra Fast)
export const storage = new MMKV({
  id: 'magaza-tv-storage',
  encryptionKey: 'magaza-panel-2025-secure-key',
});

/**
 * Storage Service
 * Ultra-fast offline storage using MMKV
 */
class StorageService {
  // Auth
  async saveAuthToken(token: AuthToken): Promise<void> {
    storage.set(STORAGE_KEYS.AUTH_TOKEN, JSON.stringify(token));
  }

  async getAuthToken(): Promise<AuthToken | null> {
    const data = storage.getString(STORAGE_KEYS.AUTH_TOKEN);
    return data ? JSON.parse(data) : null;
  }

  async clearAuthToken(): Promise<void> {
    storage.delete(STORAGE_KEYS.AUTH_TOKEN);
  }

  // Device Info
  async saveDeviceInfo(device: Device): Promise<void> {
    storage.set(STORAGE_KEYS.DEVICE_INFO, JSON.stringify(device));
  }

  async getDeviceInfo(): Promise<Device | null> {
    const data = storage.getString(STORAGE_KEYS.DEVICE_INFO);
    return data ? JSON.parse(data) : null;
  }

  // Playlists
  async savePlaylists(playlists: Playlist[]): Promise<void> {
    storage.set(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
  }

  async getPlaylists(): Promise<Playlist[]> {
    const data = storage.getString(STORAGE_KEYS.PLAYLISTS);
    return data ? JSON.parse(data) : [];
  }

  async getPlaylistById(id: number): Promise<Playlist | null> {
    const playlists = await this.getPlaylists();
    return playlists.find(p => p.id === id) || null;
  }

  // Contents
  async saveContents(contents: Content[]): Promise<void> {
    storage.set(STORAGE_KEYS.CONTENTS, JSON.stringify(contents));
  }

  async getContents(): Promise<Content[]> {
    const data = storage.getString(STORAGE_KEYS.CONTENTS);
    return data ? JSON.parse(data) : [];
  }

  async getContentById(id: number): Promise<Content | null> {
    const contents = await this.getContents();
    return contents.find(c => c.id === id) || null;
  }

  async updateContentLocalPath(contentId: number, localPath: string): Promise<void> {
    const contents = await this.getContents();
    const updated = contents.map(c =>
      c.id === contentId ? { ...c, local_path: localPath } : c
    );
    await this.saveContents(updated);
  }

  // Schedules
  async saveSchedules(schedules: Schedule[]): Promise<void> {
    storage.set(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
  }

  async getSchedules(): Promise<Schedule[]> {
    const data = storage.getString(STORAGE_KEYS.SCHEDULES);
    return data ? JSON.parse(data) : [];
  }

  // Sync Status
  async saveSyncStatus(status: SyncStatus): Promise<void> {
    storage.set(STORAGE_KEYS.LAST_SYNC, JSON.stringify(status));
  }

  async getSyncStatus(): Promise<SyncStatus | null> {
    const data = storage.getString(STORAGE_KEYS.LAST_SYNC);
    return data ? JSON.parse(data) : null;
  }

  // Offline Queue
  async addToOfflineQueue(action: any): Promise<void> {
    const queue = await this.getOfflineQueue();
    queue.push(action);
    storage.set(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  }

  async getOfflineQueue(): Promise<any[]> {
    const data = storage.getString(STORAGE_KEYS.OFFLINE_QUEUE);
    return data ? JSON.parse(data) : [];
  }

  async clearOfflineQueue(): Promise<void> {
    storage.set(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify([]));
  }

  // Clear All
  async clearAll(): Promise<void> {
    storage.clearAll();
  }

  // Check if logged in
  async isLoggedIn(): Promise<boolean> {
    const token = await this.getAuthToken();
    if (!token) return false;
    
    // Check if token expired
    const expiresAt = new Date(token.expires_at);
    return expiresAt > new Date();
  }
}

export default new StorageService();
