# 🚀 QUICK DEPLOYMENT - MONTIO v1.11.0

**Pre production DB s testovacími dátami**  
**Date:** 2026-04-13

---

## ⚡ RÝCHLY DEPLOYMENT (15 minút)

Keďže sú na production DB len testovacie dáta, môžeme ísť rýchlo bez zložitých backupov.

---

## 📋 DEPLOYMENT KROKY

### 1. Pripojte sa na production server

```bash
ssh your-production-server
cd /var/www/montio
```

---

### 2. Stop backend

```bash
pm2 stop montio-backend
# alebo
sudo systemctl stop montio-backend
```

---

### 3. Spustite DB migráciu

```bash
# Stiahnite nový migration script na server (alebo skopírujte obsah)

# Spustite migráciu
mysql -u root -p montio_db < database/migrations/simple_migration_v1.11.0.sql

# Očakávaný output:
# ✅ Migration completed!
# Zobrazí stĺpce a počty záznamov
```

**Alternatívne (priamo cez mysql):**

```bash
mysql -u root -p montio_db

# Potom spustite príkazy:
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
END
WHERE position IS NULL OR position = '';

UPDATE users SET name = SUBSTRING_INDEX(email, '@', 1)
WHERE name IS NULL OR name = '';

EXIT;
```

---

### 4. Update backend kód

```bash
cd /var/www/montio/backend

# Option A: Git pull (ak máte git setup)
git pull origin main

# Option B: Upload files cez SCP/FTP
# Nahrajte tieto súbory:
# - config/constants.js
# - middleware/companyMiddleware.js
# - middleware/rateLimiter.js
# - utils/errorHandler.js
# - utils/validation.js
# - routes/auth.js (updated)
# - routes/dashboard.js (updated)
# - routes/employees.js (updated)
# - routes/orders.js (updated)
# - routes/settings.js (updated)
# - routes/orderTypes.js (updated)
# - server.js (updated)

# Install dependencies
npm install --production

# Vytvorte uploads directories
mkdir -p uploads/avatars uploads/logos
chmod 755 uploads uploads/avatars uploads/logos

# Set ownership (ak beží ako www-data)
sudo chown -R www-data:www-data uploads/
# alebo ak beží pod iným userom
chown -R $(whoami) uploads/
```

---

### 5. Skontrolujte .env súbor

```bash
nano .env

# MUSÍ obsahovať:
JWT_SECRET=your-strong-secret-min-32-chars
JWT_EXPIRES_IN=7d
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=montio_db
PORT=3001
NODE_ENV=production

# DÔLEŽITÉ: Nastavte CORS_ORIGIN
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
# alebo ak je frontend na tej istej doméne
CORS_ORIGIN=https://yourdomain.com

# Uložte (Ctrl+X, Y, Enter)
```

---

### 6. Verify syntax

```bash
cd /var/www/montio/backend

# Quick syntax check
node -c server.js
node -c routes/auth.js
node -c middleware/rateLimiter.js

# Žiadny output = OK
```

---

### 7. Start backend

```bash
# PM2
pm2 start server.js --name montio-backend
pm2 save

# alebo systemd
sudo systemctl start montio-backend

# Check status
pm2 status
# alebo
sudo systemctl status montio-backend
```

---

### 8. Test backend

```bash
# Health check
curl http://localhost:3001/health
# Expected: {"status":"OK",...}

# Login test
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}'
# Expected: {"message":"Nesprávny email alebo heslo."}

# Rate limiting test (6 pokusov)
for i in {1..6}; do
  echo "Pokus $i:"
  curl -s -i http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' | grep -E "HTTP|X-RateLimit"
  sleep 1
done
# Expected: Pokus 6 = HTTP 429
```

---

### 9. Check logs

```bash
# PM2
pm2 logs montio-backend --lines 50

# systemd
sudo journalctl -u montio-backend -n 50

# Look for:
# ✅ "MONTIO Backend running on http://localhost:3001"
# ✅ "Environment: production"
# ✅ "Database: 127.0.0.1"
# ❌ Žiadne errors
```

---

### 10. Update frontend (ak treba rebuild)

```bash
cd /var/www/montio/frontend

# Pull latest
git pull origin main

# Install
npm install

# Set API URL
echo "VITE_API_URL=https://yourdomain.com" > .env.production

# Build
npm run build

# Deploy
sudo rm -rf /var/www/montio/html/*
sudo cp -r dist/* /var/www/montio/html/
sudo chown -R www-data:www-data /var/www/montio/html/
```

---

### 11. Test vo webovom prehliadači

1. **Otvorte** `https://yourdomain.com`
2. **Login** s existujúcim účtom
3. **Dashboard** - musí sa načítať
4. **Theme toggle** - musí fungovať
5. **Profile** - musí sa načítať
6. **Console** - žiadne errors (F12 → Console)

