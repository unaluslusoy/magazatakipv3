-- ============================================================================
-- MağazaPano - Başlangıç Verileri (Seed Data)
-- ============================================================================
-- Versiyon: 1.0.0
-- Tarih: 24 Aralık 2024
-- ============================================================================

\c magazapano;

-- ============================================================================
-- 1. AYARLAR
-- ============================================================================

INSERT INTO settings (key, value, value_type, description, is_system) VALUES
-- Genel ayarlar
('app_name', 'MağazaPano', 'string', 'Uygulama adı', true),
('app_version', '1.0.0', 'string', 'Uygulama versiyonu', true),
('default_language', 'tr', 'string', 'Varsayılan dil', true),
('timezone', 'Europe/Istanbul', 'string', 'Varsayılan zaman dilimi', true),

-- Dosya yükleme ayarları
('max_video_size_mb', '500', 'integer', 'Maksimum video boyutu (MB)', true),
('max_image_size_mb', '10', 'integer', 'Maksimum görsel boyutu (MB)', true),
('allowed_video_formats', '["mp4","webm","mov"]', 'json', 'İzin verilen video formatları', true),
('allowed_image_formats', '["jpg","jpeg","png","gif","webp"]', 'json', 'İzin verilen görsel formatları', true),

-- Cihaz ayarları
('device_heartbeat_interval', '30', 'integer', 'Cihaz heartbeat aralığı (saniye)', true),
('device_offline_threshold', '120', 'integer', 'Çevrimdışı kabul süresi (saniye)', true),
('default_playlist_duration', '10', 'integer', 'Varsayılan görsel süresi (saniye)', true),

-- Senkronizasyon ayarları
('sync_batch_size', '5', 'integer', 'Senkron batch boyutu', true),
('sync_retry_count', '3', 'integer', 'Senkron yeniden deneme sayısı', true),

-- API ayarları
('jwt_expiry_hours', '24', 'integer', 'JWT token süresi (saat)', true),
('api_rate_limit', '100', 'integer', 'API rate limit (istek/dakika)', true);

-- ============================================================================
-- 2. KULLANICILAR
-- ============================================================================

-- Şifre: Admin123! (bcrypt hash)
INSERT INTO users (email, password_hash, name, role, is_active) VALUES
('superadmin@magazapano.com', '$2b$10$6rZW.Z8M7V0KWZX3gXZvQuXKXqXkXqXkXqXkXqXkXqXkXqXkXqXkXq', 'Süper Admin', 'super_admin', true),
('admin@magazapano.com', '$2b$10$6rZW.Z8M7V0KWZX3gXZvQuXKXqXkXqXkXqXkXqXkXqXkXqXkXqXkXq', 'Admin Kullanıcı', 'admin', true),
('editor@magazapano.com', '$2b$10$6rZW.Z8M7V0KWZX3gXZvQuXKXqXkXqXkXqXkXqXkXqXkXqXkXqXkXq', 'Editör Kullanıcı', 'editor', true),
('viewer@magazapano.com', '$2b$10$6rZW.Z8M7V0KWZX3gXZvQuXKXqXkXqXkXqXkXqXkXqXkXqXkXqXkXq', 'İzleyici Kullanıcı', 'viewer', true);

-- ============================================================================
-- 3. MAĞAZALAR
-- ============================================================================

INSERT INTO stores (name, code, address, city, region, phone, email, manager_name, is_active) VALUES
-- İstanbul
('Kadıköy Mağazası', 'IST-KDK-001', 'Caferağa Mah. Moda Cad. No:15', 'İstanbul', 'Marmara', '0216 123 4567', 'kadikoy@magazapano.com', 'Ahmet Yılmaz', true),
('Beşiktaş Mağazası', 'IST-BSK-001', 'Akaretler Mah. Süleyman Seba Cad. No:22', 'İstanbul', 'Marmara', '0212 234 5678', 'besiktas@magazapano.com', 'Mehmet Demir', true),
('Şişli Mağazası', 'IST-SSL-001', 'Mecidiyeköy Mah. Büyükdere Cad. No:45', 'İstanbul', 'Marmara', '0212 345 6789', 'sisli@magazapano.com', 'Fatma Kaya', true),
('Bakırköy Mağazası', 'IST-BKK-001', 'Ataköy 7-8-9-10. Kısım Mah. E-5 Yan Yol', 'İstanbul', 'Marmara', '0212 456 7890', 'bakirkoy@magazapano.com', 'Ali Öztürk', true),
('Ataşehir Mağazası', 'IST-ATS-001', 'Barbaros Mah. Palladium AVM', 'İstanbul', 'Marmara', '0216 567 8901', 'atasehir@magazapano.com', 'Zeynep Arslan', true),
('Maltepe Mağazası', 'IST-MLT-001', 'Altayçeşme Mah. Maltepe Park AVM', 'İstanbul', 'Marmara', '0216 678 9012', 'maltepe@magazapano.com', 'Hasan Çelik', true),

