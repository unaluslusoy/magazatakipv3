# Mağaza Panel TV Player - Deployment Guide

## 📋 Gereksinimler

### Geliştirme Ortamı
- Node.js >= 18
- npm >= 9
- React Native CLI
- Android Studio
- JDK 17+

### Cihaz Gereksinimleri
- Android 6.0+ (API 23+)
- Min 2GB RAM
- WiFi/Ethernet bağlantısı
- 16GB+ depolama

## 🔧 Kurulum Adımları

### 1. Dependencies Yükleme

```bash
cd TVPlayer
npm install
```

### 2. Environment Yapılandırması

`.env` dosyası oluşturun:

```env
API_URL=http://your-server-ip:3000/api
SOCKET_URL=http://your-server-ip:3000
```

### 3. Android Build

#### Debug APK
```bash
npm run android
```

#### Release APK
```bash
# Windows
.\build.ps1

# Linux/Mac
./build.sh
```

veya manuel:

```bash
cd android
./gradlew assembleRelease
```

APK konumu: `android/app/build/outputs/apk/release/app-release.apk`

## 📱 Cihaz Kurulumu

### 1. APK Yükleme

#### USB ile
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

#### Dosya Transfer
1. APK'yı USB'ye kopyalayın
2. Cihazda dosya yöneticisi ile açın
3. "Bilinmeyen kaynaklardan yükleme" izni verin
4. Yükleyin

### 2. İlk Yapılandırma

1. Uygulamayı açın
2. Backend'den aldığınız **Cihaz Kodu**'nu girin
3. Giriş yapın
4. İlk senkronizasyon otomatik başlar

### 3. Otomatik Başlatma (Kiosk Mode)

Android cihazı kiosk moduna almak için:

1. **Settings → Apps → Default apps → Home app**
2. Mağaza Panel'i seçin
3. Cihaz açılışta otomatik başlayacaktır

Alternatif: Kiosk launcher uygulamaları:
- Fully Kiosk Browser
- SureLock
- Hexnode Kiosk Lockdown

## 🔄 Güncelleme

### OTA Güncelleme (Planlanıyor)
Backend üzerinden otomatik güncelleme

### Manuel Güncelleme
1. Yeni APK'yı indir
2. Eski uygulamanın üzerine yükle
3. Ayarlar korunur

## 🐛 Troubleshooting

### Bağlantı Sorunları

```bash
# ADB üzerinden logları izleyin
adb logcat | grep -i "magazatvplayer"
```

### Clear Cache

Settings → Storage → Clear Cache

### Reset Device

1. Uygulamadan çıkış yapın
2. Cihaz kodunu yeniden girin

### Network Issues

- WiFi/Ethernet bağlantısını kontrol edin
- Backend URL'in doğru olduğundan emin olun
- Firewall/güvenlik duvarı ayarlarını kontrol edin

## 📊 Monitoring

### Cihaz Durumu
Admin panel üzerinden:
- Cihaz online/offline durumu
- Son görülme zamanı
- Oynatılan içerik
- Hata logları

### Local Logs
Settings → Device Info → Logs

## 🔐 Güvenlik

### Best Practices
- Güvenli WiFi ağı kullanın
- Güçlü backend authentication
- HTTPS kullanın (production)
- Fiziksel cihaz güvenliği

### Kiosk Mode Güvenliği
- Power button devre dışı
- Status bar gizleme
- Settings erişimi kısıtlama
- USB debugging kapatma

## 📈 Performans Optimizasyonu

### Cache Yönetimi
- Önbellek boyutunu izleyin
- Düzenli cache temizliği
- Kullanılmayan içerikleri silin

### Ağ Kullanımı
- WiFi'de senkronizasyon yapın
- Çalışma saatleri dışında indirme
- Delta sync kullanımı

## 🎯 Production Checklist

- [ ] Backend URL doğru yapılandırıldı
- [ ] Release APK imzalandı
- [ ] Kiosk mode aktif
- [ ] Otomatik başlatma ayarlandı
- [ ] Ekran timeout kapatıldı
- [ ] Ses seviyesi ayarlandı
- [ ] Landscape mod kilidi aktif
- [ ] Ağ bağlantısı test edildi
- [ ] İlk senkronizasyon tamamlandı
- [ ] Monitoring aktif

## 📞 Destek

Sorun yaşadığınızda:
1. Logları kontrol edin
2. Backend bağlantısını test edin
3. Cihazı yeniden başlatın
4. APK'yı yeniden yükleyin
