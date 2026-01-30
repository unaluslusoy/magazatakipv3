# 📺 Mağaza Pano - Android TV Uygulaması

> Digital Signage Sistemi - Versiyon 1.1.0

---

## 🎯 Genel Bakış

Mağaza Pano, mağaza ekranlarında reklam ve bilgilendirme içeriklerini gösteren bir digital signage Android TV uygulamasıdır.

---

## ✨ Özellikler

### İçerik Yönetimi
- ✅ Video oynatma (MP4, WebM)
- ✅ Görsel gösterimi (JPG, PNG, WebP)
- ✅ Ticker (kayan yazı) desteği
- ✅ Playlist yönetimi
- ✅ Zamanlama (Schedule) desteği
- ✅ Tam ekran görüntüleme

### Uzaktan Yönetim
- ✅ Panel'den cihaz kontrolü
- ✅ Komut sistemi (7 farklı komut)
- ✅ Uzaktan screenshot alma
- ✅ Canlı cihaz izleme (heartbeat)
- ✅ IP ve MAC adresi takibi

### Offline Özellikler
- ✅ İçerik önbellekleme
- ✅ Offline oynatma
- ✅ Otomatik senkronizasyon

### Sistem
- ✅ Android 9+ desteği
- ✅ Android TV optimizasyonu
- ✅ Uzaktan kumanda desteği
- ✅ Türkçe karakter desteği

---

## 📋 Sistem Gereksinimleri

- **İşletim Sistemi:** Android 9.0 (Pie) veya üzeri
- **RAM:** Minimum 1 GB (2 GB önerilir)
- **Depolama:** Minimum 500 MB boş alan
- **İnternet:** WiFi veya Ethernet bağlantısı
- **Ekran:** 720p veya daha yüksek çözünürlük

---

## 🚀 Kurulum

### 1. APK İndirme

En son sürümü indirin:
```
android/app/build/outputs/apk/release/app-release.apk
```

### 2. Cihaza Yükleme

**ADB ile:**
```bash
adb install -r app-release.apk
```

**Manuel:**
1. APK'yı USB belleğe kopyalayın
2. Cihazda dosya yöneticisi ile açın
3. Kurulumu onaylayın

### 3. İlk Kurulum

1. Uygulamayı açın
2. Cihaz kodunu girin (örn: `MP-001`)
3. İzinleri onaylayın
4. Otomatik senkronizasyon başlayacak

---

## 🎮 Komutlar

Panel'den gönderilebilecek komutlar:

| Komut | Açıklama |
|-------|----------|
| `REFRESH_CONTENT` | İçeriği yenile |
| `SYNC_NOW` | Şimdi senkronize et |
| `TAKE_SCREENSHOT` | Ekran görüntüsü al |
| `CLEAR_CACHE` | Önbelleği temizle |
| `UPDATE_SETTINGS` | Ayarları güncelle |
| `RESTART_APP` | Uygulamayı yeniden başlat |
| `REBOOT_DEVICE` | Cihazı yeniden başlat* |

*Root veya system app izni gerektirir

---

## 🔌 API Endpoint'leri

**Base URL:** `https://pano.magazatakip.com.tr/api`

### Kimlik Doğrulama
- `POST /auth/device-login` - Cihaz girişi
- `GET /auth/verify` - Token doğrulama

### Cihaz Yönetimi
- `POST /devices/heartbeat` - Heartbeat gönder
- `PUT /devices/info` - Cihaz bilgilerini güncelle
- `POST /devices/screenshot` - Screenshot yükle
- `POST /devices/logs` - Log gönder

### İçerik
- `GET /playlists/current` - Aktif playlist
- `GET /sync/playlist` - Playlist senkronizasyonu
- `GET /sync/status` - Senkronizasyon durumu

### Komutlar
- `GET /devices/commands/pending` - Bekleyen komutlar
- `POST /devices/commands/{id}/result` - Komut sonucu

---

## 📱 Heartbeat Sistemi

Uygulama her 30 saniyede bir heartbeat gönderir:

```json
{
  "app_version": "1.1.0",
  "os_version": "Android 13",
  "screen_resolution": "1920x1080",
  "free_storage_mb": 2048,
  "ip_address": "192.168.1.100",
  "mac_address": "AA:BB:CC:DD:EE:FF"
}
```

**Response:**
```json
{
  "sync_required": false,
  "pending_commands": [],
  "server_time": "2026-01-29T12:00:00Z"
}
```

---

## 🐛 Sorun Giderme

### Uygulama Açılmıyor
1. Cihazı yeniden başlatın
2. Uygulamayı kaldırıp yeniden yükleyin
3. Android sürümünü kontrol edin (9+)

### İçerik Görünmüyor
1. İnternet bağlantısını kontrol edin
2. Cihaz kodunun doğru olduğundan emin olun
3. Panel'den içerik atandığını kontrol edin

### Heartbeat Gelmiyor
1. Firewall ayarlarını kontrol edin
2. İnternet bağlantısını test edin
3. Token süresinin dolmadığını kontrol edin

---

## 📊 Loglar

### ADB ile Log İzleme
```bash
adb logcat | grep "MagazaPano\|PlayerScreen\|SyncManager"
```

### Önemli Log Mesajları
- `[BOOT]` - Uygulama başlatma
- `[SyncManager]` - Senkronizasyon
- `[PlayerScreen]` - İçerik oynatma
- `[CommandProcessor]` - Komut işleme

---

## 🔄 Sürüm Geçmişi

### v1.1.0 (29 Ocak 2026)
- ✅ Komut sistemi eklendi
- ✅ Screenshot desteği
- ✅ IP/MAC adresi gönderimi
- ✅ Gelişmiş heartbeat

### v1.0.10 (29 Ocak 2026)
- ✅ API düzeltmeleri
- ✅ URL path iyileştirmeleri

### v1.0.0 (28 Ocak 2026)
- ✅ İlk sürüm

[Detaylı değişiklikler için CHANGELOG.md](./CHANGELOG.md)

---

## 📞 Destek

- **Email:** support@magazapano.com
- **Dokümantasyon:** [docs/](./docs/)
- **API Dokümantasyonu:** [ANDROID_TV_API_GUIDE.md](./docs/ANDROID_TV_API_GUIDE.md)

---

## 📄 Lisans

© 2026 Mağaza Takip - Tüm hakları saklıdır.

---

**Son Güncelleme:** 29 Ocak 2026
**Versiyon:** 1.1.0
**Build:** 11

