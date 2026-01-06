# 🖥️ Admin Panel - Uzaktan Ekran Kontrolü API Dokümantasyonu

Bu dokümantasyon, admin panelden Android cihazları uzaktan izleme ve kontrol etme için gereken backend API'lerini açıklar.

## 📋 Genel Bakış

Android uygulaması ekran görüntülerini (frame) backend'e gönderir, admin panel bu frame'leri alarak canlı izleme yapar.

```
Android Cihaz → POST /api/devices/screen-frame → Backend → WebSocket → Admin Panel
Admin Panel → WebSocket → Backend → socket.emit('screen:start') → Android Cihaz
```

---

## 🔐 1. Backend Endpoint'leri

### 1.1 Ekran Frame Alma (Cihazdan)

**Endpoint:** `POST /api/devices/screen-frame`
**Yetki:** Device Token (Bearer)
**Frekans:** Her 500ms (2 FPS)

```bash
curl -X POST "https://mtapi.magazatakip.com.tr/api/devices/screen-frame" \
  -H "Authorization: Bearer <DEVICE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "device_code": "MALTEPE-001",
    "frame": "<BASE64_JPEG_IMAGE>",
    "width": 540,
    "height": 960,
    "timestamp": 1704556800000
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Frame alındı"
}
```

### 1.2 Canlı Ekran İzleme (Admin Panel)

**WebSocket Event:** `screen:frame`
**Yön:** Server → Admin Panel

```javascript
// Admin Panel (JavaScript)
socket.on('screen:frame', (data) => {
  const { device_code, frame, width, height, timestamp } = data;

  // Base64 görüntüyü canvas'a çiz
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
  img.src = `data:image/jpeg;base64,${frame}`;
});
```

### 1.3 Ekran Paylaşımı Başlat (Admin Panel → Cihaz)

**WebSocket Event:** `screen:start`
**Yön:** Admin Panel → Server → Cihaz

```javascript
// Admin Panel
socket.emit('screen:start', { device_code: 'MALTEPE-001' });
```

**Backend işlemi:**
```javascript
// Backend Socket Handler
socket.on('screen:start', async (data) => {
  const { device_code } = data;

  // Cihazın socket'ini bul ve komutu ilet
  const deviceSocket = findDeviceSocket(device_code);
  if (deviceSocket) {
    deviceSocket.emit('screen:start');
  }
});
```

### 1.4 Ekran Paylaşımı Durdur

**WebSocket Event:** `screen:stop`

```javascript
// Admin Panel
socket.emit('screen:stop', { device_code: 'MALTEPE-001' });
```

---

## 🗄️ 2. Backend Database Tabloları

### 2.1 screen_sessions Tablosu

