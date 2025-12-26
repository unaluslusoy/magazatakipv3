# 🎉 MağazaPano TV Player - Canlı Sunucu Entegrasyonu Tamamlandı

## ✅ Yapılan Güncellemeler

### 1️⃣ API Entegrasyonu
```typescript
// Production API URLs
API_URL: https://mtapi.magazatakip.com.tr/api
SOCKET_URL: https://mtapi.magazatakip.com.tr
```

✅ `constants.ts` güncellendi
✅ User-Agent header eklendi (bot koruması için)
✅ Debug/Release mod ayrımı yapıldı

### 2️⃣ İzin Sistemi
✅ Tüm izinler ilk açılışta otomatik isteniyor
✅ Kullanıcı reddederse bile uygulama çalışıyor
✅ Android 13+ medya izinleri eklendi

### 3️⃣ APK Build
🔨 **Release APK:** `android/app/build/outputs/apk/release/app-release.apk`
🔨 **Debug APK:** `android/app/build/outputs/apk/debug/app-debug.apk`

## 📱 Kurulum

### Tablet'e Yükleme
```bash
# Release APK (Canlı sunucu)
adb install -r android/app/build/outputs/apk/release/app-release.apk

# Debug APK (Test - lokal geliştirme)
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### Manuel Yükleme
1. APK dosyasını USB ile tablete kopyalayın
2. Tablet Ayarlar > Güvenlik > "Bilinmeyen kaynaklar" açın
3. Dosya yöneticisinden APK'yı açıp yükleyin

## 🧪 Test

### API Bağlantı Testi
```bash
# Health check
curl -A "Mozilla/5.0" https://mtapi.magazatakip.com.tr/health

# Socket test
curl -A "Mozilla/5.0" https://mtapi.magazatakip.com.tr/socket.io/
```

### Tablet Logları
```bash
# Uygulamayı başlat
adb shell am start -n com.magazatvplayer/.MainActivity

# Logları izle
adb logcat -s ReactNativeJS:V | grep -i "api\|socket\|error"
```

## 📋 Özellikler

✅ **Offline-First:** MMKV ile ultra-hızlı yerel depolama
✅ **Auto-Sync:** Her 5 dakikada otomatik senkronizasyon
✅ **Real-time:** WebSocket ile anlık güncellemeler
✅ **Smart Scheduling:** Zaman/gün bazlı akıllı playlist seçimi
✅ **Parallel Download:** Maksimum 3 paralel medya indirmesi
✅ **Tam Ekran:** Dikey mod, status bar gizli
✅ **Auto Permissions:** İlk açılışta tüm izinler
✅ **Production Ready:** Canlı sunucuya bağlı

## 🔧 Yapılandırma

### Debug vs Release

| Mod | API URL | Kullanım |
|-----|---------|----------|
| **Debug** | `http://192.168.0.127:3000` | Geliştirme (lokal) |
| **Release** | `https://mtapi.magazatakip.com.tr` | Canlı sunucu |

### Ortam Değişkenleri
```bash
# Debug build
gradlew assembleDebug

# Release build
gradlew assembleRelease
```

## 🎨 Logo/Icon

✅ Logo generator oluşturuldu: `logo-generator.html`
✅ 5 farklı çözünürlük (48px - 192px)
✅ Tarayıcıda açılıp indirilebilir

### Icon Klasörleri
```
android/app/src/main/res/
├── mipmap-mdpi/ic_launcher.png (48x48)
├── mipmap-hdpi/ic_launcher.png (72x72)
├── mipmap-xhdpi/ic_launcher.png (96x96)
├── mipmap-xxhdpi/ic_launcher.png (144x144)
└── mipmap-xxxhdpi/ic_launcher.png (192x192)
```

## 🚀 Deployment Checklist

- [x] API URL'leri güncellendi
- [x] User-Agent header eklendi
- [x] İzin sistemi otomatikleştirildi
- [x] Release APK build edildi
- [ ] Icon'lar yüklendi (logo-generator.html'den indir)
- [ ] APK imzalandı (Google Play için)
- [ ] Tablet'e yüklendi ve test edildi

## 📞 Sorun Giderme

### Bağlantı Hatası
1. Backend çalışıyor mu? → `curl https://mtapi.magazatakip.com.tr/health`
2. Tablet WiFi'ye bağlı mı?
3. Firewall/güvenlik duvarı kontrolü
4. Logları kontrol et: `adb logcat`

### İzin Hatası
1. Ayarlar > Uygulamalar > MagazaPano TV > İzinler
2. Gerekli tüm izinleri manuel olarak ver

### Video Oynatma Hatası
1. Medya dosyası indirilmiş mi?
2. Depolama izni var mı?
3. Format destekleniyor mu? (MP4, JPG, PNG)

---

**Durum:** ✅ Canlı sunucuya entegre edildi
**Build:** 🔨 APK oluşturuluyor...
**Test:** ⏳ Tablet'e yüklenmeyi bekliyor

**Son Güncelleme:** 26 Aralık 2025 - 18:30
