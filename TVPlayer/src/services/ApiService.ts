import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG, APP_CONFIG } from '@config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LoginCredentials, AuthToken, Playlist, Content, Schedule, Device } from '@types/index';

// Döngüsel bağımlılığı önlemek için StorageService yerine doğrudan AsyncStorage kullanıyoruz
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  LOGS_DISABLED_UNTIL: 'logs_disabled_until',
};

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
  error?: { code: number; message?: string };
};

type PaginatedItems<T> = {
  items: {
    data: T[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
};

/**
 * API Service
 * Backend communication
 */
class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MagazaPanoTV/1.0 (Android; TV Player)',
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
          // Token expired - clear
          await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    const response = await this.api.post<ApiEnvelope<AuthToken>>('/auth/device-login', credentials);
    return response.data.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  async verifyToken(): Promise<Device> {
    const response = await this.api.get<ApiEnvelope<{ message: string; device: Device }>>('/auth/verify');
    return response.data.data.device;
  }

  // Device
  async getDeviceById(deviceId: number): Promise<Device> {
    const response = await this.api.get<ApiEnvelope<Device>>(`/devices/${deviceId}`);
    return response.data.data;
  }

  async updateDeviceStatus(status: string): Promise<void> {
    await this.api.put('/devices/status', { status });
  }

  async sendHeartbeat(currentPlaylistId?: number, currentContentId?: number, isPlaying?: boolean): Promise<void> {
    try {
      // Basit cihaz bilgileri - DeviceInfoService hata verebilir
      let heartbeatInfo = {
        app_version: APP_CONFIG.VERSION,
        os_version: 'Android',
        screen_resolution: '1920x1080',
        free_storage_mb: 1024,
        ip_address: 'unknown',
        battery_level: -1,
        is_charging: false,
        connection_type: 'unknown',
      };

      // DeviceInfoService varsa detaylı bilgi al
      try {
        const DeviceInfoService = require('./DeviceInfoService').default;
        heartbeatInfo = await DeviceInfoService.getHeartbeatInfo();
      } catch {
        // DeviceInfoService yoksa fallback kullan
      }

      await this.api.post('/devices/heartbeat', {
        ...heartbeatInfo,
        current_playlist_id: currentPlaylistId,
        current_content_id: currentContentId,
        is_playing: isPlaying ?? true,
      });
    } catch {
      // Heartbeat kritik değil
      return;
    }
  }

  // Playlists
  async getPlaylists(): Promise<Playlist[]> {
    const response = await this.api.get<ApiEnvelope<PaginatedItems<Playlist>>>('/playlists');
    return response.data.data.items.data;
  }

  async getPlaylistById(id: number): Promise<Playlist> {
    // include=contents ile tüm içerik detaylarını al (ticker_text dahil)
    const response = await this.api.get<ApiEnvelope<Playlist>>(`/playlists/${id}?include=contents`);
    return response.data.data;
  }

  /**
   * Cihaza atanmış playlist'i al
   * Önce device bilgisini çeker, sonra current_playlist_id ile playlist detayını döner
   */
  async getDevicePlaylist(deviceId: number): Promise<Playlist | null> {
    try {
      const device = await this.getDeviceById(deviceId);
      const playlistId = (device as any).current_playlist_id;
      if (!playlistId) {
        console.log('Cihaza atanmış playlist yok');
        return null;
      }
      return await this.getPlaylistById(playlistId);
    } catch (error) {
      console.error('Playlist alınamadı:', error);
      return null;
    }
  }

  // Contents
  async getContents(): Promise<Content[]> {
    const response = await this.api.get<ApiEnvelope<PaginatedItems<Content>>>('/contents');
    return response.data.data.items.data;
  }

  async getContentById(id: number): Promise<Content> {
    const response = await this.api.get<ApiEnvelope<Content>>(`/contents/${id}`);
    return response.data.data;
  }

  // Schedules
  async getSchedules(deviceId?: number, isActive?: boolean): Promise<Schedule[]> {
    const params: Record<string, any> = {};
    if (typeof isActive === 'boolean') {
      params.active = isActive;
    }
    if (deviceId) {
      params.device_id = deviceId;
    }

    try {
      const response = await this.api.get<any>('/schedules', { params });

      // Farklı response formatlarını destekle
      const data = response?.data?.data;
      if (!data) return [];

      // Format 1: { items: { data: [...] } }
      if (data.items?.data) {
        return data.items.data;
      }
      // Format 2: { items: [...] }
      if (Array.isArray(data.items)) {
        return data.items;
      }
      // Format 3: [...] (doğrudan array)
      if (Array.isArray(data)) {
        return data;
      }

      return [];
    } catch (error) {
      console.log('Schedule API hatası:', error);
      return [];
    }
  }

  async getActiveSchedules(deviceId?: number): Promise<Schedule[]> {
    return this.getSchedules(deviceId, true);
  }

  // Logs
  async sendLog(log: any): Promise<void> {
    if (!APP_CONFIG.ENABLE_SERVER_LOGS) return;

    try {
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
        // 30 gün kapat
        await AsyncStorage.setItem(STORAGE_KEYS.LOGS_DISABLED_UNTIL, String(Date.now() + 30 * 24 * 60 * 60 * 1000));
      }
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.api.get('/health');
      const data: any = response.data;
      if (data && typeof data.success === 'boolean') {
        return response.status === 200 && data.success === true;
      }
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export default new ApiService();
