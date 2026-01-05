import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '@config/constants';
import StorageService from './StorageService';
import SyncManager from './SyncManager';

/**
 * WebSocket Service
 * Real-time communication with backend
 */
class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

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
      // Implement app reload logic
    });
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
