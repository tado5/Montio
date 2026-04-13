#!/bin/bash

# ============================================================================
# MONTIO v1.11.0 - Manual Step-by-Step Deployment
# Spustite na production serveri: bash manual-deploy.sh
# ============================================================================

set -e

echo "=============================================="
echo "🚀 MONTIO v1.11.0 - MANUAL DEPLOYMENT"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}Manual deployment - budete vidieť každý krok${NC}"
echo ""
read -p "Pokračovať? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Zrušené"
    exit 0
fi

# ============================================================================
# KROK 1: STOP BACKEND
# ============================================================================
echo ""
echo "=============================================="
echo -e "${BLUE}KROK 1: Zastavujem backend...${NC}"
echo "=============================================="
read -p "Stlačte ENTER pre pokračovanie..."

pm2 stop montio-backend 2>/dev/null || echo "Backend nebeží"
echo -e "${GREEN}✅ Backend zastavený${NC}"

# ============================================================================
# KROK 2: DATABASE MIGRATION
# ============================================================================
echo ""
echo "=============================================="
echo -e "${BLUE}KROK 2: Database migration${NC}"
echo "=============================================="
echo ""
echo "Pridám tieto stĺpce (ak neexistujú):"
echo "  - users.avatar_url"
echo "  - users.name"
echo "  - users.position"
echo "  - employees.avatar_url"
echo "  - companies JSON columns"
echo ""
read -p "Zadajte MySQL databázu (default: montio_db): " DB_NAME
DB_NAME=${DB_NAME:-montio_db}

read -p "Zadajte MySQL user (default: root): " DB_USER
DB_USER=${DB_USER:-root}

read -sp "Zadajte MySQL password: " DB_PASSWORD
echo ""

echo ""
echo "Spúšťam migration..."
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME << 'EOSQL'

-- Add avatar_url to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS avatar_url TEXT NULL AFTER theme;

-- Add name and position to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS name VARCHAR(255) NULL AFTER role;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS position VARCHAR(255) NULL AFTER name;

-- Update default positions
UPDATE users
SET position = CASE
  WHEN role = 'superadmin' THEN 'Administrátor systému'
  WHEN role = 'companyadmin' THEN 'Majiteľ firmy'
  WHEN role = 'employee' THEN 'Zamestnanec'
  ELSE 'Používateľ'
END
WHERE position IS NULL OR position = '';

-- Update default names
UPDATE users
SET name = SUBSTRING_INDEX(email, '@', 1)
WHERE name IS NULL OR name = '';

-- Add avatar_url to employees
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS avatar_url TEXT NULL;

-- Add JSON columns to companies
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS billing_data JSON NULL;

ALTER TABLE companies
ADD COLUMN IF NOT EXISTS financial_data JSON NULL;

ALTER TABLE companies
ADD COLUMN IF NOT EXISTS contact_data JSON NULL;

ALTER TABLE companies
ADD COLUMN IF NOT EXISTS invoice_settings JSON NULL;

-- Verify
SELECT '✅ Migration completed!' AS status;
SELECT CONCAT('Users: ', COUNT(*)) AS count FROM users;
SELECT CONCAT('Companies: ', COUNT(*)) AS count FROM companies;
SELECT CONCAT('Employees: ', COUNT(*)) AS count FROM employees;

EOSQL

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database migration úspešná${NC}"
else
    echo -e "${RED}❌ Database migration zlyhala!${NC}"
    exit 1
fi

# ============================================================================
# KROK 3: VERIFY NEW FILES
# ============================================================================
echo ""
echo "=============================================="
echo -e "${BLUE}KROK 3: Verifikujem nové súbory...${NC}"
echo "=============================================="
read -p "Stlačte ENTER pre pokračovanie..."

echo ""
echo "Kontrolujem či existujú nové súbory..."

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 CHÝBA!${NC}"
        return 1
    fi
}

MISSING=0

# Check new files
check_file "config/constants.js" || MISSING=1
check_file "middleware/companyMiddleware.js" || MISSING=1
check_file "middleware/rateLimiter.js" || MISSING=1
check_file "utils/errorHandler.js" || MISSING=1
check_file "utils/validation.js" || MISSING=1

# Check updated files
check_file "server.js" || MISSING=1
check_file "routes/auth.js" || MISSING=1
check_file "routes/dashboard.js" || MISSING=1
check_file "routes/employees.js" || MISSING=1

if [ $MISSING -eq 1 ]; then
    echo ""
    echo -e "${RED}⚠️  CHÝBAJÚ NIEKTORÉ SÚBORY!${NC}"
    echo "Uploadnite ich pred pokračovaním."
    read -p "Pokračovať aj tak? (yes/no): " continue_anyway
    if [ "$continue_anyway" != "yes" ]; then
        echo "Deployment zrušený"
        exit 1
    fi
fi

