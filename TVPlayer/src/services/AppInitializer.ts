import Orientation from 'react-native-orientation-locker';
import SplashScreen from 'react-native-splash-screen';
import StorageService from './StorageService';
import DownloadManager from './DownloadManager';
import SyncManager from './SyncManager';
import SocketService from './SocketService';

/**
 * App Initializer
 * Initialize all services on app start
 */
export async function initializeApp(): Promise<void> {
  try {
    console.log('Initializing app...');

    // Lock to landscape
    Orientation.lockToLandscape();

    // Initialize download manager
    await DownloadManager.initialize();

    // Check if logged in
    const isLoggedIn = await StorageService.isLoggedIn();
    
    if (isLoggedIn) {
      // Start sync
      SyncManager.startAutoSync();

      // Connect websocket
      await SocketService.connect();
    }

    console.log('App initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
  } finally {
    // Hide splash screen
    SplashScreen.hide();
  }
}

export async function cleanupApp(): Promise<void> {
  SyncManager.stopAutoSync();
  SocketService.disconnect();
}
