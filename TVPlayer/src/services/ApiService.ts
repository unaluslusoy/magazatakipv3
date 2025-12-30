import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG, APP_CONFIG } from '@config/constants';
import StorageService from './StorageService';
import type { LoginCredentials, AuthToken, Playlist, Content, Schedule, Device } from '@types/index';

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
        const token = await StorageService.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token.token}`;
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
          // Token expired - logout
          await StorageService.clearAuthToken();
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
    await StorageService.clearAuthToken();
  }

  async verifyToken(): Promise<Device> {
    const response = await this.api.get<ApiEnvelope<{ message: string; device: Device }>>('/auth/verify');
    return response.data.data.device;
  }

  // Device
  async updateDeviceStatus(status: string): Promise<void> {
    await this.api.put('/devices/status', { status });
  }

  async sendHeartbeat(): Promise<void> {
    try {
      await this.api.post('/devices/heartbeat', {
        ip_address: '0.0.0.0', // TODO: Get real IP
        app_version: '1.0.0',
        os_version: 'Android',
        free_storage_mb: 0, // TODO: Get real storage
      });
    } catch {
      // Heartbeat kritik değil; sync akışını kırmasın
      return;
    }
  }

  // Playlists
  async getPlaylists(): Promise<Playlist[]> {
    const response = await this.api.get<ApiEnvelope<PaginatedItems<Playlist>>>('/playlists');
    return response.data.data.items.data;
  }

  async getPlaylistById(id: number, includeContents = false): Promise<Playlist> {
    const url = includeContents ? `/playlists/${id}?include=contents` : `/playlists/${id}`;
    const response = await this.api.get<ApiEnvelope<Playlist>>(url);
    return response.data.data;
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
  async getSchedules(isActive?: boolean): Promise<Schedule[]> {
    const response = await this.api.get<ApiEnvelope<PaginatedItems<Schedule>>>('/schedules', {
      params: typeof isActive === 'boolean' ? { is_active: isActive } : undefined,
    });
    return response.data.data.items.data;
  }

  async getActiveSchedules(): Promise<Schedule[]> {
    return this.getSchedules(true);
  }

  // Logs
  async sendLog(log: any): Promise<void> {
    // Kapalıysa hiç deneme
    if (!APP_CONFIG.ENABLE_SERVER_LOGS) return;

    const disabledUntil = await StorageService.getLogsDisabledUntil();
    if (disabledUntil && disabledUntil > Date.now()) {
      return;
    }

    try {
      await this.api.post('/devices/logs', log);
      if (disabledUntil) {
        await StorageService.setLogsDisabledUntil(null);
      }
    } catch (error) {
      const err = error as AxiosError;

      // Endpoint yoksa (404) uzun süre kapat: kullanıcının ekranında/terminalde spam olmasın.
      if (err.response?.status === 404) {
        // 30 gün kapat (yarın kurulum var; kesin çözüm)
        await StorageService.setLogsDisabledUntil(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return;
      }

      return;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      // Backend dokümanına göre health endpoint: GET /api/health
      // baseURL zaten .../api olduğundan '/health' -> .../api/health
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
