#!/bin/bash

# ============================================================================
# MONTIO v1.11.0 - Production Deployment Script
# ============================================================================
# This script automates the production deployment process
# Run on production server as: bash deploy-production.sh
# ============================================================================

set -e  # Exit on error

echo "=============================================="
echo "MONTIO v1.11.0 - PRODUCTION DEPLOYMENT"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="/backups"
PROJECT_DIR="/var/www/montio"
DB_NAME="montio_db"
DB_USER="root"

echo -e "${YELLOW}⚠️  WARNING: This will deploy v1.11.0 to production${NC}"
echo "Test coverage: 40% (60% untested)"
echo ""
read -p "Have you backed up your database? (yes/no): " confirm_backup
if [ "$confirm_backup" != "yes" ]; then
    echo -e "${RED}❌ Please backup your database first!${NC}"
    echo "Run: mysqldump -u root -p $DB_NAME > backup_\$(date +%Y%m%d_%H%M%S).sql"
    exit 1
fi

echo ""
read -p "Continue with deployment? (yes/no): " confirm_deploy
if [ "$confirm_deploy" != "yes" ]; then
    echo -e "${YELLOW}Deployment cancelled${NC}"
    exit 0
fi

echo ""
echo "=============================================="
echo "STEP 1: Creating Backups"
echo "=============================================="

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Backup database
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
echo "Backing up database..."
read -sp "Enter MySQL password: " DB_PASSWORD
echo ""
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/montio_db_backup_$TIMESTAMP.sql
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database backed up to $BACKUP_DIR/montio_db_backup_$TIMESTAMP.sql${NC}"
else
    echo -e "${RED}❌ Database backup failed!${NC}"
    exit 1
fi

# Backup backend code
echo "Backing up backend code..."
cd $PROJECT_DIR
tar -czf $BACKUP_DIR/montio_backend_backup_$TIMESTAMP.tar.gz backend/
echo -e "${GREEN}✅ Backend backed up${NC}"

# Backup frontend code
echo "Backing up frontend code..."
tar -czf $BACKUP_DIR/montio_frontend_backup_$TIMESTAMP.tar.gz frontend/dist/
echo -e "${GREEN}✅ Frontend backed up${NC}"

echo ""
echo "=============================================="
echo "STEP 2: Stopping Services"
echo "=============================================="

# Stop backend
pm2 stop montio-backend 2>/dev/null || echo "Backend not running"
echo -e "${GREEN}✅ Backend stopped${NC}"

echo ""
echo "=============================================="
echo "STEP 3: Running Database Migration"
echo "=============================================="

if [ -f "$PROJECT_DIR/database/migrations/production_migration_v1.11.0.sql" ]; then
    echo "Running migration..."
    mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < $PROJECT_DIR/database/migrations/production_migration_v1.11.0.sql
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Migration completed${NC}"
    else
        echo -e "${RED}❌ Migration failed!${NC}"
        echo "Restoring database backup..."
        mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < $BACKUP_DIR/montio_db_backup_$TIMESTAMP.sql
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Migration file not found, skipping${NC}"
fi

echo ""
echo "=============================================="
echo "STEP 4: Updating Backend"
echo "=============================================="

cd $PROJECT_DIR/backend

# Install dependencies
echo "Installing dependencies..."
npm install --production
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Create uploads directories
echo "Creating uploads directories..."
mkdir -p uploads/avatars uploads/logos
chmod 755 uploads uploads/avatars uploads/logos
sudo chown -R www-data:www-data uploads/ 2>/dev/null || chown -R $(whoami) uploads/
echo -e "${GREEN}✅ Uploads directories ready${NC}"

# Verify new files
echo "Verifying new files..."
if [ -f "config/constants.js" ]; then
    echo -e "${GREEN}✅ config/constants.js found${NC}"
else
    echo -e "${RED}❌ config/constants.js missing!${NC}"
fi

if [ -f "middleware/rateLimiter.js" ]; then
    echo -e "${GREEN}✅ middleware/rateLimiter.js found${NC}"
else
    echo -e "${RED}❌ middleware/rateLimiter.js missing!${NC}"
fi

if [ -f "utils/errorHandler.js" ]; then
    echo -e "${GREEN}✅ utils/errorHandler.js found${NC}"
else
    echo -e "${RED}❌ utils/errorHandler.js missing!${NC}"
fi

# Verify syntax
echo "Verifying backend syntax..."
node -c server.js && echo -e "${GREEN}✅ server.js OK${NC}" || echo -e "${RED}❌ server.js has errors${NC}"

echo ""
echo "=============================================="
echo "STEP 5: Checking Environment Variables"
echo "=============================================="

if [ -f ".env" ]; then
    if grep -q "CORS_ORIGIN" .env; then
        echo -e "${GREEN}✅ CORS_ORIGIN is set${NC}"
    else
        echo -e "${YELLOW}⚠️  CORS_ORIGIN not set in .env${NC}"
        echo "Add: CORS_ORIGIN=https://yourdomain.com"
    fi

    if grep -q "NODE_ENV=production" .env; then
        echo -e "${GREEN}✅ NODE_ENV=production${NC}"
    else
        echo -e "${YELLOW}⚠️  NODE_ENV not set to production${NC}"
    fi
else
    echo -e "${RED}❌ .env file not found!${NC}"
    exit 1
fi

echo ""
echo "=============================================="
echo "STEP 6: Starting Backend"
echo "=============================================="

pm2 start server.js --name montio-backend
pm2 save
echo -e "${GREEN}✅ Backend started${NC}"

# Wait for backend to start
sleep 3

# Check if running
if pm2 list | grep -q "montio-backend.*online"; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend failed to start!${NC}"
    echo "Check logs: pm2 logs montio-backend"
    exit 1
fi

echo ""
echo "=============================================="
echo "STEP 7: Testing Backend"
echo "=============================================="

# Test health endpoint
echo "Testing health endpoint..."
HEALTH=$(curl -s http://localhost:3001/health 2>&1)
if echo "$HEALTH" | grep -q "OK"; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Health endpoint returned: $HEALTH${NC}"
fi

# Test login endpoint
echo "Testing login endpoint..."
LOGIN=$(curl -s -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{}' 2>&1)
if echo "$LOGIN" | grep -q "povinné"; then
    echo -e "${GREEN}✅ Login endpoint responding${NC}"
else
    echo -e "${YELLOW}⚠️  Login response: $LOGIN${NC}"
fi

echo ""
echo "=============================================="
echo "DEPLOYMENT COMPLETE"
echo "=============================================="
echo ""
echo -e "${GREEN}✅ Backend v1.11.0 deployed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Update frontend (build and deploy)"
echo "2. Test in browser:"
echo "   - Login works"
echo "   - Dashboard loads"
echo "   - Theme toggle works"
echo "   - Profile page works"
echo "3. Monitor logs: pm2 logs montio-backend"
echo "4. Check for errors in first hour"
echo ""
echo "Backups saved to:"
echo "  - $BACKUP_DIR/montio_db_backup_$TIMESTAMP.sql"
echo "  - $BACKUP_DIR/montio_backend_backup_$TIMESTAMP.tar.gz"
echo "  - $BACKUP_DIR/montio_frontend_backup_$TIMESTAMP.tar.gz"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Test remaining features (see UNTESTED_AREAS.md)${NC}"
echo "   - Employee management (0% tested)"
echo "   - Company settings (0% tested)"
echo "   - Order types (0% tested)"
echo ""
echo "Deployment completed at: $(date)"
echo "=============================================="
