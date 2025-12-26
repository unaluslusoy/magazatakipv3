# 🗄️ MağazaPano - Veritabanı Şema Tasarımı

**Versiyon:** 1.0.0  
**Tarih:** 24 Aralık 2024  
**Veritabanı:** PostgreSQL 16

---

## 1. Tablo Özeti

### 1.1 Core Tablolar (8 adet)

| # | Tablo | Açıklama | İlişkiler |
|---|-------|----------|-----------|
| 1 | `users` | Sistem kullanıcıları | sessions |
| 2 | `user_sessions` | Oturum yönetimi | users |
| 3 | `stores` | Mağaza bilgileri | devices, groups |
| 4 | `store_groups` | Mağaza grupları | stores |
| 5 | `devices` | TV/Tablet cihazları | stores, logs |
| 6 | `contents` | Medya içerikleri | playlists |
| 7 | `playlists` | Oynatma listeleri | items, schedules |
| 8 | `schedules` | Zamanlama kuralları | playlists |
| 9 | `settings` | Sistem ayarları | - |

### 1.2 İlişki Tabloları (2 adet)

| Tablo | Açıklama | İlişki Tipi |
|-------|----------|-------------|
| `store_group_members` | Mağaza-Grup ilişkisi | M:N |
| `playlist_items` | Playlist içerikleri | 1:N |

### 1.3 Log Tabloları (4 adet)

| Tablo | Açıklama | Saklama Süresi |
|-------|----------|----------------|
| `device_heartbeats` | Cihaz sağlık bildirimleri | 7 gün |
| `device_logs` | Cihaz logları | 90 gün |
| `sync_logs` | Senkronizasyon kayıtları | 30 gün |
| `audit_logs` | Denetim kayıtları | 365 gün |

---

## 2. ENUM Tipleri

```sql
-- Kullanıcı rolleri
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'editor', 'viewer');

-- Cihaz durumları
CREATE TYPE device_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- Cihaz yönelimi
CREATE TYPE device_orientation AS ENUM ('portrait', 'landscape');

-- İçerik tipleri
CREATE TYPE content_type AS ENUM ('video', 'image', 'slider', 'ticker', 'announcement');

-- Slider geçiş efektleri
CREATE TYPE slider_transition AS ENUM ('fade', 'slide', 'zoom', 'flip');

-- Ticker hızları
CREATE TYPE ticker_speed AS ENUM ('slow', 'normal', 'fast');

-- Duyuru tipleri
CREATE TYPE announcement_type AS ENUM ('info', 'warning', 'urgent');

-- Layout tipleri
CREATE TYPE layout_type AS ENUM ('single', 'split_horizontal', 'split_vertical', 'grid_4', 'pip');

-- Zamanlama hedef tipleri
CREATE TYPE schedule_target AS ENUM ('store', 'store_group', 'device');

-- Zamanlama tekrar tipleri
CREATE TYPE repeat_type AS ENUM ('once', 'daily', 'weekly', 'monthly');

-- Log seviyeleri
CREATE TYPE log_level AS ENUM ('debug', 'info', 'warning', 'error', 'critical');

-- Sync tipleri
CREATE TYPE sync_type AS ENUM ('full', 'partial', 'content_only', 'config_only');

-- Sync durumları
CREATE TYPE sync_status AS ENUM ('started', 'in_progress', 'completed', 'failed');

-- Ayar değer tipleri
CREATE TYPE setting_value_type AS ENUM ('string', 'number', 'boolean', 'json');
```

---

## 3. Tablo Detayları

### 3.1 users (Kullanıcılar)

