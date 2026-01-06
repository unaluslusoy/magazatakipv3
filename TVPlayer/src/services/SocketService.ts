import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '@config/constants';
import StorageService from './StorageService';
import SyncManager from './SyncManager';

// DeviceInfoService lazy load - import edildiginde netinfo hatasi veriyor
let _deviceInfoService: any = null;
const getDeviceInfoService = () => {
  if (!_deviceInfoService) {
    try {
      _deviceInfoService = require('./DeviceInfoService').default;
    } catch (e) {
      console.warn('DeviceInfoService yuklenemedi');
    }
  }
  return _deviceInfoService;
};

// RNRestart opsiyonel
let RNRestart: any = null;
try {
  RNRestart = require('react-native-restart').default;
} catch (e) {
  console.warn('react-native-restart yuklenemedi');
}

/**
 * WebSocket Service
 * Real-time communication with backend
 */
class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private commandHandlers: Map<string, (params: any) => Promise<void>> = new Map();

  async connect(): Promise<void> {
    const token = await StorageService.getAuthToken();
    if (!token) {
      console.error('No auth token for socket connection');
      return;
    }

    this.socket = io(API_CONFIG.SOCKET_URL, {
      auth: {
        token: token.token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupListeners();
  }

  private setupListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', reason => {
      if (this.reconnectAttempts < 3) {
        console.log('Socket bağlantısı kesildi');
      }
    });

    this.socket.on('connect_error', error => {
      this.reconnectAttempts++;
      // Sadece ilk hatada log göster
      if (this.reconnectAttempts === 1) {
        console.log('Socket bağlantısı kurulamıyor, offline modda çalışılıyor');
      }
    });

    // Listen for sync commands
    this.socket.on('sync', async () => {
      console.log('Sync command received');
      await SyncManager.sync();
    });

    // Listen for playlist updates
    this.socket.on('playlist:updated', async (data: any) => {
      console.log('Playlist updated:', data);
      await SyncManager.sync();
    });

    // Listen for content updates
    this.socket.on('content:updated', async (data: any) => {
      console.log('Content updated:', data);
      await SyncManager.sync();
    });

    // Listen for schedule updates
    this.socket.on('schedule:updated', async (data: any) => {
      console.log('Schedule updated:', data);
      await SyncManager.sync();
    });

    // Listen for reload commands
    this.socket.on('reload', () => {
      console.log('Reload command received');
      if (RNRestart) {
        RNRestart.restart();
      }
    });

    // Listen for device commands from admin panel
    this.socket.on('command:receive', async (data: any) => {
      console.log('Komut alindi:', data.command);
      await this.handleCommand(data.command, data.params || {});
    });

    // Listen for settings sync
    this.socket.on('settings:sync', async (settings: any) => {
      console.log('Ayarlar senkronize ediliyor:', settings);
      await StorageService.saveSettings(settings);
      this.emit('settings:synced', { success: true });
    });

    // Listen for device info request
    this.socket.on('device:info_request', async () => {
      console.log('Cihaz bilgisi istendi');
      await this.sendDeviceInfo();
    });

    // Listen for screenshot request
    this.socket.on('device:screenshot_request', async () => {
      console.log('Ekran goruntusu istendi');
      await this.sendScreenshot();
    });
  }

  /**
   * Komut isle
   */
  private async handleCommand(command: string, params: any): Promise<void> {
    try {
      switch (command) {
        case 'REFRESH_CONTENT':
          await SyncManager.sync();
          this.emit('command:completed', { command, success: true });
          break;

        case 'RESTART_APP':
          this.emit('command:completed', { command, success: true });
          if (RNRestart) {
            setTimeout(() => RNRestart.restart(), 500);
          }
          break;

        case 'SYNC_NOW':
          await SyncManager.sync();
          this.emit('command:completed', { command, success: true });
          break;

        case 'GET_SCREENSHOT':
          await this.sendScreenshot();
          break;

        case 'GET_DEVICE_INFO':
          await this.sendDeviceInfo();
          break;

        case 'UPDATE_SETTINGS':
          if (params.settings) {
            await StorageService.saveSettings(params.settings);
            this.emit('command:completed', { command, success: true });
          }
          break;

        case 'CHANGE_PLAYLIST':
          if (params.playlist_id) {
            await StorageService.saveCurrentPlaylistId(params.playlist_id);
            await SyncManager.sync();
            this.emit('command:completed', { command, success: true });
          }
          break;

        case 'CLEAR_CACHE':
          await StorageService.clearCache();
          this.emit('command:completed', { command, success: true });
          break;

        case 'SHOW_MESSAGE':
          // Mesaj gosterme eventi gonder
          this.emit('command:completed', {
            command,
            success: true,
            show_message: {
              message: params.message,
              duration: params.duration || 5000
            }
          });
          break;

        default:
          console.log('Bilinmeyen komut:', command);
          this.emit('command:completed', { command, success: false, error: 'Bilinmeyen komut' });
      }
    } catch (error: any) {
      console.error('Komut isleme hatasi:', error);
      this.emit('command:completed', { command, success: false, error: error.message });
    }
  }

  /**
   * Cihaz bilgilerini gonder
   */
  async sendDeviceInfo(): Promise<void> {
    try {
      const DeviceInfoService = getDeviceInfoService();
      const deviceInfo = await DeviceInfoService.getFullDeviceInfo();
      this.emit('device:info', deviceInfo);
      console.log('Cihaz bilgileri gonderildi');
    } catch (error) {
      console.error('Cihaz bilgisi gonderilemedi:', error);
    }
  }

  /**
   * Ekran goruntusunu gonder
   */
  async sendScreenshot(): Promise<void> {
    try {
      const DeviceInfoService = getDeviceInfoService();
      const screenshot = await DeviceInfoService.captureScreenshot();
      if (screenshot) {
        this.emit('device:screenshot', {
          screenshot,
          captured_at: new Date().toISOString()
        });
        console.log('Ekran goruntusu gonderildi');
      }
    } catch (error) {
      console.error('Ekran goruntusu gonderilemedi:', error);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new SocketService();
