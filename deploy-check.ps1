<#
.SYNOPSIS
    MağazaPano Sunucu Kurulum ve Kontrol Scripti
.DESCRIPTION
    Sunucudaki eksik bağımlılıkları tespit eder, gerekli kurulumları yapar
.NOTES
    Version: 1.0
    Author: MağazaPano Team
#>

param(
    [switch]$CheckOnly,
    [switch]$Install,
    [switch]$Full
)

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

# Renkli cikti fonksiyonlari
function Write-CustomSuccess { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-CustomInfo { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-CustomWarning { param($msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-CustomError { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }
function Write-CustomHeader { param($msg) Write-Host "`n=== $msg ===" -ForegroundColor Magenta }

# Sonuçları topla
$checkResults = @{
    missing = @()
    found = @()
    errors = @()
}

Write-CustomHeader "MAĞAZAPANO SUNUCU KURULUM KONTROLÜ"

# 1. Node.js Kontrolü
Write-CustomInfo "Node.js kontrol ediliyor..."
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion -match "v(\d+)\.") {
        $majorVersion = [int]$Matches[1]
        if ($majorVersion -ge 18) {
            Write-CustomSuccess "Node.js $nodeVersion yüklü"
            $checkResults.found += "Node.js $nodeVersion"
        } else {
            Write-CustomWarning "Node.js $nodeVersion yüklü ancak v18+ önerilir"
            $checkResults.missing += "Node.js v18+"
        }
    }
} catch {
    Write-CustomError "Node.js bulunamadı"
    $checkResults.missing += "Node.js v18+"
}

# 2. npm Kontrolü
Write-CustomInfo "npm kontrol ediliyor..."
try {
    $npmVersion = npm --version 2>$null
    Write-CustomSuccess "npm v$npmVersion yüklü"
    $checkResults.found += "npm v$npmVersion"
} catch {
    Write-CustomError "npm bulunamadı"
    $checkResults.missing += "npm"
}

# 3. PostgreSQL Kontrolü
Write-CustomInfo "PostgreSQL kontrol ediliyor..."
try {
    $pgVersion = psql --version 2>$null
    if ($pgVersion) {
        Write-CustomSuccess "PostgreSQL yüklü: $pgVersion"
        $checkResults.found += "PostgreSQL"
    }
} catch {
    Write-CustomWarning "PostgreSQL komut satırı bulunamadı (Docker kullanılabilir)"
    $checkResults.missing += "PostgreSQL (veya Docker)"
}

# 4. Git Kontrolü
Write-CustomInfo "Git kontrol ediliyor..."
try {
    $gitVersion = git --version 2>$null
    Write-CustomSuccess "Git yüklü: $gitVersion"
    $checkResults.found += "Git"
} catch {
    Write-CustomWarning "Git bulunamadı (opsiyonel)"
}

# 5. PM2 Kontrolü (Production için)
Write-CustomInfo "PM2 kontrol ediliyor..."
try {
    $pm2Version = pm2 --version 2>$null
    Write-CustomSuccess "PM2 v$pm2Version yüklü"
    $checkResults.found += "PM2 v$pm2Version"
} catch {
    Write-CustomWarning "PM2 bulunamadı (production için gerekli)"
    $checkResults.missing += "PM2 (npm install -g pm2)"
}

# 6. Proje Dosyalarını Kontrol Et
Write-CustomHeader "PROJE DOSYALARI KONTROLÜ"

$requiredFiles = @(
    "backend/package.json",
    "backend/src/app.js",
    "backend/.env.example",
    "admin-panel/package.json",
    "admin-panel/index.html"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-CustomSuccess "$file mevcut"
    } else {
        Write-CustomError "$file BULUNAMADI"
        $checkResults.errors += "Eksik dosya: $file"
    }
}

# 7. Backend Bağımlılıkları Kontrolü
Write-CustomHeader "BACKEND BAĞIMLILIKLAR"
if (Test-Path "backend/package.json") {
    $backendPkg = Get-Content "backend/package.json" | ConvertFrom-Json
    
    if (Test-Path "backend/node_modules") {
        Write-CustomSuccess "Backend node_modules mevcut"
    } else {
        Write-CustomWarning "Backend node_modules bulunamadı"
        $checkResults.missing += "Backend dependencies (npm install gerekli)"
    }
    
    # Kritik paketleri kontrol et
    $criticalPackages = @("express", "sequelize", "pg", "socket.io", "jsonwebtoken")
    foreach ($pkg in $criticalPackages) {
        if (Test-Path "backend/node_modules/$pkg") {
            Write-CustomSuccess "  $pkg yüklü"
        } else {
            Write-CustomError "  $pkg BULUNAMADI"
            $checkResults.missing += "Backend: $pkg"
        }
    }
}

# 8. Frontend Bağımlılıkları Kontrolü
Write-CustomHeader "FRONTEND BAĞIMLILIKLAR"
if (Test-Path "admin-panel/package.json") {
    if (Test-Path "admin-panel/node_modules") {
        Write-CustomSuccess "Frontend node_modules mevcut"
    } else {
        Write-CustomWarning "Frontend node_modules bulunamadı"
        $checkResults.missing += "Frontend dependencies (npm install gerekli)"
    }
    
    # React ve kritik paketler
    $criticalFrontend = @("react", "react-dom", "@mui/material", "vite", "@tanstack/react-query")
    foreach ($pkg in $criticalFrontend) {
        if (Test-Path "admin-panel/node_modules/$pkg") {
            Write-CustomSuccess "  $pkg yüklü"
        } else {
            Write-CustomError "  $pkg BULUNAMADI"
            $checkResults.missing += "Frontend: $pkg"
        }
    }
}

# 9. Çevre Değişkenleri Kontrolü
Write-CustomHeader "ÇEVRE DEĞİŞKENLERİ (.env)"
if (Test-Path "backend/.env") {
    Write-CustomSuccess "backend/.env dosyası mevcut"
    
    $envContent = Get-Content "backend/.env" -Raw
    $requiredEnvVars = @("DATABASE_URL", "JWT_SECRET", "PORT", "NODE_ENV")
    
    foreach ($var in $requiredEnvVars) {
        if ($envContent -match "$var\s*=") {
            Write-CustomSuccess "  $var tanımlı"
        } else {
            Write-CustomWarning "  $var eksik"
            $checkResults.missing += "ENV: $var"
        }
    }
} else {
    Write-CustomWarning "backend/.env bulunamadı (.env.example'dan kopyalanmalı)"
    $checkResults.missing += "backend/.env dosyası"
}

# 10. Veritabanı Bağlantısı Test
Write-CustomHeader "VERİTABANI BAĞLANTISI"
if (Test-Path "backend/.env") {
    $env = Get-Content "backend/.env" | ConvertFrom-StringData
    if ($env.DATABASE_URL) {
        Write-CustomInfo "DATABASE_URL: $($env.DATABASE_URL)"
        # Basit format kontrolü
        if ($env.DATABASE_URL -match "postgres://") {
            Write-CustomSuccess "PostgreSQL connection string formatı doğru"
        } else {
            Write-CustomWarning "DATABASE_URL formatı kontrol edilmeli"
        }
    }
}

# 11. Port Kullanılabilirliği
Write-CustomHeader "PORT KONTROLÜ"
$ports = @(3000, 5173)
foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        Write-CustomWarning "Port $port kullanımda (process: $($connection.OwningProcess))"
    } else {
        Write-CustomSuccess "Port $port kullanılabilir"
    }
}