-- Ankara
('Kızılay Mağazası', 'ANK-KZL-001', 'Kızılay Mah. Atatürk Bulvarı No:78', 'Ankara', 'İç Anadolu', '0312 123 4567', 'kizilay@magazapano.com', 'Mustafa Yıldız', true),
('Çankaya Mağazası', 'ANK-CNK-001', 'Gaziosmanpaşa Mah. Tunus Cad. No:12', 'Ankara', 'İç Anadolu', '0312 234 5678', 'cankaya@magazapano.com', 'Ayşe Koç', true),

-- İzmir
('Alsancak Mağazası', 'IZM-ALS-001', 'Alsancak Mah. Kıbrıs Şehitleri Cad. No:56', 'İzmir', 'Ege', '0232 123 4567', 'alsancak@magazapano.com', 'Osman Şahin', true),
('Karşıyaka Mağazası', 'IZM-KRS-001', 'Bostanlı Mah. Cemal Gürsel Cad. No:34', 'İzmir', 'Ege', '0232 234 5678', 'karsiyaka@magazapano.com', 'Elif Aydın', true),

-- Antalya
('Lara Mağazası', 'ANT-LAR-001', 'Lara Mah. Akdeniz Bulvarı No:89', 'Antalya', 'Akdeniz', '0242 123 4567', 'lara@magazapano.com', 'Burak Özdemir', true),
('Konyaaltı Mağazası', 'ANT-KNY-001', '5M Migros AVM', 'Antalya', 'Akdeniz', '0242 234 5678', 'konyaalti@magazapano.com', 'Selin Yılmaz', true);

-- ============================================================================
-- 4. PLAYLİSTLER
-- ============================================================================

INSERT INTO playlists (name, description, is_default, priority, is_active, created_by) VALUES
('Varsayılan Playlist', 'Tüm mağazalar için varsayılan içerik listesi', true, 10, true, 1),
('Yılbaşı Kampanyası', '15 Aralık - 2 Ocak arası yılbaşı özel içerikler', false, 60, true, 1),
('Hafta Sonu Özel', 'Cumartesi-Pazar özel promosyonlar', false, 40, true, 1),
('VIP Mağazalar', 'Premium mağazalar için özel içerikler', false, 50, true, 1),
('Outlet İndirimleri', 'Outlet mağazalar için indirim kampanyaları', false, 45, true, 1);

-- ============================================================================
-- 5. ZAMANLAMALAR
-- ============================================================================

INSERT INTO schedules (playlist_id, schedule_type, start_date, end_date, start_time, end_time, days_of_week, is_active) VALUES
-- Varsayılan - Her zaman
(1, 'always', NULL, NULL, NULL, NULL, NULL, true),

-- Yılbaşı Kampanyası - Tarih aralığı
(2, 'date_range', '2024-12-15', '2025-01-02', '09:00', '21:00', NULL, true),

-- Hafta Sonu Özel - Haftalık
(3, 'weekly', NULL, NULL, '10:00', '20:00', '{6,7}', true),

-- VIP Mağazalar - Günlük saat aralığı
(4, 'daily', NULL, NULL, '14:00', '18:00', NULL, true);

-- ============================================================================
-- 6. KAMPANYALAR
-- ============================================================================

INSERT INTO campaigns (name, description, playlist_id, start_date, end_date, priority, status, created_by) VALUES
('Yılbaşı 2024', 'Yılbaşı özel indirim kampanyası', 2, '2024-12-15', '2025-01-02', 60, 'active', 1),
('Black Friday', 'Black Friday indirim günleri', NULL, '2024-11-25', '2024-11-30', 70, 'completed', 1),
('Sevgililer Günü', '14 Şubat özel kampanya', NULL, '2025-02-01', '2025-02-14', 65, 'pending', 1);

-- Kampanya-Mağaza atamaları (Yılbaşı - Tüm mağazalar)
INSERT INTO campaign_stores (campaign_id, store_id)
SELECT 1, id FROM stores WHERE is_active = true;

-- ============================================================================
-- 7. CİHAZLAR
-- ============================================================================

