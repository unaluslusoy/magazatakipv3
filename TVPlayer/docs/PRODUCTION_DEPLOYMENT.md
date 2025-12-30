# 📱 MağazaPano TV Player - Production Deployment

## 🚀 Canlıya Alma Adımları

### 1️⃣ API Bilgilerini Güncelleme

`src/config/constants.ts` dosyasını açın ve aşağıdaki değerleri güncelleyin:

```typescript
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://192.168.0.127:3000/api' 
    : 'https://api.sizinsunucunuz.com/api', // 👈 BURAYA CANLI API URL
  SOCKET_URL: __DEV__
    ? 'http://192.168.0.127:3000'
    : 'https://api.sizinsunucunuz.com', // 👈 BURAYA CANLI SOCKET URL
  TIMEOUT: 30000,
};
```

### 2️⃣ Logo/Icon Oluşturma

1. `logo-generator.html` dosyasını tarayıcıda açın (zaten açıldı ✅)
2. "Tümünü İndir" butonuna basın
3. İndirilen PNG dosyalarını şu klasörlere kopyalayın:

```
android/app/src/main/res/mipmap-mdpi/ic_launcher.png (48x48)
android/app/src/main/res/mipmap-hdpi/ic_launcher.png (72x72)
android/app/src/main/res/mipmap-xhdpi/ic_launcher.png (96x96)
android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png (144x144)
android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png (192x192)
```

4. AndroidManifest.xml'i güncelleyin:
```xml
<application
  android:icon="@mipmap/ic_launcher"
  android:roundIcon="@mipmap/ic_launcher_round"
```

### 3️⃣ Release APK Build

```powershell
cd android
.\gradlew assembleRelease
```

APK konumu: `android/app/build/outputs/apk/release/app-release.apk`

### 4️⃣ APK İmzalama (Opsiyonel - Google Play için gerekli)

1. Keystore oluşturun:
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore magazapano.keystore -alias magazapano -keyalg RSA -keysize 2048 -validity 10000
```

2. `android/gradle.properties` dosyasına ekleyin:
```properties
MYAPP_RELEASE_STORE_FILE=magazapano.keystore
MYAPP_RELEASE_KEY_ALIAS=magazapano
MYAPP_RELEASE_STORE_PASSWORD=***
MYAPP_RELEASE_KEY_PASSWORD=***
```

3. `android/app/build.gradle` içinde release signing ekleyin

### 5️⃣ İzinler

✅ Otomatik alınacak izinler:
- İnternet erişimi
- Depolama okuma/yazma
- Medya dosyaları (Android 13+)
- WiFi durumu
- Ekranı açık tutma
- Pil optimizasyonu muafiyeti

İlk açılışta kullanıcıya gösterilecek ve onaylanacak.

### 6️⃣ Test

```bash
# Tablette test
adb install -r android/app/build/outputs/apk/release/app-release.apk
adb shell am start -n com.magazatvplayer/.MainActivity

# Logları izle
adb logcat | grep -i "magazatvplayer\|ReactNative"
```

## 📋 Özellikler

✅ Offline-first mimari (MMKV)
✅ Otomatik senkronizasyon (5 dk)
✅ Real-time WebSocket
✅ Akıllı playlist zamanlama
✅ Paralel medya indirme
✅ Tam ekran dikey mod
✅ Otomatik izin yönetimi
✅ Centralized logging

## 🔧 Geliştirici Notları

- **Debug Build**: `gradlew assembleDebug` - Geliştirme (192.168.0.127:3000)
- **Release Build**: `gradlew assembleRelease` - Canlı sunucu
- **Log**: `adb logcat -s ReactNativeJS:V`
- **Clean**: `gradlew clean`

## 📞 Destek

Sorun yaşarsanız:
1. Backend'in çalıştığından emin olun
2. Firewall/güvenlik duvarı kontrolü
3. APK loglarını kontrol edin
4. WiFi bağlantısını test edin

---

**Son Güncelleme:** 26 Aralık 2025
