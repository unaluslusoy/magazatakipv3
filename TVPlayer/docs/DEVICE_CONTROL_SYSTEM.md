# 📱 Mağaza Pano - Cihaz Kontrol Sistemi

**Versiyon:** 1.0.0
**Son Güncelleme:** 6 Ocak 2026

---

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Backend API](#backend-api)
3. [Frontend (Admin Panel)](#frontend-admin-panel)
4. [WebSocket Entegrasyonu](#websocket-entegrasyonu)
5. [Kullanım Senaryoları](#kullanım-senaryoları)

---

## 🎯 Genel Bakış

Bu sistem, admin panelden Android tablet/TV cihazlarını uzaktan yönetmenizi sağlar.

### Mimari Diyagram

```
┌─────────────────────┐         ┌─────────────────────┐         ┌─────────────────────┐
│                     │         │                     │         │                     │
│    Admin Panel      │◄───────►│    Backend API      │◄───────►│   Android Cihaz     │
│    (React/Vue)      │   WS    │    (Node.js)        │   WS    │   (React Native)    │
│                     │         │                     │         │                     │
└─────────────────────┘         └─────────────────────┘         └─────────────────────┘
         │                              │                               │
         │         REST API             │         REST API              │
         └──────────────────────────────┴───────────────────────────────┘
```

### Özellikler

- ✅ Gerçek zamanlı cihaz durumu izleme
- ✅ Uzaktan komut gönderme
- ✅ Ekran görüntüsü alma
- ✅ Ayar senkronizasyonu
- ✅ Playlist yönetimi
- ✅ İçerik güncelleme

---

## 🔧 Backend API

### Base URL
```
https://mtapi.magazatakip.com.tr/api
```

### Authentication
Tüm isteklerde JWT token gereklidir:
```
Authorization: Bearer <token>
```

---

### 📡 Cihaz Yönetim Endpoints

#### 1. Tüm Cihazları Listele

```http
GET /api/devices
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "device_code": "TV-001",
        "device_name": "Mağaza Giriş Ekranı",
        "store_id": 1,
        "store_name": "Merkez Mağaza",
        "status": "online",
        "last_heartbeat": "2026-01-06T10:30:00Z",
        "current_playlist_id": 8,
        "app_version": "1.0.0",
        "os_version": "Android 12",
        "screen_resolution": "1920x1080",
        "orientation": "portrait",
        "is_connected": true
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 20
    }
  }
}
```

---

#### 2. Cihaz Detayı

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
    "device_name": "Mağaza Giriş Ekranı",
    "store_id": 1,
    "status": "online",
    "last_heartbeat": "2026-01-06T10:30:00Z",
    "current_playlist_id": 8,
    "current_content_id": 15,
    "settings": {
      "ticker_duration": 10,
      "ticker_speed": 50,
      "brightness": 100,
      "volume": 80,
      "auto_restart": true,
      "restart_time": "03:00"
    },
    "system_info": {
      "app_version": "1.0.0",
      "os_version": "Android 12",
      "screen_resolution": "1920x1080",
      "free_storage_mb": 2048,
      "ip_address": "192.168.1.100"
    }
  }
}
```

---

#### 3. Cihaza Komut Gönder

```http
POST /api/devices/:id/command
```

**Request Body:**
```json
{
  "command": "REFRESH_CONTENT",
  "params": {}
}
```

**Desteklenen Komutlar:**

| Komut | Açıklama | Parametreler |
|-------|----------|--------------|
| `REFRESH_CONTENT` | İçeriği yenile | - |
| `RESTART_APP` | Uygulamayı yeniden başlat | - |
| `REBOOT_DEVICE` | Cihazı yeniden başlat | - |
| `UPDATE_SETTINGS` | Ayarları güncelle | `settings: {}` |
| `CHANGE_PLAYLIST` | Playlist değiştir | `playlist_id: number` |
| `SHOW_MESSAGE` | Ekranda mesaj göster | `message: string, duration: number` |
| `GET_SCREENSHOT` | Ekran görüntüsü al | - |
| `CLEAR_CACHE` | Önbelleği temizle | - |
| `SYNC_NOW` | Hemen senkronize et | - |

**Response:**
```json
{
  "success": true,
  "message": "Komut gönderildi",
  "data": {
    "command_id": "cmd_abc123",
    "status": "sent",
    "sent_at": "2026-01-06T10:35:00Z"
  }
}
```

---

#### 4. Cihaz Ayarlarını Güncelle

```http
PUT /api/devices/:id/settings
```

**Request Body:**
```json
{
  "ticker_duration": 8,
  "ticker_speed": 60,
  "brightness": 90,
  "volume": 70,
  "orientation": "portrait",
  "auto_restart": true,
  "restart_time": "04:00"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ayarlar güncellendi",
  "data": {
    "device_id": 1,
    "settings": {
      "ticker_duration": 8,
      "ticker_speed": 60,
      "brightness": 90,
      "volume": 70
    },
    "synced": true
  }
}
```

---

#### 5. Ekran Görüntüsü Al

```http
GET /api/devices/:id/screenshot
```

**Response:**
```json
{
  "success": true,
  "data": {
    "screenshot_url": "https://mtapi.magazatakip.com.tr/screenshots/device_1_20260106_103500.jpg",
    "captured_at": "2026-01-06T10:35:00Z",
    "resolution": "1920x1080"
  }
}
```

---

#### 6. Cihaz Loglarını Al

```http
GET /api/devices/:id/logs?limit=100&level=error
```

**Query Params:**
- `limit`: Kayıt sayısı (default: 50)
- `level`: Log seviyesi (info, warn, error)
- `start_date`: Başlangıç tarihi
- `end_date`: Bitiş tarihi

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": 1,
        "level": "error",
        "message": "Socket connection failed",
        "data": {"error": "timeout"},
        "created_at": "2026-01-06T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 100
    }
  }
}
```

---

#### 7. Playlist Ata

```http
PUT /api/devices/:id/playlist
```

**Request Body:**
```json
{
  "playlist_id": 10
}
```

**Response:**
```json
{
  "success": true,
  "message": "Playlist atandı",
  "data": {
    "device_id": 1,
    "playlist_id": 10,
    "playlist_name": "Yılbaşı Kampanyası",
    "synced": true
  }
}
```

---

### 📊 İstatistik Endpoints

#### Cihaz İstatistikleri

```http
GET /api/devices/:id/stats?period=7d
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uptime_percentage": 99.5,
    "total_content_plays": 1500,
    "average_session_duration": 86400,
    "error_count": 3,
    "last_7_days": [
      {"date": "2026-01-05", "uptime": 100, "plays": 220},
      {"date": "2026-01-04", "uptime": 98, "plays": 210}
    ]
  }
}
```

---

## 🖥️ Frontend (Admin Panel)

### Cihaz Yönetim Sayfası Bileşenleri

#### 1. Cihaz Listesi Görünümü

```jsx
// DeviceList.jsx
import React, { useState, useEffect } from 'react';
import { getDevices } from '../api/deviceApi';

const DeviceList = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await getDevices();
      setDevices(response.data.items);
    } catch (error) {
      console.error('Cihazlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'green';
      case 'offline': return 'red';
      case 'maintenance': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <div className="device-list">
      <h2>Cihazlar</h2>
      <table>
        <thead>
          <tr>
            <th>Cihaz Adı</th>
            <th>Mağaza</th>
            <th>Durum</th>
            <th>Son Bağlantı</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {devices.map(device => (
            <tr key={device.id}>
              <td>{device.device_name}</td>
              <td>{device.store_name}</td>
              <td>
                <span style={{color: getStatusColor(device.status)}}>
                  ● {device.status}
                </span>
              </td>
              <td>{new Date(device.last_heartbeat).toLocaleString('tr-TR')}</td>
              <td>
                <button onClick={() => openDevicePanel(device.id)}>
                  Yönet
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

#### 2. Cihaz Kontrol Paneli

```jsx
// DeviceControlPanel.jsx
import React, { useState, useEffect } from 'react';
import {
  getDevice,
  sendCommand,
  updateSettings,
  getScreenshot
} from '../api/deviceApi';

const DeviceControlPanel = ({ deviceId }) => {
  const [device, setDevice] = useState(null);
  const [settings, setSettings] = useState({});
  const [screenshot, setScreenshot] = useState(null);

  useEffect(() => {
    fetchDevice();
  }, [deviceId]);

  const fetchDevice = async () => {
    const response = await getDevice(deviceId);
    setDevice(response.data);
    setSettings(response.data.settings);
  };

  // Komut Gönder
  const handleCommand = async (command, params = {}) => {
    try {
      await sendCommand(deviceId, { command, params });
      alert('Komut gönderildi!');
    } catch (error) {
      alert('Komut gönderilemedi: ' + error.message);
    }
  };

  // Ayarları Kaydet
  const handleSaveSettings = async () => {
    try {
      await updateSettings(deviceId, settings);
      alert('Ayarlar kaydedildi!');
    } catch (error) {
      alert('Ayarlar kaydedilemedi: ' + error.message);
    }
  };

  // Ekran Görüntüsü Al
  const handleScreenshot = async () => {
    const response = await getScreenshot(deviceId);
    setScreenshot(response.data.screenshot_url);
  };

  if (!device) return <div>Yükleniyor...</div>;

  return (
    <div className="device-control-panel">
      {/* Cihaz Bilgileri */}
      <section className="device-info">
        <h3>{device.device_name}</h3>
        <p>Kod: {device.device_code}</p>
        <p>Durum: <span className={device.status}>{device.status}</span></p>
        <p>Versiyon: {device.system_info.app_version}</p>
      </section>

      {/* Hızlı Komutlar */}
      <section className="quick-commands">
        <h4>Hızlı Komutlar</h4>
        <div className="button-group">
          <button onClick={() => handleCommand('REFRESH_CONTENT')}>
            🔄 İçeriği Yenile
          </button>
          <button onClick={() => handleCommand('RESTART_APP')}>
            🔁 Uygulamayı Yeniden Başlat
          </button>
          <button onClick={() => handleCommand('SYNC_NOW')}>
            📥 Şimdi Senkronize Et
          </button>
          <button onClick={() => handleCommand('CLEAR_CACHE')}>
            🗑️ Önbelleği Temizle
          </button>
          <button onClick={handleScreenshot}>
            📸 Ekran Görüntüsü Al
          </button>
        </div>
      </section>

      {/* Ekran Görüntüsü */}
      {screenshot && (
        <section className="screenshot">
          <h4>Ekran Görüntüsü</h4>
          <img src={screenshot} alt="Cihaz Ekranı" />
        </section>
      )}

      {/* Ayarlar */}
      <section className="settings">
        <h4>Cihaz Ayarları</h4>

        <div className="setting-item">
          <label>Ticker Süresi (saniye)</label>
          <input
            type="number"
            value={settings.ticker_duration}
            onChange={(e) => setSettings({
              ...settings,
              ticker_duration: parseInt(e.target.value)
            })}
          />
        </div>

        <div className="setting-item">
          <label>Ticker Hızı (px/sn)</label>
          <input
            type="number"
            value={settings.ticker_speed}
            onChange={(e) => setSettings({
              ...settings,
              ticker_speed: parseInt(e.target.value)
            })}
          />
        </div>

        <div className="setting-item">
          <label>Parlaklık (%)</label>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.brightness}
            onChange={(e) => setSettings({
              ...settings,
              brightness: parseInt(e.target.value)
            })}
          />
          <span>{settings.brightness}%</span>
        </div>

        <div className="setting-item">
          <label>Ses (%)</label>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.volume}
            onChange={(e) => setSettings({
              ...settings,
              volume: parseInt(e.target.value)
            })}
          />
          <span>{settings.volume}%</span>
        </div>

        <button className="save-btn" onClick={handleSaveSettings}>
          💾 Ayarları Kaydet
        </button>
      </section>

      {/* Playlist Atama */}
      <section className="playlist-assign">
        <h4>Playlist Yönetimi</h4>
        <select
          value={device.current_playlist_id}
          onChange={(e) => handleCommand('CHANGE_PLAYLIST', {
            playlist_id: parseInt(e.target.value)
          })}
        >
          {/* Playlist listesi API'den gelecek */}
        </select>
      </section>
    </div>
  );
};
```

---

#### 3. API Service

```javascript
// api/deviceApi.js
import axios from 'axios';

