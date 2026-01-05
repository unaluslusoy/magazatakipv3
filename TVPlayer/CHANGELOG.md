# Changelog

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

