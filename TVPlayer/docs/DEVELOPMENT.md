# 📱 Mağaza Pano - Geliştirme Dokümanı

**Versiyon:** 1.1.0
**Son Güncelleme:** 5 Ocak 2026
**Platform:** Android TV / Tablet (Android 13+)

---

## 📋 İçindekiler

1. [Proje Yapısı](#proje-yapısı)
2. [Kurulum](#kurulum)
3. [API Entegrasyonu](#api-entegrasyonu)
4. [Ekran Akışı](#ekran-akışı)
5. [Android TV Özellikleri](#android-tv-özellikleri)
6. [Kiosk Modu](#kiosk-modu)
7. [Build ve Deploy](#build-ve-deploy)
8. [Sorun Giderme](#sorun-giderme)

---

## 📁 Proje Yapısı

```
TVPlayer/
├── android/                    # Android native kodu
│   └── app/src/main/
│       ├── java/.../
│       │   ├── MainActivity.kt     # Ana Activity (kiosk modu)
│       │   ├── MainApplication.kt  # Uygulama başlatma
│       │   ├── BootUpReceiver.kt   # Boot sonrası başlatma
│       │   └── KioskService.kt     # Foreground service
│       └── AndroidManifest.xml     # İzinler ve ayarlar
├── src/
│   ├── App.tsx                 # Ana uygulama bileşeni
│   ├── config/
│   │   └── constants.ts        # API URL, timeout ayarları
│   ├── screens/
│   │   ├── LoginScreen.tsx     # Cihaz kodu girişi
│   │   ├── PlayerScreen.tsx    # İçerik oynatıcı
│   │   ├── SettingsScreen.tsx  # Ayarlar
│   │   └── PermissionScreen.tsx # İzin isteme
│   ├── services/
│   │   ├── ApiService.ts       # Backend API iletişimi
│   │   ├── StorageService.ts   # AsyncStorage yönetimi
│   │   ├── SyncManager.ts      # İçerik senkronizasyonu
│   │   ├── ScheduleManager.ts  # Zamanlama yönetimi
│   │   ├── SocketService.ts    # WebSocket bağlantısı
│   │   ├── DownloadManager.ts  # Medya indirme
│   │   └── Logger.ts           # Loglama
│   └── types/
│       └── index.ts            # TypeScript tipleri
├── package.json
└── CHANGELOG.md
```

---

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- Java JDK 17-20
- Android Studio (SDK 34)
- React Native CLI

### Adımlar

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Android build
cd android && ./gradlew assembleDebug

# 3. Cihaza yükle
npx react-native run-android

# 4. Release APK oluştur
cd android && ./gradlew assembleRelease
```

---

## 🔌 API Entegrasyonu

### Base URL
```
https://mtapi.magazatakip.com.tr/api
```

### Endpoint'ler

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/auth/device-login` | POST | Cihaz girişi (token al) |
| `/auth/verify` | GET | Token doğrulama |
| `/devices/{id}` | GET | Cihaz bilgisi + current_playlist_id |
| `/playlists/{id}` | GET | Playlist detayları + içerikler |
| `/schedules` | GET | Zamanlama listesi |
| `/devices/heartbeat` | POST | Canlılık sinyali |
| `/contents` | GET | İçerik listesi |

### Örnek Akış

```typescript
// 1. Cihaz girişi
const response = await ApiService.login({ device_code: 'TV-001' });
// Token ve device bilgisi döner

// 2. Cihaz bilgisi al
const device = await ApiService.getDeviceById(deviceId);
// current_playlist_id ile hangi playlist atanmış öğren

// 3. Playlist detayını al
const playlist = await ApiService.getPlaylistById(playlistId);
// contents array'i ile içerikler gelir

// 4. Heartbeat gönder (her 60 saniye)
await ApiService.sendHeartbeat(playlistId, contentId, true);
```

---

## 📺 Ekran Akışı

```
┌─────────────────┐
│ PermissionScreen│ → İzinler verildi mi?
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   LoginScreen   │ → Token var mı?
└────────┬────────┘
         │ Token varsa
         ▼
┌─────────────────┐
│  PlayerScreen   │ → İçerikleri oynat
└────────┬────────┘
         │ Ayarlar
         ▼
┌─────────────────┐
│ SettingsScreen  │ → Çıkış, senkronize
└─────────────────┘
```

---

## 🎮 Android TV Özellikleri

### Uzaktan Kumanda Tuşları

| Tuş | İşlev |
|-----|-------|
| ◀ Sol | Önceki içerik |
| ▶ Sağ | Sonraki içerik |
| ▲ Yukarı | Senkronize et |
| ▼ Aşağı | Kontrolleri göster/gizle |
| OK/Select | Kontrolleri göster/gizle |
| Menu | Ayarlar ekranı |
| Back | Kontrolleri gizle |

### TVEventHandler Kullanımı

```typescript
// PlayerScreen.tsx içinde
useEffect(() => {
  const tvEventHandler = new TVEventHandler();
  tvEventHandler.enable(null, (cmp, evt) => {
    switch (evt.eventType) {
      case 'right': playNext(); break;
      case 'left': playPrevious(); break;
      case 'select': toggleControls(); break;
    }
  });
  return () => tvEventHandler.disable();
}, []);
```

---

## 🔒 Kiosk Modu

### AndroidManifest.xml Ayarları

```xml
<activity
  android:screenOrientation="portrait"
  android:keepScreenOn="true"
  android:showWhenLocked="true"
  android:turnScreenOn="true">
```

### MainActivity.kt Özellikleri

```kotlin
// Ekranı açık tut
window.addFlags(
  WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
  WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
  WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
  WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
)

// WakeLock ile uyku engelle
val wakeLock = powerManager.newWakeLock(
  PowerManager.SCREEN_BRIGHT_WAKE_LOCK,
  "MagazaPano::WakeLock"
)
wakeLock.acquire()
```

### Boot Sonrası Başlatma

```kotlin
// BootUpReceiver.kt
class BootUpReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
      // Uygulamayı başlat
      context.startActivity(launchIntent)
    }
  }
}
```

---

## 📦 Build ve Deploy

### Debug APK

```bash
cd android
./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK

```bash
cd android
./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

### Cihaza Yükleme

```bash
# USB ile
adb install -r app-debug.apk

# Ağ üzerinden
adb connect 192.168.1.100:5555
adb install -r app-debug.apk
```

---

## 🐛 Sorun Giderme

### "İçerik bulunamadı" Hatası
- Backend'den dönen playlist'te `contents` array'i kontrol edin
- `current_playlist_id` cihaza atanmış mı kontrol edin
- API response formatını loglardan inceleyin

### Socket Bağlantı Hatası
- WebSocket URL'i doğru mu: `wss://mtapi.magazatakip.com.tr`
- Backend socket sunucusu çalışıyor mu
- Token geçerli mi

### Ekran Kapanıyor
- `FLAG_KEEP_SCREEN_ON` MainActivity'de var mı
- WakeLock acquire edilmiş mi
- Pil optimizasyonu devre dışı mı

### Yatay Mod Sorunu
- `android:screenOrientation="portrait"` manifest'te var mı
- Cihaz ayarlarından otomatik döndürme kapalı mı

---

## 📝 Versiyon Geçmişi

| Versiyon | Tarih | Değişiklikler |
|----------|-------|---------------|
| 1.1.0 | 2026-01-05 | TV kumanda desteği, dikey mod, kiosk iyileştirmeleri |
| 1.0.1 | 2025-12-30 | Boot başlatma, Türkçe uyarılar |
| 1.0.0 | 2025-12-26 | İlk sürüm |

---

## 👨‍💻 Geliştirici Notları

### Yeni İçerik Tipi Ekleme

1. `src/types/index.ts` → Content tipine ekle
2. `PlayerScreen.tsx` → Render bölümüne ekle
3. Style ekle

```typescript
// types/index.ts
type: 'image' | 'video' | 'ticker' | 'yeni_tip';

// PlayerScreen.tsx
} : currentContent.type === 'yeni_tip' ? (
  <View style={styles.yeniTipContainer}>
    <Text>{currentContent.title}</Text>
  </View>
) : (
```

### Yeni API Endpoint Ekleme

```typescript
// ApiService.ts
async getNewEndpoint(): Promise<DataType> {
  const response = await this.api.get<ApiEnvelope<DataType>>('/new-endpoint');
  return response.data.data;
}
```

---

**Sorular için:** Backend ekibiyle iletişime geçin.

