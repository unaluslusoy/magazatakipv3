import Orientation from 'react-native-orientation-locker';
import StorageService from './StorageService';
import DownloadManager from './DownloadManager';
import SyncManager from './SyncManager';
import SocketService from './SocketService';
import ScreenShareService from './ScreenShareService';

/**
 * App Initializer
 * Initialize all services on app start
 */
export async function initializeApp(): Promise<void> {
  try {
    console.log('Initializing app...');

    // Lock to portrait
    Orientation.lockToPortrait();

    // Initialize download manager
    await DownloadManager.initialize();

    // Check if logged in (local only)
    const isLoggedIn = await StorageService.isLoggedIn();

    if (isLoggedIn) {
      // Cihaz bilgilerini native modüle kaydet (ekran paylaşımı için)
      try {
        const token = await StorageService.getAuthToken();
        const deviceInfo = await StorageService.getDeviceInfo();
        if (token && deviceInfo) {
          await ScreenShareService.setDeviceInfo(
            deviceInfo.device_code,
            token.token
          );
          console.log('Cihaz bilgileri native modüle kaydedildi');
        }
      } catch (e) {
        console.log('Cihaz bilgileri kaydetme atlandı:', e);
      }

      // Start sync
      SyncManager.startAutoSync();

      // Connect websocket
      await SocketService.connect();
    }

    console.log('App initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
}

export async function cleanupApp(): Promise<void> {
  SyncManager.stopAutoSync();
  SocketService.disconnect();
}
