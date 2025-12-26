# 📡 MağazaPano - Backend API Dokümantasyonu

**Versiyon:** 1.0.0  
**Tarih:** 24 Aralık 2024

---

## 1. API Genel Bilgiler

### 1.1 Base URL

```
Geliştirme: http://localhost:3000/api
Üretim:     https://api.magazapano.com/api
```

### 1.2 Kimlik Doğrulama

Tüm API istekleri (login hariç) JWT token gerektirir:

```http
Authorization: Bearer <token>
```

### 1.3 Ortak Response Yapısı

**Başarılı Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "İşlem başarılı"
}
```

**Hata Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Geçersiz veri",
    "details": [...]
  }
}
```

### 1.4 HTTP Durum Kodları

| Kod | Açıklama |
|-----|----------|
| 200 | Başarılı |
| 201 | Oluşturuldu |
| 400 | Geçersiz istek |
| 401 | Kimlik doğrulama hatası |
| 403 | Yetki hatası |
| 404 | Bulunamadı |
| 422 | Validasyon hatası |
| 500 | Sunucu hatası |

---

## 2. Kimlik Doğrulama (Auth)

### 2.1 Giriş Yap

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "name": "Admin Kullanıcı",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

### 2.2 Token Yenile

```http
POST /api/auth/refresh
```

**Headers:**
```http
Authorization: Bearer <current_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

### 2.3 Çıkış Yap

```http
POST /api/auth/logout
```

**Response:**
```json
{
  "success": true,
  "message": "Çıkış yapıldı"
}
```

### 2.4 Profil Bilgisi

```http
GET /api/auth/me
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin Kullanıcı",
    "role": "admin",
    "store_id": null,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## 3. İçerik Yönetimi (Contents)

### 3.1 İçerik Listesi

```http
GET /api/contents
```

**Query Parameters:**

| Parametre | Tip | Açıklama |
|-----------|-----|----------|
| page | number | Sayfa numarası (varsayılan: 1) |
| limit | number | Sayfa başına öğe (varsayılan: 20) |
| type | string | İçerik tipi (video, image, slider, ticker, announcement) |
| status | string | Durum (active, inactive) |
| search | string | Arama terimi |
| sort | string | Sıralama (created_at, name, type) |
| order | string | Sıralama yönü (asc, desc) |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Yılbaşı Kampanyası",
        "type": "video",
        "file_url": "/uploads/videos/campaign.mp4",
        "thumbnail_url": "/uploads/thumbnails/campaign.jpg",
        "duration_seconds": 30,
        "file_size": 52428800,
        "resolution": "1920x1080",
        "status": "active",
        "created_at": "2024-12-24T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

### 3.2 İçerik Detayı

```http
GET /api/contents/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Yılbaşı Kampanyası",
    "description": "Yılbaşı özel indirim videosu",
    "type": "video",
    "file_url": "/uploads/videos/campaign.mp4",
    "thumbnail_url": "/uploads/thumbnails/campaign.jpg",
    "duration_seconds": 30,
    "file_size": 52428800,
    "resolution": "1920x1080",
    "mime_type": "video/mp4",
    "status": "active",
    "metadata": {
      "codec": "h264",
      "bitrate": 8000000
    },
    "created_by": 1,
    "created_at": "2024-12-24T10:00:00Z",
    "updated_at": "2024-12-24T10:00:00Z"
  }
}
```

### 3.3 İçerik Oluştur

```http
POST /api/contents
Content-Type: multipart/form-data
```

