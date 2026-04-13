# 🚀 PRODUCTION DEPLOYMENT - MONTIO v1.11.0

**Date:** 2026-04-13  
**Version:** v1.11.0 (Refactored)  
**Status:** Ready for Deployment

---

## ⚠️ PRE-DEPLOYMENT WARNING

**Test Coverage:** 40% Backend API (16/40 endpoints tested)

**Untested Areas:**
- Employee CRUD operations (0/10 endpoints)
- Company settings (0/6 endpoints)
- Order types (0/4 endpoints)
- File uploads (avatar, logo)

**Recommendation:**
- Deploy to staging first
- Complete remaining tests on staging
- Monitor for 24-48 hours before production

**If you choose to proceed to production anyway:**
- Have rollback plan ready
- Monitor logs closely
- Test critical features immediately after deployment

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### 1. Backup Current Production

```bash
# Connect to production server
ssh your-server

# Backup database
mysqldump -u root -p montio_db > /backups/montio_db_backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
ls -lh /backups/montio_db_backup_*.sql

# Backup current backend code
cd /var/www/montio
tar -czf /backups/montio_backend_backup_$(date +%Y%m%d_%H%M%S).tar.gz backend/

# Backup current frontend code
tar -czf /backups/montio_frontend_backup_$(date +%Y%m%d_%H%M%S).tar.gz frontend/dist/

# Verify backups
ls -lh /backups/
```

---

### 2. Stop Current Services

```bash
# Stop backend (PM2)
pm2 stop montio-backend

# Or if using systemd
# sudo systemctl stop montio-backend

# Verify stopped
pm2 status
```

---

### 3. Run Database Migration

```bash
# Navigate to project
cd /var/www/montio

# Run migration script
mysql -u root -p montio_db < database/migrations/production_migration_v1.11.0.sql

# Expected output:
# - "Column avatar_url already exists" OR column added
# - "Migration v1.11.0 completed successfully!"
# - Table structure displays
# - User counts

# Verify migration
mysql -u root -p montio_db -e "DESCRIBE users;" | grep avatar_url
# Should show: avatar_url | text | YES | | NULL
```

---

### 4. Update Backend Code

```bash
# Navigate to backend
cd /var/www/montio/backend

# Pull latest code (or upload files)
git pull origin main
# OR
# Upload files via SCP/FTP

# Install/update dependencies
npm install --production

# Verify new files exist
ls -la config/constants.js
ls -la middleware/companyMiddleware.js
ls -la middleware/rateLimiter.js
ls -la utils/errorHandler.js
ls -la utils/validation.js

# Create uploads directories
mkdir -p uploads/avatars
mkdir -p uploads/logos

# Set permissions
chmod 755 uploads uploads/avatars uploads/logos
sudo chown -R www-data:www-data uploads/

# Verify uploads directories
ls -la uploads/
```

---

### 5. Update Environment Variables

```bash
# Edit .env file
nano /var/www/montio/backend/.env

# Ensure these variables are set:
JWT_SECRET=your-strong-secret-here-min-32-characters
JWT_EXPIRES_IN=7d
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your-db-password
DB_NAME=montio_db
PORT=3001
NODE_ENV=production

# IMPORTANT: Set CORS origin for production
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Save and exit (Ctrl+X, Y, Enter)

# Verify .env
cat .env | grep -E "JWT_SECRET|CORS_ORIGIN|NODE_ENV"
```

---

### 6. Update Frontend Code

```bash
# Navigate to frontend
cd /var/www/montio/frontend

# Pull latest code
git pull origin main
# OR
# Upload files via SCP/FTP

# Install dependencies
npm install

# Set API URL for production
echo "VITE_API_URL=https://api.yourdomain.com" > .env.production
# OR if same domain
echo "VITE_API_URL=https://yourdomain.com" > .env.production

# Build for production
npm run build

# Verify build
ls -la dist/
# Should show index.html, assets/, etc.

# Deploy to nginx directory
sudo rm -rf /var/www/montio/html/*
sudo cp -r dist/* /var/www/montio/html/
sudo chown -R www-data:www-data /var/www/montio/html/

# Verify deployment
ls -la /var/www/montio/html/
```

