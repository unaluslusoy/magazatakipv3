import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG } from '@config/constants';
import StorageService from './StorageService';
import type { LoginCredentials, AuthToken, Playlist, Content, Schedule, Device } from '@types/index';

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
      },
    });

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
    const response = await this.api.post('/auth/device-login', credentials);
    return response.data.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
    await StorageService.clearAuthToken();
  }

  async verifyToken(): Promise<Device> {
    const response = await this.api.get('/auth/verify');
    return response.data.data;
  }

  // Device
  async updateDeviceStatus(status: string): Promise<void> {
    await this.api.put('/devices/status', { status });
  }

  async sendHeartbeat(): Promise<void> {
    await this.api.post('/devices/heartbeat');
  }

  // Playlists
  async getPlaylists(): Promise<Playlist[]> {
    const response = await this.api.get('/playlists');
    return response.data.data;
  }

  async getPlaylistById(id: number): Promise<Playlist> {
    const response = await this.api.get(`/playlists/${id}`);
    return response.data.data;
  }

  // Contents
  async getContents(): Promise<Content[]> {
    const response = await this.api.get('/contents');
    return response.data.data;
  }

  async getContentById(id: number): Promise<Content> {
    const response = await this.api.get(`/contents/${id}`);
    return response.data.data;
  }

  // Schedules
  async getSchedules(): Promise<Schedule[]> {
    const response = await this.api.get('/schedules');
    return response.data.data;
  }

  async getActiveSchedules(): Promise<Schedule[]> {
    const response = await this.api.get('/schedules/active');
    return response.data.data;
  }

  // Logs
  async sendLog(log: any): Promise<void> {
    try {
      await this.api.post('/devices/logs', log);
    } catch (error) {
      console.error('Failed to send log:', error);
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.api.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export default new ApiService();