**Form Data:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| file | File | Evet | Video/Görsel dosyası |
| name | string | Evet | İçerik adı |
| type | string | Evet | İçerik tipi |
| description | string | Hayır | Açıklama |
| duration_seconds | number | Hayır | Süre (görsel için) |
| status | string | Hayır | Durum (varsayılan: active) |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Banner Görsel",
    "type": "image",
    "file_url": "/uploads/images/banner.jpg",
    "thumbnail_url": "/uploads/thumbnails/banner.jpg",
    "status": "active",
    "created_at": "2024-12-24T11:00:00Z"
  },
  "message": "İçerik başarıyla oluşturuldu"
}
```

### 3.4 İçerik Güncelle

```http
PUT /api/contents/:id
```

**Request Body:**
```json
{
  "name": "Güncellenmiş İsim",
  "description": "Yeni açıklama",
  "duration_seconds": 15,
  "status": "inactive"
}
```

### 3.5 İçerik Sil

```http
DELETE /api/contents/:id
```

**Response:**
```json
{
  "success": true,
  "message": "İçerik silindi"
}
```

---

## 4. Slider Yönetimi

### 4.1 Slider Oluştur

```http
POST /api/contents/slider
```

**Request Body:**
```json
{
  "name": "Ana Sayfa Slider",
  "description": "Ana sayfa ürün slider'ı",
  "slides": [
    {
      "image_id": 1,
      "title": "Ürün 1",
      "subtitle": "%50 İndirim",
      "duration_seconds": 5,
      "position": 1
    },
    {
      "image_id": 2,
      "title": "Ürün 2",
      "subtitle": "Yeni Sezon",
      "duration_seconds": 5,
      "position": 2
    }
  ],
  "settings": {
    "transition_type": "fade",
    "show_indicators": true,
    "auto_play": true,
    "loop": true
  }
}
```

### 4.2 Slider Güncelle

```http
PUT /api/contents/slider/:id
```

**Request Body:**
```json
{
  "name": "Güncellenmiş Slider",
  "slides": [
    {
      "id": 1,
      "image_id": 1,
      "duration_seconds": 7,
      "position": 1
    },
    {
      "image_id": 3,
      "title": "Yeni Slide",
      "duration_seconds": 5,
      "position": 2
    }
  ]
}
```

---

## 5. Ticker Yönetimi

### 5.1 Ticker Oluştur

```http
POST /api/contents/ticker
```

**Request Body:**
```json
{
  "name": "Promosyon Ticker",
  "text": "🎄 Yılbaşı özel %30 indirim! | 🚚 Ücretsiz kargo | ⭐ VIP fırsatlar",
  "settings": {
    "speed": "normal",
    "font_size": 28,
    "background_color": "#1E293B",
    "text_color": "#FFFFFF"
  }
}
```

---

## 6. Duyuru Yönetimi

### 6.1 Duyuru Oluştur

```http
POST /api/contents/announcement
```

**Request Body:**
```json
{
  "name": "Hoş Geldiniz",
  "title": "Mağazamıza Hoş Geldiniz!",
  "message": "Bugün size özel fırsatlar sizi bekliyor.",
  "type": "info",
  "settings": {
    "duration_seconds": 10,
    "icon": "info"
  }
}
```

---

## 7. Playlist Yönetimi

### 7.1 Playlist Listesi

```http
GET /api/playlists
```

**Query Parameters:**

| Parametre | Tip | Açıklama |
|-----------|-----|----------|
| page | number | Sayfa numarası |
| limit | number | Sayfa başına öğe |
| status | string | Durum (active, inactive) |
| search | string | Arama terimi |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Varsayılan Playlist",
        "description": "Tüm mağazalar için varsayılan",
        "content_count": 8,
        "duration_seconds": 240,
        "is_default": true,
        "priority": 10,
        "status": "active",
        "assigned_devices": 45,
        "created_at": "2024-12-01T00:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

### 7.2 Playlist Detayı

```http
GET /api/playlists/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Varsayılan Playlist",
    "description": "Tüm mağazalar için varsayılan",
    "is_default": true,
    "priority": 10,
    "status": "active",
    "contents": [
      {
        "id": 1,
        "content_id": 5,
        "position": 1,
        "duration_override": null,
        "transition_type": "fade",
        "content": {
          "id": 5,
          "name": "Video 1",
          "type": "video",
          "duration_seconds": 30,
          "thumbnail_url": "/uploads/thumbnails/video1.jpg"
        }
      }
    ],
    "schedules": [
      {
        "id": 1,
        "schedule_type": "always",
        "is_active": true
      }
    ],
    "created_at": "2024-12-01T00:00:00Z"
  }
}
```

### 7.3 Playlist Oluştur

```http
POST /api/playlists
```

**Request Body:**
```json
{
  "name": "Yılbaşı Kampanyası",
  "description": "Yılbaşı dönemi özel içerikler",
  "is_default": false,
  "priority": 60,
  "contents": [
    {
      "content_id": 1,
      "position": 1,
      "duration_override": null,
      "transition_type": "slide"
    },
    {
      "content_id": 2,
      "position": 2,
      "duration_override": 10,
      "transition_type": "fade"
    }
  ]
}
```

### 7.4 Playlist İçerik Sıralama

```http
PUT /api/playlists/:id/contents/reorder
```

**Request Body:**
```json
{
  "contents": [
    { "id": 3, "position": 1 },
    { "id": 1, "position": 2 },
    { "id": 2, "position": 3 }
  ]
}
```

### 7.5 Playlist'e İçerik Ekle

```http
POST /api/playlists/:id/contents
```

**Request Body:**
```json
{
  "content_id": 5,
  "position": 4,
  "duration_override": null,
  "transition_type": "zoom"
}
```

### 7.6 Playlist'ten İçerik Çıkar

```http
DELETE /api/playlists/:id/contents/:contentId
```

---

## 8. Zamanlama (Schedule)

### 8.1 Zamanlama Listesi

```http
GET /api/schedules
```

**Query Parameters:**

| Parametre | Tip | Açıklama |
|-----------|-----|----------|
| playlist_id | number | Playlist filtresi |
| active | boolean | Sadece aktif |

### 8.2 Zamanlama Oluştur

```http
POST /api/schedules
```

**Request Body (Sürekli):**
```json
{
  "playlist_id": 1,
  "schedule_type": "always",
  "is_active": true
}
```

**Request Body (Tarih Aralığı):**
```json
{
  "playlist_id": 2,
  "schedule_type": "date_range",
  "start_date": "2024-12-15",
  "end_date": "2025-01-02",
  "start_time": "09:00",
  "end_time": "21:00",
  "is_active": true
}
```

**Request Body (Haftalık):**
```json
{
  "playlist_id": 3,
  "schedule_type": "weekly",
  "days_of_week": [1, 2, 3, 4, 5],
  "start_time": "09:00",
  "end_time": "18:00",
  "is_active": true
}
```

### 8.3 Timeline Görünümü

```http
GET /api/schedules/timeline
```

**Query Parameters:**

| Parametre | Tip | Açıklama |
|-----------|-----|----------|
| date | string | Tarih (YYYY-MM-DD) |
| device_id | number | Cihaz filtresi |
| store_id | number | Mağaza filtresi |

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-12-24",
    "timeline": [
      {
        "hour": 9,
        "active_playlist": {
          "id": 2,
          "name": "Yılbaşı Kampanyası",
          "priority": 60
        }
      }
    ],
    "playlists": [
      {
        "id": 1,
        "name": "Varsayılan",
        "priority": 10,
        "schedule_type": "always",
        "color": "#3B82F6"
      }
    ]
  }
}
```

