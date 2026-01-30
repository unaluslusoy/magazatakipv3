import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG, APP_CONFIG } from '@config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LoginCredentials, AuthToken, Playlist, Content, Device } from '@types/index';

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  LOGS_DISABLED_UNTIL: 'logs_disabled_until',
};

// API Response wrapper
type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

// Heartbeat response
interface HeartbeatResponse {
  server_time: string;
  playlist_id: number;
  sync_required: boolean;
  server_version: number;
  playlist_version: number;
  device_version: number;
  pending_commands?: Array<{
    id: number;
    command: string;
    params: Record<string, any>;
    created_at: string;
  }>;
}

// Sync check response
interface SyncCheckResponse {
  has_update: boolean;
  server_version: number;
  playlist_version: number;
  playlist_id: number;
  last_updated_at: string;
  playlist_updated_at: string;
  server_time: string;
}

// Sync status response
interface SyncStatusResponse {
  device_version: number;
  server_version: number;
  is_synced: boolean;
  versions_behind: number;
  last_sync_at: string | null;
  server_last_updated: string;
}

// Playlist response (yeni format)
interface PlaylistResponse {
  playlist: {
    id: number;
    name: string;
    description: string | null;
    total_duration: number;
    version: number;
    version_updated_at: string;
    updated_at: string;
  };
  contents: PlaylistContentItem[];
  sync_version?: number;
  synced_at?: string;
}

// Playlist content item
interface PlaylistContentItem {
  playlist_content_id: string;
  content_id: string;
  position: string;
  duration_override: string;
  transition_type: string;
  name: string;
  type: string;
  file_path: string | null;
  file_url: string;
  duration_seconds: string;
  thumbnail_url: string;
  checksum: string | null;
  file_size: string;
  content_version: number;
  content_version_updated_at?: string;
  content_updated_at?: string;
}

// Device info response
interface DeviceInfoResponse {
  device: Device & {
    current_playlist_id?: number;
    ip_address?: string;
    mac_address?: string;
    app_version?: string;
    os_version?: string;
    screen_resolution?: string;
    free_storage_mb?: number;
    layout_type?: string;
    orientation?: string;
    volume_level?: number;
    brightness_level?: number;
    last_heartbeat?: string;
    last_sync_at?: string;
    last_sync_version?: number;
  };
  store?: {
    id: number;
    name: string;
    code: string;
    city: string;
    region: string;
  };
}

/**
 * API Service
 * Yeni Backend API ile iletişim
 * Base URL: https://pano.magazatakip.com.tr/api
 */
