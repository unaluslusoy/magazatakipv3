# 📋 MağazaPano - Proje Özeti

**Versiyon:** 1.0.0  
**Tarih:** 24 Aralık 2024

---

## 1. Proje Tanımı

MağazaPano, perakende mağaza zincirlerinde kullanılan dijital tabelaların (Digital Signage) merkezi yönetim platformudur.

### 1.1 Vizyon

Mağaza içi dijital iletişimi kolaylaştıran, kullanımı basit, güçlü bir içerik yönetim sistemi sunmak.

### 1.2 Hedef Kullanıcılar

| Kullanıcı | İhtiyaç |
|-----------|---------|
| Pazarlama Ekibi | Kampanya içeriklerini yönetmek |
| Mağaza Müdürleri | Mağazaya özel içerik görmek |
| IT Ekibi | Cihazları izlemek ve yönetmek |
| Üst Yönetim | Genel durumu takip etmek |

---

## 2. Proje Kapsamı

### 2.1 Kapsam İçi (In Scope)

| Modül | Açıklama |
|-------|----------|
| **Medya Yönetimi** | Video, görsel, slider, ticker, duyuru içerikleri |
| **Playlist Yönetimi** | Sürükle-bırak içerik sıralaması, layout seçimi |
| **Zamanlama** | Tarih/saat bazlı yayın planlaması |
| **Mağaza Yönetimi** | Mağaza bilgileri ve gruplama |
| **Cihaz Yönetimi** | TV/Tablet kayıt, onay, izleme |
| **Kullanıcı Yönetimi** | Rol bazlı yetkilendirme |
| **TV Player** | Android TV/Tablet oynatıcı |
| **Gerçek Zamanlı** | Anlık cihaz durumu ve komutlar |

### 2.2 Kapsam Dışı (Out of Scope)

| Özellik | Sebep |
|---------|-------|
| Çoklu organizasyon | Tek şirket için tasarlanmış |
| Ödeme/Faturalama | SaaS modeli değil |
| Dokunmatik etkileşim | TV remote yeterli |
| Web tarayıcı widget | Güvenlik riski |
| Sosyal medya entegrasyonu | İlk versiyon kapsamı dışı |
| Hava durumu widget | İlk versiyon kapsamı dışı |

---

## 3. Temel İş Akışı

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ANA İŞ AKIŞI                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐       │
│  │ İçerik  │────►│Playlist │────►│Zamanlama│────►│ Cihaz   │       │
│  │ Yükle   │     │ Oluştur │     │ Tanımla │     │ Oynat   │       │
│  └─────────┘     └─────────┘     └─────────┘     └─────────┘       │
│                                                                      │
│  ADIM 1: Medya içerikleri yüklenir (video, görsel, slider vb.)      │
│  ADIM 2: Playlist oluşturulur, içerikler sıralanır                  │
│  ADIM 3: Zamanlama ile playlist mağaza/cihaza atanır                │
│  ADIM 4: Cihaz senkronizasyon ile içerikleri çeker ve oynatır       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. İçerik Tipleri

### 4.1 Video

| Özellik | Değer |
|---------|-------|
| Formatlar | MP4, WebM, MOV |
| Max Boyut | 500 MB |
| Çözünürlük | 1080x1920 (Portrait), 1920x1080 (Landscape) |
| Codec | H.264, H.265 |

### 4.2 Görsel

| Özellik | Değer |
|---------|-------|
| Formatlar | JPG, PNG, GIF, WebP |
| Max Boyut | 10 MB |
| Çözünürlük | Önerilen 1080x1920 |
| Animasyon | GIF ve WebP desteklenir |

### 4.3 Slider

| Özellik | Değer |
|---------|-------|
| Max Slide | 20 adet |
| Geçiş Efektleri | Fade, Slide, Zoom, Flip |
| Slide Süresi | 1-60 saniye |
| Göstergeler | Dot, number, none |

### 4.4 Ticker (Alt Bant)

| Özellik | Değer |
|---------|-------|
| Hız | Yavaş, Normal, Hızlı |
| Arkaplan | HEX renk |
| Yazı Rengi | HEX renk |
| Font Boyutu | 16-48px |
| Emoji | Desteklenir ✅ |

### 4.5 Duyuru

| Özellik | Değer |
|---------|-------|
| Tipler | Bilgi, Uyarı, Acil |
| Süre | 5-60 saniye |
| Animasyon | Fade in/out |
| Ses | İsteğe bağlı |

---

## 5. Layout (Ekran Düzeni) Seçenekleri

