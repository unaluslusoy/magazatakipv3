# ⚙️ MağazaPano - Veritabanı Yapılandırması

**Versiyon:** 1.0.0  
**Tarih:** 24 Aralık 2025

---

## 1. Neon PostgreSQL Bağlantısı

### 1.1 Bağlantı Bilgileri

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NEON POSTGRESQL                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Host:     ep-flat-haze-a92w4l8l-pooler.gwc.azure.neon.tech                │
│  Database: magaza_takip                                                     │
│  User:     neondb_owner                                                     │
│  SSL:      require (channel_binding=require)                                │
│  Region:   Azure GWC (Germany West Central)                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Connection String

```
# Pooler bağlantısı (önerilen)
postgresql://neondb_owner:npg_CmTYcM1ajG0e@ep-flat-haze-a92w4l8l-pooler.gwc.azure.neon.tech/magaza_takip?sslmode=require&channel_binding=require

# Direct bağlantısı (migration için)
postgresql://neondb_owner:npg_CmTYcM1ajG0e@ep-flat-haze-a92w4l8l.gwc.azure.neon.tech/magaza_takip?sslmode=require&channel_binding=require
```

---

## 2. Backend Yapılandırması

### 2.1 Environment Variables (.env)

```env
# =============================================================================
# MağazaPano - Backend Environment Configuration
# =============================================================================

# Node Environment
NODE_ENV=development

# Server
PORT=3000
HOST=0.0.0.0

# =============================================================================
# DATABASE (Neon PostgreSQL)
# =============================================================================
DATABASE_URL=postgresql://neondb_owner:npg_CmTYcM1ajG0e@ep-flat-haze-a92w4l8l-pooler.gwc.azure.neon.tech/magaza_takip?sslmode=require&channel_binding=require

# Direct connection (migrations)
DATABASE_URL_DIRECT=postgresql://neondb_owner:npg_CmTYcM1ajG0e@ep-flat-haze-a92w4l8l.gwc.azure.neon.tech/magaza_takip?sslmode=require&channel_binding=require

# Database Pool Settings
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=10000

# =============================================================================
# REDIS (Cache & Sessions)
# =============================================================================
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_DB=0

# =============================================================================
# JWT & SECURITY
# =============================================================================
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# =============================================================================
# FILE UPLOAD
# =============================================================================
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=500MB
ALLOWED_VIDEO_TYPES=mp4,webm,mov
ALLOWED_IMAGE_TYPES=jpg,jpeg,png,gif,webp

# =============================================================================
# SOCKET.IO
# =============================================================================
SOCKET_CORS_ORIGIN=*
SOCKET_PING_INTERVAL=25000
SOCKET_PING_TIMEOUT=20000

# =============================================================================
# LOGGING
# =============================================================================
LOG_LEVEL=debug
LOG_FORMAT=dev
```

### 2.2 Sequelize Yapılandırması

```javascript
// config/database.js

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Neon self-signed cert
    },
  },
  pool: {
    min: parseInt(process.env.DB_POOL_MIN) || 2,
    max: parseInt(process.env.DB_POOL_MAX) || 10,
    idle: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
    acquire: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 10000,
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  timezone: '+03:00', // Türkiye
  define: {
    timestamps: true,
    underscored: true, // snake_case
    freezeTableName: true,
  },
});

// Bağlantı testi
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✓ PostgreSQL bağlantısı başarılı (Neon)');
  } catch (error) {
    console.error('✗ Veritabanı bağlantı hatası:', error.message);
    process.exit(1);
  }
}

module.exports = { sequelize, testConnection };
```

### 2.3 TypeORM Alternatifi

```typescript
// config/ormconfig.ts

import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  synchronize: false, // Production'da false!
  logging: process.env.NODE_ENV === 'development',
  entities: ['src/entities/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
  extra: {
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  },
};
```

---

## 3. Neon Özel Ayarları

### 3.1 Connection Pooling

Neon, PgBouncer tabanlı connection pooling kullanır:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NEON CONNECTION POOLING                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [Your App] ──► [Pooler Endpoint] ──► [Neon Compute] ──► [Storage]         │
│                                                                              │
│  Pooler Endpoint:                                                            │
│  ep-flat-haze-a92w4l8l-pooler.gwc.azure.neon.tech                          │
│                                                                              │
│  Direct Endpoint (migrations/schema changes):                               │
│  ep-flat-haze-a92w4l8l.gwc.azure.neon.tech                                  │
│                                                                              │
│  ⚠️ Pooler bağlantısında prepared statements sınırlıdır                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Auto-suspend

Neon, kullanılmadığında compute instance'ı otomatik durdurur:

