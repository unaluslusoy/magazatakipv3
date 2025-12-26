# 📴 MağazaPano - TV Player Offline Mod

**Versiyon:** 1.0.0  
**Tarih:** 24 Aralık 2025

---

## 1. Genel Bakış

TV Player uygulaması, internet bağlantısı kesilse bile içerik oynatmaya devam edebilir. Tüm içerikler ve playlist bilgileri yerel olarak cihazda saklanır.

### 1.1 Temel Prensipler

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         OFFLINE MOD MİMARİSİ                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  SUNUCU                              CİHAZ                                  │
│  ┌─────────────────┐                ┌─────────────────────────────────────┐ │
│  │                 │    ONLINE      │                                     │ │
│  │   Backend API   │◄──────────────►│   Sync Manager                      │ │
│  │                 │                │        │                            │ │
│  └─────────────────┘                │        ▼                            │ │
│                                     │   ┌─────────────────────────────┐   │ │
│                                     │   │     LOCAL STORAGE           │   │ │
│         ╳ OFFLINE                   │   │  ┌───────────────────────┐  │   │ │
│                                     │   │  │ Hive DB (Metadata)    │  │   │ │
│                                     │   │  │ - Playlist bilgileri  │  │   │ │
│                                     │   │  │ - İçerik listesi      │  │   │ │
│                                     │   │  │ - Zamanlama           │  │   │ │
│                                     │   │  └───────────────────────┘  │   │ │
│                                     │   │                             │   │ │
│                                     │   │  ┌───────────────────────┐  │   │ │
│                                     │   │  │ File Storage          │  │   │ │
│                                     │   │  │ - Video dosyaları     │  │   │ │
│                                     │   │  │ - Görsel dosyaları    │  │   │ │
│                                     │   │  │ - Thumbnail'ler       │  │   │ │
│                                     │   │  └───────────────────────┘  │   │ │
│                                     │   └─────────────────────────────┘   │ │
│                                     │        │                            │ │
│                                     │        ▼                            │ │
│                                     │   ┌─────────────────────────────┐   │ │
│                                     │   │     PLAYER ENGINE           │   │ │
│                                     │   │  Yerel dosyalardan oynat    │   │ │
│                                     │   └─────────────────────────────┘   │ │
│                                     └─────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Offline Çalışma Akışı

### 2.1 İlk Kurulum (Online Gerekli)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         İLK KURULUM AKIŞI                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. CİHAZ AKTİVASYONU                                                       │
│     │                                                                        │
│     ├── Aktivasyon kodu girilir                                             │
│     ├── Sunucu cihazı doğrular                                              │
│     ├── Mağaza bilgileri indirilir                                          │
│     └── Device token alınır                                                 │
│     │                                                                        │
│     ▼                                                                        │
│  2. PLAYLİST SYNC                                                           │
│     │                                                                        │
│     ├── Mağazaya atanmış playlistler sorgulanır                            │
│     ├── Aktif playlist belirlenir (öncelik + zamanlama)                    │
│     ├── Playlist içerik listesi alınır                                     │
│     └── Metadata yerel DB'ye kaydedilir                                    │
│     │                                                                        │
│     ▼                                                                        │
│  3. İÇERİK İNDİRME                                                          │
│     │                                                                        │
│     ├── Playlist'teki tüm içerikler sıraya alınır                          │
│     ├── Video/Görsel dosyaları indirilir                                   │
│     ├── Checksum doğrulaması yapılır                                       │
│     └── Dosya yolları yerel DB'ye kaydedilir                               │
│     │                                                                        │
│     ▼                                                                        │
│  4. OYNATMA BAŞLAR                                                          │
│     │                                                                        │
│     └── Artık offline çalışabilir ✓                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Normal Çalışma Döngüsü

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    NORMAL ÇALIŞMA DÖNGÜSÜ                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│      ┌──────────────────────────────────────────────────────────────┐       │
│      │                    UYGULAMA BAŞLADI                          │       │
│      └──────────────────────────────────────────────────────────────┘       │
│                                    │                                         │
│                                    ▼                                         │
│                         ┌─────────────────────┐                             │
│                         │ İnternet var mı?    │                             │
│                         └─────────────────────┘                             │
│                            │              │                                  │
│                      EVET  │              │  HAYIR                          │
│                            ▼              ▼                                  │
│      ┌─────────────────────────┐    ┌─────────────────────────┐            │
│      │   ONLINE MOD            │    │   OFFLINE MOD           │            │
│      │                         │    │                         │            │
│      │ • Sunucuya bağlan       │    │ • Yerel DB'den oku      │            │
│      │ • Playlist güncelle     │    │ • Yerel dosyaları kullan│            │
│      │ • Yeni içerik indir     │    │ • Son playlist ile oynat│            │
│      │ • Heartbeat gönder      │    │ • Retry timer başlat    │            │
│      │ • Log gönder            │    │ • Log'ları biriktir     │            │
│      └─────────────────────────┘    └─────────────────────────┘            │
│                            │              │                                  │
│                            ▼              ▼                                  │
│      ┌──────────────────────────────────────────────────────────────┐       │
│      │              İÇERİK OYNATMAYA BAŞLA                          │       │
│      │         (Her iki modda da yerel dosyalardan)                 │       │
│      └──────────────────────────────────────────────────────────────┘       │
│                                    │                                         │
│                                    ▼                                         │
│                    ┌──────────────────────────────┐                         │
│                    │   Her 30 sn bağlantı kontrol │◄────────┐               │
│                    └──────────────────────────────┘         │               │
│                                    │                         │               │
│                          Bağlantı geldi?                     │               │
│                            │              │                  │               │
│                      EVET  │              │ HAYIR            │               │
│                            ▼              └──────────────────┘               │
│      ┌─────────────────────────────────────────────────────────────┐        │
│      │   • Birikmiş log'ları gönder                                │        │
│      │   • Playlist güncellemesi kontrol et                        │        │
│      │   • Yeni içerik varsa indir                                 │        │
│      └─────────────────────────────────────────────────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Yerel Veri Yapısı

