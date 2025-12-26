# 🚀 MağazaPano - Uygulama Planı

**Başlangıç Tarihi:** 24 Aralık 2024  
**Tahmini Süre:** 12 Hafta  
**Durum:** Başlatılıyor

---

## 📋 Proje Özeti

**MağazaPano**, mağaza zincirlerindeki dijital ekranları merkezi olarak yöneten bir sistemdir.

### Temel Bileşenler
- ✅ **Backend API** - Node.js + Express.js + PostgreSQL (Neon)
- ✅ **Admin Panel** - Flutter Web/Desktop
- ✅ **TV Player** - Flutter Android TV
- ✅ **Real-time** - Socket.IO

---

## 🎯 Aşamalı Geliştirme Planı

### ✅ FAZ 1: TEMEL ALTYAPI (Hafta 1-3)

#### Backend Temel Yapı
- [x] Node.js + Express.js proje kurulumu
- [x] TypeScript yapılandırması
- [x] PostgreSQL (Neon) bağlantısı
- [x] Sequelize ORM yapılandırması
- [x] Veritabanı şeması (migration)
- [x] Seed data (demo veriler)
- [x] Environment config (.env)
- [x] Error handling middleware
- [x] Logger (Winston)
- [x] CORS yapılandırması

#### Authentication Sistemi
- [x] JWT token sistemi
- [x] Login/Logout endpoint'leri
- [x] Password hashing (bcrypt)
- [x] Token refresh mekanizması
- [x] RBAC middleware (rol bazlı erişim)
- [x] Session yönetimi

#### Admin Panel Temel
- [x] Flutter proje kurulumu
- [x] Riverpod state management
- [x] Go Router navigasyon
- [x] Dio HTTP client
- [x] Login ekranı
- [x] Dashboard layout
- [x] Sidebar navigasyon
- [x] Tema sistemi (Dark/Light)

**Çıktı:** 
- Çalışan backend API sunucusu
- Login/logout işlevi
- Admin panel temel navigasyon

---

### ⏳ FAZ 2: MEDYA YÖNETİMİ (Hafta 4-6)

#### Backend - İçerik API
- [ ] Contents CRUD endpoints
- [ ] Multer dosya upload
- [ ] Video upload + thumbnail (FFmpeg)
- [ ] Görsel işleme (Sharp)
- [ ] Chunk upload desteği
- [ ] Checksum doğrulama
- [ ] Slider CRUD
- [ ] Ticker CRUD
- [ ] Duyuru CRUD
- [ ] Content validation

#### Admin Panel - Medya Modülü
- [ ] Medya galerisi (grid/liste görünümü)
- [ ] Filtreleme & arama
- [ ] Video yükleme modal
- [ ] Görsel yükleme modal
- [ ] Drag & drop upload
- [ ] Upload progress bar
- [ ] Slider editör ekranı
  - [ ] Slide ekleme/silme
  - [ ] Sürükle-bırak sıralama
  - [ ] Geçiş efekt seçici
  - [ ] Slide süre ayarı
- [ ] Ticker editör
  - [ ] Renk seçici (bg, text)
  - [ ] Hız ayarı
  - [ ] Emoji desteği
- [ ] Duyuru editör
  - [ ] Rich text editör (flutter_quill)
  - [ ] Tip seçimi (info, warning, urgent)
- [ ] Önizleme modu
- [ ] Toplu silme/arşivleme

**Çıktı:**
- Video/görsel yükleme çalışıyor
- Slider/ticker/duyuru oluşturma
- Medya önizleme

---

### ⏳ FAZ 3: PLAYLIST & CİHAZ YÖNETİMİ (Hafta 7-9)

#### Backend - Playlist API
- [ ] Playlists CRUD
- [ ] Playlist-Content ilişkisi
- [ ] Playlist süre hesaplama (trigger)
- [ ] Schedule (zamanlama) CRUD
- [ ] Kampanya CRUD
- [ ] Kampanya-Mağaza ilişkisi

#### Backend - Device API
- [ ] Devices CRUD
- [ ] Device activation/approval
- [ ] Heartbeat endpoint
- [ ] Socket.IO entegrasyonu
- [ ] Content sync endpoint
- [ ] Remote control (restart, update)