# SONUÇ RAPORU
Write-CustomHeader "ÖZET RAPOR"

Write-Host "`n✅ BULUNAN BAĞIMLILIKLAR ($($checkResults.found.Count)):" -ForegroundColor Green
$checkResults.found | ForEach-Object { Write-Host "   • $_" -ForegroundColor Gray }

if ($checkResults.missing.Count -gt 0) {
    Write-Host "`n⚠ EKSİK BAĞIMLILIKLAR ($($checkResults.missing.Count)):" -ForegroundColor Yellow
    $checkResults.missing | ForEach-Object { Write-Host "   • $_" -ForegroundColor Gray }
}

if ($checkResults.errors.Count -gt 0) {
    Write-Host "`n✗ HATALAR ($($checkResults.errors.Count)):" -ForegroundColor Red
    $checkResults.errors | ForEach-Object { Write-Host "   • $_" -ForegroundColor Gray }
}

# KURULUM KOMUTLARI ÖNERİSİ
if ($checkResults.missing.Count -gt 0 -or $checkResults.errors.Count -gt 0) {
    Write-CustomHeader "ÖNERİLEN KURULUM KOMUTLARI"
    
    Write-Host "`n# 1. Temel Sistem Gereksinimleri" -ForegroundColor Cyan
    if ($checkResults.missing -match "Node.js") {
        Write-Host "   winget install OpenJS.NodeJS.LTS" -ForegroundColor White
        Write-Host "   # veya: https://nodejs.org/en/download/" -ForegroundColor Gray
    }
    
    if ($checkResults.missing -match "PostgreSQL") {
        Write-Host "   # PostgreSQL kurulumu:" -ForegroundColor White
        Write-Host "   winget install PostgreSQL.PostgreSQL" -ForegroundColor White
        Write-Host "   # veya Docker ile:" -ForegroundColor Gray
        Write-Host "   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15" -ForegroundColor White
    }
    
    if ($checkResults.missing -match "PM2") {
        Write-Host "`n# 2. PM2 (Production Process Manager)" -ForegroundColor Cyan
        Write-Host "   npm install -g pm2" -ForegroundColor White
    }
    
    Write-Host "`n# 3. Proje Bağımlılıkları" -ForegroundColor Cyan
    if ($checkResults.missing -match "Backend dependencies") {
        Write-Host "   cd backend" -ForegroundColor White
        Write-Host "   npm install" -ForegroundColor White
        Write-Host "   cd .." -ForegroundColor White
    }
    
    if ($checkResults.missing -match "Frontend dependencies") {
        Write-Host "   cd admin-panel" -ForegroundColor White
        Write-Host "   npm install" -ForegroundColor White
        Write-Host "   cd .." -ForegroundColor White
    }
    
    Write-Host "`n# 4. Çevre Değişkenleri" -ForegroundColor Cyan
    if ($checkResults.missing -match ".env") {
        Write-Host "   Copy-Item backend/.env.example backend/.env" -ForegroundColor White
        Write-Host "   # Ardından .env dosyasını düzenleyin" -ForegroundColor Gray
    }
    
    Write-Host "`n# 5. Veritabanı Migration" -ForegroundColor Cyan
    Write-Host "   cd backend" -ForegroundColor White
    Write-Host "   npm run migrate" -ForegroundColor White
    
    Write-Host "`n# 6. Sunucuları Başlatma" -ForegroundColor Cyan
    Write-Host "   # Development:" -ForegroundColor Gray
    Write-Host "   cd backend && npm run dev" -ForegroundColor White
    Write-Host "   cd admin-panel && npm run dev" -ForegroundColor White
    Write-Host "`n   # Production (PM2 ile):" -ForegroundColor Gray
    Write-Host "   pm2 start ecosystem.config.js" -ForegroundColor White
}

