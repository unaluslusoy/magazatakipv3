# 🛠️ MağazaPano - İş Planı & Sprint Planlaması

**Versiyon:** 1.0.0  
**Tarih:** 24 Aralık 2024

---

## 1. Proje Özeti

### 1.1 Proje Kapsamı

**MağazaPano**, mağazalardaki dijital ekranları merkezi olarak yöneten bir sistemdir.

| Alan | Açıklama |
|------|----------|
| **Backend** | Node.js + Express.js + PostgreSQL |
| **Admin Panel** | Flutter Web/Desktop |
| **TV Uygulaması** | Flutter Android TV |
| **Tahmini Süre** | 12 hafta (3 ay) |

### 1.2 Öncelik Sırası

```
1. ⭐⭐⭐ Backend API Altyapısı (Temel)
2. ⭐⭐⭐ Admin Panel - Medya Yönetimi (En Önemli)
3. ⭐⭐   Admin Panel - Playlist & Zamanlama
4. ⭐⭐   TV Player Uygulaması
5. ⭐    Admin Panel - Raporlama & Analitik
6. ⭐    Test & Optimizasyon
```

---

## 2. Sprint Planı

### 2.1 Genel Bakış

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         12 HAFTALIK ROADMAP                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  HAFTA   1    2    3    4    5    6    7    8    9   10   11   12          │
│          │    │    │    │    │    │    │    │    │    │    │    │          │
│  SPRINT  ├─ Sprint 1 ─┤├─ Sprint 2 ─┤├─ Sprint 3 ─┤├─ Sprint 4 ─┤         │
│          │            ││            ││            ││            │          │
│  BACKEND ██████████████                                                     │
│          Altyapı + API                                                      │
│                                                                              │
│  ADMIN              ████████████████████████████████                        │
│                     Medya + Playlist + UI                                   │
│                                                                              │
│  TV APP                              ████████████████████                   │
│                                      Player + Sync                          │
│                                                                              │
│  TEST                                              ████████████             │
│                                                    QA + Deploy              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Sprint 1 (Hafta 1-3): Temel Altyapı

### 3.1 Backend Altyapı

| ID | Görev | Süre | Öncelik |
|----|-------|------|---------|
| B1.1 | Proje kurulumu (Express + TypeScript) | 0.5 gün | P0 |
| B1.2 | PostgreSQL şema tasarımı | 1 gün | P0 |
| B1.3 | Sequelize model tanımlamaları | 1 gün | P0 |
| B1.4 | JWT auth sistemi | 1 gün | P0 |
| B1.5 | RBAC middleware | 0.5 gün | P0 |
| B1.6 | Dosya upload servisi (Multer) | 1 gün | P0 |
| B1.7 | Redis cache entegrasyonu | 0.5 gün | P1 |
| B1.8 | Error handling & logging | 0.5 gün | P1 |

### 3.2 Admin Panel Temel

| ID | Görev | Süre | Öncelik |
|----|-------|------|---------|
| A1.1 | Flutter proje kurulumu | 0.5 gün | P0 |
| A1.2 | Riverpod state yönetimi | 0.5 gün | P0 |
| A1.3 | Go Router navigasyon | 0.5 gün | P0 |
| A1.4 | Dio HTTP client | 0.5 gün | P0 |
| A1.5 | Auth ekranları (Login) | 1 gün | P0 |
| A1.6 | Dashboard layout | 1 gün | P0 |
| A1.7 | Sidebar navigasyon | 0.5 gün | P0 |
| A1.8 | Tema sistemi (Dark/Light) | 0.5 gün | P1 |

### 3.3 Sprint 1 Çıktıları

```
✓ Çalışan backend API sunucusu
✓ Veritabanı tabloları oluşturulmuş
✓ Kullanıcı giriş/çıkış işlevi
✓ Admin panel temel navigasyon
✓ Dashboard görünümü
```

---

## 4. Sprint 2 (Hafta 4-6): Medya Yönetimi

### 4.1 Backend - İçerik API

| ID | Görev | Süre | Öncelik |
|----|-------|------|---------|
| B2.1 | CRUD: Contents endpoints | 1 gün | P0 |
| B2.2 | Video upload & thumbnail | 1 gün | P0 |
| B2.3 | Görsel işleme (Sharp) | 0.5 gün | P0 |
| B2.4 | Slider CRUD | 0.5 gün | P0 |
| B2.5 | Ticker CRUD | 0.5 gün | P0 |
| B2.6 | Duyuru CRUD | 0.5 gün | P0 |
| B2.7 | Chunk upload desteği | 1 gün | P1 |
| B2.8 | Content validation | 0.5 gün | P0 |