---

### 7. Verify Backend Syntax

```bash
cd /var/www/montio/backend

# Verify main files
node -c server.js
node -c routes/auth.js
node -c middleware/rateLimiter.js
node -c utils/errorHandler.js

# All should return nothing (no output = success)
```

---

### 8. Start Backend Service

```bash
# Start with PM2
cd /var/www/montio/backend
pm2 start server.js --name montio-backend

# OR start with systemd
# sudo systemctl start montio-backend

# Save PM2 configuration
pm2 save

# Verify running
pm2 status

# Check logs
pm2 logs montio-backend --lines 50
```

---

### 9. Verify Backend Health

```bash
# Test health endpoint
curl https://api.yourdomain.com/health
# OR
curl https://yourdomain.com/api/health

# Expected response:
# {
#   "status": "OK",
#   "timestamp": "2026-04-13T...",
#   "environment": "production",
#   "database": "connected"
# }

# Test login endpoint
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}'

# Expected: {"message":"Nesprávny email alebo heslo."}
# This confirms backend is responding
```

---

### 10. Test Rate Limiting

```bash
# Test rate limiting (should block after 5 attempts)
for i in {1..6}; do
  echo "Attempt $i:"
  curl -s -i https://yourdomain.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' 2>&1 | grep -E "HTTP|X-RateLimit"
  sleep 1
done

# Expected:
# Attempts 1-5: HTTP/1.1 401 Unauthorized, X-RateLimit headers
# Attempt 6: HTTP/1.1 429 Too Many Requests
```

---

### 11. Test Frontend

```bash
# Test frontend loads
curl -s https://yourdomain.com | grep -i "MONTIO"

# Expected: HTML containing "MONTIO APP" or similar

# Open in browser and test:
# 1. Login page loads
# 2. Can login with valid credentials
# 3. Dashboard loads
# 4. Theme toggle works
# 5. Profile page works
# 6. No console errors in browser
```

---

### 12. Monitor Logs

```bash
# Backend logs (PM2)
pm2 logs montio-backend --lines 100

# Backend logs (systemd)
sudo journalctl -u montio-backend -f

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Watch for errors
# Look for: 500 errors, CORS errors, database errors
```

---

## 🧪 POST-DEPLOYMENT TESTING

### Critical Features to Test Immediately

**Test with superadmin account:**
```bash
# 1. Login
# Email: admin@montio.sk (or your superadmin email)
# Expected: Successful login, token received

# 2. Dashboard
# Navigate to /superadmin
# Expected: Company list loads

# 3. Profile
# Navigate to /profile
# Expected: Profile data loads

# 4. Theme toggle
# Click theme icon
# Expected: Theme changes, persists on refresh

# 5. Notifications
# Check notification bell
# Expected: Unread count shows
```

**⚠️ Cannot test until you create company admin user:**
- Employee management
- Company settings
- Order types
- Order calendar

**Recommendation:** Create test company admin user on production:

```sql
-- Connect to production database
mysql -u root -p montio_db

-- Create test company
INSERT INTO companies (name, ico, dic, status, invite_token, created_at)
VALUES ('Test Company s.r.o.', '12345678', '1234567890', 'active', 'test-prod-token', NOW());

-- Get company_id
SET @company_id = LAST_INSERT_ID();

-- Create company admin (password: TestProd123!)
-- Generate hash: node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('TestProd123!', 10));"
INSERT INTO users (email, password_hash, role, company_id, name, position, theme, created_at)
VALUES (
  'testadmin@yourdomain.com',
  '$2a$10$[generated-hash]',
  'companyadmin',
  @company_id,
  'Test Admin',
  'Administrátor',
  'dark',
  NOW()
);

-- Verify
SELECT * FROM users WHERE email = 'testadmin@yourdomain.com';
SELECT * FROM companies WHERE id = @company_id;
```

