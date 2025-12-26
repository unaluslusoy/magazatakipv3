-- ============================================================================
-- MağazaPano - PostgreSQL Veritabanı Şeması
-- ============================================================================
-- Versiyon: 1.0.0
-- Tarih: 24 Aralık 2024
-- ============================================================================

-- Veritabanı oluştur
CREATE DATABASE magazapano
    WITH ENCODING = 'UTF8'
    LC_COLLATE = 'tr_TR.UTF-8'
    LC_CTYPE = 'tr_TR.UTF-8'
    TEMPLATE = template0;

\c magazapano;

-- ============================================================================
-- ENUM TİPLERİ
-- ============================================================================

-- Kullanıcı rolleri
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'editor', 'viewer');

-- İçerik tipleri
CREATE TYPE content_type AS ENUM ('video', 'image', 'slider', 'ticker', 'announcement');

-- Layout tipleri
CREATE TYPE layout_type AS ENUM ('single', 'split_horizontal', 'split_vertical', 'grid_4', 'pip');

-- Cihaz durumu
CREATE TYPE device_status AS ENUM ('online', 'offline', 'error', 'maintenance');

-- Zamanlama tipi
CREATE TYPE schedule_type AS ENUM ('always', 'date_range', 'daily', 'weekly', 'custom');

-- Kampanya durumu
CREATE TYPE campaign_status AS ENUM ('pending', 'active', 'completed', 'cancelled');

-- Log tipi
CREATE TYPE log_type AS ENUM ('info', 'warning', 'error', 'debug');

-- ============================================================================
-- TABLOLAR
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. KULLANICILAR (users)
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'viewer',
    store_id INTEGER,  -- NULL = tüm mağazalara erişim
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    password_changed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_store ON users(store_id);

-- ----------------------------------------------------------------------------
-- 2. MAĞAZALAR (stores)
-- ----------------------------------------------------------------------------
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    address TEXT,
    city VARCHAR(50),
    region VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(100),
    manager_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    timezone VARCHAR(50) DEFAULT 'Europe/Istanbul',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stores_code ON stores(code);
CREATE INDEX idx_stores_region ON stores(region);
CREATE INDEX idx_stores_active ON stores(is_active);

-- Kullanıcı-Mağaza FK
ALTER TABLE users ADD CONSTRAINT fk_users_store 
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- 3. İÇERİKLER (contents)
-- ----------------------------------------------------------------------------
CREATE TABLE contents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    type content_type NOT NULL,
    
    -- Dosya bilgileri
    file_url VARCHAR(500),
    file_path VARCHAR(500),
    thumbnail_url VARCHAR(500),
    file_size BIGINT,  -- bytes
    mime_type VARCHAR(100),
    checksum VARCHAR(64),  -- MD5/SHA256
    
    -- Video/Görsel metadata
    duration_seconds INTEGER,
    resolution VARCHAR(20),  -- "1920x1080"
    
    -- Slider özel alanları
    slider_settings JSONB,  -- {"transition_type": "fade", "show_indicators": true}
    
    -- Ticker özel alanları
    ticker_text TEXT,
    ticker_settings JSONB,  -- {"speed": "normal", "bg_color": "#000"}
    
    -- Duyuru özel alanları
    announcement_title VARCHAR(200),
    announcement_type VARCHAR(20),  -- info, warning, urgent
    announcement_settings JSONB,
    
    -- Genel alanlar
    tags VARCHAR(255)[],
    status VARCHAR(20) DEFAULT 'active',
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_contents_type ON contents(type);
CREATE INDEX idx_contents_status ON contents(status);
CREATE INDEX idx_contents_active ON contents(is_active);
CREATE INDEX idx_contents_created ON contents(created_at DESC);