```sql
CREATE TABLE screen_sessions (
  id SERIAL PRIMARY KEY,
  device_id INTEGER REFERENCES devices(id),
  admin_user_id INTEGER REFERENCES users(id),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active', -- active, ended
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 screen_frames Tablosu (Opsiyonel - Kayıt için)

```sql
-- Canlı izleme için gerekli değil, sadece kayıt tutmak isterseniz
CREATE TABLE screen_frames (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES screen_sessions(id),
  frame_data TEXT, -- Base64 veya S3 URL
  width INTEGER,
  height INTEGER,
  captured_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Frame'leri 24 saat sonra sil (disk tasarrufu)
CREATE INDEX idx_frames_created ON screen_frames(created_at);
```

---

## 🔧 3. Backend Controller (Node.js/Express Örneği)

```javascript
// controllers/screenController.js

const activeFrames = new Map(); // device_code -> { frame, timestamp }

/**
 * POST /api/devices/screen-frame
 * Android cihazdan frame al
 */
exports.receiveFrame = async (req, res) => {
  try {
    const { device_code, frame, width, height, timestamp } = req.body;

    if (!device_code || !frame) {
      return res.status(400).json({ success: false, message: 'Eksik parametreler' });
    }

    // Frame'i geçici olarak sakla (memory)
    activeFrames.set(device_code, { frame, width, height, timestamp });

    // Admin panele WebSocket ile ilet
    const io = req.app.get('io');
    io.to(`admin:${device_code}`).emit('screen:frame', {
      device_code,
      frame,
      width,
      height,
      timestamp
    });

    res.json({ success: true, message: 'Frame alındı' });

  } catch (error) {
    console.error('Frame alma hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

/**
 * GET /api/devices/:device_code/screen
 * Son frame'i al (polling alternatifi)
 */
exports.getLatestFrame = async (req, res) => {
  try {
    const { device_code } = req.params;
    const frameData = activeFrames.get(device_code);

    if (!frameData) {
      return res.status(404).json({ success: false, message: 'Frame bulunamadı' });
    }

    res.json({ success: true, data: frameData });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};
```

---

## 🔌 4. Backend Socket Handler

```javascript
// socket/screenHandler.js

module.exports = (io) => {
  io.on('connection', (socket) => {
    const { token, device_code, is_admin } = socket.handshake.auth;

    // Admin panel bağlantısı
    if (is_admin) {
      // Admin'i cihaz odasına ekle
      socket.on('screen:watch', (data) => {
        const { device_code } = data;
        socket.join(`admin:${device_code}`);
        console.log(`Admin ${socket.id} ${device_code} izlemeye başladı`);
      });

      socket.on('screen:unwatch', (data) => {
        const { device_code } = data;
        socket.leave(`admin:${device_code}`);
      });

      // Ekran paylaşımı başlat komutu
      socket.on('screen:start', (data) => {
        const { device_code } = data;
        const deviceSocket = findDeviceSocket(io, device_code);
        if (deviceSocket) {
          deviceSocket.emit('screen:start');
          console.log(`${device_code} cihazına ekran paylaşımı başlat komutu gönderildi`);
        }
      });

      // Ekran paylaşımı durdur komutu
      socket.on('screen:stop', (data) => {
        const { device_code } = data;
        const deviceSocket = findDeviceSocket(io, device_code);
        if (deviceSocket) {
          deviceSocket.emit('screen:stop');
        }
      });
    }

    // Cihaz bağlantısı
    if (device_code && !is_admin) {
      socket.join(`device:${device_code}`);
      socket.device_code = device_code;
    }
  });
};

function findDeviceSocket(io, device_code) {
  const sockets = io.sockets.sockets;
  for (const [id, socket] of sockets) {
    if (socket.device_code === device_code) {
      return socket;
    }
  }
  return null;
}
```

---

## 🖥️ 5. Admin Panel (React/Vue) Örneği

```jsx
// components/DeviceScreenViewer.jsx

import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const DeviceScreenViewer = ({ deviceCode, adminToken }) => {
  const canvasRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Admin socket bağlantısı
    socketRef.current = io('https://mtapi.magazatakip.com.tr', {
      auth: { token: adminToken, is_admin: true }
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      // Cihazı izlemeye başla
      socketRef.current.emit('screen:watch', { device_code: deviceCode });
    });

    // Frame'leri al ve canvas'a çiz
    socketRef.current.on('screen:frame', (data) => {
      if (data.device_code !== deviceCode) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.onload = () => {
        // Canvas boyutunu ayarla (ilk frame'de)
        if (canvas.width !== data.width || canvas.height !== data.height) {
          canvas.width = data.width;
          canvas.height = data.height;
        }
        ctx.drawImage(img, 0, 0);
      };
      img.src = `data:image/jpeg;base64,${data.frame}`;
    });

    return () => {
      socketRef.current?.emit('screen:unwatch', { device_code: deviceCode });
      socketRef.current?.disconnect();
    };
  }, [deviceCode, adminToken]);

  const startScreenShare = () => {
    socketRef.current?.emit('screen:start', { device_code: deviceCode });
    setIsSharing(true);
  };

  const stopScreenShare = () => {
    socketRef.current?.emit('screen:stop', { device_code: deviceCode });
    setIsSharing(false);
  };

  return (
    <div className="screen-viewer">
      <div className="controls">
        <span className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢 Bağlı' : '🔴 Bağlantı yok'}
        </span>

        {!isSharing ? (
          <button onClick={startScreenShare} disabled={!isConnected}>
            ▶️ Ekran Paylaşımı Başlat
          </button>
        ) : (
          <button onClick={stopScreenShare} className="stop">
            ⏹️ Durdur
          </button>
        )}
      </div>

      <div className="screen-container">
        <canvas ref={canvasRef} style={{ maxWidth: '100%', border: '1px solid #333' }} />

        {!isSharing && (
          <div className="overlay">
            <p>Ekran paylaşımı başlatmak için butona tıklayın</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceScreenViewer;
```

---

## 📱 6. Android Tarafı (Hazır)

Android uygulamasında aşağıdaki dosyalar oluşturuldu:

| Dosya | Açıklama |
|-------|----------|
| `ScreenShareService.kt` | Ekran yakalama ve backend'e gönderme |
| `ScreenCaptureActivity.kt` | MediaProjection izni alma |
| `ScreenShareModule.kt` | React Native native modül |
| `ScreenSharePackage.kt` | RN package tanımı |
| `ScreenShareService.ts` | TypeScript wrapper |

**Çalışma akışı:**
1. Admin panel → WebSocket `screen:start` → Backend → Cihaz socket
2. Cihaz → `ScreenCaptureActivity` → Kullanıcı izin verir
3. Cihaz → `ScreenShareService` → Her 500ms frame yakalar
4. Cihaz → POST `/api/devices/screen-frame` → Backend
5. Backend → WebSocket `screen:frame` → Admin panel canvas

---

## ⚙️ 7. Konfigürasyon

### 7.1 Frame Ayarları (Android)

```kotlin
// ScreenShareService.kt
private const val FRAME_INTERVAL_MS = 500L  // 2 FPS (düşük bant genişliği)
private const val QUALITY = 50              // JPEG kalitesi (0-100)
private const val SCALE_FACTOR = 0.5f       // Yarı çözünürlük
```

### 7.2 Bant Genişliği Hesabı

- Çözünürlük: 540x960 (yarı HD, dikey)
- JPEG kalitesi: 50%
- Yaklaşık frame boyutu: ~30-50 KB
- FPS: 2
- Bant genişliği: ~60-100 KB/s (~0.5-0.8 Mbps)

---

## 🔒 8. Güvenlik Önlemleri

1. **Token doğrulama**: Her frame isteğinde device token kontrolü
2. **Admin yetki kontrolü**: Sadece yetkili admin'ler izleyebilir
3. **Session logging**: Kim, ne zaman, hangi cihazı izledi kaydı
4. **Rate limiting**: Frame endpoint'ine rate limit (10 req/s)
5. **Otomatik timeout**: 5 dakika aktivite yoksa paylaşım durur

---

## ✅ Backend Checklist

- [ ] `POST /api/devices/screen-frame` endpoint'i oluştur
- [ ] `GET /api/devices/:device_code/screen` endpoint'i (opsiyonel)
- [ ] Socket.io `screen:start`, `screen:stop` event handler'ları
- [ ] Socket.io `screen:frame` event emitter (admin panele)
- [ ] Admin panel için `screen:watch`, `screen:unwatch` event'leri
- [ ] `screen_sessions` tablosu (opsiyonel, loglama için)
- [ ] Rate limiting middleware
- [ ] Admin yetki kontrolü

---

## 🚀 Hızlı Başlangıç

### Backend'e eklenecek minimum kod:

```javascript
// routes/devices.js
router.post('/screen-frame', authMiddleware, screenController.receiveFrame);

// socket/index.js
require('./screenHandler')(io);
```

### Test:
1. Android uygulamasını çalıştır
2. Admin panelden "Ekran Paylaşımı Başlat" tıkla
3. Cihazda izin ver
4. Admin panelde canlı ekran görüntüsü

---

**Son Güncelleme:** 6 Ocak 2026