# OTOMATIK KURULUM
if ($Install) {
    Write-CustomHeader "OTOMATIK KURULUM BAŞLIYOR"
    
    Write-CustomInfo "Backend bağımlılıkları yükleniyor..."
    Set-Location backend
    npm install
    Set-Location ..
    Write-CustomSuccess "Backend bağımlılıkları yüklendi"
    
    Write-CustomInfo "Frontend bağımlılıkları yükleniyor..."
    Set-Location admin-panel
    npm install
    Set-Location ..
    Write-CustomSuccess "Frontend bağımlılıkları yüklendi"
    
    if (-not (Test-Path "backend/.env")) {
        Write-CustomInfo ".env dosyası oluşturuluyor..."
        Copy-Item "backend/.env.example" "backend/.env"
        Write-CustomWarning ".env dosyasını düzenlemeyi unutmayın!"
    }
    
    Write-CustomSuccess "Otomatik kurulum tamamlandı!"
}

Write-Host "`n"
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
if ($checkResults.missing.Count -eq 0 -and $checkResults.errors.Count -eq 0) {
    Write-Host "✅ SİSTEM HAZIR! Sunucuları başlatabilirsiniz." -ForegroundColor Green
} else {
    Write-Host "⚠ Eksiklikler giderilmeli. Yukarıdaki komutları çalıştırın." -ForegroundColor Yellow
}
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "`nKullanım:" -ForegroundColor White
Write-Host "  .\deploy-check.ps1              # Sadece kontrol" -ForegroundColor Gray
Write-Host "  .\deploy-check.ps1 -Install     # Otomatik kurulum" -ForegroundColor Gray
Write-Host "`n"

