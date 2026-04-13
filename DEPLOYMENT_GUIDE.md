# DEPLOYMENT GUIDE - v1.11.0 (Refactored)

**Date:** 2026-04-13  
**Version:** v1.11.0 (Post-Refactoring)  
**Status:** Ready for Deployment

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### Code Verification

- [x] All backend routes refactored with asyncHandler and ensureCompanyId
- [x] All frontend components use apiClient instead of axios
- [x] No syntax errors in backend (node -c passed)
- [x] No console.error() calls in production code (except in catch blocks)
- [x] Environment validation on server startup
- [x] CORS configured with origin whitelist
- [x] Rate limiting enabled on login endpoint

### ⚠️ Testing Status

**IMPORTANT: Only 40% of backend endpoints have been tested!**

- [x] Authentication endpoints: 80% tested (8/10)
- [x] Security features: 100% tested (rate limiting, CORS, validation)
- [x] Dashboard endpoints: 75% tested (3/4)
- [ ] **Employee management: 0% tested (0/10 endpoints)** 🔴
- [ ] **Company settings: 0% tested (0/6 endpoints)** 🔴
- [ ] **Order types: 0% tested (0/4 endpoints)** 🔴
- [ ] **Orders: 50% tested (1/2 endpoints)** 🟡
- [ ] **Notifications: 50% tested (2/4 endpoints)** 🟡

**Why untested:**
- Most endpoints require `companyadmin` role with valid `company_id`
- Test user is `superadmin` (no company assigned)
- Need to create test company + company admin user

**See:** `UNTESTED_AREAS.md` for complete details and test setup instructions

**Recommendation:**
- ✅ Deploy to staging first
- ⚠️ Complete remaining 60% of tests on staging before production
- 🔴 **DO NOT skip testing employee CRUD, settings, and order management**

### Database

- [ ] Backup production database before deployment
- [ ] Review migration scripts in `/database/migrations/`
- [ ] Test migrations on staging environment first
- [ ] Verify all migrations have been applied

### Environment Variables

Required `.env` variables (validated on startup):
- [ ] `JWT_SECRET` - Strong random string (min 32 characters)
- [ ] `JWT_EXPIRES_IN` - Token expiration (e.g., "7d", "24h")
- [ ] `DB_HOST` - Database host
- [ ] `DB_USER` - Database user
- [ ] `DB_PASSWORD` - Database password
- [ ] `DB_NAME` - Database name
- [ ] `PORT` - Server port (default: 3001)
- [ ] `NODE_ENV` - Set to "production"

Optional but recommended:
- [ ] `CORS_ORIGIN` - Comma-separated list of allowed origins (e.g., "https://montio.com,https://www.montio.com")

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Prepare Backend

```bash
cd backend

# Install dependencies
npm install --production

# Create uploads directories
mkdir -p uploads/avatars
mkdir -p uploads/logos

# Set correct permissions
chmod 755 uploads
chmod 755 uploads/avatars
chmod 755 uploads/logos

# Verify environment
node -c server.js
```

### Step 2: Database Migrations

```bash
# Backup database first!
mysqldump -u root -p montio_db > backup_$(date +%Y%m%d).sql

# Apply migrations (if any new ones since last deployment)
mysql -u root -p montio_db < database/migrations/add_avatar_columns.sql

# Verify database structure
mysql -u root -p montio_db -e "SHOW TABLES;"
mysql -u root -p montio_db -e "DESCRIBE users;"
mysql -u root -p montio_db -e "DESCRIBE employees;"
```

### Step 3: Build Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set API URL for production (if needed)
echo "VITE_API_URL=https://api.yourdomain.com" > .env.production

# Build for production
npm run build

# Verify build
ls -la dist/
```

### Step 4: Deploy Backend

**Option A: PM2 (Recommended)**

```bash
cd backend

# Install PM2 globally (if not already installed)
npm install -g pm2

# Start server with PM2
pm2 start server.js --name montio-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup

