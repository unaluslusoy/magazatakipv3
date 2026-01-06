# Changelog

## v1.0.7 (2026-01-06)

### 🖥️ Uzaktan Ekran Kontrolü (Admin Panel)

#### Yeni Dosyalar
- **ScreenShareService.kt**: Ekran yakalama ve backend'e frame gönderme
- **ScreenCaptureActivity.kt**: MediaProjection izni alma
- **ScreenShareModule.kt**: React Native native modül
- **ScreenSharePackage.kt**: RN package tanımı
- **ScreenShareService.ts**: TypeScript wrapper

#### Özellikler
- Admin panelden cihaz ekranını canlı izleme
- WebSocket üzerinden frame streaming (2 FPS, ~50KB/frame)
- MediaProjection API ile ekran yakalama
- Kullanıcı izni bir kez alınır (ilk kurulumda)
- Socket komutları: `screen:start`, `screen:stop`

#### Konfigürasyon
- Frame interval: 500ms (2 FPS)
- JPEG kalitesi: 50%
- Çözünürlük: Yarı HD (0.5x scale)
- Bant genişliği: ~0.5-0.8 Mbps

### 📋 Backend Gereksinimleri
- `POST /api/devices/screen-frame` endpoint'i
- Socket.io `screen:start`, `screen:stop` event handler'ları
- Socket.io `screen:frame` event emitter (admin panele)
- Detaylı dokümantasyon: `docs/SCREEN_SHARE_API.md`

---

## v1.0.6 (2026-01-06)

### 🎯 Kiosk Modu İyileştirmeleri (Android 9+)

#### MainActivity.kt
- **FLAG_KEEP_SCREEN_ON**: Ekran asla kapanmaz - dijital tabela için zorunlu
- **onResume()**: Başka uygulamadan dönüldüğünde sistem UI'ı otomatik gizlenir
- **onWindowFocusChanged()**: Focus değişimlerinde UI yeniden gizlenir
- **Android 11+ WindowInsetsController**: Yeni API ile tam ekran modu
- **Android 9-10 IMMERSIVE_STICKY**: Eski API ile sticky immersive mod
- **setDecorFitsSystemWindows(false)**: Android 11+ layout padding sorunu çözüldü
- **setOnSystemUiVisibilityChangeListener**: Özel ROM'lar için UI değişiklik dinleyicisi

#### Manifest
- **launchMode: singleTask**: Çoklu instance engellendi
- **configChanges genişletildi**: Rotation/config değişiminde reload yok
- **resizeableActivity: false**: Split screen engellendi

#### Theme (styles.xml)
- **windowFullscreen: true**: Baştan tam ekran
- **windowLayoutInDisplayCutoutMode: shortEdges**: Notch desteği
- **Transparan status/navigation bar**: Boşluk kalmaz

#### Kiosk Güvenlik
- **onBackPressed() engellendi**: Yanlışlıkla çıkış yok
- **7 kez hızlı tıklama**: Admin çıkış mekanizması
- **Toast bildirimler**: 3+ tıklamada kalan sayı gösterilir

### 🔧 Build Ayarları
- **targetSdkVersion: 34**: Google Play Store uyumlu
- **minSdkVersion: 28**: Android 9 (Pie) ve üstü

---

## v1.0.5 (2026-01-06)

### 🎯 Yeni Özellikler
- **Ticker İyileştirmeleri**: Kayan yazı animasyonu daha yumuşak ve okunaklı
- **API İyileştirmeleri**: Playlist alırken `include=contents` ile tüm içerik detayları
- **ticker_text Desteği**: Backend'den gelen ticker_text alanı doğru gösteriliyor

### 🔧 İyileştirmeler
- Ticker font boyutu ve stil optimizasyonu
- Ticker container arka plan rengi iyileştirildi
- HTML etiketleri temizleme geliştirmeleri
- Debug loglama eklendi (ticker_text kontrolü için)

