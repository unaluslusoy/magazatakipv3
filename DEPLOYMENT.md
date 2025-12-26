# 🚀 MağazaPano Sunucu Kurulum Kılavuzu

## 📋 İçindekiler
1. [Sistem Gereksinimleri](#sistem-gereksinimleri)
2. [Hızlı Başlangıç](#hızlı-başlangıç)
3. [Manuel Kurulum](#manuel-kurulum)
4. [Production Deployment](#production-deployment)
5. [Veritabanı Kurulumu](#veritabanı-kurulumu)
6. [Sorun Giderme](#sorun-giderme)

---

## 🖥️ Sistem Gereksinimleri

### Minimum Gereksinimler
- **İşletim Sistemi:** Windows Server 2019+, Ubuntu 20.04+, CentOS 8+
- **Node.js:** v18.0.0 veya üzeri
- **npm:** v9.0.0 veya üzeri
- **PostgreSQL:** v14 veya üzeri (veya Docker)
- **RAM:** Minimum 2GB, Önerilen 4GB+
- **Disk:** 10GB boş alan

### Önerilen Araçlar
- **PM2:** Production process management
- **Nginx:** Reverse proxy (opsiyonel)
- **Git:** Versiyon kontrolü

---

## ⚡ Hızlı Başlangıç

### Otomatik Kurulum (Windows)

```powershell
# 1. Dosyaları sunucuya yükleyin

# 2. Otomatik kontrol ve kurulum
.\deploy-check.ps1 -Install

# 3. .env dosyasını düzenleyin
notepad backend\.env

# 4. Veritabanını oluşturun
cd backend
npm run migrate

# 5. Sunucuları başlatın
npm run dev
```

### Otomatik Kurulum (Linux/Mac)

```bash
# 1. Kurulum scriptini çalıştırın
chmod +x deploy.sh
./deploy.sh --install

# 2. .env dosyasını düzenleyin
nano backend/.env

# 3. Veritabanını oluşturun
cd backend
npm run migrate

# 4. Sunucuları başlatın
npm run dev
```

---

## 📦 Manuel Kurulum

### Adım 1: Sistem Bağımlılıkları

#### Windows
```powershell
# Node.js kurulumu
winget install OpenJS.NodeJS.LTS

# PostgreSQL kurulumu
winget install PostgreSQL.PostgreSQL

# PM2 kurulumu
npm install -g pm2
```

#### Ubuntu/Debian
```bash
# Node.js kurulumu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL kurulumu
sudo apt-get install -y postgresql postgresql-contrib

# PM2 kurulumu
sudo npm install -g pm2
```

#### CentOS/RHEL
```bash
# Node.js kurulumu
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# PostgreSQL kurulumu
sudo yum install -y postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql

# PM2 kurulumu
sudo npm install -g pm2
```

### Adım 2: Proje Dosyaları

```bash
# Dosyaları sunucuya yükleyin (SCP, FTP, Git vb.)
# Örnek Git ile:
git clone <repo-url> /var/www/magazapano
cd /var/www/magazapano

# Veya manuel upload sonrası
cd /var/www/magazapano
```

### Adım 3: Backend Kurulumu

```bash
cd backend

# Bağımlılıkları yükle
npm install

# .env dosyası oluştur
cp .env.example .env

# .env dosyasını düzenle
nano .env
```

#### .env Dosyası Yapılandırması

```env
# Sunucu
NODE_ENV=production
PORT=3000

# Veritabanı
DATABASE_URL=postgresql://kullanici:sifre@localhost:5432/magazapano
DB_HOST=localhost
DB_PORT=5432
DB_NAME=magazapano
DB_USER=kullanici
DB_PASSWORD=sifre

# JWT
JWT_SECRET=your-very-secret-key-change-this
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-this
REFRESH_TOKEN_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://your-domain.com,https://your-domain.com

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800

# Socket.IO
SOCKET_CORS_ORIGIN=http://your-domain.com,https://your-domain.com
```

### Adım 4: Frontend Kurulumu

```bash
cd ../admin-panel

# Bağımlılıkları yükle
npm install

# Build al (production için)
npm run build
```

#### Frontend Environment (opsiyonel .env.production)

```env
VITE_API_URL=http://your-domain.com:3000
VITE_SOCKET_URL=http://your-domain.com:3000
```

---

## 🗄️ Veritabanı Kurulumu

### PostgreSQL Kurulumu ve Yapılandırma

#### 1. PostgreSQL Kullanıcı ve Veritabanı Oluşturma

```bash
# PostgreSQL'e bağlan
sudo -u postgres psql

# Veritabanı ve kullanıcı oluştur
CREATE DATABASE magazapano;
CREATE USER magazapano_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE magazapano TO magazapano_user;

# Çıkış
\q
```

#### 2. Migration Çalıştırma

```bash
cd backend

# Migration'ları çalıştır
npm run migrate

# Seed data (opsiyonel)
npm run seed
```

#### 3. Docker ile PostgreSQL (Alternatif)

```bash
# PostgreSQL container başlat
docker run -d \
  --name magazapano-db \
  -e POSTGRES_DB=magazapano \
  -e POSTGRES_USER=magazapano_user \
  -e POSTGRES_PASSWORD=your_secure_password \
  -p 5432:5432 \
  -v magazapano_data:/var/lib/postgresql/data \
  postgres:15

# Bağlantıyı test et
docker exec -it magazapano-db psql -U magazapano_user -d magazapano
```

---

## 🌐 Production Deployment

### PM2 ile Deployment

#### 1. PM2 Ecosystem Dosyası

Proje kök dizininde `ecosystem.config.js` oluşturun:

```javascript
module.exports = {
  apps: [
    {
      name: 'magazapano-backend',
      script: './backend/src/app.js',
      cwd: './backend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
```

#### 2. PM2 Komutları

```bash
# Uygulamayı başlat
pm2 start ecosystem.config.js

# Durumu kontrol et
pm2 status

# Logları görüntüle
pm2 logs magazapano-backend

# Yeniden başlat
pm2 restart magazapano-backend

# Durdur
pm2 stop magazapano-backend

# Sistem başlangıcında otomatik başlat
pm2 startup
pm2 save
```

### Nginx Reverse Proxy Yapılandırması

#### 1. Nginx Kurulumu

```bash
# Ubuntu/Debian
sudo apt-get install nginx

# CentOS/RHEL
sudo yum install nginx
```

#### 2. Nginx Konfigürasyonu

`/etc/nginx/sites-available/magazapano` dosyası oluşturun:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend (static files)
    location / {
        root /var/www/magazapano/admin-panel/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads {
        alias /var/www/magazapano/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### 3. SSL/HTTPS (Let's Encrypt)

```bash
# Certbot kurulumu
sudo apt-get install certbot python3-certbot-nginx

# SSL sertifikası al
sudo certbot --nginx -d your-domain.com

# Otomatik yenileme testi
sudo certbot renew --dry-run
```

---

## 🔧 Sorun Giderme

### Port Zaten Kullanımda

```bash
# Port kullanan process'i bul
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# Process'i sonlandır
# Windows
taskkill /PID <pid> /F

# Linux/Mac
kill -9 <pid>
```

### Database Connection Hatası

```bash
# PostgreSQL durumunu kontrol et
# Ubuntu/Debian
sudo systemctl status postgresql

# PostgreSQL'i başlat
sudo systemctl start postgresql

# Connection string'i test et
psql postgresql://user:password@localhost:5432/magazapano
```

### Node Modules Hatası

```bash
# Node modules temizle ve tekrar yükle
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Permission Hatası (Linux)

```bash
# Dosya sahipliğini düzelt
sudo chown -R $USER:$USER /var/www/magazapano

# Upload klasörü izinleri
sudo chmod -R 755 backend/uploads
```

### Memory Hatası

```bash
# Node.js memory limitini artır
# PM2 ile
pm2 start app.js --node-args="--max-old-space-size=4096"

# Direkt node ile
node --max-old-space-size=4096 app.js
```

---

## 📊 Monitoring ve Logging

### PM2 Monitoring

```bash
# PM2 web dashboard
pm2 web

# Gerçek zamanlı monitoring
pm2 monit

# Log dosyalarını görüntüle
pm2 logs --lines 100
```

### Log Rotasyonu

```bash
# PM2 log rotation modülü
pm2 install pm2-logrotate

# Konfigürasyon
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🔐 Güvenlik Kontrol Listesi

- [ ] .env dosyasında güçlü JWT_SECRET kullanın
- [ ] PostgreSQL için güçlü şifre belirleyin
- [ ] Firewall'da sadece gerekli portları açın (80, 443, 3000)
- [ ] SSL/HTTPS sertifikası kurun
- [ ] CORS ayarlarını production domain'e göre yapılandırın
- [ ] Rate limiting aktif olduğundan emin olun
- [ ] Helmet.js güvenlik header'ları aktif
- [ ] Upload dosya boyutu sınırlamaları kontrol edin
- [ ] Düzenli backup alın (DB + uploads)
- [ ] PM2 ile process izleme aktif

---

## 📱 Deployment Komut Özeti

### İlk Kurulum
```bash
# 1. Sistem kontrolü
.\deploy-check.ps1

# 2. Otomatik kurulum
.\deploy-check.ps1 -Install

# 3. .env yapılandırması
nano backend/.env

# 4. Database migration
cd backend && npm run migrate

# 5. Production başlat
pm2 start ecosystem.config.js
```

### Güncelleme (Update)
```bash
# 1. Yeni kodu çek
git pull origin main

# 2. Backend güncelle
cd backend
npm install
npm run migrate

# 3. Frontend build
cd ../admin-panel
npm install
npm run build

# 4. Servisleri yeniden başlat
pm2 restart all
```

### Backup
```bash
# Database backup
pg_dump -U magazapano_user magazapano > backup_$(date +%Y%m%d).sql

# Upload dosyaları backup
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz backend/uploads/
```

---

## 📞 Destek

Sorun yaşarsanız:
1. `deploy-check.ps1` scriptini çalıştırın
2. Log dosyalarını kontrol edin (`pm2 logs`)
3. Hata mesajını ve sistem bilgilerini not alın

---

**Son Güncelleme:** 25 Aralık 2025
**Versiyon:** 1.0.0