# Monitor logs
pm2 logs montio-backend
```

**Option B: systemd Service**

Create `/etc/systemd/system/montio-backend.service`:

```ini
[Unit]
Description=Montio Backend API
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/montio/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable montio-backend
sudo systemctl start montio-backend
sudo systemctl status montio-backend
```

### Step 5: Deploy Frontend

**Option A: Nginx (Recommended)**

Copy built files:

```bash
sudo cp -r frontend/dist/* /var/www/montio/html/
sudo chown -R www-data:www-data /var/www/montio/html/
```

Nginx configuration (`/etc/nginx/sites-available/montio`):

```nginx
server {
    listen 80;
    server_name montio.com www.montio.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name montio.com www.montio.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/montio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/montio.com/privkey.pem;

    # Frontend
    root /var/www/montio/html;
    index index.html;

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve uploaded files
    location /uploads/ {
        alias /var/www/montio/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/montio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 6: SSL Certificate (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d montio.com -d www.montio.com
sudo certbot renew --dry-run  # Test auto-renewal
```

---

## ✅ POST-DEPLOYMENT VERIFICATION

### Backend Health Check

```bash
# Test health endpoint
curl https://api.montio.com/health

# Expected response:
# {
#   "status": "OK",
#   "timestamp": "2026-04-13T...",
#   "version": "v1.11.0",
#   "environment": "production",
#   "database": "connected"
# }
```

### Test Critical Endpoints

```bash
# Test login (should return 400 for missing credentials)
curl -X POST https://api.montio.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{}'

# Test rate limiting (5 failed attempts should trigger 429)
for i in {1..6}; do
  curl -X POST https://api.montio.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    -i
done

# Test CORS
curl -H "Origin: https://malicious.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Authorization" \
  -X OPTIONS \
  https://api.montio.com/api/auth/login \
  -i
# Should NOT return Access-Control-Allow-Origin header for malicious domain
```

### Frontend Verification

- [ ] Visit https://montio.com - should load login page
- [ ] Check browser console - no errors
- [ ] Test login with valid credentials
- [ ] Verify theme toggle works
- [ ] Check that all routes work (no 404s)
- [ ] Test file uploads (avatar, logo)
- [ ] Verify notifications work
- [ ] Test all CRUD operations

### Monitor Logs

```bash
# Backend logs (PM2)
pm2 logs montio-backend --lines 100

# Backend logs (systemd)
sudo journalctl -u montio-backend -f

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# MySQL logs
sudo tail -f /var/log/mysql/error.log
```

---

## 🔧 TROUBLESHOOTING

### Issue: 500 Internal Server Error

**Symptoms:** API returns 500 errors

**Diagnosis:**
```bash
# Check backend logs
pm2 logs montio-backend --err --lines 50

# Check for missing environment variables
pm2 env 0  # Shows environment for process ID 0
```

**Solution:**
- Verify all required .env variables are set
- Check database connection
- Verify uploads directories exist and have correct permissions

### Issue: CORS Errors

**Symptoms:** Browser console shows CORS errors

**Diagnosis:**
```bash
# Check current CORS_ORIGIN setting
grep CORS_ORIGIN backend/.env
```

**Solution:**
- Add frontend domain to CORS_ORIGIN in .env
- Format: `CORS_ORIGIN=https://montio.com,https://www.montio.com`
- Restart backend: `pm2 restart montio-backend`

### Issue: Rate Limiting Not Working

**Symptoms:** Can make unlimited login attempts

**Diagnosis:**
```bash
# Check if rate limiter is loaded
grep -r "loginRateLimiter" backend/routes/auth.js
```

**Solution:**
- Verify `loginRateLimiter` middleware is applied to login route
- Consider using Redis for distributed rate limiting in production
- Check logs for rate limiter errors

### Issue: Uploads Failing

**Symptoms:** Avatar/logo uploads fail with 500 error

**Diagnosis:**
```bash
# Check uploads directory
ls -la backend/uploads/
ls -la backend/uploads/avatars/
ls -la backend/uploads/logos/

# Check permissions
stat backend/uploads/
```

**Solution:**
```bash
mkdir -p backend/uploads/avatars backend/uploads/logos
chmod 755 backend/uploads backend/uploads/avatars backend/uploads/logos
chown www-data:www-data backend/uploads -R
```

### Issue: Database Queries Slow

**Symptoms:** API responses slow, high DB load

**Diagnosis:**
```bash
# Check slow query log
sudo tail -f /var/log/mysql/slow-queries.log

# Check process list
mysql -u root -p -e "SHOW FULL PROCESSLIST;"
```

**Solution:**
- Verify ensureCompanyId middleware is working (should reduce queries by 50+)
- Add indexes to frequently queried columns
- Optimize slow queries
- Consider connection pooling tuning in `backend/config/db.js`

---

## 🔄 ROLLBACK PROCEDURE

If deployment fails and you need to rollback:

### Step 1: Restore Database

```bash
# Stop backend
pm2 stop montio-backend

# Restore database backup
mysql -u root -p montio_db < backup_YYYYMMDD.sql

# Start backend
pm2 start montio-backend
```

### Step 2: Restore Frontend

```bash
# Deploy previous version
cd /var/www/montio/html/
sudo rm -rf *
sudo cp -r /backups/frontend-previous/* .
```

### Step 3: Restore Backend

```bash
cd /var/www/montio/backend
git checkout previous-version-tag
npm install --production
pm2 restart montio-backend
```

### Step 4: Verify Rollback

- Test login
- Check logs for errors
- Monitor for 5-10 minutes

---

## 📊 MONITORING

### Key Metrics to Monitor

1. **Server Health**
   - CPU usage (should be < 70%)
   - Memory usage (should be < 80%)
   - Disk space (should have 20%+ free)

2. **Application Metrics**
   - Response times (should be < 500ms)
   - Error rate (should be < 1%)
   - Database connection pool usage

3. **Security Metrics**
   - Failed login attempts
   - Rate limit violations
   - Unusual API access patterns

### Monitoring Tools

**PM2 Monitoring:**
```bash
pm2 monit  # Real-time monitoring
pm2 status  # Process status
```

**System Monitoring:**
```bash
htop  # CPU and memory
iotop  # Disk I/O
nethogs  # Network usage
```

**Database Monitoring:**
```bash
mysql -u root -p -e "SHOW STATUS LIKE 'Threads_connected';"
mysql -u root -p -e "SHOW STATUS LIKE 'Slow_queries';"
```

---

## 📚 ADDITIONAL RESOURCES

- **TESTING_CHECKLIST.md** - Comprehensive testing guide
- **REFACTORING.md** - Refactoring documentation
- **STATUS.md** - Current project status
- **PRODUCTION_DEPLOYMENT.md** - Original deployment guide

---

## 🆘 SUPPORT

If you encounter issues not covered in this guide:

1. Check backend logs: `pm2 logs montio-backend`
2. Check nginx logs: `/var/log/nginx/error.log`
3. Review TESTING_CHECKLIST.md for potential issues
4. Check GitHub issues: `https://github.com/[your-repo]/issues`

---

**Last Updated:** 2026-04-13  
**Deployment Status:** Ready  
**Next Review:** After first production deployment