### 3.1 Hive Box'ları

```dart
// lib/data/local/boxes.dart

/// Cihaz bilgileri
@HiveType(typeId: 0)
class DeviceBox extends HiveObject {
  @HiveField(0)
  late String deviceId;
  
  @HiveField(1)
  late String deviceToken;
  
  @HiveField(2)
  late String deviceCode;
  
  @HiveField(3)
  late int storeId;
  
  @HiveField(4)
  late String storeName;
  
  @HiveField(5)
  late DateTime activatedAt;
  
  @HiveField(6)
  late DateTime lastSyncAt;
}

/// Playlist bilgileri
@HiveType(typeId: 1)
class PlaylistBox extends HiveObject {
  @HiveField(0)
  late int id;
  
  @HiveField(1)
  late String name;
  
  @HiveField(2)
  late int priority;
  
  @HiveField(3)
  late bool isActive;
  
  @HiveField(4)
  late List<ContentBox> contents;
  
  @HiveField(5)
  late ScheduleBox? schedule;
  
  @HiveField(6)
  late DateTime syncedAt;
}

/// İçerik bilgileri
@HiveType(typeId: 2)
class ContentBox extends HiveObject {
  @HiveField(0)
  late int id;
  
  @HiveField(1)
  late String name;
  
  @HiveField(2)
  late String type; // video, image, slider, ticker, announcement
  
  @HiveField(3)
  late String remoteUrl;
  
  @HiveField(4)
  late String? localPath; // İndirildikten sonra
  
  @HiveField(5)
  late String? checksum;
  
  @HiveField(6)
  late int durationSeconds;
  
  @HiveField(7)
  late int position;
  
  @HiveField(8)
  late String transitionType;
  
  @HiveField(9)
  late bool isDownloaded;
  
  @HiveField(10)
  late Map<String, dynamic>? metadata; // Slider slides, ticker text vb.
}

/// Zamanlama bilgileri
@HiveType(typeId: 3)
class ScheduleBox extends HiveObject {
  @HiveField(0)
  late String scheduleType; // always, date_range, daily, weekly
  
  @HiveField(1)
  late DateTime? startDate;
  
  @HiveField(2)
  late DateTime? endDate;
  
  @HiveField(3)
  late String? startTime;
  
  @HiveField(4)
  late String? endTime;
  
  @HiveField(5)
  late List<int>? daysOfWeek;
}

/// Bekleyen log kayıtları (offline'da birikir)
@HiveType(typeId: 4)
class PendingLogBox extends HiveObject {
  @HiveField(0)
  late int contentId;
  
  @HiveField(1)
  late DateTime startedAt;
  
  @HiveField(2)
  late DateTime? endedAt;
  
  @HiveField(3)
  late bool completed;
}
```

### 3.2 Dosya Yapısı