#### Admin Panel - Playlist Modülü
- [ ] Playlist listesi
- [ ] Playlist oluşturma/düzenleme
- [ ] İçerik sürükle-bırak
- [ ] Pozisyon yönetimi
- [ ] Süre override
- [ ] Layout seçimi (single, split, grid, pip)
- [ ] Zamanlama ayarları
  - [ ] Tarih aralığı seçici
  - [ ] Saat aralığı
  - [ ] Haftalık gün seçici
  - [ ] Tekrar tipi
- [ ] Timeline görünümü
- [ ] Kampanya yönetimi
- [ ] Mağaza-Playlist atama
- [ ] Öncelik yönetimi

#### Admin Panel - Cihaz Modülü
- [ ] Cihaz listesi (DataTable)
- [ ] Cihaz detay sayfası
- [ ] Cihaz durum göstergeleri (online/offline)
- [ ] Heartbeat izleme
- [ ] Cihaz onaylama/reddetme
- [ ] Uzaktan yeniden başlatma
- [ ] Playlist atama
- [ ] Cihaz grupları

**Çıktı:**
- Playlist oluşturma/düzenleme
- Zamanlama sistemi
- Kampanya yönetimi
- Cihaz izleme ve yönetimi

---

### ⏳ FAZ 4: TV PLAYER UYGULAMASI (Hafta 10-12)

#### TV Player (Flutter Android TV)
- [ ] Flutter Android TV proje kurulumu
- [ ] Hive local storage
- [ ] Device registration/activation
- [ ] Playlist sync
- [ ] Content downloader
  - [ ] Chunk download
  - [ ] Resume download
  - [ ] Checksum doğrulama
- [ ] Offline playlist player
- [ ] Video player (video_player + chewie)
- [ ] Image viewer
- [ ] Slider player
- [ ] Ticker renderer
- [ ] Duyuru overlay
- [ ] Layout renderer
  - [ ] Single
  - [ ] Split horizontal/vertical
  - [ ] Grid 4
  - [ ] Picture-in-Picture
- [ ] Heartbeat sender
- [ ] Socket.IO listener (real-time)
- [ ] Auto-update mechanism
- [ ] Error reporting
- [ ] Wake lock (ekran açık tutma)

#### Admin Panel - Raporlama
- [ ] Dashboard grafikleri (fl_chart)
- [ ] Oynatma istatistikleri
- [ ] Cihaz uptime raporları
- [ ] İçerik kullanım analizi
- [ ] Kampanya performans raporları

**Çıktı:**
- Çalışan Android TV uygulaması
- Offline oynatma
- Real-time sync
- Dashboard raporları

---

### ⏳ FAZ 5: TEST & OPTİMİZASYON (Hafta 13-14)

#### Backend
- [ ] Unit testler
- [ ] Integration testler
- [ ] Load testing (Artillery)
- [ ] API documentation (Swagger)
- [ ] Security audit
- [ ] Performance optimization

#### Frontend
- [ ] Widget testleri
- [ ] Integration testleri
- [ ] E2E testler
- [ ] Accessibility
- [ ] Responsive design check

#### Deployment
- [ ] Docker container
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Production environment setup
- [ ] Backup stratejisi
- [ ] Monitoring (Sentry)

**Çıktı:**
- Test coverage > %70
- Dokümantasyon tamamlandı
- Production-ready sistem

---

## 📦 Proje Yapısı

```
MagazaPanel/
├── backend/                    # Node.js API
│   ├── src/
│   │   ├── config/            # Yapılandırma
│   │   ├── controllers/       # Route controller'ları
│   │   ├── middleware/        # Auth, error handling
│   │   ├── models/            # Sequelize modeller
│   │   ├── routes/            # API route'ları
│   │   ├── services/          # İş mantığı
│   │   ├── utils/             # Yardımcı fonksiyonlar
│   │   └── app.js             # Express uygulaması
│   ├── uploads/               # Yüklenen dosyalar
│   ├── tests/                 # Testler
│   ├── package.json
│   └── .env.example
│
├── admin_panel/               # Flutter Admin
│   ├── lib/
│   │   ├── core/              # Config, constants
│   │   ├── models/            # Data modelleri
│   │   ├── providers/         # Riverpod providers
│   │   ├── services/          # API servisleri
│   │   ├── screens/           # Ekranlar
│   │   ├── widgets/           # Widget'lar
│   │   └── main.dart
│   ├── assets/                # Görseller, fontlar
│   ├── pubspec.yaml
│   └── .env.example
│
├── tv_player/                 # Flutter TV App
│   ├── lib/
│   │   ├── core/
│   │   ├── models/
│   │   ├── services/
│   │   │   ├── sync_service.dart
│   │   │   ├── download_service.dart
│   │   │   └── player_service.dart
│   │   ├── screens/
│   │   └── main.dart
│   ├── pubspec.yaml
│   └── .env.example
│
└── docs/                      # Dokümantasyon
```

