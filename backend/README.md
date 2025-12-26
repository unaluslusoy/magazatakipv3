# 📡 MağazaPano Backend API

Backend API sunucusu - Node.js + Express.js + PostgreSQL (Neon)

## 🚀 Kurulum

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Environment Değişkenlerini Ayarla

```bash
cp .env.example .env
# .env dosyasını düzenle
```

### 3. Veritabanı Kurulumu

```bash
# Neon'da database oluştur
# docs/02-VERITABANI/sql/001-schema.sql dosyasını çalıştır
npm run db:migrate

# Seed data ekle (opsiyonel)
npm run db:seed
```

### 4. Sunucuyu Başlat

```bash
# Development
npm run dev

# Production
npm start
```

## 📁 Proje Yapısı

```
backend/
├── src/
│   ├── config/            # Yapılandırma dosyaları
│   ├── controllers/       # Route controller'ları
│   ├── middleware/        # Custom middleware'ler
│   ├── models/            # Sequelize modeller
│   ├── routes/            # API route tanımları
│   ├── services/          # İş mantığı servisleri
│   ├── utils/             # Yardımcı fonksiyonlar
│   └── app.js             # Ana uygulama
├── uploads/               # Yüklenen dosyalar
├── tests/                 # Test dosyaları
└── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Giriş yap
- `POST /api/auth/logout` - Çıkış yap
- `POST /api/auth/refresh` - Token yenile
- `GET /api/auth/me` - Profil bilgisi

### Contents
- `GET /api/contents` - İçerik listesi
- `GET /api/contents/:id` - İçerik detayı
- `POST /api/contents` - İçerik oluştur
- `PUT /api/contents/:id` - İçerik güncelle
- `DELETE /api/contents/:id` - İçerik sil

### Playlists
- `GET /api/playlists` - Playlist listesi
- `POST /api/playlists` - Playlist oluştur
- `PUT /api/playlists/:id` - Playlist güncelle
- `DELETE /api/playlists/:id` - Playlist sil

### Devices
- `GET /api/devices` - Cihaz listesi
- `POST /api/devices/register` - Cihaz kaydı
- `PUT /api/devices/:id/approve` - Cihaz onayla
- `POST /api/devices/:id/heartbeat` - Heartbeat

## 🧪 Test

```bash
npm test
```

## 📝 Lisans

MIT