| Kolon | Tip | Null | Varsayılan | Açıklama |
|-------|-----|------|------------|----------|
| id | UUID | ❌ | uuid_generate_v4() | Primary key |
| username | VARCHAR(50) | ❌ | - | Kullanıcı adı (unique) |
| email | VARCHAR(255) | ❌ | - | Email (unique) |
| password_hash | VARCHAR(255) | ❌ | - | Şifre hash'i |
| full_name | VARCHAR(100) | ✅ | - | Ad soyad |
| role | user_role | ❌ | 'viewer' | Rol |
| avatar_url | VARCHAR(500) | ✅ | - | Profil fotoğrafı |
| phone | VARCHAR(20) | ✅ | - | Telefon |
| is_active | BOOLEAN | ❌ | true | Aktif mi? |
| is_email_verified | BOOLEAN | ❌ | false | Email doğrulandı mı? |
| last_login_at | TIMESTAMPTZ | ✅ | - | Son giriş |
| last_login_ip | VARCHAR(45) | ✅ | - | Son giriş IP'si |
| failed_login_attempts | INT | ❌ | 0 | Başarısız giriş sayısı |
| locked_until | TIMESTAMPTZ | ✅ | - | Kilitlenme süresi |
| password_reset_token | VARCHAR(255) | ✅ | - | Şifre sıfırlama token'ı |
| password_reset_expires | TIMESTAMPTZ | ✅ | - | Token geçerlilik süresi |
| created_at | TIMESTAMPTZ | ❌ | NOW() | Oluşturma tarihi |
| updated_at | TIMESTAMPTZ | ❌ | NOW() | Güncelleme tarihi |
| deleted_at | TIMESTAMPTZ | ✅ | - | Soft delete |

**Indexler:**
- `idx_users_email` ON (email) WHERE deleted_at IS NULL
- `idx_users_username` ON (username) WHERE deleted_at IS NULL
- `idx_users_role` ON (role) WHERE deleted_at IS NULL

---

### 3.2 stores (Mağazalar)

| Kolon | Tip | Null | Varsayılan | Açıklama |
|-------|-----|------|------------|----------|
| id | UUID | ❌ | uuid_generate_v4() | Primary key |
| code | VARCHAR(20) | ❌ | - | Mağaza kodu (unique) |
| name | VARCHAR(100) | ❌ | - | Mağaza adı |
| address | TEXT | ✅ | - | Adres |
| city | VARCHAR(50) | ✅ | - | Şehir |
| district | VARCHAR(50) | ✅ | - | İlçe |
| postal_code | VARCHAR(10) | ✅ | - | Posta kodu |
| country | VARCHAR(50) | ❌ | 'Türkiye' | Ülke |
| phone | VARCHAR(20) | ✅ | - | Telefon |
| email | VARCHAR(255) | ✅ | - | Email |
| manager_name | VARCHAR(100) | ✅ | - | Mağaza müdürü |
| manager_phone | VARCHAR(20) | ✅ | - | Müdür telefon |
| latitude | DECIMAL(10,8) | ✅ | - | Enlem |
| longitude | DECIMAL(11,8) | ✅ | - | Boylam |
| timezone | VARCHAR(50) | ❌ | 'Europe/Istanbul' | Zaman dilimi |
| working_hours | JSONB | ❌ | {"start":"09:00","end":"22:00"} | Çalışma saatleri |
| is_active | BOOLEAN | ❌ | true | Aktif mi? |
| notes | TEXT | ✅ | - | Notlar |
| created_by | UUID | ✅ | - | Oluşturan (FK: users) |
| created_at | TIMESTAMPTZ | ❌ | NOW() | Oluşturma tarihi |
| updated_at | TIMESTAMPTZ | ❌ | NOW() | Güncelleme tarihi |
| deleted_at | TIMESTAMPTZ | ✅ | - | Soft delete |

**Indexler:**
- `idx_stores_code` ON (code) WHERE deleted_at IS NULL
- `idx_stores_city` ON (city) WHERE deleted_at IS NULL
- `idx_stores_name` USING gin(name gin_trgm_ops) WHERE deleted_at IS NULL

---

### 3.3 devices (Cihazlar)