---

### 12. Monitor logs (prvá hodina)

```bash
# Watch logs continuously
pm2 logs montio-backend -f

# alebo
sudo journalctl -u montio-backend -f

# Watch for:
# ❌ 500 errors
# ❌ CORS errors
# ❌ Database connection errors
# ❌ Unhandled promise rejections
# ✅ Successful API calls
```

---

## 🧪 POST-DEPLOYMENT TEST CHECKLIST

### Okamžite po deplomente:

- [ ] Backend beží (`pm2 status` alebo `systemctl status`)
- [ ] Health endpoint works (`curl http://localhost:3001/health`)
- [ ] Login endpoint responds
- [ ] Rate limiting funguje (6. pokus = 429)
- [ ] Frontend sa načíta
- [ ] Login vo frontende funguje
- [ ] Dashboard sa zobrazí
- [ ] Theme toggle funguje
- [ ] Žiadne console errors
- [ ] Žiadne 500 errors v backend logs

---

### V prvej hodine:

- [ ] Vytvorte test company admin user:

```sql
mysql -u root -p montio_db

INSERT INTO companies (name, ico, dic, status, invite_token, created_at)
VALUES ('Test Firma s.r.o.', '12345678', '1234567890', 'active', 'test-token-123', NOW());

SET @company_id = LAST_INSERT_ID();

-- Generate password hash for "TestPass123!"
-- node -e "console.log(require('bcryptjs').hashSync('TestPass123!', 10))"

INSERT INTO users (email, password_hash, role, company_id, name, position, theme, created_at)
VALUES (
  'testadmin@yourdomain.com',
  '$2a$10$HASH_HERE',  -- Nahraďte reálnym hashom
  'companyadmin',
  @company_id,
  'Test Admin',
  'Administrátor',
  'dark',
  NOW()
);

EXIT;
```

- [ ] Login ako testadmin@yourdomain.com
- [ ] Test employee management (create, edit, delete)
- [ ] Test company settings (všetky tabs)
- [ ] Test order types (create, edit, delete)
- [ ] Test file upload (avatar v profile)
- [ ] Test notifications

---

## 🚨 AK SA VYSKYTNE PROBLÉM

### Backend sa nespustí

```bash
# Check logs
pm2 logs montio-backend --err

# Common issues:
# - Missing .env variable → Add it to .env
# - Port 3001 occupied → Change PORT in .env
# - DB connection failed → Check DB credentials
```

### CORS errors vo frontende

```bash
# Check CORS_ORIGIN in .env
nano /var/www/montio/backend/.env

# Add your domain:
CORS_ORIGIN=https://yourdomain.com

# Restart backend
pm2 restart montio-backend
```

### Rate limiting nefunguje

```bash
# Check if rateLimiter.js was deployed
ls -la /var/www/montio/backend/middleware/rateLimiter.js

# Check if imported in routes/auth.js
grep -n "rateLimiter" /var/www/montio/backend/routes/auth.js

# Restart backend
pm2 restart montio-backend
```

### 500 errors

```bash
# Check backend logs for actual error
pm2 logs montio-backend --err --lines 100

# Common causes:
# - Missing column in DB → Run migration again
# - Missing .env variable → Check .env
# - File upload directory → Check uploads/ permissions
```

---

## ⏱️ ČASOVÝ ODHAD

| Krok | Čas |
|------|-----|
| SSH + pripojenie | 1 min |
| Stop backend | 1 min |
| DB migrácia | 2 min |
| Update kódu | 3 min |
| npm install | 2 min |
| Uploads directories | 1 min |
| .env check | 1 min |
| Start backend | 1 min |
| Testing | 3 min |
| **CELKOM** | **15 minút** |

---

## ✅ DEPLOYMENT DONE

**Čo bolo nasadené:**
- ✅ DB schema updated (avatar_url, JSON columns)
- ✅ Backend refactored code
- ✅ Rate limiting (5 req/15min on login)
- ✅ CORS configured
- ✅ Error handling improved
- ✅ 71% fewer DB queries

**Čo testovať ďalej:**
- ⚠️ Employee CRUD (0% tested)
- ⚠️ Company settings (0% tested)
- ⚠️ Order types (0% tested)
- ⚠️ File uploads (avatar, logo)

**Monitor:**
- Logs prvých 24 hodín
- Performance (response times)
- Error rate
- User feedback

---

**Deployment Date:** ______________  
**Deployed By:** ______________  
**Status:** Success / Issues  
**Notes:** ______________

---

**Version:** v1.11.0  
**Document:** QUICK_DEPLOYMENT.md
