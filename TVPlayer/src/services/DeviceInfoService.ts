import { Platform, Dimensions, PixelRatio } from 'react-native';
import RNFS from 'react-native-fs';

// DeviceInfo opsiyonel - native modul hata verirse fallback kullan
let DeviceInfo: any = null;
try {
  DeviceInfo = require('react-native-device-info').default;
} catch (e) {
  console.warn('react-native-device-info yuklenemedi, fallback kullanilacak');
}

// NetInfo opsiyonel - native modul hata verebilir
let NetInfo: any = null;
try {
  NetInfo = require('@react-native-community/netinfo').default;
} catch (e) {
  console.warn('@react-native-community/netinfo yuklenemedi');
}

// ViewShot opsiyonel
let captureScreen: any = null;
try {
  captureScreen = require('react-native-view-shot').captureScreen;
} catch (e) {
  console.warn('react-native-view-shot yuklenemedi');
}

/**
 * Device Info Service
 * Cihaz bilgilerini toplar ve yonetir
 */
class DeviceInfoService {
  /**
   * Tam cihaz bilgilerini topla
   */
  async getFullDeviceInfo(): Promise<DeviceInfoData> {
    const [networkInfo, storageInfo] = await Promise.all([
      this.getNetworkInfo(),
      this.getStorageInfo(),
    ]);

    const { width, height } = Dimensions.get('window');
    const screenWidth = Math.round(width * PixelRatio.get());
    const screenHeight = Math.round(height * PixelRatio.get());

    return {
      // Cihaz bilgileri
      device_id: await DeviceInfo.getUniqueId(),
      device_name: await DeviceInfo.getDeviceName(),
      brand: DeviceInfo.getBrand(),
      model: DeviceInfo.getModel(),
      device_type: DeviceInfo.getDeviceType(),

      // Sistem bilgileri
      os: Platform.OS,
      os_version: DeviceInfo.getSystemVersion(),
      api_level: Platform.Version,
      app_version: DeviceInfo.getVersion(),
      build_number: DeviceInfo.getBuildNumber(),

      // Ekran bilgileri
      screen_resolution: `${screenWidth}x${screenHeight}`,
      screen_width: screenWidth,
      screen_height: screenHeight,
      pixel_ratio: PixelRatio.get(),

      // Ag bilgileri
      ...networkInfo,

      // Depolama bilgileri
      ...storageInfo,

      // Diger
      is_tablet: DeviceInfo.isTablet(),
      is_emulator: await DeviceInfo.isEmulator(),
      battery_level: await this.getBatteryLevel(),
      is_charging: await DeviceInfo.isBatteryCharging(),

      // Zaman
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: 'tr-TR',
      uptime: await safeGetAsync(() => DeviceInfo.getUptime(), 0),
    };
  }

  /**
   * Ag bilgilerini al
   */
  async getNetworkInfo(): Promise<NetworkInfoData> {
    try {
      const netInfo = await NetInfo.fetch();

      let ipAddress = 'Bilinmiyor';
      let macAddress = 'Bilinmiyor';

      if (DeviceInfo) {
        try {
          ipAddress = await DeviceInfo.getIpAddress();
        } catch {
          // IP alinamazsa devam et
        }

        try {
          macAddress = await DeviceInfo.getMacAddress();
        } catch {
          // MAC alinamazsa devam et
        }
      }

      return {
        ip_address: ipAddress,
        mac_address: macAddress,
        connection_type: connectionType,
        is_connected: isConnected,
        is_wifi: isWifi,
        wifi_ssid: wifiSsid,
        signal_strength: signalStrength,
      };
    } catch (error) {
      console.error('Ag bilgisi alinamadi:', error);
      return {
        ip_address: 'Bilinmiyor',
        mac_address: 'Bilinmiyor',
        connection_type: 'unknown',
        is_connected: false,
        is_wifi: false,
        wifi_ssid: null,
        signal_strength: null,
      };
    }
  }