```
/storage/emulated/0/Android/data/com.magazapano.tvplayer/files/
├── videos/
│   ├── content_1.mp4
│   ├── content_2.mp4
│   └── content_3.mp4
│
├── images/
│   ├── content_4.jpg
│   ├── content_5.png
│   └── content_6.webp
│
├── thumbnails/
│   ├── thumb_1.jpg
│   ├── thumb_2.jpg
│   └── ...
│
└── hive/
    ├── device.hive
    ├── playlists.hive
    ├── contents.hive
    └── pending_logs.hive
```

---

## 4. Sync Manager

### 4.1 Senkronizasyon Servisi

```dart
// lib/services/sync_manager.dart

class SyncManager {
  final ApiClient _apiClient;
  final LocalStorage _localStorage;
  final DownloadManager _downloadManager;
  
  // Bağlantı durumu
  bool _isOnline = false;
  Timer? _connectionCheckTimer;
  Timer? _syncTimer;
  
  /// Sync başlat
  Future<void> startSync() async {
    // İlk bağlantı kontrolü
    _isOnline = await _checkConnection();
    
    if (_isOnline) {
      await _performFullSync();
    } else {
      await _loadFromLocalStorage();
    }
    
    // Periyodik kontroller
    _startConnectionMonitoring();
  }
  
  /// Tam senkronizasyon
  Future<void> _performFullSync() async {
    try {
      // 1. Playlist bilgilerini al
      final playlists = await _apiClient.getDevicePlaylists();
      
      // 2. Aktif playlist belirle
      final activePlaylist = _determineActivePlaylist(playlists);
      
      // 3. İçerik listesini al
      final contents = await _apiClient.getPlaylistContents(activePlaylist.id);
      
      // 4. Eksik içerikleri indir
      await _downloadMissingContents(contents);
      
      // 5. Yerel DB güncelle
      await _localStorage.savePlaylists(playlists);
      await _localStorage.saveContents(contents);
      await _localStorage.updateLastSyncTime(DateTime.now());
      
      // 6. Birikmiş logları gönder
      await _sendPendingLogs();
      
      print('✓ Sync tamamlandı: ${contents.length} içerik');
      
    } catch (e) {
      print('✗ Sync hatası: $e');
      // Yerel verilerle devam et
      await _loadFromLocalStorage();
    }
  }
  
  /// Eksik içerikleri indir
  Future<void> _downloadMissingContents(List<Content> contents) async {
    for (final content in contents) {
      if (!await _localStorage.isContentDownloaded(content.id)) {
        await _downloadManager.downloadContent(content);
      } else {
        // Checksum kontrolü
        final isValid = await _verifyChecksum(content);
        if (!isValid) {
          await _downloadManager.downloadContent(content);
        }
      }
    }
  }
  
  /// Bağlantı izleme
  void _startConnectionMonitoring() {
    _connectionCheckTimer = Timer.periodic(
      Duration(seconds: 30),
      (_) => _checkAndSync(),
    );
  }
  
  Future<void> _checkAndSync() async {
    final wasOffline = !_isOnline;
    _isOnline = await _checkConnection();
    
    if (_isOnline && wasOffline) {
      // Bağlantı geri geldi!
      print('📶 Bağlantı geri geldi, sync başlatılıyor...');
      await _performFullSync();
    }
  }
  
  /// Bağlantı kontrolü
  Future<bool> _checkConnection() async {
    try {
      final result = await InternetAddress.lookup('google.com');
      return result.isNotEmpty && result[0].rawAddress.isNotEmpty;
    } catch (_) {
      return false;
    }
  }
}
```

### 4.2 Download Manager

```dart
// lib/services/download_manager.dart

class DownloadManager {
  final Dio _dio;
  final LocalStorage _localStorage;
  
  // İndirme kuyruğu
  final Queue<Content> _downloadQueue = Queue();
  bool _isDownloading = false;
  
  /// İçerik indir
  Future<void> downloadContent(Content content) async {
    _downloadQueue.add(content);
    _processQueue();
  }
  
  Future<void> _processQueue() async {
    if (_isDownloading || _downloadQueue.isEmpty) return;
    
    _isDownloading = true;
    
    while (_downloadQueue.isNotEmpty) {
      final content = _downloadQueue.removeFirst();
      await _downloadSingleContent(content);
    }
    
    _isDownloading = false;
  }
  
  Future<void> _downloadSingleContent(Content content) async {
    try {
      final localPath = _getLocalPath(content);
      
      // İndirme başlat
      await _dio.download(
        content.fileUrl,
        localPath,
        onReceiveProgress: (received, total) {
          final progress = (received / total * 100).toStringAsFixed(0);
          print('📥 ${content.name}: $progress%');
        },
      );
      
      // Checksum doğrula
      final fileChecksum = await _calculateChecksum(localPath);
      if (fileChecksum != content.checksum) {
        throw Exception('Checksum mismatch');
      }
      
      // Yerel DB güncelle
      await _localStorage.markContentDownloaded(
        content.id,
        localPath,
      );
      
      print('✓ İndirildi: ${content.name}');
      
    } catch (e) {
      print('✗ İndirme hatası (${content.name}): $e');
      // Yeniden deneme kuyruğuna ekle
      _downloadQueue.add(content);
    }
  }
  
  String _getLocalPath(Content content) {
    final dir = content.type == 'video' ? 'videos' : 'images';
    final ext = content.fileUrl.split('.').last;
    return '${_localStorage.basePath}/$dir/content_${content.id}.$ext';
  }
}
```

