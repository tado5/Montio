#!/bin/bash

# ============================================================================
# MONTIO v1.11.0 - Quick Production Deployment
# Pre production DB s testovacími dátami
# ============================================================================

set -e

echo "=============================================="
echo "🚀 MONTIO v1.11.0 - QUICK DEPLOY"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Config
PROJECT_DIR="/var/www/montio"
DB_NAME="montio_db"
DB_USER="root"

echo -e "${YELLOW}⚡ Quick deployment for test data DB${NC}"
echo ""
read -p "Continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Cancelled"
    exit 0
fi

echo ""
echo "=============================================="
echo "1. Stopping backend..."
echo "=============================================="
pm2 stop montio-backend 2>/dev/null || echo "Not running"
echo -e "${GREEN}✅ Stopped${NC}"

echo ""
echo "=============================================="
echo "2. Running DB migration..."
echo "=============================================="
read -sp "MySQL password: " DB_PASSWORD
echo ""

# Check if migration file exists
if [ -f "$PROJECT_DIR/database/migrations/simple_migration_v1.11.0.sql" ]; then
    mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < $PROJECT_DIR/database/migrations/simple_migration_v1.11.0.sql
    echo -e "${GREEN}✅ Migration done${NC}"
else
    echo -e "${YELLOW}Migration file not found, running inline...${NC}"
    mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME << 'EOSQL'
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT NULL AFTER theme;
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255) NULL AFTER role;
ALTER TABLE users ADD COLUMN IF NOT EXISTS position VARCHAR(255) NULL AFTER name;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS avatar_url TEXT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS billing_data JSON NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS financial_data JSON NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS contact_data JSON NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS invoice_settings JSON NULL;
UPDATE users SET position = CASE
  WHEN role = 'superadmin' THEN 'Administrátor systému'
  WHEN role = 'companyadmin' THEN 'Majiteľ firmy'
  WHEN role = 'employee' THEN 'Zamestnanec'
  ELSE 'Používateľ'
END WHERE position IS NULL OR position = '';
UPDATE users SET name = SUBSTRING_INDEX(email, '@', 1) WHERE name IS NULL OR name = '';
SELECT 'Migration completed' AS status;
EOSQL
    echo -e "${GREEN}✅ Inline migration done${NC}"
fi

echo ""
echo "=============================================="
echo "3. Updating backend..."
echo "=============================================="
cd $PROJECT_DIR/backend

echo "Installing dependencies..."
npm install --production
echo -e "${GREEN}✅ Dependencies installed${NC}"

echo "Creating uploads directories..."
mkdir -p uploads/avatars uploads/logos
chmod 755 uploads uploads/avatars uploads/logos
sudo chown -R www-data:www-data uploads/ 2>/dev/null || chown -R $(whoami) uploads/
echo -e "${GREEN}✅ Uploads ready${NC}"

echo ""
echo "=============================================="
echo "4. Verifying files..."
echo "=============================================="

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1 MISSING!${NC}"
    fi
}

check_file "config/constants.js"
check_file "middleware/rateLimiter.js"
check_file "middleware/companyMiddleware.js"
check_file "utils/errorHandler.js"
check_file "utils/validation.js"

echo ""
echo "=============================================="
echo "5. Checking .env..."
echo "=============================================="

if [ -f ".env" ]; then
    if grep -q "CORS_ORIGIN" .env; then
        echo -e "${GREEN}✅ CORS_ORIGIN set${NC}"
    else
        echo -e "${YELLOW}⚠️  CORS_ORIGIN not set!${NC}"
        echo "Add to .env: CORS_ORIGIN=https://yourdomain.com"
    fi

    if grep -q "NODE_ENV=production" .env; then
        echo -e "${GREEN}✅ NODE_ENV=production${NC}"
    else
        echo -e "${YELLOW}⚠️  NODE_ENV not set to production${NC}"
    fi
else
    echo -e "${RED}❌ .env file missing!${NC}"
    exit 1
fi

echo ""
echo "=============================================="
echo "6. Starting backend..."
echo "=============================================="
pm2 start server.js --name montio-backend
pm2 save
echo -e "${GREEN}✅ Backend started${NC}"

sleep 2

echo ""
echo "=============================================="
echo "7. Testing..."
echo "=============================================="

# Health check
echo "Health check..."
HEALTH=$(curl -s http://localhost:3001/health 2>&1)
if echo "$HEALTH" | grep -q "OK"; then
    echo -e "${GREEN}✅ Health OK${NC}"
else
    echo -e "${YELLOW}⚠️  Health response: $HEALTH${NC}"
fi

# Login test
echo "Login test..."
LOGIN=$(curl -s -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{}' 2>&1)
if echo "$LOGIN" | grep -q "povinné"; then
    echo -e "${GREEN}✅ Login endpoint OK${NC}"
else
    echo -e "${YELLOW}⚠️  Login response: $LOGIN${NC}"
fi

echo ""
echo "=============================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=============================================="
echo ""
echo "Next steps:"
echo "1. Test login in browser"
echo "2. Check dashboard loads"
echo "3. Test theme toggle"
echo "4. Create test company admin user"
echo "5. Test employee management"
echo ""
echo "Monitor logs:"
echo "  pm2 logs montio-backend"
echo ""
echo "Deployment completed: $(date)"
echo "=============================================="
