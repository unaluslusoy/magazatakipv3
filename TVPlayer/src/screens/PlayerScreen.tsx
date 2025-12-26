import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import Video from 'react-native-video';
import StorageService from '@services/StorageService';
import SyncManager from '@services/SyncManager';
import ScheduleManager from '@services/ScheduleManager';
import Logger from '@services/Logger';
import type { Playlist, Content } from '@types/index';
import { useNavigation } from '@react-navigation/native';

const PlayerScreen = () => {
  const navigation = useNavigation();
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [currentContent, setCurrentContent] = useState<Content | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);

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

      // Get current playlist from schedule manager
      const playlist = await ScheduleManager.getCurrentPlaylist();

      if (!playlist || playlist.contents.length === 0) {
        Logger.warning('No playlist or contents available');
        return;
      }

      setCurrentPlaylist(playlist);
      setCurrentContent(playlist.contents[0].content);
      setCurrentIndex(0);
      
      Logger.info('Playlist loaded', { 
        playlistId: playlist.id, 
        playlistName: playlist.name,
        contentsCount: playlist.contents.length 
      });
    } catch (error) {
      Logger.error('Failed to load playlist', error);
    } finally {
      setLoading(false);
    }
  };

  const checkScheduleChange = async () => {
    const newPlaylist = await ScheduleManager.getCurrentPlaylist();
    if (newPlaylist && newPlaylist.id !== currentPlaylist?.id) {
      Logger.info('Schedule changed, loading new playlist', { 
        oldPlaylist: currentPlaylist?.name,
        newPlaylist: newPlaylist.name 
      });
      setCurrentPlaylist(newPlaylist);
      setCurrentContent(newPlaylist.contents[0].content);
      setCurrentIndex(0);
    }
  };

  const playNext = () => {
    if (!currentPlaylist) return;

    const nextIndex = (currentIndex + 1) % currentPlaylist.contents.length;
    setCurrentIndex(nextIndex);
    setCurrentContent(currentPlaylist.contents[nextIndex].content);
    
    Logger.info('Playing next content', { 
      index: nextIndex,
      contentId: currentPlaylist.contents[nextIndex].content.id 
    });
  };

  const handleVideoEnd = () => {
    playNext();
  };

  // Auto-advance for images
  useEffect(() => {
    if (!currentContent || currentContent.type !== 'image') {
      return;
    }

    const duration = currentContent.duration * 1000 || 10000; // Default 10 seconds
    const timer = setTimeout(() => {
      playNext();
    }, duration);

    return () => clearTimeout(timer);
  }, [currentContent]);

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const handleSync = async () => {
    await SyncManager.sync();
    await loadPlaylist();
  };

  const handleSettings = () => {
    navigation.navigate('Settings' as never);
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
        {currentContent.type === 'video' ? (
          <Video
            source={{ uri: currentContent.local_path || currentContent.file_url }}
            style={styles.video}
            resizeMode="contain"
            repeat={false}
            paused={false}
            onEnd={handleVideoEnd}
            onError={error => console.error('Video error:', error)}
          />
        ) : currentContent.type === 'image' ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: currentContent.local_path || currentContent.file_url }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        ) : (
          <View style={styles.templateContainer}>
            <Text style={styles.templateText}>{currentContent.title}</Text>
          </View>
        )}
      </TouchableOpacity>

      {showControls && (
        <View style={styles.controls}>
          <View style={styles.topBar}>
            <Text style={styles.playlistName}>{currentPlaylist?.name}</Text>
            <Text style={styles.contentInfo}>
              {currentIndex + 1} / {currentPlaylist?.contents.length}
            </Text>
          </View>

          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.controlButton} onPress={handleSync}>
              <Text style={styles.controlButtonText}>🔄 Sync</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={playNext}>
              <Text style={styles.controlButtonText}>⏭ Next</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={handleSettings}>
              <Text style={styles.controlButtonText}>⚙️ Settings</Text>
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
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  templateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  templateText: {
    fontSize: 48,
    color: '#fff',
    textAlign: 'center',
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
    bottom: 30,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 20,
    paddingHorizontal: 40,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default PlayerScreen;