---

## 9. Kampanya Yönetimi

### 9.1 Kampanya Listesi

```http
GET /api/campaigns
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Yılbaşı Kampanyası",
        "playlist_id": 2,
        "playlist_name": "Yılbaşı Playlist",
        "start_date": "2024-12-15",
        "end_date": "2025-01-02",
        "priority": 60,
        "status": "active",
        "store_count": 45,
        "created_at": "2024-12-01T00:00:00Z"
      }
    ]
  }
}
```

### 9.2 Kampanya Oluştur

```http
POST /api/campaigns
```

**Request Body:**
```json
{
  "name": "Yılbaşı Kampanyası",
  "playlist_id": 2,
  "start_date": "2024-12-15",
  "end_date": "2025-01-02",
  "priority": 60,
  "store_ids": [1, 2, 3, 4, 5]
}
```

### 9.3 Kampanyaya Mağaza Ata

```http
POST /api/campaigns/:id/stores
```

**Request Body:**
```json
{
  "store_ids": [1, 2, 3],
  "replace": false
}
```

---

## 10. Cihaz Yönetimi (Devices)

### 10.1 Cihaz Listesi

```http
GET /api/devices
```

**Query Parameters:**

| Parametre | Tip | Açıklama |
|-----------|-----|----------|
| page | number | Sayfa numarası |
| limit | number | Sayfa başına öğe |
| status | string | Durum (online, offline, error) |
| store_id | number | Mağaza filtresi |
| search | string | Arama (isim, kod) |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "device_code": "TV-001",
        "name": "Kadıköy TV 1",
        "store_id": 1,
        "store_name": "Kadıköy Mağazası",
        "status": "online",
        "last_heartbeat": "2024-12-24T14:55:00Z",
        "current_playlist_id": 2,
        "current_playlist_name": "Yılbaşı Kampanyası",
        "ip_address": "192.168.1.100",
        "app_version": "1.0.0",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": { ... },
    "summary": {
      "total": 50,
      "online": 45,
      "offline": 3,
      "error": 2
    }
  }
}
```

### 10.2 Cihaz Detayı

```http
GET /api/devices/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "device_code": "TV-001",
    "name": "Kadıköy TV 1",
    "store": {
      "id": 1,
      "name": "Kadıköy Mağazası",
      "region": "İstanbul"
    },
    "status": "online",
    "last_heartbeat": "2024-12-24T14:55:00Z",
    "current_playlist": {
      "id": 2,
      "name": "Yılbaşı Kampanyası"
    },
    "system_info": {
      "ip_address": "192.168.1.100",
      "mac_address": "AA:BB:CC:DD:EE:FF",
      "app_version": "1.0.0",
      "os_version": "Android 11",
      "screen_resolution": "1920x1080",
      "free_storage_mb": 2048
    },
    "sync_status": {
      "last_sync": "2024-12-24T14:00:00Z",
      "pending_contents": 0
    },
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 10.3 Cihaz Kaydet

