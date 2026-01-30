import RNFS from 'react-native-fs';
import { CACHE_CONFIG } from '@config/constants';
import StorageService from './StorageService';
import type { Content, DownloadProgress } from '@types/index';

// İndirme durumu callback tipi
type DownloadCallback = (info: {
  totalFiles: number;
  completedFiles: number;
  currentFile: string;
  overallProgress: number;
  isDownloading: boolean;
}) => void;

/**
 * Download Manager
 * Media file downloads and caching
 */
class DownloadManager {
  private downloadQueue: Map<number, DownloadProgress> = new Map();
  private activeDownloads: number = 0;
  private maxConcurrentDownloads = 3;

  // İndirme durumu callback'leri
  private progressCallbacks: Set<DownloadCallback> = new Set();
  private totalFilesToDownload = 0;
  private completedDownloads = 0;
  private currentFileName = '';

  private get cachePath(): string {
    return `${RNFS.DocumentDirectoryPath}/${CACHE_CONFIG.DOWNLOAD_PATH}`;
  }

  /**
   * İndirme durumu dinleyicisi ekle
   */
  addProgressListener(callback: DownloadCallback): void {
    this.progressCallbacks.add(callback);
  }

  /**
   * İndirme durumu dinleyicisini kaldır
   */
  removeProgressListener(callback: DownloadCallback): void {
    this.progressCallbacks.delete(callback);
  }

  /**
   * Tüm dinleyicilere durum bildir
   */
  private notifyProgress(): void {
    const overallProgress = this.totalFilesToDownload > 0
      ? (this.completedDownloads / this.totalFilesToDownload) * 100
      : 0;

    const info = {
      totalFiles: this.totalFilesToDownload,
      completedFiles: this.completedDownloads,
      currentFile: this.currentFileName,
      overallProgress,
      isDownloading: this.activeDownloads > 0 || this.completedDownloads < this.totalFilesToDownload,
    };

    this.progressCallbacks.forEach(cb => {
      try { cb(info); } catch (e) { /* ignore */ }
    });
  }

  async initialize(): Promise<void> {
    try {
      // Create cache directory
      const exists = await RNFS.exists(this.cachePath);
      if (!exists) {
        await RNFS.mkdir(this.cachePath);
        console.log('Önbellek dizini oluşturuldu:', this.cachePath);
      } else {
        console.log('Önbellek dizini mevcut:', this.cachePath);
      }

      // Önbellekteki dosyaları kontrol et ve Storage'ı güncelle
      await this.syncCacheWithStorage();

      // Clean old cache (30 günden eski dosyaları sil)
      await this.cleanCache();
    } catch (error) {
      console.error('DownloadManager başlatma hatası:', error);
      // Hata olsa bile devam et
    }
  }

  /**
   * Önbellekteki dosyaları Storage ile senkronize et
   */
  async syncCacheWithStorage(): Promise<void> {
    try {
      const cacheFiles = await RNFS.readDir(this.cachePath);
      const storedContents = await StorageService.getContents();

      console.log(`Önbellekte ${cacheFiles.length} dosya bulundu`);

      let updatedCount = 0;

      for (const content of storedContents) {
        // Dosya adını oluştur
        const fileName = this.getFileName(content);
        const localPath = `${this.cachePath}/${fileName}`;

        // Önbellekte var mı kontrol et
        const fileExists = cacheFiles.some(f => f.path === localPath || f.name === fileName);

        if (fileExists && !content.local_path) {
          // Storage'ı güncelle
          await StorageService.updateContentLocalPath(content.id, localPath);
          updatedCount++;
        }
      }

      if (updatedCount > 0) {
        console.log(`${updatedCount} içerik önbellekten güncellendi`);
      }
    } catch (error) {
      console.log('Önbellek senkronizasyonu hatası:', error);
    }
  }

