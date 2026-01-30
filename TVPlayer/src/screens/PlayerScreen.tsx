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
import CommandProcessor from '@services/CommandProcessor';
import Logger from '@services/Logger';
import type { Playlist, Content } from '@types/index';
import { useNavigation } from '@react-navigation/native';
import { APP_CONFIG } from '@config/constants';
import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Ekran boyutuna göre ölçekleme
const baseWidth = 1080; // Referans genişlik (dikey mod için)
const baseHeight = 1920; // Referans yükseklik

// Genişliğe göre ölçekle
const scaleWidth = (size: number) => (SCREEN_WIDTH / baseWidth) * size;
// Yüksekliğe göre ölçekle
const scaleHeight = (size: number) => (SCREEN_HEIGHT / baseHeight) * size;
// Font ölçekleme (daha küçük ekranlarda çok küçülmesin)
const scaleFont = (size: number) => {
  const scale = SCREEN_WIDTH / baseWidth;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};
// Moderate ölçekleme (hem genişlik hem yükseklik ortalaması)
const moderateScale = (size: number, factor = 0.5) => {
  return size + (scaleWidth(size) - size) * factor;
};

// HTML etiketlerini temizle
const stripHtml = (html: string): string => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ouml;/g, 'ö')
    .replace(/&uuml;/g, 'ü')
    .replace(/&ccedil;/g, 'ç')
    .replace(/\s+/g, ' ')
    .trim();
};