| Kolon | Tip | Null | Varsayılan | Açıklama |
|-------|-----|------|------------|----------|
| id | UUID | ❌ | uuid_generate_v4() | Primary key |
| hardware_id | VARCHAR(100) | ❌ | - | Donanım ID (unique) |
| name | VARCHAR(100) | ✅ | - | Cihaz adı |
| store_id | UUID | ✅ | - | Mağaza (FK: stores) |
| device_model | VARCHAR(100) | ✅ | - | Model |
| device_brand | VARCHAR(50) | ✅ | - | Marka |
| os_version | VARCHAR(50) | ✅ | - | OS versiyonu |
| app_version | VARCHAR(20) | ✅ | - | Uygulama versiyonu |
| screen_width | INT | ✅ | - | Ekran genişliği |
| screen_height | INT | ✅ | - | Ekran yüksekliği |
| screen_density | DECIMAL(4,2) | ✅ | - | Ekran yoğunluğu |
| ip_address | VARCHAR(45) | ✅ | - | IP adresi |
| mac_address | VARCHAR(17) | ✅ | - | MAC adresi |
| wifi_ssid | VARCHAR(100) | ✅ | - | WiFi ağı |
| status | device_status | ❌ | 'pending' | Durum |
| is_online | BOOLEAN | ❌ | false | Çevrimiçi mi? |
| last_seen_at | TIMESTAMPTZ | ✅ | - | Son görülme |
| last_sync_at | TIMESTAMPTZ | ✅ | - | Son sync |
| last_ping_at | TIMESTAMPTZ | ✅ | - | Son ping |
| last_ping_ms | INT | ✅ | - | Ping süresi (ms) |
| orientation | device_orientation | ❌ | 'portrait' | Yön |
| volume_level | INT | ❌ | 50 | Ses seviyesi (0-100) |
| brightness_level | INT | ❌ | 80 | Parlaklık (0-100) |
| auto_brightness | BOOLEAN | ❌ | false | Otomatik parlaklık |
| debug_mode | BOOLEAN | ❌ | false | Debug modu |
| approved_by | UUID | ✅ | - | Onaylayan (FK: users) |
| approved_at | TIMESTAMPTZ | ✅ | - | Onay tarihi |
| rejection_reason | TEXT | ✅ | - | Red nedeni |
| notes | TEXT | ✅ | - | Notlar |
| tags | VARCHAR(50)[] | ✅ | - | Etiketler |
| created_at | TIMESTAMPTZ | ❌ | NOW() | Oluşturma tarihi |
| updated_at | TIMESTAMPTZ | ❌ | NOW() | Güncelleme tarihi |
| deleted_at | TIMESTAMPTZ | ✅ | - | Soft delete |

**Indexler:**
- `idx_devices_hardware` ON (hardware_id) WHERE deleted_at IS NULL
- `idx_devices_store` ON (store_id) WHERE deleted_at IS NULL
- `idx_devices_status` ON (status) WHERE deleted_at IS NULL
- `idx_devices_online` ON (is_online) WHERE deleted_at IS NULL AND status = 'approved'

---

### 3.4 contents (İçerikler)

