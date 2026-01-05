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
import Logger from '@services/Logger';
import type { Playlist, Content } from '@types/index';
import { useNavigation } from '@react-navigation/native';
import { APP_CONFIG } from '@config/constants';

const PlayerScreen = () => {
  const navigation = useNavigation();
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [currentContent, setCurrentContent] = useState<Content | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);

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
        // Aşağı tuş: Kontrolleri göster/gizle
        setShowControls(prev => !prev);
        break;
      case 'select':
      case 'playPause':
        // OK/Select tuşu: Kontrolleri göster/gizle
        setShowControls(prev => !prev);
        break;
      case 'menu':
        // Menu tuşu: Ayarlar
        handleSettings();
        break;
    }
  }, [playNext, playPrevious]);

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

      // İlk içeriği al - format: { content: {...} } veya doğrudan content objesi
      const firstItem = contents[0];
      const firstContent = firstItem.content || firstItem;

      // Debug: Tüm içerik yapısını logla
      console.log('PlayerScreen: İlk item raw:', JSON.stringify(firstItem, null, 2));
      console.log('PlayerScreen: İlk içerik:', firstContent?.name || firstContent?.title, 'Tip:', firstContent?.type, 'URL:', firstContent?.file_url || firstContent?.url);

      setCurrentPlaylist(playlist);
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
    // Önce local_path, sonra file_url, sonra url
    const path = content.local_path || content.file_url || content.url;
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('file://')) return path;
    return `file://${path}`;
  };

  const getContentDuration = (content: Content | null): number => {
    if (!content) return 10000;
    // API'den duration veya duration_seconds gelebilir
    const seconds = content.duration || content.duration_seconds || 10;
    return seconds * 1000;
  };

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
        <View style={styles.controls}>
          <View style={styles.topBar}>
            <Text style={styles.playlistName}>{currentPlaylist?.name}</Text>
            <Text style={styles.contentInfo}>
              {currentIndex + 1} / {(currentPlaylist?.contents || []).length}
            </Text>
          </View>

          {/* TV Remote talimatları */}
          <View style={styles.tvHints}>
            <Text style={styles.tvHintText}>◀ Önceki  |  ▶ Sonraki  |  ▲ Senkronize  |  ▼ Gizle  |  MENU Ayarlar</Text>
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
        </View>
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
  },
  playlistName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
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
