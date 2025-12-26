# Mağaza Panel - TV Player

React Native tabanlı Android TV/Tablet dijital ekran oynatıcı uygulaması.

## 🎯 Özellikler

- ✅ **Offline Mod**: İnternet bağlantısı olmadan çalışır
- 🔄 **Otomatik Senkronizasyon**: Backend ile düzenli senkronizasyon
- 📱 **WebSocket Desteği**: Real-time güncellemeler
- 🎬 **Video/Görsel Oynatıcı**: Çoklu format desteği
- ⏰ **Zamanlama Sistemi**: Playlist zamanlama
- 💾 **MMKV Storage**: Ultra hızlı local storage
- 📦 **Akıllı Önbellekleme**: Otomatik medya indirme

## 🚀 Kurulum

### Gereksinimler

- Node.js >= 18
- npm >= 9
- React Native CLI
- Android SDK

### Bağımlılıkları Yükle

```bash
npm install
```

### Environment Ayarları

`.env.example` dosyasını `.env` olarak kopyalayın ve düzenleyin:

```env
API_URL=http://your-backend-url/api
SOCKET_URL=http://your-backend-url
```

### Android Build

```bash
# Debug
npm run android

# Release
npm run build:android
```

## 📁 Proje Yapısı

```
TVPlayer/
├── src/
│   ├── screens/          # UI Ekranları
│   │   ├── LoginScreen.tsx
│   │   ├── PlayerScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/         # İş Mantığı
│   │   ├── ApiService.ts
│   │   ├── StorageService.ts
│   │   ├── SyncManager.ts
│   │   ├── DownloadManager.ts
│   │   ├── SocketService.ts
│   │   └── AppInitializer.ts
│   ├── config/           # Yapılandırma
│   │   └── constants.ts
│   ├── types/            # TypeScript Types
│   │   └── index.ts
│   └── App.tsx           # Ana Uygulama
├── android/              # Android Native
├── package.json
└── tsconfig.json
```

## 🎮 Kullanım

### İlk Giriş

1. Uygulamayı başlatın
2. Backend'den aldığınız **Cihaz Kodu**'nu girin
3. Giriş yapın

### Player Ekranı

- **Dokunma**: Kontrolleri göster/gizle
- **Sync Butonu**: Manuel senkronizasyon
- **Next Butonu**: Sonraki içeriğe geç
- **Settings**: Ayarlar sayfası

### Otomatik İşlemler

- ✅ 5 dakikada bir otomatik senkronizasyon
- ✅ Yeni içerikleri otomatik indirme
- ✅ WebSocket ile anlık güncellemeler
- ✅ Heartbeat ile cihaz durumu bildirimi

## 🔧 Servisler

### StorageService
- MMKV ile ultra hızlı local storage
- Şifreli veri saklama
- Offline veri yönetimi

### ApiService
- Backend API iletişimi
- Token yönetimi
- Axios interceptors

### SyncManager
- Otomatik senkronizasyon
- Offline queue yönetimi
- Akıllı yeniden deneme

### DownloadManager
- Paralel dosya indirme
- İlerleme takibi
- Cache yönetimi

### SocketService
- WebSocket bağlantısı
- Real-time events
- Otomatik reconnect

## 📊 Offline Mod

Uygulama internet bağlantısı olmadan çalışabilir:

1. **Playlists**: MMKV'de saklanır
2. **Contents**: MMKV'de metadata + local files
3. **Media Files**: `media_cache/` dizininde
4. **Schedules**: Local storage'da

## 🔐 Güvenlik

- ✅ Şifreli local storage (MMKV)
- ✅ JWT token authentication
- ✅ Secure WebSocket connection
- ✅ API request interceptors

## 🐛 Debug

```bash
# Logları izle
adb logcat *:S ReactNative:V ReactNativeJS:V

# Metro bundler
npm start

# Clear cache
npm start -- --reset-cache
```

## 📝 Lisans

Proprietary - Mağaza Panel © 2025