```http
POST /api/devices
```

**Request Body:**
```json
{
  "device_code": "TV-002",
  "name": "Kadıköy TV 2",
  "store_id": 1,
  "layout_type": "single",
  "orientation": "landscape"
}
```

### 10.4 Cihaza Playlist Ata

```http
PUT /api/devices/:id/playlist
```

**Request Body:**
```json
{
  "playlist_id": 2
}
```

### 10.5 Cihazı Yeniden Başlat

```http
POST /api/devices/:id/restart
```

**Response:**
```json
{
  "success": true,
  "message": "Yeniden başlatma komutu gönderildi"
}
```

### 10.6 Cihaz İçerik Senkronizasyonu

```http
POST /api/devices/:id/sync
```

**Response:**
```json
{
  "success": true,
  "message": "Senkronizasyon başlatıldı",
  "data": {
    "contents_to_download": 3,
    "total_size_mb": 125.5
  }
}
```

---

## 11. Mağaza Yönetimi (Stores)

### 11.1 Mağaza Listesi

```http
GET /api/stores
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Kadıköy Mağazası",
        "code": "KDK001",
        "address": "Kadıköy, İstanbul",
        "region": "İstanbul",
        "device_count": 3,
        "active_campaign": "Yılbaşı Kampanyası",
        "status": "active",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### 11.2 Mağaza-Playlist Atama

```http
PUT /api/stores/:id/playlists
```

**Request Body:**
```json
{
  "playlists": [
    { "playlist_id": 1, "priority": 10 },
    { "playlist_id": 2, "priority": 60 }
  ]
}
```

---

## 12. TV Player API

### 12.1 Cihaz Aktivasyonu

```http
POST /api/player/activate
```

**Request Body:**
```json
{
  "device_code": "TV-001",
  "activation_code": "ABC123",
  "device_info": {
    "os_version": "Android 11",
    "app_version": "1.0.0",
    "screen_resolution": "1920x1080",
    "mac_address": "AA:BB:CC:DD:EE:FF"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "device_id": 1,
    "device_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "store": {
      "id": 1,
      "name": "Kadıköy Mağazası"
    },
    "websocket_url": "wss://api.magazapano.com/socket"
  }
}
```

### 12.2 Mevcut Playlist Al

```http
GET /api/player/playlist
```

**Headers:**
```http
X-Device-Token: <device_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "playlist_id": 2,
    "playlist_name": "Yılbaşı Kampanyası",
    "layout_type": "single",
    "contents": [
      {
        "id": 1,
        "type": "video",
        "name": "Kampanya Video",
        "file_url": "https://cdn.magazapano.com/videos/campaign.mp4",
        "duration_seconds": 30,
        "position": 1,
        "transition_type": "fade",
        "checksum": "abc123..."
      }
    ],
    "ticker": {
      "id": 5,
      "text": "🎄 Yılbaşı özel %30 indirim!",
      "speed": "normal",
      "background_color": "#1E293B",
      "text_color": "#FFFFFF"
    },
    "last_updated": "2024-12-24T14:00:00Z"
  }
}
```

### 12.3 Heartbeat

```http
POST /api/player/heartbeat
```

**Headers:**
```http
X-Device-Token: <device_token>
```

**Request Body:**
```json
{
  "status": "playing",
  "current_content_id": 1,
  "current_position_seconds": 15,
  "system_info": {
    "free_storage_mb": 2048,
    "memory_usage_percent": 45,
    "cpu_usage_percent": 30
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "commands": [],
    "playlist_updated": false,
    "server_time": "2024-12-24T15:00:00Z"
  }
}
```

### 12.4 Play Log Kaydet

```http
POST /api/player/logs
```

**Request Body:**
```json
{
  "logs": [
    {
      "content_id": 1,
      "started_at": "2024-12-24T14:00:00Z",
      "ended_at": "2024-12-24T14:00:30Z",
      "completed": true
    }
  ]
}
```

### 12.5 İçerik İndir

```http
GET /api/player/contents/:id/download
```

**Headers:**
```http
X-Device-Token: <device_token>
Range: bytes=0-1048575
```

---

## 13. Raporlama API

### 13.1 Dashboard Özeti

```http
GET /api/reports/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "devices": {
      "total": 50,
      "online": 45,
      "offline": 5
    },
    "contents": {
      "total": 156,
      "video": 45,
      "image": 78,
      "slider": 12,
      "ticker": 15,
      "announcement": 6
    },
    "playlists": {
      "total": 24,
      "active": 18
    },
    "storage": {
      "used_gb": 24.5,
      "total_gb": 100
    },
    "today_plays": 12500,
    "active_campaigns": 3
  }
}
```

### 13.2 İçerik Görüntülenme Raporu

```http
GET /api/reports/content-views
```

**Query Parameters:**

| Parametre | Tip | Açıklama |
|-----------|-----|----------|
| start_date | string | Başlangıç tarihi |
| end_date | string | Bitiş tarihi |
| content_id | number | İçerik filtresi |
| store_id | number | Mağaza filtresi |

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2024-12-01",
      "end": "2024-12-24"
    },
    "total_views": 125000,
    "contents": [
      {
        "content_id": 1,
        "content_name": "Yılbaşı Video",
        "type": "video",
        "view_count": 15000,
        "total_duration_minutes": 7500,
        "completion_rate": 92.5
      }
    ]
  }
}
```