class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `MagazaPanoTV/${APP_CONFIG.VERSION} (Android; TV Player)`,
      },
    });

    if (APP_CONFIG.ENABLE_DEBUG) {
      console.log('[ApiService] baseURL:', API_CONFIG.BASE_URL);
    }

    // Request interceptor - add auth token
    this.api.interceptors.request.use(
      async config => {
        try {
          const tokenData = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
          if (tokenData) {
            const token: AuthToken = JSON.parse(tokenData);
            if (token?.token) {
              config.headers.Authorization = `Bearer ${token.token}`;
            }
          }
        } catch {
          // Token okunamazsa devam et
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Response interceptor - handle errors
    this.api.interceptors.response.use(
      response => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired - clear and re-login gerekli
          await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          console.log('[ApiService] Token geçersiz, yeniden giriş gerekli');
        }
        return Promise.reject(error);
      }
    );
  }

  // ==================== AUTH ====================

  /**
   * Cihaz girişi - Token al
   * POST /api/auth/device-login
   */
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    const response = await this.api.post<ApiEnvelope<AuthToken>>('/auth/device-login', credentials);
    console.log('[ApiService] Login başarılı:', response.data.message);
    return response.data.data;
  }

  /**
   * Cihaz aktivasyonu
   * POST /api/devices/activate
   */
  async activateDevice(deviceCode: string, activationCode: string): Promise<AuthToken> {
    const response = await this.api.post<ApiEnvelope<AuthToken>>('/devices/activate', {
      device_code: deviceCode,
      activation_code: activationCode,
    });
    return response.data.data;
  }

  /**
   * Token doğrulama
   * GET /api/auth/verify
   */
  async verifyToken(): Promise<Device> {
    const response = await this.api.get<ApiEnvelope<{ device: Device }>>('/auth/verify');
    return response.data.data.device;
  }

  /**
   * Çıkış - Status offline yap
   * PUT /api/devices/status
   */
  async logout(): Promise<void> {
    try {
      await this.updateDeviceStatus('offline');
    } catch {
      // Logout hatası kritik değil
    }
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  // ==================== DEVICE ====================

  /**
   * Cihaz bilgilerini getir
   * GET /api/devices/info
   */
  async getDeviceInfo(): Promise<DeviceInfoResponse> {
    const response = await this.api.get<ApiEnvelope<DeviceInfoResponse>>('/devices/info');
    return response.data.data;
  }

  /**
   * Cihaz bilgilerini güncelle
   * PUT /api/devices/info
   */
  async updateDeviceInfo(info: {
    name?: string;
    ip_address?: string;
    mac_address?: string;
    app_version?: string;
    os_version?: string;
    screen_resolution?: string;
    free_storage_mb?: number;
    layout_type?: string;
    orientation?: string;
    volume_level?: number;
    brightness_level?: number;
  }): Promise<Device> {
    const response = await this.api.put<ApiEnvelope<{ device: Device }>>('/devices/info', info);
    return response.data.data.device;
  }

  /**
   * Cihaz durumunu güncelle
   * PUT /api/devices/status
   */
  async updateDeviceStatus(status: 'online' | 'offline' | 'error' | 'maintenance'): Promise<void> {
    await this.api.put('/devices/status', { status });
  }

  /**
   * Heartbeat gönder
   * POST /api/devices/heartbeat
   * @returns HeartbeatResponse - sync_required true ise senkronizasyon gerekli
   */
  async sendHeartbeat(): Promise<HeartbeatResponse> {
    // Cihaz bilgilerini topla
    let heartbeatInfo: any = {
      app_version: APP_CONFIG.VERSION,
      os_version: 'Android',
      screen_resolution: '1920x1080',
      free_storage_mb: 1024,
      ip_address: null,
      mac_address: null,
    };

    // DeviceInfoService varsa detaylı bilgi al
    try {
      const DeviceInfoService = require('./DeviceInfoService').default;
      const info = await DeviceInfoService.getHeartbeatInfo();
      heartbeatInfo = {
        app_version: info.app_version || APP_CONFIG.VERSION,
        os_version: info.os_version || 'Android',
        screen_resolution: info.screen_resolution || '1920x1080',
        free_storage_mb: info.free_storage_mb || 1024,
        ip_address: info.ip_address || null,
        mac_address: info.mac_address || null,
      };
    } catch {
      // DeviceInfoService yoksa fallback kullan
    }

    const response = await this.api.post<ApiEnvelope<HeartbeatResponse>>('/devices/heartbeat', heartbeatInfo);
    return response.data.data;
  }

  /**
   * Log gönder
   * POST /api/devices/logs
   */
  async sendLog(log: {
    level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
    message: string;
    data?: any;
  }): Promise<void> {
    if (!APP_CONFIG.ENABLE_SERVER_LOGS) return;

    try {
      // Circuit breaker kontrolü
      const disabledUntilStr = await AsyncStorage.getItem(STORAGE_KEYS.LOGS_DISABLED_UNTIL);
      if (disabledUntilStr) {
        const disabledUntil = Number(disabledUntilStr);
        if (Number.isFinite(disabledUntil) && disabledUntil > Date.now()) {
          return;
        }
      }

      await this.api.post('/devices/logs', log);
    } catch (error) {
      const err = error as AxiosError;
      if (err.response?.status === 404) {
        // Endpoint yoksa 30 gün kapat
        await AsyncStorage.setItem(
          STORAGE_KEYS.LOGS_DISABLED_UNTIL,
          String(Date.now() + 30 * 24 * 60 * 60 * 1000)
        );
      }
    }
  }

  /**
   * Screenshot yükle
   * POST /api/devices/screenshot
   */
  async uploadScreenshot(base64Image: string): Promise<{ screenshot_url: string; screenshot_at: string }> {
    const response = await this.api.post<ApiEnvelope<{ screenshot_url: string; screenshot_at: string }>>(
      '/devices/screenshot',
      { screenshot: base64Image }
    );
    return response.data.data;
  }

  /**
   * Komut sonucunu bildir
   * POST /api/devices/commands/{id}/result
   */
  async reportCommandResult(
    commandId: number,
    status: 'executed' | 'failed',
    result: { success: boolean; message: string; data?: any }
  ): Promise<void> {
    try {
      await this.api.post(`/devices/commands/${commandId}/result`, {
        status,
        result: result.message,
        data: result.data,
      });
    } catch (error) {
      // Sonuç bildirilemezse sessizce devam et
      console.warn('[ApiService] Komut sonucu bildirilemedi:', error);
    }
  }

  /**
   * Bekleyen komutları al
   * GET /api/devices/commands/pending
   */
  async getPendingCommands(): Promise<Array<{ id: number; command: string; params: any; created_at: string }>> {
    try {
      const response = await this.api.get<ApiEnvelope<Array<{ id: number; command: string; params: any; created_at: string }>>>(
        '/devices/commands/pending'
      );
      return response.data.data || [];
    } catch (error) {
      return [];
    }
  }

  // ==================== PLAYLIST & CONTENT ====================

  /**
   * Mevcut playlist'i al
   * GET /api/playlists/current
   * NOT: Bu endpoint 500 hatası verebilir, bu durumda syncPlaylist kullanılır
   */
  async getCurrentPlaylist(): Promise<PlaylistResponse> {
    try {
      const response = await this.api.get<ApiEnvelope<PlaylistResponse>>('/playlists/current');
      return response.data.data;
    } catch (error: any) {
      // /api/playlists/current 500 hatası veriyorsa syncPlaylist'i dene
      if (error?.response?.status === 500) {
        console.log('[ApiService] /playlists/current 500 hatası, /sync/playlist deneniyor...');
        return this.syncPlaylist();
      }
      throw error;
    }
  }

  /**
   * Tek içerik detayı
   * GET /api/contents/{id}
   */
  async getContentById(id: number): Promise<Content> {
    const response = await this.api.get<ApiEnvelope<{ content: Content }>>(`/contents/${id}`);
    return response.data.data.content;
  }

  // ==================== SYNC ====================

  /**
   * Güncelleme kontrolü
   * GET /api/sync/check
   */
  async checkSync(clientVersion: number, playlistVersion: number): Promise<SyncCheckResponse> {
    const response = await this.api.get<ApiEnvelope<SyncCheckResponse>>('/sync/check', {
      params: {
        version: clientVersion,
        playlist_version: playlistVersion,
      },
    });
    return response.data.data;
  }

  /**
   * Playlist senkronizasyonu
   * GET /api/sync/playlist
   */
  async syncPlaylist(): Promise<PlaylistResponse> {
    const response = await this.api.get<ApiEnvelope<PlaylistResponse>>('/sync/playlist');
    return response.data.data;
  }

  /**
   * Delta senkronizasyon - Sadece değişen içerikler
   * GET /api/sync/contents
   */
  async syncContents(sinceVersion?: number, sinceDate?: string): Promise<{
    contents: Content[];
    count: number;
    current_version: number;
    has_more: boolean;
  }> {
    const params: Record<string, any> = {};
    if (sinceVersion !== undefined) {
      params.since_version = sinceVersion;
    }
    if (sinceDate) {
      params.since_date = sinceDate;
    }

    const response = await this.api.get<ApiEnvelope<{
      contents: Content[];
      count: number;
      current_version: number;
      has_more: boolean;
    }>>('/sync/contents', { params });

    return response.data.data;
  }

  /**
   * Senkronizasyon onayı
   * POST /api/sync/confirm
   */
  async confirmSync(version: number, playlistId: number): Promise<{
    confirmed_version: number;
    device_id: number;
    synced_at: string;
  }> {
    const response = await this.api.post<ApiEnvelope<{
      confirmed_version: number;
      device_id: number;
      synced_at: string;
    }>>('/sync/confirm', {
      version,
      playlist_id: playlistId,
    });
    return response.data.data;
  }

  /**
   * Senkronizasyon durumu
   * GET /api/sync/status
   */
  async getSyncStatus(): Promise<SyncStatusResponse> {
    const response = await this.api.get<ApiEnvelope<SyncStatusResponse>>('/sync/status');
    return response.data.data;
  }

  // ==================== LEGACY COMPAT ====================

  /**
   * Playlist'i Playlist tipine dönüştür (eski kod uyumluluğu)
   */
  convertToPlaylist(data: PlaylistResponse): Playlist {
    const contents = data.contents.map((item, index) => ({
      id: parseInt(item.playlist_content_id),
      playlist_id: data.playlist.id,
      content_id: parseInt(item.content_id),
      position: parseInt(item.position),
      duration_override: parseInt(item.duration_override) || undefined,
      transition_type: item.transition_type,
      content: {
        id: parseInt(item.content_id),
        name: item.name,
        type: item.type as Content['type'],
        file_url: this.getFullUrl(item.file_url),
        url: this.getFullUrl(item.file_url),
        thumbnail_url: item.thumbnail_url,
        duration_seconds: parseInt(item.duration_seconds),
        duration: parseInt(item.duration_seconds),
      } as Content,
    }));

    return {
      id: data.playlist.id,
      name: data.playlist.name,
      description: data.playlist.description || undefined,
      duration_seconds: data.playlist.total_duration,
      is_default: false,
      priority: 0,
      is_active: true,
      contents,
      created_at: data.playlist.updated_at,
      updated_at: data.playlist.updated_at,
    };
  }

  /**
   * Dosya URL'sini tam URL'ye dönüştür
   */
  private getFullUrl(path: string | null): string {
    if (!path) return '';

    // Backslash'leri düzelt
    let cleanPath = path.replace(/\\\//g, '/');

    // Zaten tam URL ise direkt döndür
    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
      return cleanPath;
    }

    // Leading slash varsa kaldır
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }

    // images/ veya videos/ ile başlıyorsa uploads/ prefix'i ekle
    if (cleanPath.startsWith('images/') || cleanPath.startsWith('videos/')) {
      cleanPath = `uploads/${cleanPath}`;
    }

    // Base URL: https://pano.magazatakip.com.tr
    const baseUrl = 'https://pano.magazatakip.com.tr';
    return `${baseUrl}/${cleanPath}`;
  }

  /**
   * Health check - Sunucu durumu
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Basit bir endpoint çağır
      await this.api.get('/auth/verify');
      return true;
    } catch (error) {
      const err = error as AxiosError;
      // 401 bile olsa sunucu çalışıyor demektir
      if (err.response?.status === 401) {
        return true;
      }
      return false;
    }
  }
}

export default new ApiService();

