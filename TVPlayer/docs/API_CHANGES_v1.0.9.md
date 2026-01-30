# API Güncelleme Değişiklikleri - v1.0.9

## 🔄 Base URL Değişikliği

**Eski:** `https://mtapi.magazatakip.com.tr/api`
**Yeni:** `https://pano.magazatakip.com.tr/api`

---

## 📋 Güncellenmiş Endpoint'ler

### 1. Kimlik Doğrulama

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/api/auth/device-login` | POST | Cihaz girişi (değişiklik yok) |
| `/api/auth/verify` | GET | Token doğrulama (değişiklik yok) |
| `/api/devices/activate` | POST | **YENİ** - Cihaz aktivasyonu |

### 2. Cihaz Yönetimi

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/api/devices/info` | GET | **YENİ** - Cihaz bilgilerini getir |
| `/api/devices/info` | PUT | **YENİ** - Cihaz bilgilerini güncelle |
| `/api/devices/status` | PUT | Durum güncelleme (değişiklik yok) |
| `/api/devices/heartbeat` | POST | Heartbeat - **sync_required** alanı eklendi |
| `/api/devices/logs` | POST | Log gönderme (değişiklik yok) |

### 3. Playlist & İçerik

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/api/playlists/current` | GET | **YENİ** - Mevcut playlist'i al |
| `/api/contents/{id}` | GET | Tek içerik detayı |

### 4. Senkronizasyon (Yeni Akış)

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/api/sync/check` | GET | **YENİ** - Güncelleme kontrolü |
| `/api/sync/playlist` | GET | **YENİ** - Tam playlist senkronizasyonu |
| `/api/sync/contents` | GET | **YENİ** - Delta senkronizasyon |
| `/api/sync/confirm` | POST | **YENİ** - Senkronizasyon onayı |
| `/api/sync/status` | GET | **YENİ** - Senkronizasyon durumu |

---

## 🔄 Yeni Senkronizasyon Akışı

```
1. Heartbeat Döngüsü (30 saniye)
   └── POST /api/devices/heartbeat
       └── sync_required: true ise
           ├── GET /api/sync/playlist
           ├── İçerikleri indir
           └── POST /api/sync/confirm

2. Alternatif Akış (Delta Sync)
   ├── GET /api/sync/check (güncelleme var mı?)
   ├── GET /api/sync/contents?since_version=X
   └── POST /api/sync/confirm
```

---

## 📝 Response Format Değişiklikleri

### Heartbeat Response (Yeni)
```json
{
  "success": true,
  "data": {
    "server_time": "2026-01-29T11:30:00+03:00",
    "playlist_id": 10,
    "sync_required": true,
    "server_version": 2,
    "playlist_version": 1,
    "device_version": 0
  }
}
```

### Playlist Response (Yeni Format)
```json
{
  "success": true,
  "data": {
    "playlist": {
      "id": 10,
      "name": "Playlist Adı",
      "total_duration": 92,
      "version": 1
    },
    "contents": [
      {
        "playlist_content_id": "29",
        "content_id": "46",
        "position": "0",
        "duration_override": "59",
        "name": "İçerik Adı",
        "type": "video",
        "file_url": "videos/dosya.mp4"
      }
    ],
    "sync_version": 2,
    "synced_at": "2026-01-29T11:30:00+03:00"
  }
}
```

---

## 🛠 Kod Değişiklikleri

### ApiService.ts
- Yeni endpoint'ler eklendi
- `convertToPlaylist()` - API yanıtını Playlist tipine dönüştürür
- `getFullUrl()` - Relative URL'leri absolute URL'ye çevirir

### SyncManager.ts
- Heartbeat döngüsü 30 saniyeye ayarlandı
- `sync_required` flag'ine göre senkronizasyon
- `confirmSync()` ile senkronizasyon onayı

### ScheduleManager.ts
- Schedule endpoint'i olmayabilir, bu durumda direkt playlist kullanılır

---

## 📱 Uygulama Akışı

```
App Başlangıç
    │
    ├── Token kontrolü
    │   └── Yok/Geçersiz → Login ekranı
    │
    ├── Token geçerli
    │   ├── GET /api/devices/info (cihaz bilgileri)
    │   ├── PUT /api/devices/info (bilgileri güncelle)
    │   └── GET /api/sync/playlist (playlist al)
    │
    └── Çalışma Döngüsü
        ├── Her 30 sn → POST /api/devices/heartbeat
        │   └── sync_required → Senkronizasyon
        │
        └── Uygulama kapanışı
            └── PUT /api/devices/status (offline)
```

---

## ✅ Test Edilmesi Gerekenler

1. [ ] Cihaz girişi (device-login)
2. [ ] Token doğrulama (verify)
3. [ ] Heartbeat ve sync_required kontrolü
4. [ ] Playlist senkronizasyonu
5. [ ] İçerik indirme
6. [ ] Senkronizasyon onayı

---

**Versiyon:** 1.0.9
**Tarih:** 2026-01-29