const API_URL = 'https://mtapi.magazatakip.com.tr/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Cihaz API fonksiyonları
export const getDevices = (params) => {
  return api.get('/devices', { params });
};

export const getDevice = (id) => {
  return api.get(`/devices/${id}`);
};

export const sendCommand = (deviceId, command) => {
  return api.post(`/devices/${deviceId}/command`, command);
};

export const updateSettings = (deviceId, settings) => {
  return api.put(`/devices/${deviceId}/settings`, settings);
};

export const getScreenshot = (deviceId) => {
  return api.get(`/devices/${deviceId}/screenshot`);
};

export const getDeviceLogs = (deviceId, params) => {
  return api.get(`/devices/${deviceId}/logs`, { params });
};

export const assignPlaylist = (deviceId, playlistId) => {
  return api.put(`/devices/${deviceId}/playlist`, { playlist_id: playlistId });
};

export const getDeviceStats = (deviceId, period) => {
  return api.get(`/devices/${deviceId}/stats`, { params: { period } });
};
```

---

## 🔌 WebSocket Entegrasyonu

### Backend WebSocket Server

Backend'de şu WebSocket event'lerini dinlemeniz ve göndermeniz gerekiyor:

#### Cihaza Gönderilecek Event'ler (Server → Device)

| Event | Açıklama | Data |
|-------|----------|------|
| `command:receive` | Cihaza komut gönder | `{ command: string, params: object }` |
| `settings:sync` | Ayarları senkronize et | `{ ticker_duration, ticker_speed, ... }` |
| `device:info_request` | Cihaz bilgisi iste | - |
| `device:screenshot_request` | Ekran görüntüsü iste | - |
| `playlist:updated` | Playlist güncellendi | `{ playlist_id: number }` |
| `content:updated` | İçerik güncellendi | `{ content_id: number }` |
| `reload` | Uygulamayı yeniden başlat | - |

#### Cihazdan Alınacak Event'ler (Device → Server)

| Event | Açıklama | Data |
|-------|----------|------|
| `device:info` | Cihaz bilgileri | Aşağıdaki yapı |
| `device:screenshot` | Ekran görüntüsü | `{ screenshot: base64, captured_at: ISO }` |
| `command:completed` | Komut tamamlandı | `{ command, success, error? }` |
| `settings:synced` | Ayarlar uygulandı | `{ success: boolean }` |

#### Cihaz Bilgisi Yapısı (`device:info` event data)

```json
{
  "device_id": "abc123",
  "device_name": "Samsung Tab A8",
  "brand": "samsung",
  "model": "SM-T510",
  "device_type": "Tablet",

  "os": "android",
  "os_version": "12",
  "api_level": 31,
  "app_version": "1.0.7",
  "build_number": "107",

  "screen_resolution": "1920x1200",
  "screen_width": 1920,
  "screen_height": 1200,
  "pixel_ratio": 2,

  "ip_address": "192.168.1.100",
  "mac_address": "AA:BB:CC:DD:EE:FF",
  "connection_type": "wifi",
  "is_connected": true,
  "is_wifi": true,
  "wifi_ssid": "MagazaWifi",
  "signal_strength": -55,

  "total_storage_mb": 32768,
  "free_storage_mb": 15000,
  "used_storage_mb": 17768,
  "storage_percentage": 54,

  "is_tablet": true,
  "is_emulator": false,
  "battery_level": 85,
  "is_charging": true,

  "timezone": "Europe/Istanbul",
  "locale": "tr-TR",
  "uptime": 86400
}
```

```javascript
// backend/websocket/deviceHandler.js
const { Server } = require('socket.io');

const initWebSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Cihaz bağlantıları
  const deviceConnections = new Map();

  // Admin bağlantıları
  const adminConnections = new Map();

  io.on('connection', (socket) => {
    const { type, deviceId, adminId } = socket.handshake.auth;

    if (type === 'device') {
      // Cihaz bağlandı
      deviceConnections.set(deviceId, socket);

      // Adminlere bildir
      io.to('admins').emit('device:connected', { deviceId });

      socket.on('device:status', (data) => {
        // Cihaz durumu güncellendi
        io.to('admins').emit('device:status_update', {
          deviceId,
          ...data
        });
      });

      socket.on('device:screenshot', (data) => {
        // Ekran görüntüsü geldi
        io.to('admins').emit('device:screenshot', {
          deviceId,
          screenshot: data.screenshot
        });
      });

      socket.on('disconnect', () => {
        deviceConnections.delete(deviceId);
        io.to('admins').emit('device:disconnected', { deviceId });
      });

    } else if (type === 'admin') {
      // Admin bağlandı
      socket.join('admins');
      adminConnections.set(adminId, socket);

      // Admin komut gönderdi
      socket.on('command:send', ({ deviceId, command, params }) => {
        const deviceSocket = deviceConnections.get(deviceId);
        if (deviceSocket) {
          deviceSocket.emit('command:receive', { command, params });
        }
      });

      // Ayar güncelleme
      socket.on('settings:update', ({ deviceId, settings }) => {
        const deviceSocket = deviceConnections.get(deviceId);
        if (deviceSocket) {
          deviceSocket.emit('settings:sync', settings);
        }
      });

      socket.on('disconnect', () => {
        adminConnections.delete(adminId);
      });
    }
  });

  return io;
};