  /**
   * Download content file
   */
  async downloadContent(content: Content): Promise<string> {
    const fileUrl = content.file_url || content.url;
    if (!fileUrl) {
      throw new Error('Content has no file URL');
    }

    // Cache dizininin var olduğundan emin ol
    try {
      const cacheExists = await RNFS.exists(this.cachePath);
      if (!cacheExists) {
        await RNFS.mkdir(this.cachePath);
        console.log('Cache dizini oluşturuldu:', this.cachePath);
      }
    } catch (mkdirError) {
      console.error('Cache dizini oluşturulamadı:', mkdirError);
    }

    const fileName = this.getFileName(content);
    const localPath = `${this.cachePath}/${fileName}`;
    const expectedSize = Number((content as any).file_size || 0);

    // Önce önbellekte var mı kontrol et
    try {
      const cacheExists = await RNFS.exists(localPath);
      if (cacheExists) {
        if (expectedSize > 0) {
          const stat = await RNFS.stat(localPath);
          const actualSize = Number(stat.size || 0);
          if (actualSize + 1024 < expectedSize) {
            console.log('Önbellek dosyası eksik, yeniden indirilecek:', { expectedSize, actualSize, fileName });
            await RNFS.unlink(localPath);
          } else {
            console.log('Önbellekten yükleniyor:', fileName);
            await StorageService.updateContentLocalPath(content.id, localPath);
            return localPath;
          }
        } else {
          console.log('Önbellekten yükleniyor:', fileName);
          await StorageService.updateContentLocalPath(content.id, localPath);
          return localPath;
        }
      }
    } catch (e) {
      // Önbellek kontrolü başarısız, indirmeye devam et
    }

    // Check if already downloaded (local_path varsa)
    if (content.local_path) {
      try {
        const exists = await RNFS.exists(content.local_path);
        if (exists) {
          if (expectedSize > 0) {
            const stat = await RNFS.stat(content.local_path);
            const actualSize = Number(stat.size || 0);
            if (actualSize + 1024 < expectedSize) {
              console.log('Local dosya eksik, yeniden indirilecek:', { expectedSize, actualSize, fileName });
              await RNFS.unlink(content.local_path);
            } else {
              console.log('Zaten indirilmiş:', content.local_path);
              return content.local_path;
            }
          } else {
            console.log('Zaten indirilmiş:', content.local_path);
            return content.local_path;
          }
        }
      } catch (e) {
        // Dosya kontrolü başarısız, indirmeye devam et
      }
    }


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
      file_url: fileUrl,
      progress: 0,
      status: 'pending',
    });

    return this.processDownload(content, localPath, fileUrl);
  }

  private async processDownload(content: Content, localPath: string, fromUrl: string, retryCount = 0): Promise<string> {
    // Wait for available slot
    while (this.activeDownloads >= this.maxConcurrentDownloads) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.activeDownloads++;
    const progress = this.downloadQueue.get(content.id)!;
    progress.status = 'downloading';

    const fileName = content.title || content.name || `Dosya ${content.id}`;
    let expectedFromDownload = 0;
    const maxRetries = 3;

    try {
      console.log(`[DownloadManager] İndirme başlıyor: ${fileName} (deneme ${retryCount + 1}/${maxRetries})`);

      const downloadResult = await RNFS.downloadFile({
        fromUrl,
        toFile: localPath,
        progressDivider: 5,
        connectionTimeout: 30000,
        readTimeout: 60000,
        begin: (res) => {
          expectedFromDownload = res.contentLength || 0;
          console.log(`[DownloadManager] ${fileName}: ${Math.round(expectedFromDownload / 1024)} KB`);
          this.currentFileName = fileName;
          this.notifyProgress();
        },
        progress: res => {
          if (res.contentLength > 0) {
            expectedFromDownload = res.contentLength;
          }
          const percent = res.contentLength > 0
            ? (res.bytesWritten / res.contentLength) * 100
            : 0;
          progress.progress = percent;
          this.downloadQueue.set(content.id, progress);
        },
      }).promise;

      // İndirme sonucu kontrolü
      if (downloadResult.statusCode !== 200) {
        throw new Error(`HTTP ${downloadResult.statusCode}`);
      }

      // Dosya boyut doğrulaması
      const stat = await RNFS.stat(localPath);
      const actualSize = Number(stat.size || 0);
      const expectedSize = Number((content as any).file_size || 0) || expectedFromDownload;

      console.log(`[DownloadManager] ${fileName}: indirilen=${actualSize}, beklenen=${expectedSize}`);

      // Dosya çok küçükse veya beklenen boyutun %90'ından azsa hatalı
      if (actualSize < 1000) {
        throw new Error('Dosya çok küçük, indirme başarısız');
      }

      if (expectedSize > 0 && actualSize < expectedSize * 0.9) {
        console.log(`[DownloadManager] ${fileName}: Eksik indirme tespit edildi`);
        await RNFS.unlink(localPath).catch(() => {});

        if (retryCount < maxRetries - 1) {
          this.activeDownloads--;
          return this.processDownload(content, localPath, fromUrl, retryCount + 1);
        }
        throw new Error('İndirme tamamlanamadı (boyut uyuşmuyor)');
      }

      // Update storage
      await StorageService.updateContentLocalPath(content.id, localPath);

      progress.status = 'completed';
      progress.local_path = localPath;
      progress.progress = 100;

      console.log(`[DownloadManager] ✓ ${fileName} tamamlandı (${Math.round(actualSize / 1024)} KB)`);
      return localPath;

    } catch (error: any) {
      console.error(`[DownloadManager] ✗ ${fileName} hatası:`, error?.message || error);

      // Yeniden dene
      if (retryCount < maxRetries - 1) {
        console.log(`[DownloadManager] ${fileName}: Yeniden deneniyor...`);
        this.activeDownloads--;
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 saniye bekle
        return this.processDownload(content, localPath, fromUrl, retryCount + 1);
      }

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
    const toDownload = contents.filter(c => (c.file_url || c.url) && !c.local_path);

    if (toDownload.length === 0) {
      console.log('Tüm içerikler zaten indirilmiş');
      return;
    }

    // İndirme durumunu başlat
    this.totalFilesToDownload = toDownload.length;
    this.completedDownloads = 0;
    this.notifyProgress();

    console.log(`${toDownload.length} dosya indiriliyor...`);

    const downloads = toDownload.map(async (c) => {
      try {
        // file_url veya url kullan
        const contentWithUrl = { ...c, file_url: c.file_url || c.url };
        this.currentFileName = c.title || c.name || `Dosya ${c.id}`;
        this.notifyProgress();

        await this.downloadContent(contentWithUrl);

        this.completedDownloads++;
        this.notifyProgress();
      } catch (err) {
        console.error(`İndirme hatası (${c.title || c.name}):`, err);
        this.completedDownloads++;
        this.notifyProgress();
      }
    });

    await Promise.all(downloads);

    // İndirme tamamlandı
    this.currentFileName = '';
    this.notifyProgress();
    console.log('Tüm indirmeler tamamlandı');
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
    const url = content.file_url || content.url || '';

    // URL'den dosya uzantısını çıkar
    let ext = 'bin'; // varsayılan

    try {
      // URL'den path kısmını al
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      // Son segment'i al
      const segments = pathname.split('/').filter(s => s);
      const lastSegment = segments[segments.length - 1] || '';

      // Uzantı var mı kontrol et (. içermeli ve 2-5 karakter olmalı)
      if (lastSegment.includes('.')) {
        const possibleExt = lastSegment.split('.').pop()?.toLowerCase() || '';
        if (possibleExt.length >= 2 && possibleExt.length <= 5 && /^[a-z0-9]+$/.test(possibleExt)) {
          ext = possibleExt;
        }
      }
    } catch (e) {
      // URL parse hatası, content type'a göre uzantı belirle
      console.log('URL parse hatası, content type kullanılıyor:', content.type);
    }

    // Content type'a göre varsayılan uzantı
    if (ext === 'bin') {
      switch (content.type) {
        case 'image':
          ext = 'jpg';
          break;
        case 'video':
          ext = 'mp4';
          break;
        default:
          ext = 'bin';
      }
    }

    // Tutarlı dosya adı (content.id ile) - alt klasör yok, düz dosya
    return `content_${content.id}.${ext}`;
  }

  async forceDownloadContent(content: Content): Promise<string> {
    const fileName = this.getFileName(content);
    const localPath = `${this.cachePath}/${fileName}`;

    try {
      const exists = await RNFS.exists(localPath);
      if (exists) {
        await RNFS.unlink(localPath);
      }
    } catch {
      // ignore delete errors
    }

    try {
      await StorageService.updateContentLocalPath(content.id, '');
    } catch {
      // ignore storage errors
    }

    return this.downloadContent({ ...content, local_path: undefined });
  }
}

export default new DownloadManager();
