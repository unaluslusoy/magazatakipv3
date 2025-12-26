# 🛠️ MağazaPano - Teknoloji Stack

**Versiyon:** 1.0.0  
**Tarih:** 24 Aralık 2025

---

## 1. Backend

### 1.1 Ana Teknolojiler

| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| **Node.js** | 20 LTS | Runtime |
| **Express.js** | 4.18+ | Web framework |
| **Neon PostgreSQL** | 16+ | Cloud veritabanı (serverless) |
| **Redis** | 7+ | Cache & session |
| **Socket.IO** | 4.7+ | Gerçek zamanlı iletişim |

> 📌 **Veritabanı:** Neon PostgreSQL kullanılıyor (Serverless, Azure GWC region)

### 1.2 Yardımcı Kütüphaneler

| Kütüphane | Kullanım |
|-----------|----------|
| **Sequelize** | ORM (veritabanı işlemleri) |
| **Joi** | Request validation |
| **JWT** | Authentication |
| **Bcrypt** | Şifre hashleme |
| **Multer** | Dosya upload |
| **Sharp** | Görsel işleme (thumbnail, resize) |
| **FFmpeg** | Video işleme (thumbnail, metadata) |
| **Winston** | Loglama |
| **Nodemailer** | Email gönderimi |
| **Helmet** | Güvenlik header'ları |
| **Cors** | CORS yönetimi |
| **Morgan** | HTTP loglama |
| **Express-rate-limit** | Rate limiting |

---

## 2. Admin Panel (Flutter)

### 2.1 Ana Teknolojiler

| Teknoloji | Versiyon | Platform |
|-----------|----------|----------|
| **Flutter** | 3.16+ | Cross-platform |
| **Dart** | 3.2+ | Programlama dili |

### 2.2 Hedef Platformlar

| Platform | Durum | Notlar |
|----------|-------|--------|
| ✅ Web | Birincil | Ana kullanım |
| ✅ Windows | Destekleniyor | Masaüstü uygulama |
| ✅ macOS | Destekleniyor | Masaüstü uygulama |
| ⚠️ Linux | Opsiyonel | Talep üzerine |
| ❌ Mobile | Yok | Gerekli değil |

### 2.3 Flutter Paketleri

| Paket | Kullanım |
|-------|----------|
| **flutter_riverpod** | State management |
| **go_router** | Routing / navigation |
| **dio** | HTTP client |
| **socket_io_client** | WebSocket |
| **flutter_localizations** | Çoklu dil (TR/EN) |
| **intl** | Tarih/sayı formatlama |
| **file_picker** | Dosya seçimi |
| **video_player** | Video önizleme |
| **cached_network_image** | Görsel cache |
| **fl_chart** | Grafikler (dashboard) |
| **data_table_2** | Gelişmiş tablolar |
| **flutter_quill** | Rich text editör |
| **reorderable_grid_view** | Sürükle-bırak grid |
| **flutter_colorpicker** | Renk seçici |
| **flutter_dropzone** | Drag & drop upload |
| **shimmer** | Loading skeleton |
| **toastification** | Bildirim toast'ları |

---

## 3. TV Player (Flutter)

### 3.1 Hedef Platformlar

| Platform | Durum | Notlar |
|----------|-------|--------|
| ✅ Android TV | Birincil | Ana hedef |
| ✅ Android Tablet | Destekleniyor | Alternatif |
| ❌ Fire TV | İleride | Amazon cihazlar |
| ❌ iOS | Yok | Gerekli değil |

### 3.2 Offline Çalışma

> 📌 **Önemli:** TV Player uygulaması çevrimdışı çalışabilir.
> - Playlist ve içerikler cihaza indirilir
> - İnternet kesilse bile oynatma devam eder
> - Bağlantı geldiğinde otomatik senkronize olur

### 3.3 Flutter Paketleri

| Paket | Kullanım |
|-------|----------|
| **video_player** | Video oynatma |
| **chewie** | Video player UI |
| **cached_network_image** | Görsel cache |
| **dio** | HTTP client + indirme |
| **socket_io_client** | WebSocket |
| **hive** | Local storage (offline playlist) |
| **hive_flutter** | Hive Flutter entegrasyonu |
| **path_provider** | Dosya yolu yönetimi |
| **connectivity_plus** | Ağ durumu kontrolü |
| **wakelock_plus** | Ekran açık tutma |
| **android_intent_plus** | Sistem intent'leri |
| **device_info_plus** | Cihaz bilgileri |
| **package_info_plus** | Uygulama bilgileri |
| **crypto** | Checksum doğrulama |

---

## 4. Veritabanı

### 4.1 PostgreSQL Extensions

| Extension | Kullanım |
|-----------|----------|
| **uuid-ossp** | UUID üretimi |
| **pgcrypto** | Şifreleme fonksiyonları |
| **pg_trgm** | Fuzzy text search |

### 4.2 Tablo Özeti

| Kategori | Tablo Sayısı |
|----------|--------------|
| Core tablolar | 8 |
| İlişki tabloları | 3 |
| Log tabloları | 4 |
| **Toplam** | **15** |

---

## 5. Dosya Depolama

### 5.1 Yapı