### 4.2 Admin Panel - Medya Modülü

| ID | Görev | Süre | Öncelik |
|----|-------|------|---------|
| A2.1 | Medya galerisi grid/liste | 1 gün | P0 |
| A2.2 | Filtreleme & arama | 0.5 gün | P0 |
| A2.3 | Video yükleme modal | 1 gün | P0 |
| A2.4 | Görsel yükleme modal | 0.5 gün | P0 |
| A2.5 | Slider editör ekranı | 1.5 gün | P0 |
| A2.6 | Slide sürükle-bırak | 0.5 gün | P0 |
| A2.7 | Ticker editör ekranı | 1 gün | P0 |
| A2.8 | Duyuru editör ekranı | 0.5 gün | P0 |
| A2.9 | Rich text editör (flutter_quill) | 1 gün | P1 |
| A2.10 | Önizleme modu | 1 gün | P0 |
| A2.11 | Upload progress UI | 0.5 gün | P1 |
| A2.12 | Geçiş efekt seçici | 0.5 gün | P2 |

### 4.3 Sprint 2 Çıktıları

```
✓ Video/Görsel yükleme çalışıyor
✓ Slider oluşturma/düzenleme
✓ Ticker oluşturma/düzenleme
✓ Duyuru oluşturma/düzenleme
✓ Rich text desteği
✓ Medya önizleme
```

---

## 5. Sprint 3 (Hafta 7-9): Playlist & Cihaz

### 5.1 Backend - Playlist & Device API

| ID | Görev | Süre | Öncelik |
|----|-------|------|---------|
| B3.1 | CRUD: Playlists endpoints | 1 gün | P0 |
| B3.2 | Playlist-Content ilişkisi | 0.5 gün | P0 |
| B3.3 | Schedule (zamanlama) CRUD | 1 gün | P0 |
| B3.4 | Campaign CRUD | 0.5 gün | P0 |
| B3.5 | CRUD: Devices endpoints | 1 gün | P0 |
| B3.6 | Socket.IO entegrasyonu | 1 gün | P0 |
| B3.7 | Cihaz heartbeat sistemi | 0.5 gün | P0 |
| B3.8 | Content sync endpoint | 1 gün | P0 |

### 5.2 Admin Panel - Playlist Modülü

| ID | Görev | Süre | Öncelik |
|----|-------|------|---------|
| A3.1 | Playlist listesi | 0.5 gün | P0 |
| A3.2 | Playlist oluşturma/düzenleme | 1 gün | P0 |
| A3.3 | İçerik sürükle-bırak | 0.5 gün | P0 |
| A3.4 | Zamanlama ayarları UI | 1 gün | P0 |
| A3.5 | Timeline görünümü | 1.5 gün | P1 |
| A3.6 | Kampanya yönetimi | 1 gün | P0 |
| A3.7 | Mağaza-Playlist atama | 1 gün | P0 |
| A3.8 | Öncelik yönetimi | 0.5 gün | P1 |

### 5.3 Admin Panel - Cihaz Modülü

| ID | Görev | Süre | Öncelik |
|----|-------|------|---------|
| A3.9 | Cihaz listesi (DataTable) | 1 gün | P0 |
| A3.10 | Cihaz detay sayfası | 0.5 gün | P0 |
| A3.11 | Cihaz durum göstergeleri | 0.5 gün | P0 |
| A3.12 | Uzaktan yeniden başlatma | 0.5 gün | P1 |
| A3.13 | Cihaz grupları | 0.5 gün | P2 |

### 5.4 Sprint 3 Çıktıları

```
✓ Playlist oluşturma/düzenleme
✓ Zamanlama sistemi çalışıyor
✓ Kampanya yönetimi
✓ Cihaz listesi ve izleme
✓ Socket.IO bağlantısı
```

---

## 6. Sprint 4 (Hafta 10-12): TV App & Finalizasyon

### 6.1 TV Uygulaması

| ID | Görev | Süre | Öncelik |
|----|-------|------|---------|
| T1.1 | Flutter TV proje kurulumu | 0.5 gün | P0 |
| T1.2 | D-pad navigasyon | 0.5 gün | P0 |
| T1.3 | Cihaz kayıt ekranı | 0.5 gün | P0 |
| T1.4 | Video player (Chewie) | 1 gün | P0 |
| T1.5 | Görsel slider | 0.5 gün | P0 |
| T1.6 | Ticker bileşeni | 0.5 gün | P0 |
| T1.7 | Duyuru bileşeni | 0.5 gün | P0 |
| T1.8 | Layout sistemi (split/grid) | 1 gün | P0 |
| T1.9 | İçerik senkronizasyonu | 1 gün | P0 |
| T1.10 | Offline cache (Hive) | 1 gün | P1 |
| T1.11 | Socket.IO client | 0.5 gün | P0 |
| T1.12 | Auto-recovery mekanizması | 0.5 gün | P1 |