---

## 🔧 Teknoloji Stack

### Backend
- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js 4.18+
- **Database:** PostgreSQL 16 (Neon Serverless)
- **ORM:** Sequelize
- **Cache:** Redis 7+
- **Real-time:** Socket.IO 4.7+
- **Validation:** Joi
- **Auth:** JWT + bcrypt
- **File Processing:**
  - Multer (upload)
  - Sharp (görsel işleme)
  - FFmpeg (video işleme)
- **Logging:** Winston
- **Testing:** Jest + Supertest

### Admin Panel
- **Framework:** Flutter 3.16+
- **State Management:** Riverpod
- **Routing:** Go Router
- **HTTP Client:** Dio
- **WebSocket:** socket_io_client
- **Charts:** fl_chart
- **Tables:** data_table_2
- **Rich Text:** flutter_quill
- **File Upload:** flutter_dropzone
- **Caching:** cached_network_image

### TV Player
- **Framework:** Flutter 3.16+
- **Target:** Android TV/Tablet
- **Video Player:** video_player + chewie
- **Local Storage:** Hive
- **Background Download:** Dio
- **Network:** connectivity_plus
- **Device Info:** device_info_plus
- **Wake Lock:** wakelock_plus

---

## 📊 Veritabanı Tabloları

### Core Tablolar (8)
1. `users` - Kullanıcılar
2. `stores` - Mağazalar
3. `contents` - Medya içerikleri
4. `playlists` - Oynatma listeleri
5. `schedules` - Zamanlama kuralları
6. `campaigns` - Kampanyalar
7. `devices` - TV/Tablet cihazları
8. `settings` - Sistem ayarları

### İlişki Tabloları (4)
- `slider_slides` - Slider slide'ları
- `playlist_contents` - Playlist içerikleri
- `campaign_stores` - Kampanya-Mağaza
- `device_playlists` - Cihaz-Playlist

### Log Tabloları (3)
- `play_logs` - Oynatma logları (partitioned)
- `system_logs` - Sistem logları
- `device_logs` - Cihaz logları

**Toplam:** 15 tablo

---

## 🚦 Sonraki Adımlar

### Şu An Yapılacaklar (FAZ 1)

1. **Backend Proje Kurulumu**
   ```bash
   mkdir backend
   cd backend
   npm init -y
   npm install express sequelize pg pg-hstore
   npm install -D typescript @types/node @types/express
   ```

2. **Veritabanı Oluşturma**
   - Neon hesabı oluştur
   - Database oluştur
   - Şema SQL'i çalıştır
   - Seed data ekle

3. **Admin Panel Kurulumu**
   ```bash
   flutter create admin_panel --platforms=web,windows,macos
   cd admin_panel
   flutter pub add flutter_riverpod go_router dio
   ```

4. **Auth Sistemi**
   - JWT middleware
   - Login/logout endpoint'leri
   - Password hashing

---

## 📝 Notlar

- **Öncelik:** Backend API ve Admin Panel medya yönetimi
- **Database:** Neon PostgreSQL (serverless, Azure GWC region)
- **Deployment:** Backend - Railway/Render, Frontend - Vercel/Netlify
- **Version Control:** Git + GitHub
- **Documentation:** Swagger/OpenAPI

---

## 📞 İletişim

- **Developer:** [Takım]
- **Client:** [Müşteri]
- **Timeline:** 12 hafta (esnek)

---

**Son Güncelleme:** 24 Aralık 2024