### 13.3 Cihaz Çalışma Raporu

```http
GET /api/reports/device-uptime
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2024-12-01",
      "end": "2024-12-24"
    },
    "devices": [
      {
        "device_id": 1,
        "device_name": "Kadıköy TV 1",
        "store_name": "Kadıköy Mağazası",
        "uptime_percent": 99.5,
        "total_hours": 552,
        "online_hours": 549,
        "offline_events": 2
      }
    ]
  }
}
```

---

## 14. WebSocket Olayları

### 14.1 Bağlantı

```javascript
const socket = io('wss://api.magazapano.com', {
  auth: {
    token: '<device_token>'
  }
});
```

### 14.2 Sunucudan Gelen Olaylar

| Olay | Açıklama |
|------|----------|
| `playlist:updated` | Playlist güncellemesi |
| `content:sync` | İçerik senkronizasyonu |
| `device:restart` | Yeniden başlatma komutu |
| `device:screenshot` | Ekran görüntüsü isteği |

**Örnek:**
```javascript
socket.on('playlist:updated', (data) => {
  console.log('Yeni playlist:', data.playlist_id);
});
```

### 14.3 Cihazdan Gönderilen Olaylar

| Olay | Açıklama |
|------|----------|
| `status:update` | Durum güncelleme |
| `play:log` | Oynatma logu |
| `error:report` | Hata raporu |

**Örnek:**
```javascript
socket.emit('status:update', {
  status: 'playing',
  content_id: 1
});
```

---

## 15. Hata Kodları

| Kod | Açıklama |
|-----|----------|
| AUTH_INVALID_TOKEN | Geçersiz token |
| AUTH_EXPIRED_TOKEN | Token süresi dolmuş |
| AUTH_INSUFFICIENT_ROLE | Yetersiz yetki |
| VALIDATION_REQUIRED | Zorunlu alan eksik |
| VALIDATION_INVALID | Geçersiz değer |
| RESOURCE_NOT_FOUND | Kaynak bulunamadı |
| RESOURCE_IN_USE | Kaynak kullanımda |
| FILE_TOO_LARGE | Dosya çok büyük |
| FILE_INVALID_TYPE | Geçersiz dosya tipi |
| DEVICE_OFFLINE | Cihaz çevrimdışı |
| QUOTA_EXCEEDED | Kota aşıldı |

---

*Son Güncelleme: 24 Aralık 2024*