---

## 5. Player Engine

### 5.1 Offline Player

```dart
// lib/player/offline_player.dart

class OfflinePlayer {
  final LocalStorage _localStorage;
  
  PlaylistBox? _currentPlaylist;
  int _currentIndex = 0;
  Timer? _contentTimer;
  
  /// Oynatmayı başlat
  Future<void> startPlayback() async {
    // Aktif playlist yükle
    _currentPlaylist = await _localStorage.getActivePlaylist();
    
    if (_currentPlaylist == null || _currentPlaylist!.contents.isEmpty) {
      _showNoContentScreen();
      return;
    }
    
    // İlk içerikten başla
    _currentIndex = 0;
    await _playCurrentContent();
  }
  
  /// Mevcut içeriği oynat
  Future<void> _playCurrentContent() async {
    final content = _currentPlaylist!.contents[_currentIndex];
    
    // Dosya kontrolü
    if (!content.isDownloaded || content.localPath == null) {
      print('⚠️ İçerik bulunamadı, sonrakine geç: ${content.name}');
      _playNext();
      return;
    }
    
    // İçerik tipine göre oynat
    switch (content.type) {
      case 'video':
        await _playVideo(content);
        break;
      case 'image':
        await _showImage(content);
        break;
      case 'slider':
        await _playSlider(content);
        break;
      case 'ticker':
        _showTicker(content);
        _playNext(); // Ticker arka planda kalır
        break;
      case 'announcement':
        await _showAnnouncement(content);
        break;
    }
    
    // Log kaydet (offline'da birikir)
    await _logPlayback(content);
  }
  
  /// Video oynat
  Future<void> _playVideo(ContentBox content) async {
    final file = File(content.localPath!);
    
    if (!await file.exists()) {
      _playNext();
      return;
    }
    
    // Video player ile oynat
    await _videoController.setFile(file);
    await _videoController.play();
    
    // Video bittiğinde sonrakine geç
    _videoController.addListener(() {
      if (_videoController.value.isCompleted) {
        _playNext();
      }
    });
  }
  
  /// Görsel göster
  Future<void> _showImage(ContentBox content) async {
    final file = File(content.localPath!);
    
    if (!await file.exists()) {
      _playNext();
      return;
    }
    
    // Görseli göster
    _imageWidget = Image.file(file, fit: BoxFit.cover);
    
    // Süre sonunda geç
    _contentTimer = Timer(
      Duration(seconds: content.durationSeconds),
      _playNext,
    );
  }
  
  /// Sonraki içerik
  void _playNext() {
    _contentTimer?.cancel();
    
    _currentIndex++;
    if (_currentIndex >= _currentPlaylist!.contents.length) {
      _currentIndex = 0; // Döngü
    }
    
    _playCurrentContent();
  }
  
  /// Playback log (offline birikir)
  Future<void> _logPlayback(ContentBox content) async {
    await _localStorage.addPendingLog(PendingLogBox()
      ..contentId = content.id
      ..startedAt = DateTime.now()
      ..completed = true
    );
  }
}
```

---

## 6. Offline Durum Göstergeleri

### 6.1 UI Göstergeleri

