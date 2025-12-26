# 🎨 Medya Yönetimi - Template Modülü (Slider Revolution Benzeri)

## 🚀 Yeni Özellikler

### Template Oluşturucu Sistemi

Medya yönetimi sayfasına **Slider Revolution** tarzında profesyonel template oluşturma modülü eklendi.

## ✅ Tamamlanan Özellikler

### 1. **Backend API** (✅ Tüm CRUD İşlemleri)

#### Endpoints:
```
GET    /api/templates          - Tüm template'leri listele
GET    /api/templates/:id      - Tek template detayı
POST   /api/templates          - Yeni template oluştur
PUT    /api/templates/:id      - Template güncelle
DELETE /api/templates/:id      - Template sil
POST   /api/templates/:id/duplicate - Template kopyala
```

#### Template Tipleri:
- `slider` - Slayt gösterisi
- `banner` - Banner/Afişler
- `countdown` - Geri sayım
- `weather` - Hava durumu widget'ı
- `news` - Haber akışı
- `custom` - Özel tasarım

#### Kategoriler:
- `promotional` - Tanıtım
- `informational` - Bilgilendirme
- `interactive` - Etkileşimli
- `dynamic` - Dinamik içerik

### 2. **Database Schema**

```sql
CREATE TABLE templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  template_type VARCHAR(50) NOT NULL,
  category VARCHAR(50),
  preview_image TEXT,
  config JSONB,              -- Genel ayarlar (boyut, renk, vb.)
  layers JSONB,              -- Katmanlar dizisi
  animations JSONB,          -- Animasyon yapılandırmaları
  duration INTEGER,          -- Süre (saniye)
  is_active BOOLEAN,
  created_by INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Örnek Layer Yapısı:
```json
{
  "id": "layer1",
  "type": "text",           // text, image, rectangle, circle, countdown, weather, video
  "content": "Özel Kampanya",
  "x": 100,
  "y": 300,
  "fontSize": 72,
  "fontFamily": "Arial",
  "color": "#FFFFFF",
  "fontWeight": "bold",
  "zIndex": 1
}
```

#### Örnek Animasyon:
```json
{
  "layerId": "layer2",
  "type": "fadeIn",         // fadeIn, slideInLeft, zoomIn, pulse, vb.
  "delay": 0,               // ms
  "duration": 1000,         // ms
  "easing": "ease-in-out",
  "repeat": false
}
```

### 3. **Frontend Template Creator**

#### Özellikler:

**📐 Canvas Editor:**
- 1920x1080 çözünürlük desteği
- Gerçek zamanlı önizleme
- Katman seçimi ve düzenleme
- Görsel feedback

**🎨 Katman Tipleri:**
- **Text** - Metin katmanı
  - Font boyutu, renk, kalınlık
  - Pozisyon ayarlama
  - Formatlama (bold, italic, underline)
- **Image** - Resim katmanı
  - URL ile resim ekleme
  - Boyut ayarlama
  - Pozisyonlama
- **Rectangle** - Dikdörtgen şekil
  - Boyut ve renk
  - Dolgu rengi
- **Countdown** - Geri sayım
  - Hedef tarih
  - Format seçimi (DD:HH:MM:SS)
  - Stil ayarları

**✨ Animasyon Sistemi:**
- 10+ animasyon tipi:
  - Fade In/Out
  - Slide In (Left, Right, Up, Down)
  - Zoom In/Out
  - Bounce
  - Pulse
- Gecikme (delay) ayarı
- Süre (duration) kontrolü
- Easing fonksiyonları

**🛠️ Araçlar:**
- Geri Al / İleri Al
- Yakınlaştır / Uzaklaştır
- Önizleme modu
- Katman listesi
- Özellik paneli

### 4. **MediaPage Entegrasyonu**

#### 2 Sekme:
1. **İçerikler** - Mevcut medya içerikleri
2. **Template'ler** - Yeni template modülü

#### Template Yönetimi:
- Template listesi (kart görünümü)
- Hızlı düzenleme
- Kopyalama (duplicate)
- Silme
- Önizleme görseli
- Durum rozetleri (aktif/pasif)
- İstatistikler (süre, katman sayısı)

## 🎯 Kullanım

### Template Oluşturma:

1. **Medya Yönetimi** sayfasına git
2. **Template'ler** sekmesine tıkla
3. **Yeni Template** butonuna bas
4. Template bilgilerini doldur:
   - Ad
   - Tip (slider, banner, countdown, vb.)
   - Kategori
   - Süre
   - Arka plan rengi
5. **Katman Ekle** ile içerik oluştur:
   - Metin ekle ve düzenle
   - Resim ekle ve konumlandır
   - Şekiller ekle
   - Countdown widget'ı ekle
6. **Animasyon Ekle** ile katmanlara hareket ekle
7. **Kaydet**

### Template Düzenleme:

1. Template kartı üzerinde **Edit** ikonuna tıkla
2. Değişiklik yap
3. Kaydet

### Template Kopyalama:

1. Template kartı üzerinde **Copy** ikonuna tıkla
2. Otomatik olarak "(Kopya)" eki ile yeni template oluşturulur

## 📊 Hazır Template'ler

Sistem 3 hazır template ile geliyor:

### 1. Modern Slider
- Tip: slider
- 3 katman (arka plan resmi, başlık, indirim metni)
- 2 animasyon (fadeIn, slideInRight)
- Süre: 10 saniye

### 2. Countdown Timer
- Tip: countdown
- Gradient arka plan
- Geri sayım widget'ı
- Pulse animasyonu
- Süre: 15 saniye

### 3. Weather Display
- Tip: weather
- Hava durumu widget'ı
- İstanbul verisi
- Süre: 20 saniye

## 🔧 API Kullanım Örnekleri

### Template Oluştur:
```javascript
POST /api/templates
{
  "name": "Yaz İndirimi",
  "template_type": "slider",
  "category": "promotional",
  "duration": 10,
  "config": {
    "width": 1920,
    "height": 1080,
    "backgroundColor": "#FF5722"
  },
  "layers": [
    {
      "id": "text1",
      "type": "text",
      "content": "%70 İndirim",
      "x": 100,
      "y": 200,
      "fontSize": 96,
      "color": "#FFFFFF"
    }
  ],
  "animations": [
    {
      "layerId": "text1",
      "type": "bounceIn",
      "duration": 1500
    }
  ]
}
```

### Template Güncelle:
```javascript
PUT /api/templates/1
{
  "name": "Güncellenen İsim",
  "is_active": false
}
```

### Template Listele:
```javascript
GET /api/templates