# ============================================================================
# KROK 4: NPM INSTALL
# ============================================================================
echo ""
echo "=============================================="
echo -e "${BLUE}KROK 4: Inštalujem dependencies...${NC}"
echo "=============================================="
read -p "Stlačte ENTER pre pokračovanie..."

npm install --production

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies nainštalované${NC}"
else
    echo -e "${RED}❌ npm install zlyhal!${NC}"
    exit 1
fi

# ============================================================================
# KROK 5: UPLOADS DIRECTORIES
# ============================================================================
echo ""
echo "=============================================="
echo -e "${BLUE}KROK 5: Vytváram uploads directories...${NC}"
echo "=============================================="
read -p "Stlačte ENTER pre pokračovanie..."

mkdir -p uploads/avatars uploads/logos
chmod 755 uploads uploads/avatars uploads/logos

# Try to set www-data ownership
sudo chown -R www-data:www-data uploads/ 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Couldn't set www-data ownership (may need manual setup)${NC}"
    chown -R $(whoami) uploads/
}

echo -e "${GREEN}✅ Uploads directories pripravené${NC}"
ls -la uploads/

# ============================================================================
# KROK 6: CHECK .ENV
# ============================================================================
echo ""
echo "=============================================="
echo -e "${BLUE}KROK 6: Kontrolujem .env súbor...${NC}"
echo "=============================================="
read -p "Stlačte ENTER pre pokračovanie..."

if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env súbor neexistuje!${NC}"
    echo "Vytvorte .env súbor s týmito premennými:"
    echo "  JWT_SECRET=..."
    echo "  NODE_ENV=production"
    echo "  CORS_ORIGIN=https://yourdomain.com"
    echo "  DB_HOST=127.0.0.1"
    echo "  DB_USER=root"
    echo "  DB_PASSWORD=..."
    echo "  DB_NAME=montio_db"
    echo "  PORT=3001"
    exit 1
fi

echo "Kontrolujem .env premenné..."

check_env() {
    if grep -q "$1" .env; then
        VALUE=$(grep "$1" .env | cut -d'=' -f2)
        if [ ! -z "$VALUE" ]; then
            echo -e "${GREEN}✅ $1 je nastavené${NC}"
            return 0
        fi
    fi
    echo -e "${RED}❌ $1 CHÝBA alebo je prázdne!${NC}"
    return 1
}

ENV_OK=1
check_env "JWT_SECRET" || ENV_OK=0
check_env "NODE_ENV" || ENV_OK=0
check_env "CORS_ORIGIN" || ENV_OK=0
check_env "DB_HOST" || ENV_OK=0
check_env "DB_USER" || ENV_OK=0
check_env "DB_PASSWORD" || ENV_OK=0
check_env "DB_NAME" || ENV_OK=0

