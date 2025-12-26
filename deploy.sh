#!/bin/bash

# MağazaPano Linux/Mac Deployment Script
# Usage: ./deploy.sh [--check|--install|--update]

set -e

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Fonksiyonlar
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_info() { echo -e "${CYAN}ℹ${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_header() { echo -e "\n${MAGENTA}═══ $1 ═══${NC}"; }

# Değişkenler
MISSING=()
FOUND=()
ERRORS=()

print_header "MAĞAZAPANO SUNUCU KURULUM KONTROLÜ"

# 1. Node.js Kontrolü
print_info "Node.js kontrol ediliyor..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        print_success "Node.js $NODE_VERSION yüklü"
        FOUND+=("Node.js $NODE_VERSION")
    else
        print_warning "Node.js $NODE_VERSION yüklü ancak v18+ önerilir"
        MISSING+=("Node.js v18+")
    fi
else
    print_error "Node.js bulunamadı"
    MISSING+=("Node.js v18+")
fi

# 2. npm Kontrolü
print_info "npm kontrol ediliyor..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm v$NPM_VERSION yüklü"
    FOUND+=("npm v$NPM_VERSION")
else
    print_error "npm bulunamadı"
    MISSING+=("npm")
fi

# 3. PostgreSQL Kontrolü
print_info "PostgreSQL kontrol ediliyor..."
if command -v psql &> /dev/null; then
    PG_VERSION=$(psql --version)
    print_success "PostgreSQL yüklü: $PG_VERSION"
    FOUND+=("PostgreSQL")
else
    print_warning "PostgreSQL komut satırı bulunamadı (Docker kullanılabilir)"
    MISSING+=("PostgreSQL (veya Docker)")
fi

# 4. Git Kontrolü
print_info "Git kontrol ediliyor..."
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    print_success "Git yüklü: $GIT_VERSION"
    FOUND+=("Git")
else
    print_warning "Git bulunamadı (opsiyonel)"
fi

# 5. PM2 Kontrolü
print_info "PM2 kontrol ediliyor..."
if command -v pm2 &> /dev/null; then
    PM2_VERSION=$(pm2 --version)
    print_success "PM2 v$PM2_VERSION yüklü"
    FOUND+=("PM2 v$PM2_VERSION")
else
    print_warning "PM2 bulunamadı (production için gerekli)"
    MISSING+=("PM2 (npm install -g pm2)")
fi

# 6. Proje Dosyaları
print_header "PROJE DOSYALARI KONTROLÜ"

REQUIRED_FILES=(
    "backend/package.json"
    "backend/src/app.js"
    "backend/.env.example"
    "admin-panel/package.json"
    "admin-panel/index.html"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file mevcut"
    else
        print_error "$file BULUNAMADI"
        ERRORS+=("Eksik dosya: $file")
    fi
done

# 7. Backend Bağımlılıkları
print_header "BACKEND BAĞIMLILIKLAR"
if [ -f "backend/package.json" ]; then
    if [ -d "backend/node_modules" ]; then
        print_success "Backend node_modules mevcut"
    else
        print_warning "Backend node_modules bulunamadı"
        MISSING+=("Backend dependencies (npm install gerekli)")
    fi
    
    # Kritik paketler
    CRITICAL_PACKAGES=("express" "sequelize" "pg" "socket.io" "jsonwebtoken")
    for pkg in "${CRITICAL_PACKAGES[@]}"; do
        if [ -d "backend/node_modules/$pkg" ]; then
            print_success "  $pkg yüklü"
        else
            print_error "  $pkg BULUNAMADI"
            MISSING+=("Backend: $pkg")
        fi
    done
fi

# 8. Frontend Bağımlılıkları
print_header "FRONTEND BAĞIMLILIKLAR"
if [ -f "admin-panel/package.json" ]; then
    if [ -d "admin-panel/node_modules" ]; then
        print_success "Frontend node_modules mevcut"
    else
        print_warning "Frontend node_modules bulunamadı"
        MISSING+=("Frontend dependencies (npm install gerekli)")
    fi
fi

# 9. .env Kontrolü
print_header "ÇEVRE DEĞİŞKENLERİ (.env)"
if [ -f "backend/.env" ]; then
    print_success "backend/.env dosyası mevcut"
    
    REQUIRED_VARS=("DATABASE_URL" "JWT_SECRET" "PORT" "NODE_ENV")
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^${var}=" backend/.env; then
            print_success "  $var tanımlı"
        else
            print_warning "  $var eksik"
            MISSING+=("ENV: $var")
        fi
    done
else
    print_warning "backend/.env bulunamadı (.env.example'dan kopyalanmalı)"
    MISSING+=("backend/.env dosyası")
fi

# SONUÇ RAPORU
print_header "ÖZET RAPOR"

echo -e "\n${GREEN}✅ BULUNAN BAĞIMLILIKLAR (${#FOUND[@]}):${NC}"
for item in "${FOUND[@]}"; do
    echo "   • $item"
done

if [ ${#MISSING[@]} -gt 0 ]; then
    echo -e "\n${YELLOW}⚠ EKSİK BAĞIMLILIKLAR (${#MISSING[@]}):${NC}"
    for item in "${MISSING[@]}"; do
        echo "   • $item"
    done
fi

if [ ${#ERRORS[@]} -gt 0 ]; then
    echo -e "\n${RED}✗ HATALAR (${#ERRORS[@]}):${NC}"
    for item in "${ERRORS[@]}"; do
        echo "   • $item"
    done
fi

# Kurulum Komutları
if [ ${#MISSING[@]} -gt 0 ] || [ ${#ERRORS[@]} -gt 0 ]; then
    print_header "ÖNERİLEN KURULUM KOMUTLARI"
    
    echo -e "\n${CYAN}# 1. Sistem Gereksinimleri${NC}"
    
    # OS tespiti
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        
        if [[ "$OS" == "ubuntu" ]] || [[ "$OS" == "debian" ]]; then
            echo "   # Node.js kurulumu:"
            echo "   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
            echo "   sudo apt-get install -y nodejs"
            echo ""
            echo "   # PostgreSQL kurulumu:"
            echo "   sudo apt-get install -y postgresql postgresql-contrib"
        elif [[ "$OS" == "centos" ]] || [[ "$OS" == "rhel" ]]; then
            echo "   # Node.js kurulumu:"
            echo "   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -"
            echo "   sudo yum install -y nodejs"
            echo ""
            echo "   # PostgreSQL kurulumu:"
            echo "   sudo yum install -y postgresql-server postgresql-contrib"
        fi
    fi
    
    echo -e "\n${CYAN}# 2. PM2 Kurulumu${NC}"
    echo "   sudo npm install -g pm2"
    
    echo -e "\n${CYAN}# 3. Proje Bağımlılıkları${NC}"
    echo "   cd backend && npm install && cd .."
    echo "   cd admin-panel && npm install && cd .."
    
    echo -e "\n${CYAN}# 4. .env Dosyası${NC}"
    echo "   cp backend/.env.example backend/.env"
    echo "   nano backend/.env"
    
    echo -e "\n${CYAN}# 5. Veritabanı${NC}"
    echo "   cd backend && npm run migrate"
    
    echo -e "\n${CYAN}# 6. Sunucuları Başlat${NC}"
    echo "   pm2 start ecosystem.config.js"
fi

# Otomatik kurulum
if [ "$1" == "--install" ]; then
    print_header "OTOMATIK KURULUM"
    
    print_info "Backend bağımlılıkları yükleniyor..."
    cd backend
    npm install
    cd ..
    print_success "Backend tamamlandı"
    
    print_info "Frontend bağımlılıkları yükleniyor..."
    cd admin-panel
    npm install
    cd ..
    print_success "Frontend tamamlandı"
    
    if [ ! -f "backend/.env" ]; then
        print_info ".env dosyası oluşturuluyor..."
        cp backend/.env.example backend/.env
        print_warning ".env dosyasını düzenlemeyi unutmayın!"
    fi
    
    print_success "Otomatik kurulum tamamlandı!"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
if [ ${#MISSING[@]} -eq 0 ] && [ ${#ERRORS[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ SİSTEM HAZIR! Sunucuları başlatabilirsiniz.${NC}"
else
    echo -e "${YELLOW}⚠ Eksiklikler giderilmeli. Yukarıdaki komutları çalıştırın.${NC}"
fi
echo "═══════════════════════════════════════════════════════════"
echo -e "\nKullanım:"
echo "  ./deploy.sh              # Sadece kontrol"
echo "  ./deploy.sh --install    # Otomatik kurulum"
echo ""