-- ----------------------------------------------------------------------------
-- 4. SLIDER SLIDE'LARI (slider_slides)
-- ----------------------------------------------------------------------------
CREATE TABLE slider_slides (
    id SERIAL PRIMARY KEY,
    slider_id INTEGER NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    image_id INTEGER REFERENCES contents(id) ON DELETE SET NULL,
    image_url VARCHAR(500),
    title VARCHAR(200),
    subtitle TEXT,
    duration_seconds INTEGER DEFAULT 5,
    position INTEGER NOT NULL,
    transition_type VARCHAR(20) DEFAULT 'fade',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_slider_slides_slider ON slider_slides(slider_id);
CREATE INDEX idx_slider_slides_position ON slider_slides(slider_id, position);

-- ----------------------------------------------------------------------------
-- 5. PLAYLİSTLER (playlists)
-- ----------------------------------------------------------------------------
CREATE TABLE playlists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    duration_seconds INTEGER DEFAULT 0,  -- Hesaplanan toplam süre
    is_default BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 10,  -- 1-100, yüksek = öncelikli
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_playlists_default ON playlists(is_default);
CREATE INDEX idx_playlists_active ON playlists(is_active);
CREATE INDEX idx_playlists_priority ON playlists(priority DESC);

-- ----------------------------------------------------------------------------
-- 6. PLAYLİST İÇERİKLERİ (playlist_contents)
-- ----------------------------------------------------------------------------
CREATE TABLE playlist_contents (
    id SERIAL PRIMARY KEY,
    playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    content_id INTEGER NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    duration_override INTEGER,  -- NULL = içerik süresi
    transition_type VARCHAR(20) DEFAULT 'fade',
    settings JSONB,  -- Ek ayarlar
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_playlist_contents_playlist ON playlist_contents(playlist_id);
CREATE INDEX idx_playlist_contents_position ON playlist_contents(playlist_id, position);
CREATE UNIQUE INDEX idx_playlist_contents_unique ON playlist_contents(playlist_id, content_id);

-- ----------------------------------------------------------------------------
-- 7. ZAMANLAMALAR (schedules)
-- ----------------------------------------------------------------------------
CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    schedule_type schedule_type NOT NULL DEFAULT 'always',
    
    -- Tarih aralığı
    start_date DATE,
    end_date DATE,
    
    -- Saat aralığı
    start_time TIME,
    end_time TIME,
    
    -- Haftalık (1=Pzt, 7=Paz)
    days_of_week INTEGER[],  -- {1,2,3,4,5}
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_schedules_playlist ON schedules(playlist_id);
CREATE INDEX idx_schedules_type ON schedules(schedule_type);
CREATE INDEX idx_schedules_dates ON schedules(start_date, end_date);

-- ----------------------------------------------------------------------------
-- 8. KAMPANYALAR (campaigns)
-- ----------------------------------------------------------------------------
CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    playlist_id INTEGER REFERENCES playlists(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    priority INTEGER DEFAULT 60,
    status campaign_status DEFAULT 'pending',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);

-- ----------------------------------------------------------------------------
-- 9. KAMPANYA-MAĞAZA İLİŞKİSİ (campaign_stores)
-- ----------------------------------------------------------------------------
CREATE TABLE campaign_stores (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(campaign_id, store_id)
);

CREATE INDEX idx_campaign_stores_campaign ON campaign_stores(campaign_id);
CREATE INDEX idx_campaign_stores_store ON campaign_stores(store_id);

-- ----------------------------------------------------------------------------
-- 10. CİHAZLAR (devices)
-- ----------------------------------------------------------------------------
CREATE TABLE devices (
    id SERIAL PRIMARY KEY,
    device_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
    
    -- Durum
    status device_status DEFAULT 'offline',
    last_heartbeat TIMESTAMP,
    
    -- Mevcut playlist
    current_playlist_id INTEGER REFERENCES playlists(id) ON DELETE SET NULL,
    
    -- Cihaz bilgileri
    ip_address VARCHAR(45),
    mac_address VARCHAR(17),
    app_version VARCHAR(20),
    os_version VARCHAR(50),
    screen_resolution VARCHAR(20),
    free_storage_mb INTEGER,
    
    -- Ayarlar
    layout_type layout_type DEFAULT 'single',
    orientation VARCHAR(20) DEFAULT 'landscape',
    volume_level INTEGER DEFAULT 50,
    brightness_level INTEGER DEFAULT 100,
    
    -- Token
    device_token VARCHAR(500),
    activation_code VARCHAR(10),
    activated_at TIMESTAMP,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_devices_code ON devices(device_code);
CREATE INDEX idx_devices_store ON devices(store_id);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_devices_active ON devices(is_active);

-- ----------------------------------------------------------------------------
-- 11. CİHAZ-PLAYLİST İLİŞKİSİ (device_playlists)
-- ----------------------------------------------------------------------------
CREATE TABLE device_playlists (
    id SERIAL PRIMARY KEY,
    device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    assigned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(device_id, playlist_id)
);

CREATE INDEX idx_device_playlists_device ON device_playlists(device_id);

-- ----------------------------------------------------------------------------
-- 12. OYNATMA LOGLARI (play_logs)
-- ----------------------------------------------------------------------------
CREATE TABLE play_logs (
    id BIGSERIAL PRIMARY KEY,
    device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    content_id INTEGER NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    playlist_id INTEGER REFERENCES playlists(id) ON DELETE SET NULL,
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    duration_seconds INTEGER,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Aylık partitionlar
CREATE TABLE play_logs_2024_12 PARTITION OF play_logs
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');
CREATE TABLE play_logs_2025_01 PARTITION OF play_logs
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE play_logs_2025_02 PARTITION OF play_logs
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE play_logs_2025_03 PARTITION OF play_logs
    FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

CREATE INDEX idx_play_logs_device ON play_logs(device_id);
CREATE INDEX idx_play_logs_content ON play_logs(content_id);
CREATE INDEX idx_play_logs_date ON play_logs(created_at DESC);

-- ----------------------------------------------------------------------------
-- 13. SİSTEM LOGLARI (system_logs)
-- ----------------------------------------------------------------------------
CREATE TABLE system_logs (
    id BIGSERIAL PRIMARY KEY,
    log_type log_type DEFAULT 'info',
    source VARCHAR(50),  -- 'api', 'device', 'scheduler'
    message TEXT NOT NULL,
    details JSONB,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    device_id INTEGER REFERENCES devices(id) ON DELETE SET NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_system_logs_type ON system_logs(log_type);
CREATE INDEX idx_system_logs_source ON system_logs(source);
CREATE INDEX idx_system_logs_date ON system_logs(created_at DESC);

-- ----------------------------------------------------------------------------
-- 14. CİHAZ LOGLARI (device_logs)
-- ----------------------------------------------------------------------------
CREATE TABLE device_logs (
    id BIGSERIAL PRIMARY KEY,
    device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    log_type log_type DEFAULT 'info',
    message TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_device_logs_device ON device_logs(device_id);
CREATE INDEX idx_device_logs_date ON device_logs(created_at DESC);

-- ----------------------------------------------------------------------------
-- 15. AYARLAR (settings)
-- ----------------------------------------------------------------------------
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    value_type VARCHAR(20) DEFAULT 'string',  -- string, integer, boolean, json
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    updated_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_settings_key ON settings(key);

-- ============================================================================
-- FONKSİYONLAR
-- ============================================================================

-- updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'ları oluştur
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contents_updated_at BEFORE UPDATE ON contents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Playlist süre hesaplama
CREATE OR REPLACE FUNCTION calculate_playlist_duration()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE playlists 
    SET duration_seconds = (
        SELECT COALESCE(SUM(
            COALESCE(pc.duration_override, c.duration_seconds, 10)
        ), 0)
        FROM playlist_contents pc
        JOIN contents c ON c.id = pc.content_id
        WHERE pc.playlist_id = NEW.playlist_id
    )
    WHERE id = NEW.playlist_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_playlist_duration_insert 
    AFTER INSERT ON playlist_contents 
    FOR EACH ROW EXECUTE FUNCTION calculate_playlist_duration();
    
CREATE TRIGGER update_playlist_duration_update 
    AFTER UPDATE ON playlist_contents 
    FOR EACH ROW EXECUTE FUNCTION calculate_playlist_duration();
    
CREATE TRIGGER update_playlist_duration_delete 
    AFTER DELETE ON playlist_contents 
    FOR EACH ROW EXECUTE FUNCTION calculate_playlist_duration();

-- ============================================================================
-- GÖRÜNÜMLER (VIEWS)
-- ============================================================================

-- Cihaz özet görünümü
CREATE VIEW v_device_summary AS
SELECT 
    d.id,
    d.device_code,
    d.name,
    d.status,
    d.last_heartbeat,
    s.id AS store_id,
    s.name AS store_name,
    s.region,
    p.id AS playlist_id,
    p.name AS playlist_name,
    d.app_version,
    d.screen_resolution
FROM devices d
LEFT JOIN stores s ON s.id = d.store_id
LEFT JOIN playlists p ON p.id = d.current_playlist_id
WHERE d.is_active = true;

-- İçerik istatistik görünümü
CREATE VIEW v_content_stats AS
SELECT 
    c.id,
    c.name,
    c.type,
    c.duration_seconds,
    c.status,
    c.created_at,
    COUNT(DISTINCT pc.playlist_id) AS playlist_count,
    COUNT(DISTINCT pl.id) AS play_count,
    COALESCE(SUM(pl.duration_seconds), 0) AS total_play_seconds
FROM contents c
LEFT JOIN playlist_contents pc ON pc.content_id = c.id
LEFT JOIN play_logs pl ON pl.content_id = c.id
GROUP BY c.id;

-- ============================================================================
-- BİTİŞ
-- ============================================================================

COMMENT ON DATABASE magazapano IS 'MağazaPano - Dijital Tabela Yönetim Sistemi';
