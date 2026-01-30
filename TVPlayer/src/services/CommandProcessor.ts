/**
 * Command Processor Service
 * Panel'den gelen komutları işler
 *
 * Desteklenen komutlar:
 * - REFRESH_CONTENT: İçeriği yenile
 * - RESTART_APP: Uygulamayı yeniden başlat
 * - SYNC_NOW: Şimdi senkronize et
 * - CLEAR_CACHE: Önbelleği temizle
 * - TAKE_SCREENSHOT: Ekran görüntüsü al
 * - UPDATE_SETTINGS: Ayarları güncelle
 */

import { NativeModules, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import ApiService from './ApiService';
import StorageService from './StorageService';
import Logger from './Logger';

// Screenshot modülü (opsiyonel)
let captureScreen: any = null;
try {
  captureScreen = require('react-native-view-shot').captureScreen;
} catch (e) {
  console.warn('react-native-view-shot yüklenemedi');
}

// Komut tipi
export interface Command {
  id: number;
  command: string;
  params: Record<string, any>;
  created_at: string;
}

// Komut sonucu
export interface CommandResult {
  success: boolean;
  message: string;
  data?: Record<string, any>;
}

// Event listener tipi
type CommandListener = (command: string) => void;

class CommandProcessor {
  private listeners: CommandListener[] = [];
  private isProcessing = false;

  /**
   * Komut listener'ı ekle
   */
  addListener(listener: CommandListener): void {
    this.listeners.push(listener);
  }

  /**
   * Komut listener'ı kaldır
   */
  removeListener(listener: CommandListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Listener'ları bilgilendir
   */
  private notifyListeners(command: string): void {
    this.listeners.forEach(listener => {
      try {
        listener(command);
      } catch (e) {
        console.error('Command listener hatası:', e);
      }
    });
  }

  /**
   * Bekleyen komutları işle
   */
  async processPendingCommands(commands: Command[]): Promise<void> {
    if (this.isProcessing || !commands || commands.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`[CommandProcessor] ${commands.length} komut işlenecek`);

    try {
      for (const command of commands) {
        await this.processCommand(command);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Tek komut işle
   */
  async processCommand(command: Command): Promise<CommandResult> {
    console.log(`[CommandProcessor] Komut işleniyor: ${command.command}`);
    Logger.info('Komut alındı', { command: command.command, id: command.id });

    let result: CommandResult;

    try {
      switch (command.command) {
        case 'REFRESH_CONTENT':
          result = await this.handleRefreshContent();
          break;

        case 'RESTART_APP':
          result = await this.handleRestartApp();
          break;

        case 'SYNC_NOW':
          result = await this.handleSyncNow();
          break;

        case 'CLEAR_CACHE':
          result = await this.handleClearCache();
          break;

        case 'TAKE_SCREENSHOT':
          result = await this.handleTakeScreenshot();
          break;

        case 'UPDATE_SETTINGS':
          result = await this.handleUpdateSettings(command.params);
          break;

        case 'REBOOT_DEVICE':
          result = await this.handleRebootDevice();
          break;

        default:
          result = {
            success: false,
            message: `Bilinmeyen komut: ${command.command}`,
          };
      }
    } catch (error: any) {
      console.error('[CommandProcessor] Komut hatası:', error);
      result = {
        success: false,
        message: error?.message || 'Komut işlenirken hata oluştu',
      };
    }

    // Sonucu sunucuya bildir
    await this.reportCommandResult(command.id, result);

    // Listener'ları bilgilendir
    this.notifyListeners(command.command);

    Logger.info('Komut tamamlandı', {
      command: command.command,
      success: result.success,
      message: result.message,
    });

    return result;
  }

  /**
   * REFRESH_CONTENT - İçeriği yenile
   */
  private async handleRefreshContent(): Promise<CommandResult> {
    try {
      // Listener'ları bilgilendir - PlayerScreen dinleyecek
      this.notifyListeners('REFRESH_CONTENT');

      return {
        success: true,
        message: 'İçerik yenileme komutu gönderildi',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'İçerik yenilenemedi',
      };
    }
  }

  /**
   * RESTART_APP - Uygulamayı yeniden başlat
   */
  private async handleRestartApp(): Promise<CommandResult> {
    try {
      // React Native'de uygulama yeniden başlatma
      if (Platform.OS === 'android') {
        // Native modul ile restart
        try {
          const { RNRestart } = NativeModules;
          if (RNRestart) {
            setTimeout(() => {
              RNRestart.Restart();
            }, 1000);
            return {
              success: true,
              message: 'Uygulama yeniden başlatılıyor',
            };
          }
        } catch {
          // RNRestart yoksa devam et
        }

        // Alternatif: DevSettings ile reload
        try {
          const { DevSettings } = NativeModules;
          if (DevSettings?.reload) {
            setTimeout(() => {
              DevSettings.reload();
            }, 1000);
            return {
              success: true,
              message: 'Uygulama yeniden yükleniyor',
            };
          }
        } catch {
          // DevSettings yoksa devam et
        }
      }

      return {
        success: false,
        message: 'Yeniden başlatma desteklenmiyor',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Uygulama yeniden başlatılamadı',
      };
    }
  }

  /**
   * SYNC_NOW - Şimdi senkronize et
   */
  private async handleSyncNow(): Promise<CommandResult> {
    try {
      const SyncManager = require('./SyncManager').default;
      await SyncManager.sync();

      return {
        success: true,
        message: 'Senkronizasyon tamamlandı',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Senkronizasyon başarısız',
      };
    }
  }

  /**
   * CLEAR_CACHE - Önbelleği temizle
   */
  private async handleClearCache(): Promise<CommandResult> {
    try {
      // Media cache temizle
      const cacheDir = `${RNFS.DocumentDirectoryPath}/media_cache`;

      const exists = await RNFS.exists(cacheDir);
      if (exists) {
        await RNFS.unlink(cacheDir);
        await RNFS.mkdir(cacheDir);
      }

      // Storage'dan cached content bilgilerini temizle
      await StorageService.clearContents();

      return {
        success: true,
        message: 'Önbellek temizlendi',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Önbellek temizlenemedi',
      };
    }
  }

  /**
   * TAKE_SCREENSHOT - Ekran görüntüsü al
   */
  private async handleTakeScreenshot(): Promise<CommandResult> {
    try {
      if (!captureScreen) {
        return {
          success: false,
          message: 'Screenshot modülü yüklü değil',
        };
      }

      // Ekran görüntüsü al
      const uri = await captureScreen({
        format: 'jpg',
        quality: 0.8,
        result: 'tmpfile',
      });

      console.log('[CommandProcessor] Screenshot alındı:', uri);

      // Sunucuya yükle
      try {
        await this.uploadScreenshot(uri);

        // Geçici dosyayı sil
        await RNFS.unlink(uri);

        return {
          success: true,
          message: 'Ekran görüntüsü alındı ve yüklendi',
        };
      } catch (uploadError: any) {
        return {
          success: false,
          message: `Screenshot yüklenemedi: ${uploadError?.message}`,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Ekran görüntüsü alınamadı',
      };
    }
  }

  /**
   * Screenshot'ı sunucuya yükle
   */
  private async uploadScreenshot(filePath: string): Promise<void> {
    // Dosyayı base64'e çevir
    const base64 = await RNFS.readFile(filePath, 'base64');

    // API'ye gönder
    await ApiService.uploadScreenshot(base64);
  }

  /**
   * UPDATE_SETTINGS - Ayarları güncelle
   */
  private async handleUpdateSettings(params: Record<string, any>): Promise<CommandResult> {
    try {
      const settings = params.settings || params;

      // Ayarları storage'a kaydet
      for (const [key, value] of Object.entries(settings)) {
        await StorageService.setSetting(key, value);
      }

      // Listener'ları bilgilendir
      this.notifyListeners('UPDATE_SETTINGS');

      return {
        success: true,
        message: 'Ayarlar güncellendi',
        data: settings,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Ayarlar güncellenemedi',
      };
    }
  }

  /**
   * REBOOT_DEVICE - Cihazı yeniden başlat
   */
  private async handleRebootDevice(): Promise<CommandResult> {
    try {
      // Android'de sistem izni gerektirir (root veya system app)
      if (Platform.OS === 'android') {
        try {
          const { PowerManager } = NativeModules;
          if (PowerManager?.reboot) {
            setTimeout(() => {
              PowerManager.reboot();
            }, 2000);
            return {
              success: true,
              message: 'Cihaz yeniden başlatılıyor',
            };
          }
        } catch {
          // PowerManager yoksa
        }
      }

      return {
        success: false,
        message: 'Cihaz yeniden başlatma desteklenmiyor (sistem izni gerekli)',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Cihaz yeniden başlatılamadı',
      };
    }
  }

  /**
   * Komut sonucunu sunucuya bildir
   */
  private async reportCommandResult(commandId: number, result: CommandResult): Promise<void> {
    try {
      await ApiService.reportCommandResult(commandId, result.success ? 'executed' : 'failed', result);
    } catch (error) {
      console.error('[CommandProcessor] Komut sonucu bildirilemedi:', error);
    }
  }
}

export default new CommandProcessor();