module.exports = { initWebSocket };
```

---

### Frontend WebSocket Client

```javascript
// frontend/services/deviceSocket.js
import { io } from 'socket.io-client';

class DeviceSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(adminId) {
    this.socket = io('wss://mtapi.magazatakip.com.tr', {
      auth: {
        type: 'admin',
        adminId,
        token: localStorage.getItem('token')
      }
    });

    this.socket.on('connect', () => {
      console.log('WebSocket bağlandı');
    });

    this.socket.on('device:connected', (data) => {
      this.notifyListeners('deviceConnected', data);
    });

    this.socket.on('device:disconnected', (data) => {
      this.notifyListeners('deviceDisconnected', data);
    });

    this.socket.on('device:status_update', (data) => {
      this.notifyListeners('statusUpdate', data);
    });

    this.socket.on('device:screenshot', (data) => {
      this.notifyListeners('screenshot', data);
    });
  }

  sendCommand(deviceId, command, params = {}) {
    this.socket.emit('command:send', { deviceId, command, params });
  }

  updateSettings(deviceId, settings) {
    this.socket.emit('settings:update', { deviceId, settings });
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  notifyListeners(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export const deviceSocket = new DeviceSocketService();
```

---

## 📋 Kullanım Senaryoları

### Senaryo 1: İçerik Güncelleme

```
1. Admin panelde cihazı seç
2. "İçeriği Yenile" butonuna tıkla
3. Backend, cihaza REFRESH_CONTENT komutu gönderir
4. Cihaz yeni içerikleri indirir
5. Cihaz durumu admin panele bildirilir
```

### Senaryo 2: Ticker Süresini Değiştirme

```
1. Admin panelde cihaz ayarlarını aç
2. Ticker süresini değiştir (örn: 10 → 5 saniye)
3. "Ayarları Kaydet" tıkla
4. Backend ayarları veritabanına kaydeder
5. WebSocket ile cihaza anlık bildirim gönderilir
6. Cihaz yeni ayarları uygular
```

### Senaryo 3: Ekran Görüntüsü Alma

```
1. Admin panelde "Ekran Görüntüsü Al" tıkla
2. Backend, cihaza GET_SCREENSHOT komutu gönderir
3. Cihaz ekran görüntüsü alır ve base64 olarak gönderir
4. Backend görüntüyü kaydeder ve URL döner
5. Admin panelde görüntü gösterilir
```

---

## 🔒 Güvenlik

### Token Doğrulama

```javascript
// Backend middleware
const authenticateDevice = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token gerekli'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.device = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Geçersiz token'
    });
  }
};
```

### Rate Limiting

```javascript
// Backend rate limiter
const rateLimit = require('express-rate-limit');

const commandLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 dakika
  max: 30, // Maksimum 30 istek
  message: {
    success: false,
    message: 'Çok fazla istek, lütfen bekleyin'
  }
});

app.use('/api/devices/:id/command', commandLimiter);
```

---

## 📝 Notlar

1. **Ticker Süresi Güncellemesi:** Ayar değişikliği anında uygulanır (WebSocket)
2. **Offline Mod:** Cihaz çevrimdışıyken komutlar kuyruğa alınır
3. **Heartbeat:** Cihazlar 60 saniyede bir durum bildirir
4. **Yeniden Bağlanma:** WebSocket koptuğunda 5 saniye sonra otomatik yeniden bağlanır

---

## 🆘 Sorun Giderme

| Sorun | Çözüm |
|-------|-------|
| Cihaz offline görünüyor | Heartbeat kontrolü yap, internet bağlantısını kontrol et |
| Ayarlar güncellenmiyor | WebSocket bağlantısını kontrol et, cihazı yeniden başlat |
| Ekran görüntüsü gelmiyor | Cihaz izinlerini kontrol et |
| Komut çalışmıyor | Token süresini kontrol et, cihazın online olduğunu doğrula |

---

**Hazırlayan:** Mağaza Pano Geliştirme Ekibi
**İletişim:** destek@magazatakip.com.tr

