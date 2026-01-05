import React, { useState, useEffect } from 'react';
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
import { APP_CONFIG } from '@config/constants';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [deviceCode, setDeviceCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState<number>(0);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        // Önce local token kontrolü
        const isLocallyLoggedIn = await StorageService.isLoggedIn();
        if (!isLocallyLoggedIn) {
          const saved = await StorageService.getDeviceCode();
          if (saved) {
            setDeviceCode(saved);
          }
          return;
        }

        // Token var, sunucudan doğrula
        try {
          const device = await ApiService.verifyToken();
          if (device) {
            await StorageService.saveDeviceInfo(device);
            navigation.reset({
              index: 0,
              routes: [{ name: 'Player' as never }],
            });
            return;
          }
        } catch {
          // Token geçersiz, login ekranında kal
        }

        const saved = await StorageService.getDeviceCode();
        if (saved) {
          setDeviceCode(saved);
        }
      } finally {
        setCheckingSession(false);
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!cooldownUntil) return;

    const tick = () => {
      const leftMs = cooldownUntil - Date.now();
      const leftSec = Math.max(0, Math.ceil(leftMs / 1000));
      setCooldownSecondsLeft(leftSec);
      if (leftSec <= 0) {
        setCooldownUntil(null);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const handleLogin = async () => {
    // cooldown aktifse denemeyi engelle
    if (cooldownUntil && cooldownUntil > Date.now()) {
      Alert.alert(
        'Çok Fazla Deneme',
        `Güvenlik nedeniyle kısa süre beklemeniz gerekiyor.\n\nKalan süre: ${cooldownSecondsLeft} sn`
      );
      return;
    }

    if (!deviceCode.trim()) {
      Alert.alert('Uyarı', 'Lütfen cihaz kodunu girin.');
      return;
    }

    setLoading(true);

    try {
      const authToken = await ApiService.login({ device_code: deviceCode.trim() });

      if (!authToken || !authToken.device) {
        throw new Error('Sunucudan geçersiz yanıt alındı (Cihaz bilgisi eksik).');
      }

      await StorageService.saveAuthToken(authToken);
      await StorageService.saveDeviceInfo(authToken.device);
      await StorageService.saveDeviceCode(deviceCode.trim());

      await SyncManager.sync();

      SyncManager.startAutoSync(false);
      await SocketService.connect();

      // Login ekranına geri dönmeyi engelle
      navigation.reset({
        index: 0,
        routes: [{ name: 'Player' as never }],
      });
    } catch (error: any) {
      let errorMessage = 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.';

      if (error?.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = 'Hatalı istek. Lütfen kodu kontrol edin.';
            break;
          case 401:
            errorMessage = 'Cihaz kodu geçersiz. Lütfen kontrol edip tekrar deneyin.';
            break;
          case 403:
            errorMessage = 'Bu cihazın erişim yetkisi yok. Yönetici ile iletişime geçin.';
            break;
          case 404:
            errorMessage = 'Cihaz bulunamadı. Panelden yeni cihaz kodu oluşturun.';
            break;
          case 429: {
            // Backend 1 dk blok uyguluyor; kullanıcıyı doğru yönlendir
            const retryAfterHeader = error.response.headers?.['retry-after'];
            const retryAfterSec = Number(retryAfterHeader);
            const waitSec = Number.isFinite(retryAfterSec) && retryAfterSec > 0 ? retryAfterSec : 60;
            setCooldownUntil(Date.now() + waitSec * 1000);
            errorMessage = `Çok fazla deneme yaptınız.\n\nLütfen ${waitSec} saniye bekleyip tekrar deneyin.`;
            break;
          }
          case 500:
            errorMessage = 'Sunucu kaynaklı bir sorun oluştu. Teknik destek ile iletişime geçin.';
            break;
          default:
            errorMessage = String(error.response.data?.message || 'Sunucu ile iletişimde sorun oluştu.');
        }
      } else if (error?.request) {
        errorMessage = 'Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.';
      } else {
        errorMessage = `Uygulama hatası: ${error?.message || 'Bilinmeyen hata'}`;
      }

      Alert.alert('Giriş Başarısız', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator color="#3DDC84" />
          <Text style={[styles.subtitle, { marginTop: 16 }]}>Kontroller yapılıyor...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo Alanı: Yeşil çerçeveli MP logosu */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>MP</Text>
        </View>

        <Text style={styles.title}>Mağaza Pano</Text>
        <Text style={styles.subtitle}>Reklam Panosu</Text>

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
            style={[styles.button, (loading || (cooldownUntil && cooldownUntil > Date.now())) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading || (cooldownUntil != null && cooldownUntil > Date.now())}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : cooldownUntil && cooldownUntil > Date.now() ? (
              <Text style={styles.buttonText}>Bekleyin ({cooldownSecondsLeft}s)</Text>
            ) : (
              <Text style={styles.buttonText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* cooldown yazısı */}
        {cooldownUntil && cooldownUntil > Date.now() ? (
          <Text style={styles.cooldownText}>
            Çok fazla deneme yapıldı. {cooldownSecondsLeft} saniye sonra tekrar deneyebilirsiniz.
          </Text>
        ) : null}

        <Text style={styles.version}>v{APP_CONFIG.VERSION}</Text>
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
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#3DDC84', // Yeşil çerçeve
    borderRadius: 20,
  },
  logoText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#3DDC84', // Yeşil yazı
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
  cooldownText: {
    marginTop: 18,
    color: '#ffcc00',
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 520,
  },
});

export default LoginScreen;