### 6.2 Raporlama & Analitik

| ID | Görev | Süre | Öncelik |
|----|-------|------|---------|
| R1.1 | Play log kayıt sistemi | 0.5 gün | P0 |
| R1.2 | Analitik dashboard | 1 gün | P1 |
| R1.3 | İçerik görüntülenme raporları | 0.5 gün | P1 |
| R1.4 | Cihaz çalışma raporları | 0.5 gün | P1 |
| R1.5 | Excel/PDF export | 0.5 gün | P2 |

### 6.3 Test & Deploy

| ID | Görev | Süre | Öncelik |
|----|-------|------|---------|
| Q1.1 | API unit testleri | 1 gün | P1 |
| Q1.2 | Integration testleri | 1 gün | P1 |
| Q1.3 | UI/UX testleri | 0.5 gün | P1 |
| Q1.4 | Performans optimizasyonu | 0.5 gün | P1 |
| Q1.5 | Docker containerization | 0.5 gün | P1 |
| Q1.6 | CI/CD pipeline | 0.5 gün | P2 |
| Q1.7 | Production deploy | 0.5 gün | P0 |
| Q1.8 | Dokümantasyon finalizasyonu | 0.5 gün | P1 |

### 6.4 Sprint 4 Çıktıları

```
✓ TV uygulaması çalışıyor
✓ Tüm içerik tipleri oynatılıyor
✓ Canlı senkronizasyon
✓ Temel raporlar
✓ Üretime hazır sistem
```

---

## 7. Detaylı Görev Matrisi

### 7.1 Backend Görevleri (Toplam)

| Kategori | Görev Sayısı | Tahmini Süre |
|----------|--------------|--------------|
| Altyapı | 8 | 6 gün |
| İçerik API | 8 | 6 gün |
| Playlist API | 4 | 3 gün |
| Cihaz API | 4 | 3.5 gün |
| **Toplam** | **24** | **18.5 gün** |

### 7.2 Admin Panel Görevleri (Toplam)

| Kategori | Görev Sayısı | Tahmini Süre |
|----------|--------------|--------------|
| Temel | 8 | 5 gün |
| Medya Modülü | 12 | 10 gün |
| Playlist Modülü | 8 | 7 gün |
| Cihaz Modülü | 5 | 3 gün |
| **Toplam** | **33** | **25 gün** |

### 7.3 TV App Görevleri (Toplam)

| Kategori | Görev Sayısı | Tahmini Süre |
|----------|--------------|--------------|
| Temel | 3 | 1.5 gün |
| İçerik Gösterimi | 5 | 3.5 gün |
| Senkronizasyon | 4 | 3 gün |
| **Toplam** | **12** | **8 gün** |

---

## 8. Risk Yönetimi

### 8.1 Teknik Riskler

| Risk | Olasılık | Etki | Azaltma Stratejisi |
|------|----------|------|---------------------|
| Büyük video upload hataları | Orta | Yüksek | Chunk upload, resume desteği |
| Socket.IO bağlantı kesintileri | Orta | Orta | Reconnection logic, queue |
| TV performans sorunları | Düşük | Yüksek | Cache optimizasyonu, lazy load |
| Veritabanı performansı | Düşük | Orta | İndeksleme, query optimizasyonu |

### 8.2 Proje Riskleri

| Risk | Olasılık | Etki | Azaltma Stratejisi |
|------|----------|------|---------------------|
| Kapsam genişlemesi | Yüksek | Orta | MVP odaklı geliştirme |
| Kaynak yetersizliği | Orta | Yüksek | Önceliklendirme, P2 erteleme |
| Teknik borç | Orta | Orta | Refactoring sprintleri |

---

## 9. Definition of Done (DoD)

### 9.1 Feature Tamamlanma Kriterleri

```
☐ Kod yazıldı ve test edildi
☐ API dokümantasyonu güncellendi
☐ UI/UX rehberine uygun
☐ Error handling yapıldı
☐ Loading state'ler eklendi
☐ Empty state'ler eklendi
☐ Responsive kontrol edildi
☐ Code review yapıldı
☐ Merge edildi
```

### 9.2 Sprint Tamamlanma Kriterleri

```
☐ Tüm P0 görevler tamamlandı
☐ Demo hazır
☐ Sprint retrospective yapıldı
☐ Sonraki sprint planlandı
☐ Dokümantasyon güncellendi
```

---