```
uploads/
├── videos/
│   ├── original/        # Orijinal videolar
│   └── thumbnails/      # Video thumbnail'ları
├── images/
│   ├── original/        # Orijinal görseller
│   └── thumbnails/      # Görsel thumbnail'ları
├── sliders/             # Slider görselleri
└── temp/                # Geçici dosyalar
```

### 5.2 Dosya İşleme

| İşlem | Araç | Açıklama |
|-------|------|----------|
| Görsel Resize | Sharp | Thumbnail ve önizleme oluşturma |
| Görsel Optimizasyon | Sharp | WebP dönüşümü, kalite ayarı |
| Video Thumbnail | FFmpeg | Video karelerinden thumbnail |
| Video Metadata | FFmpeg | Süre, çözünürlük bilgileri |

---

## 6. Güvenlik

### 6.1 Authentication

| Bileşen | Teknoloji |
|---------|-----------|
| Token | JWT (Access + Refresh) |
| Şifre Hash | Bcrypt (salt: 10) |
| Session | Redis |

### 6.2 Authorization

| Rol | Yetki Seviyesi |
|-----|----------------|
| super_admin | Tüm yetkiler |
| admin | Mağaza/cihaz yönetimi |
| editor | İçerik yönetimi |
| viewer | Sadece görüntüleme |

### 6.3 Güvenlik Önlemleri

| Önlem | Uygulama |
|-------|----------|
| HTTPS | Zorunlu (production) |
| CORS | Whitelist tabanlı |
| Rate Limiting | IP bazlı |
| SQL Injection | ORM + parameterized queries |
| XSS | Input sanitization |
| CSRF | Token tabanlı |
| Headers | Helmet.js |

---

## 7. DevOps

### 7.1 Geliştirme Ortamı

| Araç | Kullanım |
|------|----------|
| Git | Versiyon kontrolü |
| VS Code | IDE |
| Docker | Konteynerizasyon |
| Docker Compose | Multi-container |

### 7.2 CI/CD (Planlanan)

| Araç | Kullanım |
|------|----------|
| GitHub Actions | CI/CD pipeline |
| Docker Hub | Image registry |
| PM2 | Node.js process manager |

### 7.3 Monitoring (Planlanan)

| Araç | Kullanım |
|------|----------|
| Winston + File | Log dosyaları |
| PostgreSQL Logs | Veritabanı logları |
| Custom Dashboard | İstatistikler |

---

## 8. Versiyon Gereksinimleri

### 8.1 Minimum Gereksinimler

```yaml
# Backend
node: ">=20.0.0"
npm: ">=10.0.0"
postgresql: ">=14.0"
redis: ">=6.0"

# Flutter
flutter: ">=3.16.0"
dart: ">=3.2.0"

# Android TV
android_sdk: ">=21"  # Android 5.0 Lollipop
target_sdk: "34"     # Android 14
```

### 8.2 Önerilen Gereksinimler

```yaml
# Backend Server
cpu: "2+ cores"
ram: "4+ GB"
storage: "50+ GB SSD"
os: "Ubuntu 22.04 LTS"

# Android TV
ram: "2+ GB"
storage: "8+ GB"
resolution: "1080p+"
```

---

## 9. Paket Bağımlılık Diyagramı

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BAĞIMLILIK YAPISI                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  BACKEND                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                       │
│  │ Express  │───►│ Sequelize│───►│PostgreSQL│                       │
│  └──────────┘    └──────────┘    └──────────┘                       │
│       │                                                              │
│       ├──────────►┌──────────┐                                      │
│       │           │ Socket.IO│───────────────────┐                  │
│       │           └──────────┘                   │                  │
│       │                                          │                  │
│       ├──────────►┌──────────┐                   │                  │
│       │           │  Redis   │◄──────────────────┤                  │
│       │           └──────────┘                   │                  │
│       │                                          │                  │
│       └──────────►┌──────────┐                   │                  │
│                   │  Multer  │───►┌──────────┐   │                  │
│                   └──────────┘    │  Sharp   │   │                  │
│                                   └──────────┘   │                  │
│                                                  │                  │
│  ADMIN PANEL                                     │                  │
│  ┌──────────┐    ┌──────────┐                   │                  │
│  │ Flutter  │───►│ Riverpod │                   │                  │
│  └──────────┘    └──────────┘                   │                  │
│       │                                          │                  │
│       ├──────────►┌──────────┐    ┌──────────┐   │                  │
│       │           │   Dio    │───►│ Backend  │◄──┘                  │
│       │           └──────────┘    │   API    │                      │
│       │                           └──────────┘                      │
│       └──────────►┌──────────┐                                      │
│                   │ Go Router│                                      │
│                   └──────────┘                                      │
│                                                                      │
│  TV PLAYER                                                           │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                       │
│  │ Flutter  │───►│video_player│──►│  Chewie  │                      │
│  └──────────┘    └──────────┘    └──────────┘                       │
│       │                                                              │
│       ├──────────►┌──────────┐                                      │
│       │           │   Hive   │ (Local Cache)                        │
│       │           └──────────┘                                      │
│       │                                                              │
│       └──────────►┌──────────┐                                      │
│                   │   Dio    │───► Backend API                      │
│                   └──────────┘                                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

*Son Güncelleme: 24 Aralık 2024*