INSERT INTO devices (device_code, name, store_id, status, layout_type, orientation, is_active, current_playlist_id) VALUES
-- İstanbul Kadıköy
('TV-IST-KDK-001', 'Kadıköy Giriş TV', 1, 'online', 'single', 'landscape', true, 2),
('TV-IST-KDK-002', 'Kadıköy Kasa TV', 1, 'online', 'split_horizontal', 'landscape', true, 2),

-- İstanbul Beşiktaş
('TV-IST-BSK-001', 'Beşiktaş Vitrin TV', 2, 'online', 'single', 'portrait', true, 2),
('TV-IST-BSK-002', 'Beşiktaş İç Mekan TV', 2, 'offline', 'single', 'landscape', true, 1),

-- İstanbul Şişli
('TV-IST-SSL-001', 'Şişli Ana Ekran', 3, 'online', 'grid_4', 'landscape', true, 2),

-- İstanbul Bakırköy
('TV-IST-BKK-001', 'Bakırköy Giriş TV', 4, 'online', 'single', 'landscape', true, 2),

-- Ankara Kızılay
('TV-ANK-KZL-001', 'Kızılay Giriş', 7, 'online', 'single', 'landscape', true, 1),
('TV-ANK-KZL-002', 'Kızılay Reyonlar', 7, 'error', 'split_vertical', 'landscape', true, 1),

-- İzmir Alsancak
('TV-IZM-ALS-001', 'Alsancak Vitrin', 9, 'online', 'single', 'portrait', true, 2),

-- Antalya Lara
('TV-ANT-LAR-001', 'Lara Ana Ekran', 11, 'online', 'pip', 'landscape', true, 2);

-- ============================================================================
-- 8. CİHAZ-PLAYLİST ATAMALARI
-- ============================================================================

INSERT INTO device_playlists (device_id, playlist_id, priority, is_active) VALUES
-- Kadıköy cihazları
(1, 1, 10, true),
(1, 2, 60, true),
(2, 1, 10, true),
(2, 2, 60, true),

-- Beşiktaş cihazları
(3, 1, 10, true),
(3, 2, 60, true),
(4, 1, 10, true),

-- Şişli cihazları
(5, 1, 10, true),
(5, 2, 60, true),
(5, 4, 50, true),  -- VIP

-- Bakırköy
(6, 1, 10, true),
(6, 2, 60, true),

-- Kızılay
(7, 1, 10, true),
(8, 1, 10, true),

-- Alsancak
(9, 1, 10, true),
(9, 2, 60, true),

-- Lara
(10, 1, 10, true),
(10, 2, 60, true);

-- ============================================================================
-- 9. DEMO İÇERİKLER (Gerçek dosyalar olmadan)
-- ============================================================================

INSERT INTO contents (name, description, type, file_url, thumbnail_url, duration_seconds, resolution, status, created_by) VALUES
-- Videolar
('Yılbaşı Kampanya Tanıtımı', 'Ana yılbaşı indirim videosu', 'video', '/uploads/videos/yilbasi-kampanya.mp4', '/uploads/thumbnails/yilbasi-kampanya.jpg', 30, '1920x1080', 'active', 1),
('Hoş Geldiniz Videosu', 'Mağaza giriş videosu', 'video', '/uploads/videos/hosgeldiniz.mp4', '/uploads/thumbnails/hosgeldiniz.jpg', 15, '1920x1080', 'active', 1),
('Ürün Tanıtım 1', 'Yeni koleksiyon ürün tanıtımı', 'video', '/uploads/videos/urun-tanitim-1.mp4', '/uploads/thumbnails/urun-tanitim-1.jpg', 45, '1920x1080', 'active', 1),

-- Görseller
('Banner - %50 İndirim', 'İndirim banner görseli', 'image', '/uploads/images/banner-50-indirim.jpg', '/uploads/thumbnails/banner-50-indirim.jpg', 10, '1920x1080', 'active', 1),
('Banner - Ücretsiz Kargo', 'Kargo kampanyası görseli', 'image', '/uploads/images/banner-kargo.jpg', '/uploads/thumbnails/banner-kargo.jpg', 10, '1920x1080', 'active', 1),
('Banner - Yeni Sezon', 'Yeni sezon tanıtım görseli', 'image', '/uploads/images/banner-yeni-sezon.jpg', '/uploads/thumbnails/banner-yeni-sezon.jpg', 10, '1920x1080', 'active', 1);

-- Slider
INSERT INTO contents (name, description, type, slider_settings, duration_seconds, status, created_by) VALUES
('Ürün Slider', 'Ana ürün slider''ı', 'slider', '{"transition_type": "fade", "show_indicators": true, "auto_play": true}', 25, 'active', 1);

