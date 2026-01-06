/**
 * Ekran Paylaşımı Native Modül
 * Admin panelden uzaktan izleme için
 */
import { NativeModules, Platform } from 'react-native';

const { ScreenShareModule } = NativeModules;

interface DeviceInfo {
  device_code: string;
  is_sharing: boolean;
}

class ScreenShareService {
  /**
   * Ekran paylaşımını başlat
   * Kullanıcıdan izin istenir ve ardından paylaşım başlar
   */
  async startScreenShare(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.log('Ekran paylaşımı sadece Android\'de destekleniyor');
      return false;
    }

    try {
      const result = await ScreenShareModule.startScreenShare();
      console.log('Ekran paylaşımı başlatıldı');
      return result;
    } catch (error) {
      console.error('Ekran paylaşımı başlatma hatası:', error);
      return false;
    }
  }

  /**
   * Ekran paylaşımını durdur
   */
  async stopScreenShare(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      const result = await ScreenShareModule.stopScreenShare();
      console.log('Ekran paylaşımı durduruldu');
      return result;
    } catch (error) {
      console.error('Ekran paylaşımı durdurma hatası:', error);
      return false;
    }
  }

  /**
   * Ekran paylaşımı aktif mi kontrol et
   */
  async isScreenSharing(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      return await ScreenShareModule.isScreenSharing();
    } catch (error) {
      console.error('Ekran paylaşımı durum kontrolü hatası:', error);
      return false;
    }
  }

  /**
   * Cihaz bilgilerini native modüle kaydet
   * Servis bu bilgileri backend'e frame gönderirken kullanacak
   */
  async setDeviceInfo(deviceCode: string, token: string): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      await ScreenShareModule.setDeviceInfo(deviceCode, token);
      return true;
    } catch (error) {
      console.error('Cihaz bilgileri kaydetme hatası:', error);
      return false;
    }
  }

  /**
   * Cihaz bilgilerini al
   */
  async getDeviceInfo(): Promise<DeviceInfo | null> {
    if (Platform.OS !== 'android') {
      return null;
    }

    try {
      return await ScreenShareModule.getDeviceInfo();
    } catch (error) {
      console.error('Cihaz bilgileri alma hatası:', error);
      return null;
    }
  }
}

export default new ScreenShareService();