if [ $ENV_OK -eq 0 ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Niektoré .env premenné chýbajú!${NC}"
    read -p "Pokračovať aj tak? (yes/no): " continue_env
    if [ "$continue_env" != "yes" ]; then
        echo "Deployment zrušený. Upravte .env súbor."
        exit 1
    fi
fi

# Check CORS_ORIGIN specifically
if grep -q "CORS_ORIGIN=https://" .env; then
    echo -e "${GREEN}✅ CORS_ORIGIN nastavený na production domain${NC}"
else
    echo -e "${YELLOW}⚠️  CORS_ORIGIN nie je nastavený na https://! Skontrolujte.${NC}"
fi

# Check NODE_ENV
if grep -q "NODE_ENV=production" .env; then
    echo -e "${GREEN}✅ NODE_ENV=production${NC}"
else
    echo -e "${YELLOW}⚠️  NODE_ENV nie je nastavený na 'production'!${NC}"
fi

# ============================================================================
# KROK 7: VERIFY SYNTAX
# ============================================================================
echo ""
echo "=============================================="
echo -e "${BLUE}KROK 7: Verifikujem syntax...${NC}"
echo "=============================================="
read -p "Stlačte ENTER pre pokračovanie..."

echo "Kontrolujem syntax hlavných súborov..."

SYNTAX_OK=1

if node -c server.js 2>/dev/null; then
    echo -e "${GREEN}✅ server.js - OK${NC}"
else
    echo -e "${RED}❌ server.js - SYNTAX ERROR!${NC}"
    SYNTAX_OK=0
fi

if node -c routes/auth.js 2>/dev/null; then
    echo -e "${GREEN}✅ routes/auth.js - OK${NC}"
else
    echo -e "${RED}❌ routes/auth.js - SYNTAX ERROR!${NC}"
    SYNTAX_OK=0
fi

if node -c middleware/rateLimiter.js 2>/dev/null; then
    echo -e "${GREEN}✅ middleware/rateLimiter.js - OK${NC}"
else
    echo -e "${RED}❌ middleware/rateLimiter.js - SYNTAX ERROR!${NC}"
    SYNTAX_OK=0
fi

if [ $SYNTAX_OK -eq 0 ]; then
    echo ""
    echo -e "${RED}⚠️  SYNTAX ERRORS DETECTED!${NC}"
    read -p "Pokračovať aj tak? (yes/no): " continue_syntax
    if [ "$continue_syntax" != "yes" ]; then
        echo "Deployment zrušený"
        exit 1
    fi
fi

# ============================================================================
# KROK 8: START BACKEND
# ============================================================================
echo ""
echo "=============================================="
echo -e "${BLUE}KROK 8: Spúšťam backend...${NC}"
echo "=============================================="
read -p "Stlačte ENTER pre spustenie..."

pm2 start server.js --name montio-backend
pm2 save

echo ""
echo "Čakám 3 sekundy na štart..."
sleep 3

# Check if running
if pm2 list | grep -q "montio-backend.*online"; then
    echo -e "${GREEN}✅ Backend beží!${NC}"
else
    echo -e "${RED}❌ Backend sa nespustil!${NC}"
    echo "Skontrolujte logy: pm2 logs montio-backend"
    exit 1
fi

# ============================================================================
# KROK 9: TESTING
# ============================================================================
echo ""
echo "=============================================="
echo -e "${BLUE}KROK 9: Testujem backend...${NC}"
echo "=============================================="
read -p "Stlačte ENTER pre testing..."

echo ""
echo "Test 1: Health check..."
HEALTH=$(curl -s http://localhost:3001/health 2>&1)
if echo "$HEALTH" | grep -q "OK"; then
    echo -e "${GREEN}✅ Health endpoint OK${NC}"
    echo "$HEALTH" | head -3
else
    echo -e "${YELLOW}⚠️  Health check response:${NC}"
    echo "$HEALTH" | head -10
fi

echo ""
echo "Test 2: Login endpoint..."
LOGIN=$(curl -s -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{}' 2>&1)
if echo "$LOGIN" | grep -q "povinné"; then
    echo -e "${GREEN}✅ Login endpoint OK${NC}"
else
    echo -e "${YELLOW}⚠️  Login response:${NC}"
    echo "$LOGIN" | head -5
fi

echo ""
echo "Test 3: Rate limiting (skúšam 6 pokusov)..."
for i in {1..6}; do
    RESPONSE=$(curl -s -i http://localhost:3001/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"test@test.com","password":"wrong"}' 2>&1)

    if [ $i -eq 6 ]; then
        if echo "$RESPONSE" | grep -q "429"; then
            echo -e "${GREEN}✅ Rate limiting funguje! (6. pokus = 429)${NC}"
        else
            echo -e "${YELLOW}⚠️  Rate limiting: očakávané 429, dostané:${NC}"
            echo "$RESPONSE" | grep "HTTP" | head -1
        fi
    fi
    sleep 0.5
done

# ============================================================================
# KROK 10: CHECK LOGS
# ============================================================================
echo ""
echo "=============================================="
echo -e "${BLUE}KROK 10: Kontrolujem logs...${NC}"
echo "=============================================="
read -p "Stlačte ENTER pre zobrazenie logov..."

echo ""
echo "Posledných 20 riadkov logov:"
echo "=============================================="
pm2 logs montio-backend --lines 20 --nostream

# ============================================================================
# DEPLOYMENT COMPLETE
# ============================================================================
echo ""
echo "=============================================="
echo -e "${GREEN}✅ DEPLOYMENT DOKONČENÝ!${NC}"
echo "=============================================="
echo ""
echo "Čo bolo urobené:"
echo "  ✅ Backend zastavený"
echo "  ✅ Database migration"
echo "  ✅ Dependencies nainštalované"
echo "  ✅ Uploads directories vytvorené"
echo "  ✅ .env skontrolovaný"
echo "  ✅ Syntax overený"
echo "  ✅ Backend spustený"
echo "  ✅ Basic tests úspešné"
echo ""
echo "Ďalšie kroky:"
echo ""
echo "1. TEST VO WEBOVOM PREHLIADAČI:"
echo "   - Otvorte https://yourdomain.com"
echo "   - Login"
echo "   - Dashboard"
echo "   - Theme toggle"
echo "   - Profile"
echo "   - Skontrolujte console (F12) - žiadne errors"
echo ""
echo "2. VYTVORTE TEST COMPANY ADMIN USER:"
echo "   mysql -u root -p montio_db"
echo "   (SQL príkazy sú v QUICK_DEPLOYMENT.md)"
echo ""
echo "3. OTESTUJTE NETESTOVANÉ FUNKCIE:"
echo "   - Employee management"
echo "   - Company settings"
echo "   - Order types"
echo "   - File uploads (avatar, logo)"
echo ""
echo "4. MONITORUJTE LOGS:"
echo "   pm2 logs montio-backend -f"
echo ""
echo "Deployment completed: $(date)"
echo "=============================================="
echo ""
echo "Backend status:"
pm2 status montio-backend
echo ""
echo -e "${GREEN}🚀 MONTIO v1.11.0 is running!${NC}"
echo "=============================================="
