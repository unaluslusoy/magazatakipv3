# 📺 MağazaPano - Dijital Tabela Yönetim Sistemi

**Versiyon:** 1.0.0  
**Tarih:** 24 Aralık 2024  
**Dil:** Türkçe

---

## 📋 Proje Özeti

MağazaPano, mağaza zincirlerinde kullanılan dijital tabelaların (Android TV/Tablet) merkezi yönetim sistemidir.

### Temel Özellikler

- 🖥️ **Admin Panel** - Flutter tabanlı çoklu platform yönetim arayüzü
- 📺 **TV Player** - Android TV/Tablet için oynatıcı uygulama
- 🔄 **Gerçek Zamanlı Sync** - Socket.IO ile anlık güncelleme
- 📁 **Medya Yönetimi** - Video, görsel, slider, ticker desteği
- 📅 **Zamanlama** - Esnek kampanya planlama sistemi

---

## 📁 Dokümantasyon Yapısı

```
docs/
├── README.md                          # Bu dosya
├── 01-PROJE-GENEL/
│   ├── 01-proje-ozeti.md             # Proje tanımı ve kapsamı
│   ├── 02-teknoloji-stack.md         # Kullanılan teknolojiler
│   └── 03-mimari-diyagram.md         # Sistem mimarisi
│
├── 02-VERITABANI/
│   ├── 01-sema-tasarimi.md           # Tablo yapıları ✓
│   ├── 02-neon-yapilandirma.md       # Neon PostgreSQL config ✓
│   ├── 02-iliskiler-diagram.md       # ER diyagramı
│   └── sql/
│       ├── 001-schema.sql            # Ana şema ✓
│       └── 002-seed-data.sql         # Demo veriler ✓
│
├── 03-BACKEND-API/
│   ├── 01-api-endpoints.md           # Tüm endpoint'ler
│   ├── 02-auth-sistemi.md            # Kimlik doğrulama
│   └── 03-servis-mimarisi.md         # Servis yapısı
│
├── 04-ADMIN-PANEL/
│   ├── 01-ui-tasarim-rehberi.md      # UI/UX standartları ✓
│   ├── 02-ekran-akislari.md          # Sayfa akışları
│   ├── 03-komponent-kutuphanesi.md   # Widget kütüphanesi
│   ├── 04-medya-yonetimi.md          # Medya modülü detayları ✓
│   └── 05-playlist-zamanlama.md      # Playlist & zamanlama ✓
│
├── 05-TV-PLAYER/
│   ├── 01-offline-mod.md             # Çevrimdışı çalışma ✓
│   ├── 02-player-tasarimi.md         # Oynatıcı yapısı
│   └── 03-sync-mekanizmasi.md        # Senkronizasyon
│
└── 06-IS-PLANI/
    ├── 01-sprint-plani.md            # Haftalık iş planı
    ├── 02-gorev-listesi.md           # Detaylı görevler
    └── 03-test-kontrol-listesi.md    # QA checklist
```

---

## 🚀 Hızlı Başlangıç

### Gereksinimler

| Bileşen | Versiyon |
|---------|----------|
| Node.js | 20 LTS |
| PostgreSQL | 16+ |
| Redis | 7+ |
| Flutter | 3.16+ |

### Kurulum Adımları

```bash
# 1. Projeyi klonla
git clone https://github.com/company/magazapano.git

# 2. Backend kurulumu
cd backend && npm install

# 3. Veritabanı kurulumu
./database/db_manager.sh install

# 4. Admin panel kurulumu
cd admin_panel && flutter pub get

# 5. TV player kurulumu
cd tv_player && flutter pub get
```

---

## 📊 Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MağazaPano Sistem Mimarisi                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐         ┌──────────────────────────────────────┐  │
│  │   Admin      │         │           Backend API                │  │
│  │   Panel      │◄───────►│          (Node.js)                   │  │
│  │  (Flutter)   │  REST   │                                      │  │
│  │              │         │  ┌─────────┐    ┌─────────────────┐  │  │
│  │  • Web       │         │  │ Express │───►│   PostgreSQL    │  │  │
│  │  • Windows   │         │  │ Router  │    │   + Redis       │  │  │
│  │  • macOS     │         │  └────┬────┘    └─────────────────┘  │  │
│  └──────────────┘         │       │                              │  │
│         │                 │       │         ┌─────────────────┐  │  │
│         │ WebSocket       │  ┌────▼────┐    │  File Storage   │  │  │
│         └────────────────►│  │Socket.IO│    │  (uploads/)     │  │  │
│                           │  └────┬────┘    └─────────────────┘  │  │
│  ┌──────────────┐         │       │                              │  │
│  │   TV Player  │◄────────│───────┘                              │  │
│  │  (Flutter)   │ Sync    │                                      │  │
│  │              │         │                                      │  │
│  │  • Android TV│         │                                      │  │
│  │  • Tablet    │         │                                      │  │
│  └──────────────┘         └──────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 👥 Kullanıcı Rolleri

| Rol | Yetkiler |
|-----|----------|
| **Super Admin** | Tüm sistem yetkileri |
| **Admin** | Mağaza ve cihaz yönetimi |
| **Editor** | İçerik ve playlist yönetimi |
| **Viewer** | Sadece görüntüleme |

---

## 📱 Ekran Listesi

### Admin Panel (14 Ekran)

| # | Ekran | Açıklama |
|---|-------|----------|
| 1 | Giriş | Kullanıcı girişi |
| 2 | Dashboard | İstatistikler ve genel bakış |
| 3 | Mağazalar | Mağaza listesi ve yönetimi |
| 4 | Mağaza Detay | Mağaza bilgileri ve cihazları |
| 5 | Mağaza Grupları | Grup yönetimi |
| 6 | Cihazlar | Cihaz listesi ve durum |
| 7 | Cihaz Detay | Cihaz bilgileri ve loglar |
| 8 | Medya Galerisi | İçerik yönetimi (video/görsel) |
| 9 | Medya Editör | İçerik düzenleme |
| 10 | Playlistler | Oynatma listesi yönetimi |
| 11 | Playlist Editör | Sürükle-bırak düzenleme |
| 12 | Zamanlamalar | Kampanya planlaması |
| 13 | Kullanıcılar | Kullanıcı yönetimi |
| 14 | Ayarlar | Sistem ayarları |

### TV Player (5 Ekran)

| # | Ekran | Açıklama |
|---|-------|----------|
| 1 | Kayıt | Cihaz kaydı ve QR |
| 2 | Bekleme | Onay bekleme ekranı |
| 3 | Player | Ana oynatma ekranı |
| 4 | Sync | Senkronizasyon durumu |
| 5 | Debug | Hata ayıklama modu |

---

## 📞 İletişim

- **Proje Sahibi:** [İsim]
- **Geliştirici:** [İsim]
- **Email:** info@magazapano.com

---

*Son Güncelleme: 24 Aralık 2024*
