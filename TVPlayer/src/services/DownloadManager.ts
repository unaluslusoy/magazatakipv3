import RNFS from 'react-native-fs';
import { CACHE_CONFIG } from '@config/constants';
import StorageService from './StorageService';
import type { Content, DownloadProgress } from '@types/index';

/**
 * Download Manager
 * Media file downloads and caching
 */
class DownloadManager {
  private downloadQueue: Map<number, DownloadProgress> = new Map();
  private activeDownloads: number = 0;
  private maxConcurrentDownloads = 3;

  private get cachePath(): string {
    return `${RNFS.DocumentDirectoryPath}/${CACHE_CONFIG.DOWNLOAD_PATH}`;
  }

  async initialize(): Promise<void> {
    // Create cache directory
    const exists = await RNFS.exists(this.cachePath);
    if (!exists) {
      await RNFS.mkdir(this.cachePath);
    }

    // Clean old cache
    await this.cleanCache();
  }

  /**
   * Download content file
   */
  async downloadContent(content: Content): Promise<string> {
    if (!content.file_url) {
      throw new Error('Content has no file URL');
    }

    // Check if already downloaded
    if (content.local_path) {
      const exists = await RNFS.exists(content.local_path);
      if (exists) {
        return content.local_path;
      }
    }

    const fileName = this.getFileName(content);
    const localPath = `${this.cachePath}/${fileName}`;

    // Check queue
    if (this.downloadQueue.has(content.id)) {
      const progress = this.downloadQueue.get(content.id)!;
      if (progress.status === 'completed') {
        return localPath;
      }
      if (progress.status === 'downloading') {
        return this.waitForDownload(content.id);
      }
    }

    // Add to queue
    this.downloadQueue.set(content.id, {
      content_id: content.id,
      file_url: content.file_url,
      progress: 0,
      status: 'pending',
    });

    return this.processDownload(content, localPath);
  }

  private async processDownload(content: Content, localPath: string): Promise<string> {
    // Wait for available slot
    while (this.activeDownloads >= this.maxConcurrentDownloads) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.activeDownloads++;
    const progress = this.downloadQueue.get(content.id)!;
    progress.status = 'downloading';

    try {
      await RNFS.downloadFile({
        fromUrl: content.file_url!,
        toFile: localPath,
        progressDivider: 10,
        begin: () => {
          console.log('Download started:', content.title);
        },
        progress: res => {
          const percent = (res.bytesWritten / res.contentLength) * 100;
          progress.progress = percent;
          this.downloadQueue.set(content.id, progress);
        },
      }).promise;

      // Update storage
      await StorageService.updateContentLocalPath(content.id, localPath);

      progress.status = 'completed';
      progress.local_path = localPath;
      progress.progress = 100;

      console.log('Download completed:', content.title);
      return localPath;
    } catch (error: any) {
      progress.status = 'failed';
      progress.error = error.message;
      throw error;
    } finally {
      this.activeDownloads--;
    }
  }

  private async waitForDownload(contentId: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        const progress = this.downloadQueue.get(contentId);
        if (!progress) {
          clearInterval(interval);
          reject(new Error('Download cancelled'));
          return;
        }

        if (progress.status === 'completed' && progress.local_path) {
          clearInterval(interval);
          resolve(progress.local_path);
        } else if (progress.status === 'failed') {
          clearInterval(interval);
          reject(new Error(progress.error || 'Download failed'));
        }
      }, 500);

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(interval);
        reject(new Error('Download timeout'));
      }, 300000);
    });
  }

  /**
   * Download all playlist contents
   */
  async downloadPlaylistContents(contents: Content[]): Promise<void> {
    const downloads = contents
      .filter(c => c.file_url && !c.local_path)
      .map(c => this.downloadContent(c).catch(err => {
        console.error(`Failed to download ${c.title}:`, err);
      }));

    await Promise.all(downloads);
  }

  /**
   * Get download progress
   */
  getProgress(contentId: number): DownloadProgress | null {
    return this.downloadQueue.get(contentId) || null;
  }

  getAllProgress(): DownloadProgress[] {
    return Array.from(this.downloadQueue.values());
  }

  /**
   * Clean old cache files
   */
  private async cleanCache(): Promise<void> {
    try {
      const files = await RNFS.readDir(this.cachePath);
      const now = Date.now();
      const expiryMs = CACHE_CONFIG.EXPIRY_DAYS * 24 * 60 * 60 * 1000;

      for (const file of files) {
        const fileAge = now - new Date(file.mtime || 0).getTime();
        if (fileAge > expiryMs) {
          await RNFS.unlink(file.path);
          console.log('Deleted old cache file:', file.name);
        }
      }
    } catch (error) {
      console.error('Failed to clean cache:', error);
    }
  }

  /**
   * Get cache size
   */
  async getCacheSize(): Promise<number> {
    try {
      const files = await RNFS.readDir(this.cachePath);
      let totalSize = 0;
      for (const file of files) {
        totalSize += file.size;
      }
      return totalSize / (1024 * 1024); // MB
    } catch {
      return 0;
    }
  }

  /**
   * Clear all cache
   */
  async clearCache(): Promise<void> {
    try {
      await RNFS.unlink(this.cachePath);
      await RNFS.mkdir(this.cachePath);
      this.downloadQueue.clear();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  private getFileName(content: Content): string {
    const ext = content.file_url?.split('.').pop() || 'mp4';
    return `${content.id}_${Date.now()}.${ext}`;
  }
}

export default new DownloadManager();