```
┌─────────────────────────────────────────────────────────────────────┐
│                      LAYOUT TİPLERİ                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │             │  │      A      │  │   A  │  B   │                  │
│  │    SINGLE   │  ├─────────────┤  ├──────┼──────┤                  │
│  │             │  │      B      │  │   C  │  D   │                  │
│  └─────────────┘  └─────────────┘  └─────────────┘                  │
│      Tekli         Yatay Bölmeli      4'lü Grid                     │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐                                   │
│  │   │         │  │             │                                   │
│  │ A │    B    │  │    MAIN     │                                   │
│  │   │         │  │   ┌─────┐   │                                   │
│  └─────────────┘  │   │ PIP │   │                                   │
│   Dikey Bölmeli   └───┴─────┴───┘                                   │
│                     Picture-in-Picture                              │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                        MAIN CONTENT                          │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │  ◄◄◄ TICKER (Kayan Yazı) ◄◄◄                               │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                   Main + Alt Ticker                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Zamanlama Sistemi

### 6.1 Hedef Tipleri

| Hedef | Açıklama |
|-------|----------|
| Mağaza | Tek bir mağazaya yayın |
| Mağaza Grubu | Bölge/tip bazlı gruplara yayın |
| Cihaz | Belirli bir cihaza özel yayın |

### 6.2 Tekrar Seçenekleri

| Tip | Açıklama |
|-----|----------|
| Bir Kez | Sadece belirtilen tarihte |
| Günlük | Her gün belirlenen saatlerde |
| Haftalık | Seçilen günlerde |
| Aylık | Ayın belirli günlerinde |

### 6.3 Öncelik Sistemi

Aynı anda birden fazla zamanlama aktifse, **öncelik değeri yüksek** olan yayınlanır.

```
Örnek:
- Zamanlama A: Tüm mağazalar, Öncelik: 10
- Zamanlama B: Sadece AVM mağazaları, Öncelik: 20
- Zamanlama C: Kadıköy mağazası özel, Öncelik: 50

Kadıköy mağazasında → C yayınlanır (öncelik: 50)
Diğer AVM'lerde → B yayınlanır (öncelik: 20)
Diğer mağazalarda → A yayınlanır (öncelik: 10)
```

---

## 7. Cihaz Durumları

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CİHAZ DURUM AKIŞI                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐       │
│  │ PENDING │────►│APPROVED │────►│ ONLINE  │────►│ PLAYING │       │
│  │(Bekliyor)│     │ (Onaylı)│     │(Çevrimiçi)│   │(Oynuyor)│       │
│  └─────────┘     └─────────┘     └─────────┘     └─────────┘       │
│       │                │                              │             │
│       │                │                              │             │
│       ▼                ▼                              ▼             │
│  ┌─────────┐     ┌─────────┐                   ┌─────────┐         │
│  │REJECTED │     │SUSPENDED│                   │ OFFLINE │         │
│  │(Reddedildi)│   │(Askıya  │                   │(Çevrimdışı)│      │
│  └─────────┘     │ Alındı) │                   └─────────┘         │
│                  └─────────┘                                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. Başarı Kriterleri

| Kriter | Hedef |
|--------|-------|
| Cihaz Online Oranı | %99+ |
| Sync Başarı Oranı | %99.5+ |
| Sayfa Yüklenme Süresi | <2 saniye |
| Video Başlama Süresi | <1 saniye |
| Offline Çalışma Süresi | 7 gün |

---

## 9. Riskler ve Çözümler

| Risk | Olasılık | Etki | Çözüm |
|------|----------|------|-------|
| Ağ kesintisi | Orta | Yüksek | Offline mode + cache |
| Büyük dosya upload | Düşük | Orta | Chunk upload + progress |
| Cihaz çökmesi | Düşük | Yüksek | Auto-restart + watchdog |
| Veri kaybı | Düşük | Kritik | Günlük yedekleme |

---

## 10. Proje Zaman Çizelgesi

| Faz | Süre | Çıktı |
|-----|------|-------|
| **Faz 1: Backend** | 2 hafta | API + Veritabanı |
| **Faz 2: Admin Panel** | 3 hafta | Tüm ekranlar |
| **Faz 3: TV Player** | 2 hafta | Oynatıcı uygulama |
| **Faz 4: Entegrasyon** | 1 hafta | Test ve düzeltme |
| **Toplam** | **8 hafta** | Production-ready sistem |

---

*Son Güncelleme: 24 Aralık 2024*