| Kolon | Tip | Null | Varsayılan | Açıklama |
|-------|-----|------|------------|----------|
| id | UUID | ❌ | uuid_generate_v4() | Primary key |
| name | VARCHAR(200) | ❌ | - | İçerik adı |
| type | content_type | ❌ | - | Tip |
| description | TEXT | ✅ | - | Açıklama |
| file_path | VARCHAR(500) | ✅ | - | Dosya yolu |
| file_name | VARCHAR(255) | ✅ | - | Dosya adı |
| file_size | BIGINT | ✅ | - | Dosya boyutu (byte) |
| mime_type | VARCHAR(100) | ✅ | - | MIME tipi |
| checksum | VARCHAR(64) | ✅ | - | MD5 hash |
| file_url | VARCHAR(500) | ✅ | - | Dosya URL'i |
| thumbnail_url | VARCHAR(500) | ✅ | - | Thumbnail URL |
| duration_seconds | INT | ✅ | - | Süre (video) |
| width | INT | ✅ | - | Genişlik |
| height | INT | ✅ | - | Yükseklik |
| bitrate | INT | ✅ | - | Bitrate (video) |
| fps | DECIMAL(5,2) | ✅ | - | FPS (video) |
| slider_items | JSONB | ❌ | '[]' | Slider öğeleri |
| slider_interval | INT | ❌ | 5 | Slide süresi (1-60) |
| slider_transition | slider_transition | ❌ | 'fade' | Geçiş efekti |
| slider_show_indicators | BOOLEAN | ❌ | true | Göstergeler |
| ticker_text | TEXT | ✅ | - | Ticker metni |
| ticker_speed | ticker_speed | ❌ | 'normal' | Ticker hızı |
| ticker_bg_color | VARCHAR(7) | ❌ | '#1E293B' | Arkaplan rengi |
| ticker_text_color | VARCHAR(7) | ❌ | '#FFFFFF' | Yazı rengi |
| ticker_font_size | INT | ❌ | 24 | Font boyutu |
| announcement_title | VARCHAR(200) | ✅ | - | Duyuru başlığı |
| announcement_body | TEXT | ✅ | - | Duyuru içeriği |
| announcement_type | announcement_type | ❌ | 'info' | Duyuru tipi |
| announcement_icon | VARCHAR(50) | ✅ | - | İkon |
| announcement_duration | INT | ❌ | 10 | Süre |
| is_active | BOOLEAN | ❌ | true | Aktif mi? |
| is_processing | BOOLEAN | ❌ | false | İşleniyor mu? |
| processing_error | TEXT | ✅ | - | İşleme hatası |
| version | INT | ❌ | 1 | Versiyon |
| tags | VARCHAR(50)[] | ✅ | - | Etiketler |
| created_by | UUID | ✅ | - | Oluşturan |
| created_at | TIMESTAMPTZ | ❌ | NOW() | Oluşturma tarihi |
| updated_at | TIMESTAMPTZ | ❌ | NOW() | Güncelleme tarihi |
| deleted_at | TIMESTAMPTZ | ✅ | - | Soft delete |

**Indexler:**
- `idx_contents_type` ON (type) WHERE deleted_at IS NULL
- `idx_contents_active` ON (is_active) WHERE deleted_at IS NULL
- `idx_contents_name` USING gin(name gin_trgm_ops) WHERE deleted_at IS NULL
- `idx_contents_tags` USING gin(tags) WHERE deleted_at IS NULL

---

### 3.5 playlists (Oynatma Listeleri)

| Kolon | Tip | Null | Varsayılan | Açıklama |
|-------|-----|------|------------|----------|
| id | UUID | ❌ | uuid_generate_v4() | Primary key |
| name | VARCHAR(100) | ❌ | - | Playlist adı |
| description | TEXT | ✅ | - | Açıklama |
| layout_type | layout_type | ❌ | 'single' | Layout tipi |
| layout_config | JSONB | ❌ | '{}' | Layout ayarları |
| loop_enabled | BOOLEAN | ❌ | true | Döngü |
| shuffle_enabled | BOOLEAN | ❌ | false | Karıştır |
| total_duration | INT | ❌ | 0 | Toplam süre (hesaplanır) |
| item_count | INT | ❌ | 0 | Öğe sayısı (hesaplanır) |
| is_active | BOOLEAN | ❌ | true | Aktif mi? |
| version | INT | ❌ | 1 | Versiyon |
| tags | VARCHAR(50)[] | ✅ | - | Etiketler |
| created_by | UUID | ✅ | - | Oluşturan |
| created_at | TIMESTAMPTZ | ❌ | NOW() | Oluşturma tarihi |
| updated_at | TIMESTAMPTZ | ❌ | NOW() | Güncelleme tarihi |
| deleted_at | TIMESTAMPTZ | ✅ | - | Soft delete |

---

### 3.6 schedules (Zamanlamalar)

