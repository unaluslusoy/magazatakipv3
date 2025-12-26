import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ApiService from '@services/ApiService';
import StorageService from '@services/StorageService';
import SyncManager from '@services/SyncManager';
import SocketService from '@services/SocketService';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [deviceCode, setDeviceCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!deviceCode.trim()) {
      Alert.alert('Hata', 'Lütfen cihaz kodunu giriniz');
      return;
    }

    setLoading(true);

    try {
      // Login
      const authToken = await ApiService.login({ device_code: deviceCode.trim() });

      // Save token and device info
      await StorageService.saveAuthToken(authToken);
      await StorageService.saveDeviceInfo(authToken.device);

      // Start sync
      SyncManager.startAutoSync();

      // Connect socket
      await SocketService.connect();

      // Navigate to player
      navigation.navigate('Player' as never);
    } catch (error: any) {
      console.error('Login failed:', error);
      Alert.alert(
        'Giriş Başarısız',
        error.response?.data?.message || 'Geçersiz cihaz kodu'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logoText}>📺</Text>

        <Text style={styles.title}>Mağaza Panel</Text>
        <Text style={styles.subtitle}>TV Oynatıcı</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Cihaz Kodu"
            placeholderTextColor="#999"
            value={deviceCode}
            onChangeText={setDeviceCode}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={20}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>v1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  logoText: {
    fontSize: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 24,
    color: '#999',
    marginBottom: 50,
  },
  form: {
    width: '100%',
    maxWidth: 500,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  version: {
    position: 'absolute',
    bottom: 20,
    color: '#666',
    fontSize: 16,
  },
});

export default LoginScreen;
