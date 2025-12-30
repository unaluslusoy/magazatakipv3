import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { APP_CONFIG } from '@config/constants';

interface PermissionScreenProps {
  onPermissionsGranted: () => void;
}

export const PermissionScreen: React.FC<PermissionScreenProps> = ({ onPermissionsGranted }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<'checking' | 'granted' | 'denied'>('checking');

  useEffect(() => {
    requestAllPermissions();
  }, []);

  const requestAllPermissions = async () => {
    if (Platform.OS !== 'android') {
      onPermissionsGranted();
      return;
    }

    setIsChecking(true);
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
        setTimeout(onPermissionsGranted, 250);
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
    } finally {
      setIsChecking(false);
    }
  };

  if (permissionStatus === 'denied') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>İzin Gerekli</Text>
        <Text style={styles.errorText}>
          Uygulamanın içerikleri gösterebilmesi için cihaza kayıtlı medya dosyalarına erişim izni gerekiyor.
          {'\n\n'}
          Lütfen “Tekrar İste” ile izin verin. Olmazsa “Ayarları Aç” ile izinleri manuel olarak açın.
        </Text>

        <TouchableOpacity style={styles.button} onPress={requestAllPermissions}>
          <Text style={styles.buttonText}>Tekrar İste</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => Linking.openSettings()}>
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Ayarları Aç</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3DDC84" />
      <Text style={styles.text}>Hazırlanıyor…</Text>
      <Text style={styles.subText}>İlk kurulum kontrolleri yapılıyor</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  text: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  subText: {
    color: '#888888',
    fontSize: 16,
    marginTop: 10,
  },
  errorTitle: {
    color: '#ff4444',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  errorText: {
    color: '#cccccc',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#3DDC84',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
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
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#3DDC84',
  },
});