```
ONLINE MOD
┌─────────────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                         │ │
│ │                          İÇERİK OYNATILIYOR                             │ │
│ │                                                                         │ │
│ │                                                                         │ │
│ │                                                                         │ │
│ │                                                                         │ │
│ │                                                                         │ │
│ │                                                                         │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                              📶 ● ONLINE   │
└─────────────────────────────────────────────────────────────────────────────┘

OFFLINE MOD
┌─────────────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                         │ │
│ │                          İÇERİK OYNATILIYOR                             │ │
│ │                                                                         │ │
│ │                                                                         │ │
│ │                                                                         │ │
│ │                                                                         │ │
│ │                                                                         │ │
│ │                                                                         │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                    📴 ○ OFFLINE (2 saat)   │
└─────────────────────────────────────────────────────────────────────────────┘

SYNC DURUMU
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                              🔄 Senkronize Ediliyor...                      │
│                                                                              │
│                              ████████░░░░░░░░ 55%                           │
│                                                                              │
│                         3/8 içerik indirildi                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Hata Senaryoları

### 7.1 Offline Senaryolar

| Senaryo | Davranış |
|---------|----------|
| İnternet yok, playlist var | Yerel playlist ile devam |
| İnternet yok, içerik eksik | Mevcut içeriklerle devam, eksikler atlanır |
| İnternet yok, hiç içerik yok | "Bağlantı bekleniyor" ekranı |
| İnternet geldi | Otomatik sync, yeni içerik indir |
| Dosya bozuk | Checksum hatası, yeniden indir |
| Depolama dolu | Eski içerikleri sil, uyarı göster |

### 7.2 Recovery Mekanizması

```dart
class RecoveryManager {
  
  /// Uygulama çökmesinden kurtarma
  Future<void> recover() async {
    // 1. Son durumu kontrol et
    final lastState = await _localStorage.getLastState();
    
    // 2. Yarım kalan indirmeleri temizle
    await _cleanIncompleteDownloads();
    
    // 3. Bozuk dosyaları tespit et
    await _verifyAllContents();
    
    // 4. Oynatmayı kaldığı yerden devam ettir
    await _resumePlayback(lastState);
  }
  
  /// Tüm içerikleri doğrula
  Future<void> _verifyAllContents() async {
    final contents = await _localStorage.getAllContents();
    
    for (final content in contents) {
      if (content.localPath != null) {
        final file = File(content.localPath!);
        
        if (!await file.exists()) {
          // Dosya kaybolmuş, yeniden indir flag'i
          content.isDownloaded = false;
          await content.save();
        } else {
          // Checksum kontrolü
          final isValid = await _verifyChecksum(content);
          if (!isValid) {
            content.isDownloaded = false;
            await content.save();
          }
        }
      }
    }
  }
}
```

---

## 8. Depolama Yönetimi

### 8.1 Disk Alanı Kontrolü

```dart
class StorageManager {
  static const int MIN_FREE_SPACE_MB = 500; // Minimum boş alan
  static const int MAX_CACHE_SIZE_GB = 5;   // Maksimum cache
  
  /// Disk alanı kontrolü
  Future<StorageInfo> checkStorage() async {
    final stat = await getExternalStorageDirectory();
    final freeSpace = await _getFreeSpace(stat!.path);
    final usedSpace = await _getCacheSize();
    
    return StorageInfo(
      freeSpaceMb: freeSpace ~/ (1024 * 1024),
      usedSpaceMb: usedSpace ~/ (1024 * 1024),
      isLow: freeSpace < MIN_FREE_SPACE_MB * 1024 * 1024,
    );
  }
  
  /// Eski içerikleri temizle
  Future<void> cleanOldContents() async {
    final contents = await _localStorage.getAllContents();
    
    // Playlistlerde olmayan içerikleri bul
    final activePlaylists = await _localStorage.getActivePlaylists();
    final activeContentIds = activePlaylists
        .expand((p) => p.contents.map((c) => c.id))
        .toSet();
    
    for (final content in contents) {
      if (!activeContentIds.contains(content.id)) {
        // Bu içerik artık kullanılmıyor, sil
        if (content.localPath != null) {
          final file = File(content.localPath!);
          if (await file.exists()) {
            await file.delete();
          }
        }
        await content.delete();
      }
    }
  }
}
```

---

## 9. API Endpoint'leri (Offline için)

### 9.1 Playlist Sync

```http
GET /api/player/sync
Headers:
  X-Device-Token: <device_token>
  X-Last-Sync: <timestamp>

Response:
{
  "success": true,
  "data": {
    "playlists": [...],
    "contents": [...],
    "schedules": [...],
    "has_changes": true,
    "server_time": "2025-12-24T15:00:00Z"
  }
}
```

### 9.2 Bulk Log Upload

```http
POST /api/player/logs/bulk
Headers:
  X-Device-Token: <device_token>

Body:
{
  "logs": [
    {
      "content_id": 1,
      "started_at": "2025-12-24T14:00:00Z",
      "ended_at": "2025-12-24T14:00:30Z",
      "completed": true
    },
    ...
  ]
}
```

---

*Son Güncelleme: 24 Aralık 2025*
