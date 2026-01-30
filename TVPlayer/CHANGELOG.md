# Değişiklik Geçmişi

## v1.2.0 (30 Ocak 2026)

### 🎬 Video Oynatma Sorunları Çözüldü

- ✅ **Video Erken Kesilme Sorunu**: Uzun videoların 32. saniyede kesilmesi sorunu kalıcı olarak çözüldü
- ✅ **Buffer Optimizasyonu**: Video buffer ayarları artırıldı (15s min, 120s max buffer)
- ✅ **Akıllı onEnd Kontrolü**: Video gerçekten bitip bitmediği kontrol ediliyor (%80 kuralı)
- ✅ **Otomatik Yeniden Başlatma**: Video takılırsa otomatik olarak kaldığı yerden devam ediyor
- ✅ **Cache Desteği**: 100MB video cache ile daha akıcı oynatma

### 📥 İndirme Sistemi İyileştirmeleri

- ✅ **3 Deneme Mekanizması**: Başarısız indirmeler 3 kez yeniden deneniyor
- ✅ **Boyut Doğrulaması**: İndirilen dosyaların tam olup olmadığı kontrol ediliyor
- ✅ **Detaylı Loglama**: İndirme süreçleri artık daha anlaşılır şekilde loglanıyor

### 🧹 Kod Temizliği

- ✅ Kullanılmayan `zustand` bağımlılığı kaldırıldı
- ✅ SyncManager'dan kullanılmayan fonksiyonlar temizlendi (`checkForUpdates`, `syncDelta`, `getServerSyncStatus`)
- ✅ Performans için gereksiz kodlar optimize edildi

### 📱 Android İyileştirmeleri

- ✅ `vmSafeMode="false"` - JIT derleme için performans artışı
- ✅ `requestLegacyExternalStorage="true"` - Android 10 depolama uyumluluğu
- ✅ Android 9+ (minSdk=28) desteği korundu

### 🔧 Korunan Özellikler

- ✅ ScreenShare (ekran paylaşımı)
- ✅ Socket komutları (uzaktan kontrol)
- ✅ Schedule (zamanlama) sistemi

---

## v1.1.1 (29 Ocak 2026)

### 🚀 Performans İyileştirmeleri

- ✅ **Hardware Acceleration**: Donanım hızlandırma etkinleştirildi (`hardwareAccelerated="true"`)
- ✅ **Memory Management**: `largeHeap="true"` ile büyük bellek alanı kullanımı açıldı
- ✅ **Video Optimize**: `TextureView` yerine daha performanslı olan `SurfaceView` kullanımına geçildi
- ✅ **Image Optimize**: Görsel yüklemelerinde `resizeMethod="resize"` kullanılarak bellek kullanımı düşürüldü
- ✅ **Buffer Ayarları**: Video oynatma başlangıç süreleri iyileştirildi (Buffer süreleri optimize edildi)

### 🔧 Diğer

- ✅ Cihaz USB yükleme sorunları için `AndroidManifest.xml` optimizasyonları yapıldı.

---

## v1.1.0 (29 Ocak 2026)

### 🎉 Yeni Özellikler

#### Komut Sistemi
- ✅ Panel'den uzaktan komut alma sistemi eklendi
- ✅ Desteklenen komutlar:
  - `REFRESH_CONTENT` - İçeriği yenile
  - `RESTART_APP` - Uygulamayı yeniden başlat
  - `SYNC_NOW` - Şimdi senkronize et
  - `CLEAR_CACHE` - Önbelleği temizle
  - `TAKE_SCREENSHOT` - Ekran görüntüsü al
  - `UPDATE_SETTINGS` - Ayarları güncelle
  - `REBOOT_DEVICE` - Cihazı yeniden başlat (root/system app gerekli)
- ✅ Komut sonuçları sunucuya raporlanıyor

#### Screenshot Sistemi
- ✅ Uzaktan ekran görüntüsü alma
- ✅ Screenshot'lar otomatik sunucuya yükleniyor
- ✅ Base64 formatında upload

#### Gelişmiş Heartbeat
- ✅ IP adresi bilgisi eklendi
- ✅ MAC adresi bilgisi eklendi
- ✅ Heartbeat response'unda pending_commands kontrolü
- ✅ Otomatik komut işleme

#### Cihaz Bilgileri
- ✅ Detaylı cihaz bilgisi toplama
- ✅ Network bilgileri (IP, MAC, WiFi SSID, sinyal gücü)
- ✅ Depolama bilgileri (toplam, boş, kullanılan)
- ✅ Batarya durumu

### 🔧 İyileştirmeler

- ✅ API endpoint'leri yeni backend'e uyarlandı
- ✅ URL path'lerde `uploads/` prefix'i eklendi
- ✅ Video ve görseller tam ekran (cover) olarak gösteriliyor
- ✅ Komut listener'ları PlayerScreen'e eklendi
- ✅ SyncManager heartbeat'te komutları işliyor

### 📚 Dokümantasyon

- ✅ Android TV Geliştirme Rehberi eklendi
- ✅ Heartbeat mekanizması dökümante edildi
- ✅ Komut sistemi dökümante edildi
- ✅ Screenshot upload dökümante edildi

---

## v1.0.10 (29 Ocak 2026)

### 🔧 Düzeltmeler

- ✅ API `/playlists/current` 500 hatası için workaround eklendi
- ✅ URL path düzeltmeleri yapıldı

---

## v1.0.9 (29 Ocak 2026)

### 🔧 Düzeltmeler

- ✅ Video ve görsel URL'leri düzeltildi
- ✅ Backslash escape karakterleri temizlendi

---

## v1.0.0 (28 Ocak 2026)

### 🎉 İlk Sürüm

- ✅ Video ve görsel içerik oynatma
- ✅ Ticker (kayan yazı) desteği
- ✅ Playlist yönetimi
- ✅ Schedule (zamanlama) desteği
- ✅ Offline mode
- ✅ İçerik indirme ve önbellekleme
- ✅ Otomatik senkronizasyon
- ✅ Android TV uzaktan kumanda desteği
- ✅ Heartbeat sistemi
- ✅ Log sistemi