  /**
   * Depolama bilgilerini al
   */
  async getStorageInfo(): Promise<StorageInfoData> {
    try {
      const freeSpace = await RNFS.getFSInfo();

      return {
        total_storage_mb: Math.round(freeSpace.totalSpace / (1024 * 1024)),
        free_storage_mb: Math.round(freeSpace.freeSpace / (1024 * 1024)),
        used_storage_mb: Math.round((freeSpace.totalSpace - freeSpace.freeSpace) / (1024 * 1024)),
        storage_percentage: Math.round(((freeSpace.totalSpace - freeSpace.freeSpace) / freeSpace.totalSpace) * 100),
      };
    } catch (error) {
      console.error('Depolama bilgisi alinamadi:', error);
      return {
        total_storage_mb: 0,
        free_storage_mb: 0,
        used_storage_mb: 0,
        storage_percentage: 0,
      };
    }
  }

  /**
   * Batarya seviyesini al
   */
  async getBatteryLevel(): Promise<number> {
    try {
      const level = await DeviceInfo.getBatteryLevel();
      return Math.round(level * 100);
    } catch {
      return -1;
    }
  }

  /**
   * Ekran goruntusu al (base64)
   */
  async captureScreenshot(): Promise<string | null> {
    try {
      const uri = await captureScreen({
        format: 'jpg',
        quality: 0.7,
        result: 'base64',
      });
      return uri;
    } catch (error) {
      console.error('Ekran goruntusu alinamadi:', error);
      return null;
    }
  }

  /**
   * Heartbeat icin ozet bilgi
   */
  async getHeartbeatInfo(): Promise<HeartbeatData> {
    const [networkInfo, storageInfo] = await Promise.all([
      this.getNetworkInfo(),
      this.getStorageInfo(),
    ]);

    const { width, height } = Dimensions.get('window');
    const screenWidth = Math.round(width * PixelRatio.get());
    const screenHeight = Math.round(height * PixelRatio.get());

    return {
      app_version: DeviceInfo.getVersion(),
      os_version: `Android ${DeviceInfo.getSystemVersion()}`,
      screen_resolution: `${screenWidth}x${screenHeight}`,
      free_storage_mb: storageInfo.free_storage_mb,
      ip_address: networkInfo.ip_address,
      battery_level: await this.getBatteryLevel(),
      is_charging: await DeviceInfo.isBatteryCharging(),
      connection_type: networkInfo.connection_type,
    };
  }
}

// Tip tanimlari
interface DeviceInfoData {
  device_id: string;
  device_name: string;
  brand: string;
  model: string;
  device_type: string;
  os: string;
  os_version: string;
  api_level: string | number;
  app_version: string;
  build_number: string;
  screen_resolution: string;
  screen_width: number;
  screen_height: number;
  pixel_ratio: number;
  ip_address: string;
  mac_address: string;
  connection_type: string;
  is_connected: boolean;
  is_wifi: boolean;
  wifi_ssid: string | null;
  signal_strength: number | null;
  total_storage_mb: number;
  free_storage_mb: number;
  used_storage_mb: number;
  storage_percentage: number;
  is_tablet: boolean;
  is_emulator: boolean;
  battery_level: number;
  is_charging: boolean;
  timezone: string;
  locale: string;
  uptime: number;
}

interface NetworkInfoData {
  ip_address: string;
  mac_address: string;
  connection_type: string;
  is_connected: boolean;
  is_wifi: boolean;
  wifi_ssid: string | null;
  signal_strength: number | null;
}

interface StorageInfoData {
  total_storage_mb: number;
  free_storage_mb: number;
  used_storage_mb: number;
  storage_percentage: number;
}

interface HeartbeatData {
  app_version: string;
  os_version: string;
  screen_resolution: string;
  free_storage_mb: number;
  ip_address: string;
  battery_level: number;
  is_charging: boolean;
  connection_type: string;
}

export default new DeviceInfoService();
export type { DeviceInfoData, NetworkInfoData, StorageInfoData, HeartbeatData };