// Kayan yazı bileşeni - tam genişlikte yumuşak kaydırma
const TickerText = ({ text, style }: { text: string; style?: any }) => {
  const scrollAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const cleanText = stripHtml(text || ''); // Handle null/undefined
  const [textWidth, setTextWidth] = useState(SCREEN_WIDTH * 2);

  // Yazı uzunluğuna göre animasyon süresi - yavaş ve okunaklı
  // Karakter başına ~250ms, minimum 15 saniye
  const duration = Math.max(15000, cleanText.length * 250);

  useEffect(() => {
    if (!cleanText) return;

    // Animasyonu başlat
    const startAnimation = () => {
      scrollAnim.setValue(SCREEN_WIDTH);
      Animated.timing(scrollAnim, {
        toValue: -(textWidth + 100), // Yazının tamamı ekrandan çıksın
        duration: duration,
        useNativeDriver: true,
        isInteraction: false,
      }).start(({ finished }) => {
        if (finished) {
          // Döngü - başa dön
          startAnimation();
        }
      });
    };

    // İlk başlatma
    const timer = setTimeout(startAnimation, 500);

    return () => {
      clearTimeout(timer);
      scrollAnim.stopAnimation();
    };
  }, [cleanText, duration, textWidth]);

  if (!cleanText) return null;

  return (
    <Animated.Text
      style={[
        {
          fontSize: scaleFont(48), // Okunabilir font boyutu
          color: '#ffffff',
          fontWeight: 'bold',
          position: 'absolute',
          left: 0,
          transform: [{ translateX: scrollAnim }],
          textShadowColor: 'rgba(0, 0, 0, 0.9)',
          textShadowOffset: { width: 3, height: 3 },
          textShadowRadius: 8,
          includeFontPadding: false,
          textAlignVertical: 'center',
          letterSpacing: 1,
        },
        style,
      ]}
      onLayout={(e) => {
        const width = e.nativeEvent.layout.width;
        if (width > 0) {
          setTextWidth(width);
        }
      }}
      numberOfLines={1}
      ellipsizeMode="clip">
      {cleanText}
    </Animated.Text>
  );
};

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
  const [lastPlaylistSignature, setLastPlaylistSignature] = useState<string | null>(null);
  const [mediaInstanceKey, setMediaInstanceKey] = useState(0);
  const [videoSeconds, setVideoSeconds] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoRestartCount, setVideoRestartCount] = useState(0);

  const videoRef = useRef<Video>(null);
  const lastProgressRef = useRef(0);
  const lastProgressAtRef = useRef(Date.now());
  const resumeAtRef = useRef(0);

  // Video içerik değişince sayaçları ve yeniden başlatma durumunu sıfırla
  useEffect(() => {
    if (!currentContent || currentContent.type !== 'video') return;
    setVideoSeconds(0);
    setVideoDuration(0);
    setVideoRestartCount(0);
    resumeAtRef.current = 0;
    lastProgressRef.current = 0;
    lastProgressAtRef.current = Date.now();
  }, [currentContent?.id, currentContent?.type]);

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
      const baseContent = prevItem.content || prevItem;

      // duration_override'ı content'e ekle
      const prevContent = {
        ...baseContent,
        duration_override: prevItem.duration_override || prevItem.duration || null,
        duration: prevItem.duration || baseContent.duration || baseContent.duration_seconds,
      };

      setCurrentIndex(prevIndex);
      setCurrentContent(prevContent);

      console.log('PlayerScreen: Önceki içerik:', prevContent?.name || prevContent?.title, 'Süre:', prevContent.duration);
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

  // Command listener - Panel'den gelen komutları dinle
  useEffect(() => {
    const handleCommand = (command: string) => {
      console.log('[PlayerScreen] Komut alındı:', command);

      if (command === 'REFRESH_CONTENT' || command === 'UPDATE_SETTINGS') {
        // Playlist'i yeniden yükle
        loadPlaylist();
      }
    };

    CommandProcessor.addListener(handleCommand);

    return () => {
      CommandProcessor.removeListener(handleCommand);
    };
  }, []);

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

      // Playlist imzası (versiyon/updated_at değiştiyse yeniden indir)
      const playlistSignature = `${playlist.id}:${(playlist as any).version || ''}:${playlist.updated_at || ''}`;
      const forceDownload = lastPlaylistSignature !== playlistSignature;
      if (forceDownload) {
        console.log('PlayerScreen: Playlist güncellendi, tüm içerikler yeniden indiriliyor...');
        setLastPlaylistSignature(playlistSignature);
      }

      // Storage'dan güncel içerikleri al (local_path güncellenmiş olabilir)
      const storedContents = await StorageService.getContents();

      // Contents'ı local_path ile güncelle ve duration bilgilerini aktar
      const updatedContents = contents.map((item: any) => {
        const content = item.content || item;
        const stored = storedContents.find((c: any) => c.id === content.id || c.id === content.content_id);

        // Content'e playlist_content'ten gelen duration_override'ı ekle
        const mergedContent = {
          ...content,
          duration_override: item.duration_override || item.duration || null,
          duration: item.duration || content.duration || content.duration_seconds,
          ...(stored?.local_path ? { local_path: stored.local_path } : {}),
        };

        return { ...item, content: mergedContent };
      });

      // İndirme zorunlu: yeni playlist veya local_path eksikse indir
      await ensureOfflineCopies(updatedContents, forceDownload);

      // İndirme sonrası local_path güncelle
      const storedContentsAfter = await StorageService.getContents();
      const updatedContentsAfter = contents.map((item: any) => {
        const content = item.content || item;
        const stored = storedContentsAfter.find((c: any) => c.id === content.id || c.id === content.content_id);
        const mergedContent = {
          ...content,
          duration_override: item.duration_override || item.duration || null,
          duration: item.duration || content.duration || content.duration_seconds,
          ...(stored?.local_path ? { local_path: stored.local_path } : {}),
        };
        return { ...item, content: mergedContent };
      });

      // İlk içeriği al - format: { content: {...} } veya doğrudan content objesi
      const firstItem = updatedContentsAfter[0];
      const baseContent = firstItem.content || firstItem;

      // duration_override'ı content'e ekle
      const firstContent = {
        ...baseContent,
        duration_override: firstItem.duration_override || firstItem.duration || null,
        duration: firstItem.duration || baseContent.duration || baseContent.duration_seconds,
      };

      // Debug: Tüm içerik yapısını logla
      console.log('PlayerScreen: İlk item raw:', JSON.stringify(firstItem, null, 2));
      console.log('PlayerScreen: İlk içerik:', firstContent?.name || firstContent?.title, 'Tip:', firstContent?.type, 'Süre:', firstContent.duration, 'ticker_text:', firstContent?.ticker_text);

      // Playlist'i güncellenmiş contents ile kaydet
      const updatedPlaylist = { ...playlist, contents: updatedContentsAfter };

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
      const baseContent = nextItem.content || nextItem;

      // duration_override'ı content'e ekle
      const nextContent = {
        ...baseContent,
        duration_override: nextItem.duration_override || nextItem.duration || null,
        duration: nextItem.duration || baseContent.duration || baseContent.duration_seconds,
      };

      console.log('PlayerScreen: Sonraki içerik:', nextContent?.name || nextContent?.title, 'Süre:', nextContent.duration || nextContent.duration_override);

      setCurrentIndex(nextIndex);
      setCurrentContent(nextContent);
    });
  }, [currentPlaylist, currentIndex]);


  const getExpectedVideoDurationSec = (content: Content | null) => {
    if (!content) return 0;
    const durationOverride = (content as any).duration_override;
    const duration = content.duration;
    const durationSeconds = content.duration_seconds;
    return durationOverride || duration || durationSeconds || 0;
  };

  const handleVideoEnd = useCallback(() => {
    console.log('PlayerScreen: Video tamamlandı, sonraki içeriğe geçiliyor...');

    // Kısa bir gecikme ile sonraki içeriğe geç (player'ın temizlenmesi için)
    setTimeout(() => {
      playNext();
    }, 300);
  }, [playNext]);

  const handleVideoError = useCallback((error: any) => {
    if (APP_CONFIG.ENABLE_DEBUG) {
      console.error('Video error:', error);
    }
    Logger.error('Video playback error', error);
    setTimeout(() => {
      playNext();
    }, 2000);
  }, [playNext]);

  const handleImageError = useCallback((error: any) => {
    if (APP_CONFIG.ENABLE_DEBUG) {
      console.error('Image error:', error);
    }
    Logger.error('Image load error', error);
    setTimeout(() => {
      playNext();
    }, 2000);
  }, [playNext]);

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
    if (!content) {
      console.log('PlayerScreen: Content null!');
      return '';
    }

    // Önbellekteki dosya varsa her zaman onu kullan (offline destek)
    if (content.local_path) {
      // RN'de yerel dosya için file:// prefix'i ekle
      const localUri = content.local_path.startsWith('file://')
        ? content.local_path
        : `file://${content.local_path}`;
      console.log('PlayerScreen: local_path kullanılıyor:', localUri);
      return localUri;
    }

    // Online URL'yi hazırla
    let path = content.file_url || content.url || '';

    console.log('PlayerScreen: getFileUri - raw path:', path, 'type:', content.type);

    if (!path) {
      console.log('PlayerScreen: URL bulunamadı, içerik:', content.name || content.id);
      return '';
    }

    // Backslash'leri düzelt (API'den escape edilmiş gelebilir)
    path = path.replace(/\\\//g, '/');

    // Eğer zaten tam URL ise direkt döndür
    if (path.startsWith('http://') || path.startsWith('https://')) {
      console.log('PlayerScreen: Tam URL kullanılıyor:', path);
      return path;
    }

    // Relative path ise base URL ekle
    const baseUrl = 'https://pano.magazatakip.com.tr';

    // Path başında / varsa kaldır
    if (path.startsWith('/')) {
      path = path.substring(1);
    }

    // images/ veya videos/ ile başlıyorsa uploads/ prefix'i ekle
    if (path.startsWith('images/') || path.startsWith('videos/')) {
      path = `uploads/${path}`;
    }

    const fullUrl = `${baseUrl}/${path}`;
    console.log('PlayerScreen: Full URL oluşturuldu:', fullUrl);
    return fullUrl;
  };

  const getContentDuration = (content: Content | null): number => {
    if (!content) return 10000;

    // API'den farklı alanlarla gelebilir:
    // - duration_override (playlist_content tablosundan - öncelikli)
    // - duration (content tablosundan veya playlist_content'ten)
    // - duration_seconds (content tablosundan)
    const durationOverride = (content as any).duration_override;
    const duration = content.duration;
    const durationSeconds = content.duration_seconds;

    // Öncelik sırası: duration_override > duration > duration_seconds > 10 (varsayılan)
    let seconds = 10; // varsayılan

    if (durationOverride && durationOverride > 0) {
      seconds = durationOverride;
    } else if (duration && duration > 0) {
      seconds = duration;
    } else if (durationSeconds && durationSeconds > 0) {
      seconds = durationSeconds;
    }

    console.log('PlayerScreen: İçerik süresi hesaplandı:', {
      id: content.id,
      name: content.name || content.title,
      type: content.type,
      duration_override: durationOverride,
      duration: duration,
      duration_seconds: durationSeconds,
      hesaplanan_saniye: seconds,
      hesaplanan_ms: seconds * 1000,
    });

    return seconds * 1000;
  };

  const ensureOfflineCopies = useCallback(async (contents: any[], forceDownload = false) => {
    for (const item of contents) {
      const content = item.content || item;
      const needsDownload = forceDownload || !content.local_path;
      if (!needsDownload) continue;
      try {
        await DownloadManager.downloadContent(content);
      } catch (err) {
        console.log('PlayerScreen: İndirme hatası:', content?.name || content?.id, err);
      }
    }
  }, []);

  const formatTime = (seconds: number) => {
    const s = Math.max(0, Math.floor(seconds));
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  // Video takılma izleme: ilerleme yoksa player'ı yeniden başlat
  useEffect(() => {
    if (!currentContent || currentContent.type !== 'video') return;

    let stallCount = 0;
    const maxStallCount = 3; // 3 kontrol sonrası yeniden başlat

    const stallCheck = setInterval(() => {
      const now = Date.now();
      const idleMs = now - lastProgressAtRef.current;

      // 10 saniyeden fazla ilerleme yoksa
      if (idleMs > 10000 && lastProgressRef.current > 0) {
        stallCount++;
        console.log('PlayerScreen: Video takılma tespit edildi', {
          idleMs,
          stallCount,
          position: lastProgressRef.current
        });

        if (stallCount >= maxStallCount) {
          console.log('PlayerScreen: Video takıldı, yeniden başlatılıyor...');
          stallCount = 0;
          resumeAtRef.current = lastProgressRef.current;
          setMediaInstanceKey(prev => prev + 1);
          lastProgressAtRef.current = Date.now();
        }
      } else {
        stallCount = 0; // İlerleme varsa sayacı sıfırla
      }
    }, 5000);

    return () => clearInterval(stallCheck);
  }, [currentContent?.id, currentContent?.type]);

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
              key={`video-${currentContent.id}-${mediaInstanceKey}`}
              source={{ uri: getFileUri(currentContent) }}
              style={styles.media}
              resizeMode="cover"
              repeat={false}
              paused={false}
              useTextureView={false}
              playInBackground={false}
              playWhenInactive={false}
              ignoreSilentSwitch="ignore"
              progressUpdateInterval={500}
              ref={videoRef}
              onEnd={() => {
                // Video gerçekten bitti mi kontrol et
                const expectedDuration = videoDuration || getExpectedVideoDurationSec(currentContent);
                const actualPlayed = lastProgressRef.current;

                console.log('PlayerScreen: onEnd tetiklendi', {
                  expectedDuration,
                  actualPlayed,
                  videoDuration,
                  name: currentContent?.name
                });

                // Eğer beklenen sürenin %80'inden azı oynandıysa, video erken kesilmiş demektir
                if (expectedDuration > 0 && actualPlayed < expectedDuration * 0.8) {
                  console.log('PlayerScreen: Video erken kesildi! Yeniden başlatılıyor...');

                  // Dosya bozuk olabilir, yeniden indir
                  if (videoRestartCount < 2) {
                    setVideoRestartCount(prev => prev + 1);
                    resumeAtRef.current = actualPlayed;
                    setMediaInstanceKey(prev => prev + 1);
                    return;
                  }
                }

                // Normal sonlandırma
                handleVideoEnd();
              }}
              onError={(error: any) => {
                console.log('PlayerScreen: Video HATA:', JSON.stringify(error));
                console.log('PlayerScreen: Video URL:', getFileUri(currentContent));
                handleVideoError(error);
              }}
              onLoad={(data: any) => {
                const duration = data?.duration || 0;
                console.log('PlayerScreen: Video yüklendi:', currentContent?.name, 'Süre:', duration, 'saniye');
                setVideoDuration(duration);
                setVideoRestartCount(0); // Başarılı yüklemede restart sayacını sıfırla

                // Resume noktası varsa seek yap
                if (resumeAtRef.current > 0 && resumeAtRef.current < duration) {
                  const seekTo = resumeAtRef.current;
                  resumeAtRef.current = 0;
                  setTimeout(() => {
                    videoRef.current?.seek(seekTo);
                    console.log('PlayerScreen: Video seek yapıldı:', seekTo, 'saniye');
                  }, 200);
                }
              }}
              onProgress={(data: any) => {
                const t = data?.currentTime || 0;
                setVideoSeconds(t);
                lastProgressRef.current = t;
                lastProgressAtRef.current = Date.now();
              }}
              bufferConfig={{
                minBufferMs: 15000,
                maxBufferMs: 120000,
                bufferForPlaybackMs: 2500,
                bufferForPlaybackAfterRebufferMs: 5000,
                cacheSizeMB: 100,
              }}
              onBuffer={({ isBuffering }: { isBuffering: boolean }) => {
                if (isBuffering) {
                  console.log('PlayerScreen: Video buffer yapıyor... Pozisyon:', lastProgressRef.current);
                }
              }}
              onReadyForDisplay={() => {
                console.log('PlayerScreen: Video görüntülenmeye hazır');
              }}
              onPlaybackRateChange={({ playbackRate }: { playbackRate: number }) => {
                if (playbackRate === 0) {
                  console.log('PlayerScreen: Video durdu/pause');
                }
              }}
            />
          ) : currentContent.type === 'image' ? (
            <Image
              key={`image-${currentContent.id}-${mediaInstanceKey}`}
              source={{ uri: getFileUri(currentContent) }}
              style={styles.media}
              resizeMode="cover"
              resizeMethod="resize" // Android Image memory optimization
              onError={(error: any) => {
                console.log('PlayerScreen: Image HATA:', error?.nativeEvent?.error);
                console.log('PlayerScreen: Image URL:', getFileUri(currentContent));
                handleImageError(error);
              }}
              onLoad={() => {
                console.log('PlayerScreen: Image BAŞARILI yüklendi:', currentContent?.name);
              }}
            />
          ) : currentContent.type === 'ticker' ? (
            <View style={[styles.media, styles.tickerContainer]}>
              {/* Başlık - Sabit ortada */}
              <Text style={styles.tickerTitle}>
                {currentContent.name || currentContent.title || 'Duyuru'}
              </Text>
              {/* Kayan Yazı - ticker_text alanından */}
              <View style={styles.tickerTextContainer}>
                <TickerText
                  text={currentContent.ticker_text || currentContent.description || currentContent.text || 'Hoş geldiniz!'}
                />
              </View>
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

      {currentContent?.type === 'video' && (
        <View style={styles.videoTimerContainer}>
          <Text style={styles.videoTimerText}>{formatTime(videoSeconds)} / {formatTime(videoDuration)}</Text>
        </View>
      )}

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
  },
  templateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: scaleWidth(40),
    backgroundColor: '#1a1a2e',
  },
  templateText: {
    fontSize: scaleFont(56),
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    lineHeight: scaleFont(72),
  },
  tickerContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d1b2a', // Koyu mavi arka plan
  },
  tickerTitle: {
    fontSize: scaleFont(56),
    color: '#00d9ff', // Cyan renk
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: scaleHeight(60),
    paddingHorizontal: scaleWidth(30),
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    width: '100%',
    letterSpacing: 2,
  },
  tickerDescription: {
    fontSize: scaleFont(36),
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: scaleFont(50),
    paddingHorizontal: scaleWidth(20),
  },
  tickerText: {
    fontSize: scaleFont(48),
    color: '#ffffff',
    fontWeight: 'bold',
  },
  tickerTextContainer: {
    width: '100%',
    height: scaleHeight(150),
    justifyContent: 'center',
    alignItems: 'flex-start',
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: scaleHeight(20),
    position: 'relative',
  },
  loadingText: {
    color: '#fff',
    fontSize: scaleFont(24),
    marginTop: scaleHeight(20),
  },
  // İndirme durumu stilleri
  downloadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: scaleWidth(40),
    width: '85%',
  },
  downloadTitle: {
    fontSize: scaleFont(36),
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: scaleHeight(30),
  },
  downloadInfo: {
    fontSize: scaleFont(28),
    color: '#00ff88',
    fontWeight: 'bold',
    marginBottom: scaleHeight(10),
  },
  downloadFileName: {
    fontSize: scaleFont(18),
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: scaleHeight(20),
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: scaleHeight(20),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: scaleWidth(10),
    overflow: 'hidden',
    marginVertical: scaleHeight(20),
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00ff88',
    borderRadius: scaleWidth(10),
  },
  downloadPercent: {
    fontSize: scaleFont(48),
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: scaleHeight(20),
  },
  downloadHint: {
    fontSize: scaleFont(16),
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginTop: scaleHeight(20),
  },
  errorText: {
    color: '#fff',
    fontSize: scaleFont(32),
    marginBottom: scaleHeight(30),
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: scaleWidth(12),
    padding: scaleWidth(20),
    paddingHorizontal: scaleWidth(40),
  },
  buttonText: {
    color: '#fff',
    fontSize: scaleFont(24),
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
    padding: scaleWidth(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playlistName: {
    color: '#fff',
    fontSize: scaleFont(28),
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    paddingVertical: scaleHeight(12),
    paddingHorizontal: scaleWidth(24),
    borderRadius: scaleWidth(8),
  },
  closeButtonText: {
    color: '#fff',
    fontSize: scaleFont(20),
    fontWeight: 'bold',
  },
  contentInfoContainer: {
    alignItems: 'center',
    marginTop: scaleHeight(10),
  },
  contentInfo: {
    color: '#fff',
    fontSize: scaleFont(24),
  },
  bottomBar: {
    position: 'absolute',
    bottom: scaleHeight(40),
    left: scaleWidth(20),
    right: scaleWidth(20),
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: scaleWidth(15),
  },
  controlButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
    borderRadius: scaleWidth(12),
    padding: scaleWidth(18),
    paddingHorizontal: scaleWidth(28),
    minWidth: scaleWidth(140),
    alignItems: 'center',
  },
  settingsButton: {
    backgroundColor: 'rgba(255, 149, 0, 0.8)',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: scaleFont(20),
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
    fontSize: scaleFont(16),
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: scaleHeight(12),
    paddingHorizontal: scaleWidth(24),
    borderRadius: scaleWidth(8),
  },
  videoTimerContainer: {
    position: 'absolute',
    bottom: scaleHeight(20),
    left: scaleWidth(20),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: scaleHeight(6),
    paddingHorizontal: scaleWidth(10),
    borderRadius: scaleWidth(6),
  },
  videoTimerText: {
    color: '#fff',
    fontSize: scaleFont(16),
    fontWeight: 'bold',
  },
});

export default PlayerScreen;