| Kolon | Tip | Null | Varsayılan | Açıklama |
|-------|-----|------|------------|----------|
| id | UUID | ❌ | uuid_generate_v4() | Primary key |
| name | VARCHAR(100) | ❌ | - | Zamanlama adı |
| description | TEXT | ✅ | - | Açıklama |
| target_type | schedule_target | ❌ | - | Hedef tipi |
| target_id | UUID | ❌ | - | Hedef ID |
| playlist_id | UUID | ❌ | - | Playlist (FK) |
| start_date | DATE | ❌ | - | Başlangıç tarihi |
| end_date | DATE | ✅ | - | Bitiş tarihi |
| start_time | TIME | ❌ | - | Başlangıç saati |
| end_time | TIME | ❌ | - | Bitiş saati |
| repeat_type | repeat_type | ❌ | 'daily' | Tekrar tipi |
| repeat_days | INT[] | ❌ | [0,1,2,3,4,5,6] | Günler (0=Pazar) |
| repeat_months | INT[] | ✅ | - | Aylar |
| repeat_dates | INT[] | ✅ | - | Ay günleri |
| priority | INT | ❌ | 0 | Öncelik (0-100) |
| is_active | BOOLEAN | ❌ | true | Aktif mi? |
| created_by | UUID | ✅ | - | Oluşturan |
| created_at | TIMESTAMPTZ | ❌ | NOW() | Oluşturma tarihi |
| updated_at | TIMESTAMPTZ | ❌ | NOW() | Güncelleme tarihi |
| deleted_at | TIMESTAMPTZ | ✅ | - | Soft delete |

---

## 4. Entity Relationship Diyagramı

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ER DİYAGRAMI                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────┐         ┌──────────────────┐         ┌──────────┐            │
│  │  users   │         │  store_groups    │         │  stores  │            │
│  ├──────────┤         ├──────────────────┤         ├──────────┤            │
│  │ id (PK)  │◄───┐    │ id (PK)          │    ┌───►│ id (PK)  │            │
│  │ username │    │    │ name             │    │    │ code     │            │
│  │ email    │    │    │ color            │    │    │ name     │            │
│  │ role     │    │    └────────┬─────────┘    │    │ city     │            │
│  └──────────┘    │             │              │    └────┬─────┘            │
│       │          │             │              │         │                   │
│       │          │    ┌────────▼─────────┐    │         │                   │
│       │          │    │store_group_members│   │         │                   │
│       │          │    ├──────────────────┤    │         │                   │
│       │          │    │ store_id (FK)────┼────┘         │                   │
│       │          │    │ group_id (FK)    │              │                   │
│       │          │    └──────────────────┘              │                   │
│       │          │                                      │                   │
│       │          └──────────────────┐                   │                   │
│       │                             │                   │                   │
│       │    ┌───────────────────┐    │    ┌──────────────▼──────────┐       │
│       │    │     contents      │    │    │        devices          │       │
│       │    ├───────────────────┤    │    ├─────────────────────────┤       │
│       │    │ id (PK)           │    │    │ id (PK)                 │       │
│       │    │ name              │    │    │ hardware_id             │       │
│       │    │ type              │    │    │ store_id (FK)           │       │
│       │    │ file_path         │    │    │ status                  │       │
│       │    │ created_by (FK)───┼────┤    │ approved_by (FK)────────┼───┐   │
│       │    └────────┬──────────┘    │    └─────────────────────────┘   │   │
│       │             │               │              │                   │   │
│       │             │               │              ▼                   │   │
│       │             │               │    ┌─────────────────────────┐   │   │
│       │             │               │    │    device_heartbeats    │   │   │
│       │             │               │    ├─────────────────────────┤   │   │
│       │             │               │    │ device_id (FK)          │   │   │
│       │             │               │    │ cpu_usage               │   │   │
│       │             │               │    └─────────────────────────┘   │   │
│       │             │               │                                  │   │
│       │    ┌────────▼──────────┐    │    ┌─────────────────────────┐   │   │
│       │    │  playlist_items   │    │    │      device_logs        │   │   │
│       │    ├───────────────────┤    │    ├─────────────────────────┤   │   │
│       │    │ playlist_id (FK)──┼──┐ │    │ device_id (FK)          │   │   │
│       │    │ content_id (FK)   │  │ │    │ level                   │   │   │
│       │    │ position          │  │ │    └─────────────────────────┘   │   │
│       │    │ zone              │  │ │                                  │   │
│       │    └───────────────────┘  │ │    ┌─────────────────────────┐   │   │
│       │                           │ │    │       sync_logs         │   │   │
│       │    ┌──────────────────────▼─┼────┤─────────────────────────┤   │   │
│       │    │      playlists        ││    │ device_id (FK)          │   │   │
│       │    ├───────────────────────┤│    │ status                  │   │   │
│       │    │ id (PK)               ││    └─────────────────────────┘   │   │
│       │    │ name                  ││                                  │   │
│       │    │ layout_type           ││    ┌─────────────────────────┐   │   │
│       │    │ created_by (FK)───────┼┤    │      audit_logs         │   │   │
│       │    └───────────┬───────────┘│    ├─────────────────────────┤   │   │
│       │                │            │    │ user_id (FK)────────────┼───┘   │
│       │                │            │    │ action                  │       │
│       │                ▼            │    │ entity_type             │       │
│       │    ┌───────────────────────┐│    └─────────────────────────┘       │
│       │    │      schedules        ││                                      │
│       │    ├───────────────────────┤│    ┌─────────────────────────┐       │
│       │    │ id (PK)               ││    │       settings          │       │
│       │    │ playlist_id (FK)──────┘│    ├─────────────────────────┤       │
│       │    │ target_type           │     │ id (PK)                 │       │
│       │    │ target_id             │     │ category                │       │
│       │    │ created_by (FK)───────┤     │ key                     │       │
│       │    └───────────────────────┘     │ value                   │       │
│       │                                  └─────────────────────────┘       │
│       │                                                                     │
│       └─────────────────────────────────────────────────────────────────────│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Views (Hazır Sorgular)