-- Ticker
INSERT INTO contents (name, description, type, ticker_text, ticker_settings, status, created_by) VALUES
('Promosyon Ticker', 'Kayan promosyon metni', 'ticker', '🎄 YILBAŞI ÖZEL: Tüm ürünlerde %30 indirim! | 🚚 500 TL üzeri ücretsiz kargo | ⭐ VIP üyelere ekstra %10 | 📱 Mobil uygulamada sürpriz fırsatlar', '{"speed": "normal", "font_size": 28, "background_color": "#1E293B", "text_color": "#FFFFFF"}', 'active', 1);

-- Duyuru
INSERT INTO contents (name, description, type, announcement_title, announcement_type, announcement_settings, status, created_by) VALUES
('Hoş Geldiniz Duyurusu', 'Mağaza giriş duyurusu', 'announcement', 'Mağazamıza Hoş Geldiniz!', 'info', '{"duration_seconds": 10, "icon": "info", "message": "Bugün size özel fırsatlar sizi bekliyor. Yeni koleksiyonumuzu keşfedin."}', 'active', 1);

-- ============================================================================
-- 10. PLAYLİST İÇERİKLERİ
-- ============================================================================

-- Varsayılan Playlist içerikleri
INSERT INTO playlist_contents (playlist_id, content_id, position, duration_override, transition_type) VALUES
(1, 2, 1, NULL, 'fade'),    -- Hoş Geldiniz Video
(1, 4, 2, 10, 'slide'),     -- Banner %50
(1, 5, 3, 10, 'fade'),      -- Banner Kargo
(1, 6, 4, 10, 'zoom'),      -- Banner Yeni Sezon
(1, 7, 5, NULL, 'fade');    -- Ürün Slider

-- Yılbaşı Kampanyası Playlist içerikleri
INSERT INTO playlist_contents (playlist_id, content_id, position, duration_override, transition_type) VALUES
(2, 1, 1, NULL, 'fade'),    -- Yılbaşı Video
(2, 7, 2, NULL, 'slide'),   -- Ürün Slider
(2, 4, 3, 8, 'fade'),       -- Banner %50
(2, 3, 4, NULL, 'fade'),    -- Ürün Tanıtım
(2, 8, 5, NULL, 'fade');    -- Ticker (sürekli)

-- ============================================================================
-- 11. SLIDER SLIDE'LARI
-- ============================================================================

INSERT INTO slider_slides (slider_id, image_id, title, subtitle, duration_seconds, position, transition_type) VALUES
(7, 4, 'Yılbaşı Özel', '%50''ye varan indirimler', 5, 1, 'fade'),
(7, 5, 'Ücretsiz Kargo', '500 TL üzeri alışverişlerde', 5, 2, 'slide'),
(7, 6, 'Yeni Sezon', 'Koleksiyonu keşfedin', 5, 3, 'fade'),
(7, 4, 'Son Günler', 'Kampanya 2 Ocak''ta bitiyor', 5, 4, 'zoom');

-- ============================================================================
-- 12. ÖRNEK LOG KAYITLARI
-- ============================================================================

INSERT INTO system_logs (log_type, source, message, details, user_id) VALUES
('info', 'system', 'Sistem başlatıldı', '{"version": "1.0.0"}', NULL),
('info', 'auth', 'Kullanıcı giriş yaptı', '{"user_id": 1, "email": "superadmin@magazapano.com"}', 1),
('info', 'content', 'Yeni içerik yüklendi', '{"content_id": 1, "type": "video"}', 1),
('info', 'playlist', 'Playlist güncellendi', '{"playlist_id": 2, "contents_count": 5}', 1);

-- ============================================================================
-- BİTİŞ
-- ============================================================================

-- İstatistikleri güncelle
ANALYZE;

-- Bilgi mesajı
DO $$
BEGIN
    RAISE NOTICE 'Seed data başarıyla yüklendi!';
    RAISE NOTICE 'Kullanıcılar: %', (SELECT COUNT(*) FROM users);
    RAISE NOTICE 'Mağazalar: %', (SELECT COUNT(*) FROM stores);
    RAISE NOTICE 'Cihazlar: %', (SELECT COUNT(*) FROM devices);
    RAISE NOTICE 'İçerikler: %', (SELECT COUNT(*) FROM contents);
    RAISE NOTICE 'Playlistler: %', (SELECT COUNT(*) FROM playlists);
END $$;