```javascript
// İlk bağlantıda gecikme olabilir (cold start)
// Retry mekanizması ekleyin:

const connectWithRetry = async (maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await sequelize.authenticate();
      return true;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Bağlantı denemesi ${i + 1}/${maxRetries}...`);
      await new Promise(r => setTimeout(r, 2000)); // 2 sn bekle
    }
  }
};
```

### 3.3 Branching (Geliştirme için)

```bash
# Neon CLI ile branch oluşturma
neon branches create --name feature-playlist

# Branch bağlantısı
postgresql://neondb_owner:xxx@ep-xxx-feature-playlist.gwc.azure.neon.tech/magaza_takip
```

---

## 4. Migration Yönetimi

### 4.1 Sequelize Migrations

```javascript
// migrations/20251224000001-initial-schema.js

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // ENUM types
    await queryInterface.sequelize.query(`
      CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'editor', 'viewer');
      CREATE TYPE content_type AS ENUM ('video', 'image', 'slider', 'ticker', 'announcement');
      CREATE TYPE device_status AS ENUM ('online', 'offline', 'error', 'maintenance');
    `);
    
    // Users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      // ... diğer alanlar
    });
    
    // ... diğer tablolar
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS user_role;
      DROP TYPE IF EXISTS content_type;
      DROP TYPE IF EXISTS device_status;
    `);
  }
};
```

### 4.2 Migration Komutları

```bash
# Migration oluştur
npx sequelize-cli migration:generate --name create-devices

# Migration çalıştır (Direct endpoint kullan!)
DATABASE_URL=$DATABASE_URL_DIRECT npx sequelize-cli db:migrate

# Geri al
DATABASE_URL=$DATABASE_URL_DIRECT npx sequelize-cli db:migrate:undo

# Seed çalıştır
DATABASE_URL=$DATABASE_URL_DIRECT npx sequelize-cli db:seed:all
```

---

## 5. Güvenlik

### 5.1 Bağlantı Güvenliği

```javascript
// SSL zorunlu
dialectOptions: {
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
}

// Channel binding (Neon gereksinimi)
// Connection string'de: channel_binding=require
```

### 5.2 Şifre Yönetimi

```bash
# .env dosyasını .gitignore'a ekle
echo ".env" >> .gitignore

# Production'da environment variable kullan
export DATABASE_URL="postgresql://..."

# Şifre rotasyonu için Neon Dashboard kullanın
```

### 5.3 IP Whitelisting (Opsiyonel)

```
# Neon Dashboard > Project Settings > IP Allow List
# Production sunucu IP'lerini ekleyin
```

---

## 6. Monitoring

### 6.1 Connection Monitoring

```javascript
// Bağlantı sayısı izleme
const getConnectionCount = async () => {
  const [result] = await sequelize.query(`
    SELECT count(*) as count 
    FROM pg_stat_activity 
    WHERE datname = 'magaza_takip'
  `);
  return result[0].count;
};

// Health check endpoint
app.get('/health/db', async (req, res) => {
  try {
    await sequelize.query('SELECT 1');
    const connections = await getConnectionCount();
    res.json({ 
      status: 'healthy', 
      connections,
      pool: sequelize.connectionManager.pool.size 
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      error: error.message 
    });
  }
});
```

### 6.2 Query Logging

```javascript
// Yavaş query'leri logla
const queryLogger = (query, time) => {
  if (time > 1000) { // 1 saniyeden uzun
    console.warn(`⚠️ Yavaş query (${time}ms):`, query);
  }
};

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: (query, time) => queryLogger(query, time),
  benchmark: true,
});
```

---

## 7. Backup & Recovery

### 7.1 Neon Otomatik Backup

```
Neon otomatik olarak:
- Point-in-time recovery (PITR) destekler
- 7 gün geriye dönüş (Free tier)
- 30 gün geriye dönüş (Pro tier)
```

### 7.2 Manuel Export

```bash
# pg_dump ile export
PGPASSWORD=npg_CmTYcM1ajG0e pg_dump \
  -h ep-flat-haze-a92w4l8l.gwc.azure.neon.tech \
  -U neondb_owner \
  -d magaza_takip \
  -F c \
  -f backup_$(date +%Y%m%d).dump

# Restore
pg_restore -d magaza_takip backup_20251224.dump
```

---

## 8. Performance Tips

### 8.1 Query Optimizasyonu

```sql
-- Index'leri kontrol et
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'contents';

-- Yavaş query'leri bul
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### 8.2 Bağlantı Yönetimi

```javascript
// Bağlantıları düzgün kapat
process.on('SIGTERM', async () => {
  console.log('Bağlantılar kapatılıyor...');
  await sequelize.close();
  process.exit(0);
});

// Transaction kullan
await sequelize.transaction(async (t) => {
  await Content.create({ ... }, { transaction: t });
  await PlaylistContent.create({ ... }, { transaction: t });
});
```

---

*Son Güncelleme: 24 Aralık 2025*
