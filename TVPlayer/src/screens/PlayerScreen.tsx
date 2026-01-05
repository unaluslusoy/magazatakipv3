import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Animated,
  BackHandler,
  TVEventHandler,
  Platform,
  useTVEventHandler,
} from 'react-native';
import Video from 'react-native-video';
import StorageService from '@services/StorageService';
import SyncManager from '@services/SyncManager';
import ScheduleManager from '@services/ScheduleManager';
import DownloadManager from '@services/DownloadManager';
import Logger from '@services/Logger';
import type { Playlist, Content } from '@types/index';
import { useNavigation } from '@react-navigation/native';
import { APP_CONFIG } from '@config/constants';

// İndirme durumu tipi
interface DownloadStatus {
  isDownloading: boolean;
  totalFiles: number;
  completedFiles: number;
  currentFile: string;
  overallProgress: number;
}

const PlayerScreen = () => {
  const navigation = useNavigation();
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [currentContent, setCurrentContent] = useState<Content | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);

  // İndirme durumu
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>({
    isDownloading: false,
    totalFiles: 0,
    completedFiles: 0,
    currentFile: '',
    overallProgress: 0,
  });

  // Fade animation
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = (callback: () => void) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      callback();
      fadeIn();
    });
  };

  // Önceki içeriğe geç
  const playPrevious = useCallback(() => {
    if (!currentPlaylist) return;

    const contents = currentPlaylist.contents || [];
    if (contents.length === 0) return;

    fadeOut(() => {
      const prevIndex = (currentIndex - 1 + contents.length) % contents.length;
      const prevItem = contents[prevIndex];
      const prevContent = prevItem.content || prevItem;

      setCurrentIndex(prevIndex);
      setCurrentContent(prevContent);

      console.log('PlayerScreen: Önceki içerik:', prevContent?.title || prevContent?.name);
    });
  }, [currentPlaylist, currentIndex]);

  // Android TV Remote / D-pad kontrolü
  const handleTVEvent = useCallback((evt: any) => {
    if (!evt) return;

    const eventType = evt.eventType;
    console.log('TV Event:', eventType);

    switch (eventType) {
      case 'right':
      case 'swipeRight':
        // Sağ tuş: Sonraki içerik
        playNext();
        break;
      case 'left':
      case 'swipeLeft':
        // Sol tuş: Önceki içerik
        playPrevious();
        break;
      case 'up':
      case 'swipeUp':
        // Yukarı tuş: Senkronize et
        handleSync();
        break;
      case 'down':
      case 'swipeDown':
      case 'select':
      case 'playPause':
        // Aşağı/OK tuşu: Kontrolleri göster/gizle
        setShowControls(prev => !prev);
        break;
      case 'menu':
        // Menu tuşu: Ayarlar
        handleSettings();
        break;
      case 'back':
        // Back tuşu: Menüyü gizle
        if (showControls) {
          setShowControls(false);
        }
        break;
    }
  }, [playNext, playPrevious, handleSync, handleSettings, showControls]);

  // TV Event Handler
  useEffect(() => {
    // Android TV için event handler
    let tvEventHandler: any;

    if (Platform.OS === 'android') {
      try {
        tvEventHandler = new TVEventHandler();
        tvEventHandler.enable(null, (cmp: any, evt: any) => {
          handleTVEvent(evt);
        });
      } catch (e) {
        // TVEventHandler desteklenmiyor, devam et
        console.log('TVEventHandler not available');
      }
    }

    return () => {
      if (tvEventHandler) {
        tvEventHandler.disable();
      }
    };
  }, [handleTVEvent]);

  // Back button handler
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showControls) {
        setShowControls(false);
        return true; // Back tuşunu yakala
      }
      // Kontroller kapalıysa, kontrolleri göster (çıkış onayı için)
      setShowControls(true);
      return true;
    });

    return () => backHandler.remove();
  }, [showControls]);

  // DownloadManager listener
  useEffect(() => {
    const handleDownloadProgress = (info: DownloadStatus) => {
      setDownloadStatus(info);

      // İndirme tamamlandığında playlist'i yeniden yükle
      if (!info.isDownloading && info.totalFiles > 0 && info.completedFiles === info.totalFiles) {
        console.log('PlayerScreen: İndirmeler tamamlandı, playlist yeniden yükleniyor...');
        setTimeout(() => {
          loadPlaylist();
        }, 500);
      }
    };

    DownloadManager.addProgressListener(handleDownloadProgress);

    return () => {
      DownloadManager.removeProgressListener(handleDownloadProgress);
    };
  }, []);

  useEffect(() => {
    loadPlaylist();

    // Check schedule every minute
    const scheduleInterval = setInterval(() => {
      checkScheduleChange();
    }, 60000);

    return () => clearInterval(scheduleInterval);
  }, []);

  const loadPlaylist = async () => {
    try {
      setLoading(true);
      console.log('PlayerScreen: Playlist yükleniyor...');

      // Get current playlist from schedule manager
      const playlist = await ScheduleManager.getCurrentPlaylist();
      console.log('PlayerScreen: Playlist alındı:', playlist?.name, 'Contents:', playlist?.contents?.length);

      if (!playlist) {
        console.log('PlayerScreen: Playlist bulunamadı');
        Logger.warning('No playlist available');
        return;
      }

      // Contents formatını normalize et
      const contents = playlist.contents || [];
      console.log('PlayerScreen: Contents array:', contents.length);

      if (contents.length === 0) {
        console.log('PlayerScreen: İçerik yok');
        Logger.warning('No contents in playlist');
        return;
      }

      // Storage'dan güncel içerikleri al (local_path güncellenmiş olabilir)
      const storedContents = await StorageService.getContents();

      // Contents'ı local_path ile güncelle
      const updatedContents = contents.map((item: any) => {
        const content = item.content || item;
        const stored = storedContents.find((c: any) => c.id === content.id || c.id === content.content_id);
        if (stored?.local_path) {
          return { ...item, content: { ...content, local_path: stored.local_path } };
        }
        return item;
      });

      // İlk içeriği al - format: { content: {...} } veya doğrudan content objesi
      const firstItem = updatedContents[0];
      const firstContent = firstItem.content || firstItem;

      // Debug: Tüm içerik yapısını logla
      console.log('PlayerScreen: İlk item raw:', JSON.stringify(firstItem, null, 2));
      console.log('PlayerScreen: İlk içerik:', firstContent?.name || firstContent?.title, 'Tip:', firstContent?.type, 'Local:', firstContent?.local_path);

      // Playlist'i güncellenmiş contents ile kaydet
      const updatedPlaylist = { ...playlist, contents: updatedContents };

      setCurrentPlaylist(updatedPlaylist);
      setCurrentContent(firstContent);
      setCurrentIndex(0);

      Logger.info('Playlist loaded', {
        playlistId: playlist.id,
        playlistName: playlist.name,
        contentsCount: contents.length
      });
    } catch (error) {
      console.error('PlayerScreen: Playlist yükleme hatası:', error);
      Logger.error('Failed to load playlist', error);
    } finally {
      setLoading(false);
    }
  };

  const checkScheduleChange = async () => {
    const newPlaylist = await ScheduleManager.getCurrentPlaylist();
    if (newPlaylist && newPlaylist.id !== currentPlaylist?.id) {
      const contents = newPlaylist.contents || [];
      if (contents.length > 0) {
        const firstItem = contents[0];
        const firstContent = firstItem.content || firstItem;

        Logger.info('Schedule changed, loading new playlist', {
          oldPlaylist: currentPlaylist?.name,
          newPlaylist: newPlaylist.name
        });
        setCurrentPlaylist(newPlaylist);
        setCurrentContent(firstContent);
        setCurrentIndex(0);
      }
    }
  };

  const playNext = useCallback(() => {
    if (!currentPlaylist) return;

    const contents = currentPlaylist.contents || [];
    if (contents.length === 0) return;

    // Fade out, içerik değiştir, fade in
    fadeOut(() => {
      const nextIndex = (currentIndex + 1) % contents.length;
      const nextItem = contents[nextIndex];
      const nextContent = nextItem.content || nextItem;

      setCurrentIndex(nextIndex);
      setCurrentContent(nextContent);

      console.log('PlayerScreen: Sonraki içerik:', nextContent?.title || nextContent?.name);
    });
  }, [currentPlaylist, currentIndex]);


  const handleVideoEnd = () => {
    playNext();
  };

  const handleVideoError = (error: any) => {
    if (APP_CONFIG.ENABLE_DEBUG) {
      console.error('Video error:', error);
    }
    Logger.error('Video playback error', error);
    setTimeout(() => {
      playNext();
    }, 2000);
  };

  const handleImageError = (error: any) => {
    if (APP_CONFIG.ENABLE_DEBUG) {
      console.error('Image error:', error);
    }
    Logger.error('Image load error', error);
    setTimeout(() => {
      playNext();
    }, 2000);
  };

  // Auto-advance for images, ticker, and other non-video content
  useEffect(() => {
    if (!currentContent) return;

    // Video kendi kendine ilerler (onEnd callback ile)
    if (currentContent.type === 'video') {
      return;
    }

    const duration = getContentDuration(currentContent);
    console.log('PlayerScreen: Auto-advance timer başlatıldı:', duration, 'ms, Tip:', currentContent.type);

    const timer = setTimeout(() => {
      console.log('PlayerScreen: Timer doldu, sonraki içeriğe geçiliyor');
      playNext();
    }, duration);

    return () => clearTimeout(timer);
  }, [currentContent, currentIndex]);

  const toggleControls = useCallback(() => {
    setShowControls(prev => !prev);
  }, []);

  const handleSync = useCallback(async () => {
    console.log('PlayerScreen: Senkronizasyon başlatılıyor...');
    await SyncManager.sync();
    await loadPlaylist();
  }, []);

  const handleSettings = useCallback(() => {
    navigation.navigate('Settings' as never);
  }, [navigation]);

  const getFileUri = (content: Content | null) => {
    if (!content) return '';

    // Önce local_path kontrol et (önbellekteki dosya)
    if (content.local_path) {
      // file:// prefix ekle
      const localPath = content.local_path.startsWith('file://')
        ? content.local_path
        : `file://${content.local_path}`;
      return localPath;
    }

    // Yoksa URL kullan (online)
    const path = content.file_url || content.url;
    if (!path) return '';
    return path;
  };

  const getContentDuration = (content: Content | null): number => {
    if (!content) return 10000;
    // API'den duration veya duration_seconds gelebilir
    const seconds = content.duration || content.duration_seconds || 10;
    return seconds * 1000;
  };

  // İndirme devam ediyorsa ilerleme çubuğu göster
  if (downloadStatus.isDownloading && downloadStatus.totalFiles > 0) {
    return (
      <View style={styles.container}>
        <View style={styles.downloadContainer}>
          <Text style={styles.downloadTitle}>📥 İçerikler İndiriliyor</Text>

          <Text style={styles.downloadInfo}>
            {downloadStatus.completedFiles} / {downloadStatus.totalFiles} dosya
          </Text>

          {downloadStatus.currentFile ? (
            <Text style={styles.downloadFileName} numberOfLines={1}>
              {downloadStatus.currentFile}
            </Text>
          ) : null}

          {/* İlerleme çubuğu */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${downloadStatus.overallProgress}%` }
              ]}
            />
          </View>

          <Text style={styles.downloadPercent}>
            %{Math.round(downloadStatus.overallProgress)}
          </Text>

          <Text style={styles.downloadHint}>
            Lütfen bekleyin, indirme tamamlandığında içerikler otomatik başlayacak...
          </Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (!currentContent) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>İçerik bulunamadı</Text>
        <TouchableOpacity style={styles.button} onPress={handleSync}>
          <Text style={styles.buttonText}>Senkronize Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <TouchableOpacity
        style={styles.touchArea}
        activeOpacity={1}
        onPress={toggleControls}>
        <Animated.View style={[styles.stage, { opacity: fadeAnim }]}>
          {currentContent.type === 'video' ? (
            <Video
              source={{ uri: getFileUri(currentContent) }}
              style={styles.media}
              resizeMode="contain"
              repeat={false}
              paused={false}
              onEnd={handleVideoEnd}
              onError={handleVideoError}
            />
          ) : currentContent.type === 'image' ? (
            <Image
              source={{ uri: getFileUri(currentContent) }}
              style={styles.media}
              resizeMode="contain"
              onError={handleImageError}
            />
          ) : currentContent.type === 'ticker' ? (
            <View style={[styles.media, styles.tickerContainer]}>
              <Text style={styles.tickerText}>
                {currentContent.title || currentContent.name || currentContent.description || 'Kayan Yazı'}
              </Text>
            </View>
          ) : (
            <View style={[styles.media, styles.templateContainer]}>
              <Text style={styles.templateText}>
                {currentContent.title || currentContent.name || currentContent.description || 'İçerik'}
              </Text>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>

      {showControls && (
        <TouchableOpacity
          style={styles.controls}
          activeOpacity={1}
          onPress={() => setShowControls(false)}>
          <View style={styles.topBar}>
            <Text style={styles.playlistName}>{currentPlaylist?.name}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowControls(false)}>
              <Text style={styles.closeButtonText}>✕ Kapat</Text>
            </TouchableOpacity>
          </View>

          {/* İçerik bilgisi */}
          <View style={styles.contentInfoContainer}>
            <Text style={styles.contentInfo}>
              {currentIndex + 1} / {(currentPlaylist?.contents || []).length}
            </Text>
          </View>

          {/* TV Remote talimatları */}
          <View style={styles.tvHints}>
            <Text style={styles.tvHintText}>◀ Önceki  |  ▶ Sonraki  |  ▲ Senkronize  |  BACK/▼ Gizle</Text>
          </View>

          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={playPrevious}
              activeOpacity={0.7}>
              <Text style={styles.controlButtonText}>◀ Önceki</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleSync}
              activeOpacity={0.7}>
              <Text style={styles.controlButtonText}>↻ Senkronize</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={playNext}
              activeOpacity={0.7}>
              <Text style={styles.controlButtonText}>Sonraki ▶</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.settingsButton]}
              onPress={handleSettings}
              activeOpacity={0.7}>
              <Text style={styles.controlButtonText}>⚙ Ayarlar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchArea: {
    flex: 1,
    width: '100%',
  },
  stage: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: '100%',
    height: '100%',
    // Dikey modda tam ekran kullanılıyor
  },
  templateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#1a1a2e',
  },
  templateText: {
    fontSize: 56,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    lineHeight: 72,
  },
  tickerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
    backgroundColor: '#1a1a2e',
  },
  tickerText: {
    fontSize: 48,
    color: '#00ff88',
    textAlign: 'center',
    fontWeight: 'bold',
    lineHeight: 64,
  },
  loadingText: {
    color: '#fff',
    fontSize: 24,
    marginTop: 20,
  },
  // İndirme durumu stilleri
  downloadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    width: '80%',
    maxWidth: 500,
  },
  downloadTitle: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  downloadInfo: {
    fontSize: 28,
    color: '#00ff88',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  downloadFileName: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00ff88',
    borderRadius: 10,
  },
  downloadPercent: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  downloadHint: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 32,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 20,
    paddingHorizontal: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  controls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  topBar: {
    padding: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playlistName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  contentInfoContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  contentInfo: {
    color: '#fff',
    fontSize: 24,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
    borderRadius: 16,
    padding: 24,
    paddingHorizontal: 36,
    minWidth: 160,
    alignItems: 'center',
  },
  settingsButton: {
    backgroundColor: 'rgba(255, 149, 0, 0.8)',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tvHints: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tvHintText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
});

export default PlayerScreen;