Response:
{
  "success": true,
  "data": {
    "templates": [...]
  }
}
```

## 🎨 Desteklenen Animasyonlar

- `fadeIn` - Belirerek görünme
- `fadeOut` - Kaybolma
- `slideInLeft` - Soldan kayma
- `slideInRight` - Sağdan kayma
- `slideInUp` - Aşağıdan kayma
- `slideInDown` - Yukarıdan kayma
- `zoomIn` - Yakınlaşma
- `zoomOut` - Uzaklaşma
- `bounce` - Zıplama
- `pulse` - Nabız

## 🚀 Gelişmiş Özellikler

### Canvas Rendering:
- HTML5 Canvas ile gerçek zamanlı çizim
- Katman bazlı Z-index desteği
- Seçili katman highlight
- Responsive preview

### Validasyon:
- Backend'de express-validator
- Zorunlu alan kontrolleri
- Tip kontrolü
- Format doğrulama

### Performans:
- JSONB index'leme
- Lazy loading
- Önbellek desteği
- Optimized queries

## 📈 İstatistikler

Sistem üzerinde:
- ✅ 6 API endpoint (GET, POST, PUT, DELETE, DUPLICATE)
- ✅ 7 katman tipi
- ✅ 10+ animasyon tipi
- ✅ 4 template kategorisi
- ✅ 6 template tipi
- ✅ 3 hazır template
- ✅ Tam CRUD desteği

## 🎉 Sonuç

Slider Revolution benzeri profesyonel template oluşturma sistemi başarıyla entegre edildi!

**Özellikler:**
- ✅ Visual editor (Canvas)
- ✅ Drag & position
- ✅ Çoklu katman desteği
- ✅ Animasyon sistemi
- ✅ Gerçek zamanlı önizleme
- ✅ Template kopyalama
- ✅ Tam CRUD API
- ✅ Database migration
- ✅ Frontend-backend entegrasyonu

Sistem artık tamamen işlevsel ve kullanıma hazır! 🚀