---

## 🚨 MONITORING CHECKLIST (First 24 Hours)

### Hour 1 - Immediate Monitoring

- [ ] Backend logs show no errors
- [ ] Frontend loads correctly
- [ ] Login works
- [ ] Dashboard loads
- [ ] No 500 errors in nginx logs
- [ ] Rate limiting working
- [ ] CORS headers correct

### Hour 3 - Extended Testing

- [ ] Create test company admin user
- [ ] Test employee management
- [ ] Test company settings
- [ ] Test order types
- [ ] Test file uploads (avatar, logo)
- [ ] Test notifications

### Hour 6 - Performance Check

- [ ] Response times < 500ms
- [ ] No memory leaks (check pm2 monit)
- [ ] Database connections stable
- [ ] CPU usage < 70%
- [ ] Memory usage < 80%

### Hour 24 - Stability Check

- [ ] No crashes or restarts
- [ ] Error rate < 1%
- [ ] All critical features working
- [ ] User feedback (if any users active)

---

## 🔄 ROLLBACK PROCEDURE (If Issues Occur)

### Quick Rollback

```bash
# 1. Stop current backend
pm2 stop montio-backend

# 2. Restore database backup
mysql -u root -p montio_db < /backups/montio_db_backup_YYYYMMDD_HHMMSS.sql

# 3. Restore backend code
cd /var/www/montio
rm -rf backend/
tar -xzf /backups/montio_backend_backup_YYYYMMDD_HHMMSS.tar.gz

# 4. Restore frontend code
sudo rm -rf /var/www/montio/html/*
cd /var/www/montio
tar -xzf /backups/montio_frontend_backup_YYYYMMDD_HHMMSS.tar.gz
sudo cp -r frontend/dist/* /var/www/montio/html/

# 5. Restart backend
cd /var/www/montio/backend
pm2 start server.js --name montio-backend

# 6. Verify rollback
curl https://yourdomain.com/api/health
```

---

## 📊 DEPLOYMENT SUMMARY

**What was deployed:**
- ✅ Backend refactoring (8 new files, 7 routes updated)
- ✅ Frontend refactoring (22 files migrated to apiClient)
- ✅ Database migration (avatar_url column, schema updates)
- ✅ Security improvements (rate limiting, CORS, validation)
- ✅ Performance improvements (71% fewer DB queries)

**What to monitor:**
- ⚠️ Employee CRUD operations (not fully tested)
- ⚠️ Company settings (not fully tested)
- ⚠️ File uploads (not fully tested)
- ⚠️ Slovak validators (not tested)

**Estimated time:**
- Deployment: 30-45 minutes
- Initial testing: 30 minutes
- Extended testing: 2-3 hours
- **Total: 3-4 hours**

---

## ✅ DEPLOYMENT COMPLETE

After completing all steps above:

1. ✅ Database migrated
2. ✅ Backend deployed
3. ✅ Frontend deployed
4. ✅ Services running
5. ✅ Basic tests passed

**Next Steps:**
1. Create company admin test user
2. Test remaining features (employees, settings, order types)
3. Monitor logs for 24-48 hours
4. Complete full test suite (see UNTESTED_AREAS.md)

---

## 📞 SUPPORT

**If issues occur:**

1. Check logs: `pm2 logs montio-backend`
2. Check nginx logs: `/var/log/nginx/error.log`
3. Review TESTING_RESULTS.md for known issues
4. Rollback if critical issues found
5. Report issues in project documentation

---

**Deployment Date:** _____________  
**Deployed By:** _____________  
**Rollback Tested:** Yes / No  
**Status:** Success / Issues Found  
**Notes:** _____________

---

**Version:** v1.11.0  
**Last Updated:** 2026-04-13  
**Document:** PRODUCTION_DEPLOYMENT_V1.11.0.md