## 10. Takvim Görünümü

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              2024 - 2025                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ARALIK 2024                                                                │
│  ─────────────────────────────────────────                                  │
│  Pzt   Sal   Çar   Per   Cum   Cmt   Paz                                   │
│                                                                              │
│                              1                                              │
│  2     3     4     5     6     7     8     ◄─── Sprint 1 Başlangıç         │
│  9    10    11    12    13    14    15                                      │
│  16    17    18    19    20    21    22                                     │
│  23    24    25    26    27    28    29    ◄─── Sprint 1 Bitiş              │
│  30    31                                                                    │
│                                                                              │
│  OCAK 2025                                                                  │
│  ─────────────────────────────────────────                                  │
│              1     2     3     4     5                                      │
│  6     7     8     9    10    11    12     ◄─── Sprint 2 Başlangıç         │
│  13    14    15    16    17    18    19                                     │
│  20    21    22    23    24    25    26    ◄─── Sprint 2 Bitiş              │
│  27    28    29    30    31               ◄─── Sprint 3 Başlangıç          │
│                                                                              │
│  ŞUBAT 2025                                                                 │
│  ─────────────────────────────────────────                                  │
│                          1     2                                            │
│  3     4     5     6     7     8     9                                      │
│  10    11    12    13    14    15    16    ◄─── Sprint 3 Bitiş              │
│  17    18    19    20    21    22    23    ◄─── Sprint 4 Başlangıç         │
│  24    25    26    27    28                                                  │
│                                                                              │
│  MART 2025                                                                  │
│  ─────────────────────────────────────────                                  │
│                          1     2                                            │
│  3     4     5     6     7     8     9     ◄─── Sprint 4 Bitiş / RELEASE   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Milestone'lar

| Milestone | Tarih | Çıktılar |
|-----------|-------|----------|
| **M1: Altyapı Hazır** | 29 Aralık 2024 | Backend + Admin temel |
| **M2: Medya Yönetimi** | 26 Ocak 2025 | Tüm içerik tipleri |
| **M3: Playlist Sistemi** | 16 Şubat 2025 | Zamanlama + Kampanya |
| **M4: MVP Release** | 9 Mart 2025 | Üretime hazır sistem |

---

## 12. Ekip & Sorumluluklar

### 12.1 Roller

| Rol | Sorumluluk |
|-----|------------|
| **Backend Developer** | API geliştirme, veritabanı, Socket.IO |
| **Frontend Developer** | Admin Panel Flutter, UI bileşenleri |
| **Mobile Developer** | TV uygulaması, cihaz entegrasyonu |
| **QA** | Test, bug raporlama |
| **DevOps** | Deploy, CI/CD, monitoring |

### 12.2 Günlük Rutinler

```
09:00 - Daily standup (15 dk)
       - Dün ne yaptım?
       - Bugün ne yapacağım?
       - Engellerim var mı?

12:00 - Öğle arası

17:00 - Günlük kod review
```

### 12.3 Haftalık Rutinler

```
Pazartesi  - Sprint planning (yeni sprint başlangıcı ise)
Cuma       - Sprint review & demo
           - Sprint retrospective
```

---

## 13. Araçlar & Teknolojiler

### 13.1 Geliştirme Araçları

| Araç | Kullanım |
|------|----------|
| VS Code | Kod editörü |
| Android Studio | Flutter + Android TV |
| Postman | API test |
| pgAdmin | PostgreSQL yönetimi |
| Redis Commander | Redis yönetimi |

### 13.2 Proje Yönetimi

| Araç | Kullanım |
|------|----------|
| Git + GitHub | Versiyon kontrolü |
| GitHub Projects | Kanban board |
| Slack/Discord | İletişim |
| Confluence/Notion | Dokümantasyon |

### 13.3 CI/CD

| Araç | Kullanım |
|------|----------|
| Docker | Containerization |
| GitHub Actions | CI/CD pipeline |
| Nginx | Reverse proxy |
| PM2 | Process manager |

---

## 14. Sonraki Adımlar (Post-MVP)

### 14.1 Phase 2 Önerileri

| Özellik | Açıklama |
|---------|----------|
| Multi-tenant | Birden fazla firma desteği |
| Gelişmiş analitik | Detaylı raporlama |
| API rate limiting | Güvenlik |
| CDN entegrasyonu | Performans |
| Mobile app | iOS/Android yönetim |

### 14.2 Teknik İyileştirmeler

| Alan | İyileştirme |
|------|-------------|
| Caching | Redis cluster |
| Database | Read replica |
| API | GraphQL desteği |
| Monitoring | Prometheus + Grafana |

---

*Son Güncelleme: 24 Aralık 2024*