### 5.1 v_dashboard_stats

Dashboard istatistikleri için hazır view.

```sql
SELECT * FROM v_dashboard_stats;
-- total_stores, approved_devices, online_devices, total_contents, etc.
```

### 5.2 v_device_details

Cihaz + mağaza bilgilerini birleştirir.

```sql
SELECT * FROM v_device_details WHERE is_online = true;
```

### 5.3 v_store_details

Mağaza + cihaz sayıları + grup isimleri.

```sql
SELECT * FROM v_store_details WHERE city = 'İstanbul';
```

### 5.4 v_active_schedules

Aktif zamanlamalar + playlist bilgileri.

```sql
SELECT * FROM v_active_schedules ORDER BY priority DESC;
```

---

## 6. Fonksiyonlar

### 6.1 get_device_active_playlist(device_id)

Cihaz için şu an aktif olan playlist'i döndürür.

### 6.2 create_audit_log(...)

Audit log kaydı oluşturur.

### 6.3 cleanup_old_logs(...)

Eski log kayıtlarını temizler.

---

## 7. Index Stratejisi

| Kategori | Index Tipi | Örnek |
|----------|------------|-------|
| Primary Key | B-tree | Tüm `id` kolonları |
| Foreign Key | B-tree | `store_id`, `device_id` |
| Durum Filtresi | Partial | `WHERE is_active = true` |
| Text Arama | GIN + Trigram | `name gin_trgm_ops` |
| Array Arama | GIN | `tags` kolonları |
| Tarih Aralığı | B-tree | `created_at`, `start_date` |

---

## 8. Veri Saklama Politikası

| Tablo | Saklama Süresi | Temizleme |
|-------|----------------|-----------|
| device_heartbeats | 7 gün | cleanup_old_logs() |
| device_logs | 90 gün | cleanup_old_logs() |
| sync_logs | 30 gün | cleanup_old_logs() |
| audit_logs | 365 gün | cleanup_old_logs() |

---

*Son Güncelleme: 24 Aralık 2024*
