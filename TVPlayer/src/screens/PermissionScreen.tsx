import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Animated,
} from 'react-native';
import { APP_CONFIG } from '@config/constants';

interface PermissionScreenProps {
  onPermissionsGranted: () => void;
}

export const PermissionScreen: React.FC<PermissionScreenProps> = ({ onPermissionsGranted }) => {
  const [permissionStatus, setPermissionStatus] = useState<'checking' | 'granted' | 'denied'>('checking');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Giriş animasyonu
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    requestAllPermissions();
  }, []);

  const requestAllPermissions = async () => {
    if (Platform.OS !== 'android') {
      onPermissionsGranted();
      return;
    }

    setPermissionStatus('checking');

    try {
      const permissions: string[] = [];

      if (Platform.Version >= 33) {
        permissions.push(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO
        );
      } else {
        permissions.push(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
      }

      const granted = await PermissionsAndroid.requestMultiple(permissions);

      const allGranted = Object.values(granted).every(
        status => status === PermissionsAndroid.RESULTS.GRANTED
      );

      if (allGranted) {
        if (APP_CONFIG.ENABLE_DEBUG) {
          console.log('Tüm izinler verildi');
        }
        setPermissionStatus('granted');
        // Animasyonlu geçiş
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          onPermissionsGranted();
        });
      } else {
        if (APP_CONFIG.ENABLE_DEBUG) {
          console.log('Bazı izinler reddedildi');
        }
        setPermissionStatus('denied');
      }
    } catch (err) {
      if (APP_CONFIG.ENABLE_DEBUG) {
        console.error('İzin hatası:', err);
      }
      setPermissionStatus('denied');
    }
  };

  if (permissionStatus === 'denied') {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔐</Text>
        </View>
        <Text style={styles.errorTitle}>İzin Gerekli</Text>
        <Text style={styles.errorText}>
          Uygulamanın içerikleri gösterebilmesi için medya dosyalarına erişim izni gerekiyor.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={requestAllPermissions}
          activeOpacity={0.8}>
          <Text style={styles.buttonText}>İzin Ver</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => Linking.openSettings()}
          activeOpacity={0.8}>
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Ayarları Aç</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>MP</Text>
      </View>
      <ActivityIndicator size="large" color="#3DDC84" style={styles.loader} />
      <Text style={styles.text}>Mağaza Pano</Text>
      <Text style={styles.subText}>Hazırlanıyor...</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 30,
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#3DDC84',
    borderRadius: 20,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#3DDC84',
  },
  loader: {
    marginBottom: 20,
  },
  text: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subText: {
    color: '#888888',
    fontSize: 18,
    marginTop: 8,
  },
  iconContainer: {
    marginBottom: 20,
  },
  icon: {
    fontSize: 64,
  },
  errorTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  errorText: {
    color: '#aaaaaa',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
    maxWidth: 400,
  },
  button: {
    backgroundColor: '#3DDC84',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3DDC84',
    marginTop: 16,
  },
  secondaryButtonText: {
    color: '#3DDC84',
  },
});
