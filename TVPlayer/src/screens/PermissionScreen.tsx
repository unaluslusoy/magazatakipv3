import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, PermissionsAndroid, Platform, Alert, ActivityIndicator } from 'react-native';

interface PermissionScreenProps {
  onPermissionsGranted: () => void;
}

export const PermissionScreen: React.FC<PermissionScreenProps> = ({ onPermissionsGranted }) => {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    requestAllPermissions();
  }, []);

  const requestAllPermissions = async () => {
    if (Platform.OS !== 'android') {
      onPermissionsGranted();
      return;
    }

    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ];

      // Android 13+ için medya izinleri
      if (Platform.Version >= 33) {
        permissions.push(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO
        );
      }

      const granted = await PermissionsAndroid.requestMultiple(permissions);

      const allGranted = Object.values(granted).every(
        status => status === PermissionsAndroid.RESULTS.GRANTED
      );

      if (allGranted) {
        console.log('✅ Tüm izinler verildi');
        setTimeout(onPermissionsGranted, 500);
      } else {
        console.warn('⚠️ Bazı izinler reddedildi, devam ediliyor...');
        // Kullanıcı izin vermese bile devam et
        setTimeout(onPermissionsGranted, 500);
      }
    } catch (err) {
      console.error('❌ İzin hatası:', err);
      // Hata olsa bile devam et
      setTimeout(onPermissionsGranted, 500);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3DDC84" />
      <Text style={styles.text}>Uygulama Hazırlanıyor...</Text>
      <Text style={styles.subText}>İzinler kontrol ediliyor</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  text: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  subText: {
    color: '#888888',
    fontSize: 14,
    marginTop: 8,
  },
});