### 🐛 Hata Düzeltmeleri
- Ticker yazı kesilmesi sorunu giderildi
- Animasyon döngüsü düzeltildi
- API yanıt formatı uyumluluğu

---

## v1.2.0 (2026-01-05)

### 🎯 Yeni Özellikler
- **İndirme İlerleme Çubuğu**: İçerikler indirilirken görsel ilerleme göstergesi
- **Önbellek Desteği**: İndirilen içerikler cihazda saklanıyor, tekrar indirilmiyor
- **Offline Oynatma**: İndirilen içerikler internet olmadan da oynatılabiliyor
- **Menü Kapat Butonu**: Sağ üstte "✕ Kapat" butonu eklendi
- **Android 9+ Desteği**: minSdkVersion 28'e düşürüldü (Android Pie ve üstü)

### 🔧 İyileştirmeler
- Menü arka planına dokunarak kapatılabiliyor
- Back tuşu ile menü kapatılabiliyor
- Dosya adı oluşturma hatası düzeltildi (URL parse sorunu)
- Release APK imzalama düzeltildi
- TV remote talimatları güncellendi

### 🐛 Hata Düzeltmeleri
- `ENOENT: no such file or directory` hatası düzeltildi
- Önbellek senkronizasyonu eklendi
- Content type'a göre doğru dosya uzantısı belirleniyor

### 📦 Build
- Release keystore oluşturuldu
- APK Signature Scheme v3 ile imzalanıyor
- minifyEnabled kapatıldı (stabilite için)

---

## v1.1.0 (2026-01-05)

### 🎯 Yeni Özellikler
- **Android TV Kumanda Desteği**: D-pad ve uzaktan kumanda ile tam kontrol
  - ◀ Sol: Önceki içerik
  - ▶ Sağ: Sonraki içerik
  - ▲ Yukarı: Senkronize et
  - ▼ Aşağı: Kontrolleri göster/gizle
  - OK/Select: Kontrolleri göster/gizle
  - Menu: Ayarlar ekranı
  - Back: Kontrolleri gizle

- **Dikey Mod (Portrait)**: TV ve tabletler için 9:16 dikey konumlandırma
- **Yumuşak Geçiş Efekti**: İçerikler arası fade in/out animasyonu
- **Ticker İçerik Desteği**: Kayan yazı tipinde içerikler gösteriliyor

### 🔒 Kiosk Modu İyileştirmeleri
- Ekran sürekli açık kalıyor (WakeLock)
- Uyku moduna geçmiyor
- Kilit ekranına düşmüyor
- Cihaz yeniden başlatıldığında otomatik açılıyor

### 🔧 API İyileştirmeleri
- Cihaza atanmış playlist otomatik çekiliyor (`GET /api/devices/{id}`)
- Schedule endpoint hata toleransı artırıldı
- Socket bağlantı hatası logları azaltıldı
- Farklı API response formatları destekleniyor

### 🐛 Hata Düzeltmeleri
- "İçerik bulunamadı" hatası düzeltildi
- Contents format uyumsuzluğu giderildi (content.title, content.url desteği)
- Auto-advance tüm içerik tipleri için çalışıyor (image, video, ticker)
- Socket error spam logları kaldırıldı

### 📱 UI İyileştirmeleri
- TV için büyük kontrol butonları
- Mavi/turuncu renk şeması
- Uzaktan kumanda talimatları ekranda gösteriliyor
- Daha büyük font boyutları (ticker: 48px, template: 56px)

---

## v1.0.1 (2025-12-30)
- Uygulama adı: **Mağaza Pano**
- Android TV/Box desteği: `LEANBACK_LAUNCHER`
- Boot sonrası otomatik başlatma için Foreground Service yaklaşımı (`BootUpReceiver` + `KioskService`)
- Login ekranında 429 (çok deneme) geri sayım ve daha anlaşılır Türkçe uyarılar
- UTF-8 Türkçe karakter uyumu için `.editorconfig`

