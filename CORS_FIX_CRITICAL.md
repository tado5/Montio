# 🚨 CRITICAL FIX - CORS Blocking API Calls (ROOT CAUSE FOUND!)

**Dátum:** 2026-04-15 09:45  
**Status:** 🔴 **ROOT CAUSE IDENTIFIED**  
**Severity:** CRITICAL - Application completely broken

---

## 🎯 ROOT CAUSE (NAŠIEL SA!)

### Problém v Refactoringu (Commit e42d974)

Pri veľkom refactoringu (v1.11.0) bol pridaný **CORS whitelist security feature**:

**backend/config/constants.js:**
```javascript
export const CORS_CONFIG = {
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  // ❌ DEFAULT: Len localhost:3000
  // ❌ Production potrebuje: ['https://montio.tsdigital.sk']
  CREDENTIALS: true,
  METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  ALLOWED_HEADERS: ['Content-Type', 'Authorization']
};
```

**backend/server.js:**
```javascript
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    // In development, allow localhost
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // In production, check whitelist
    const allowedOrigins = CORS_CONFIG.ALLOWED_ORIGINS;
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));  // ❌ TOTO BLOKUJE REQUESTY!
    }
  },
  credentials: CORS_CONFIG.CREDENTIALS,
  methods: CORS_CONFIG.METHODS,
  allowedHeaders: CORS_CONFIG.ALLOWED_HEADERS
}));
```

---

## 💥 Čo sa stalo v produkcii:

1. **Backend sa spustil bez `ALLOWED_ORIGINS` env variable**
2. **CORS_CONFIG použil default:** `['http://localhost:3000']`
3. **Frontend volá z:** `https://montio.tsdigital.sk`
4. **NODE_ENV nie je nastavený** → server myslí že je v production
5. **CORS kontrola zlyhá:** `'https://montio.tsdigital.sk'` nie je v `['http://localhost:3000']`
6. **Výsledok:** `callback(new Error('Not allowed by CORS'))`
7. **Browser dostane:** `502 Bad Gateway` (alebo CORS error)

---

## ✅ Riešenie (3 kroky)

### Krok 1: Vytvoriť `.env` súbor na production serveri ✅

**Na production serveri (cez SSH alebo File Manager):**

**Cesta:** `/tsdigital.sk/sub/montio/api/.env`

**Obsah:**
```env
# PRODUCTION Environment Variables

# Database Configuration
DB_HOST=sql14.hostcreators.sk
DB_PORT=3319
DB_USER=u46895_montio
DB_PASSWORD=x52D_Z-lb!UX6n5
DB_NAME=d46895_montio

# JWT Secret (64+ chars random hex)
JWT_SECRET=vygeneruj_pomocou_crypto_randomBytes_64_chars_minimum
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=production

# Frontend URL
FRONTEND_URL=https://montio.tsdigital.sk

# ⚠️ CRITICAL: CORS Configuration
# Comma-separated list of allowed origins (NO SPACES!)
ALLOWED_ORIGINS=https://montio.tsdigital.sk,https://www.montio.tsdigital.sk
```

**Generovanie JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### Krok 2: Reštartovať Backend Docker Container ✅

**Cez Hostcreator Admin Panel:**
1. Prejdi na: GIT Webhook Admin
2. Klikni na: **Restart Application**
3. Alebo: **Re-trigger Webhook** (push to production branch)

**Cez SSH (ak máš prístup):**
```bash
# Docker
docker restart montio-backend

# Alebo PM2
pm2 restart montio-backend
```

---

### Krok 3: Testovanie ✅

**Test 1: API Health Check**
```bash
curl https://montio.tsdigital.sk/api/health

# Expected:
# {"status":"ok","message":"MONTIO API is running","version":"1.10.0",...}
```

**Test 2: CORS Headers**
```bash
curl -I -X OPTIONS https://montio.tsdigital.sk/api/auth/login \
  -H "Origin: https://montio.tsdigital.sk" \
  -H "Access-Control-Request-Method: POST"

# Expected headers:
# Access-Control-Allow-Origin: https://montio.tsdigital.sk
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH
# Access-Control-Allow-Credentials: true
```

**Test 3: Login Test**
```bash
curl -X POST https://montio.tsdigital.sk/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://montio.tsdigital.sk" \
  -d '{"email":"admin@montio.sk","password":"admin123"}'

# Expected:
# {"success":true,"token":"...","user":{...}}
```

**Test 4: Frontend Browser Test**
1. Otvoriť: https://montio.tsdigital.sk
2. Skúsiť login: admin@montio.sk / admin123
3. Skontrolovať Console (F12) - **žiadne CORS errors!**
4. Skontrolovať Network tab - API calls majú status 200 ✅

---

## 📊 Pred a Po Oprave

### PRED Opravou ❌

**Backend .env súbor:**
```env
# NEEXISTUJE!
```

**CORS_CONFIG.ALLOWED_ORIGINS:**
```javascript
['http://localhost:3000']  // ❌ Default
```

**Frontend request:**
```
Origin: https://montio.tsdigital.sk
```

**Backend response:**
```
❌ Error: Not allowed by CORS
❌ 502 Bad Gateway
```

---

### PO Oprave ✅

**Backend .env súbor:**
```env
ALLOWED_ORIGINS=https://montio.tsdigital.sk,https://www.montio.tsdigital.sk
NODE_ENV=production
```

**CORS_CONFIG.ALLOWED_ORIGINS:**
```javascript
['https://montio.tsdigital.sk', 'https://www.montio.tsdigital.sk']  // ✅
```

**Frontend request:**
```
Origin: https://montio.tsdigital.sk
```

**Backend response:**
```
✅ 200 OK
✅ Access-Control-Allow-Origin: https://montio.tsdigital.sk
✅ Access-Control-Allow-Credentials: true
```

---

## 🔍 Ako sme to zistili?

### Debug Timeline:

1. **User report:** "api/auth/login:1 Failed to load resource: 502"
2. **První check:** Production branch zastaralý → OPRAVENÉ ✅
3. **Druhý check:** 502 error pretrváva → deploy.yml opravený ✅
4. **Tretí check:** Git refactoring history
5. **Commit e42d974:** "Major backend/frontend refactoring"
6. **Diff server.js:** Pridaný CORS whitelist security ⚠️
7. **Check constants.js:** `ALLOWED_ORIGINS` z env variable
8. **Check .env.example:** ❌ **CHÝBA `ALLOWED_ORIGINS`!**
9. **ROOT CAUSE FOUND!** 🎯

---

## 📝 Zmeny v Repozitári

### Opravené Súbory:

1. **backend/.env.example** - Pridaný `ALLOWED_ORIGINS` parameter
2. **backend/.env** - Pridaný `ALLOWED_ORIGINS=http://localhost:3000`
3. **backend/.env.production** - Nový template pre production
4. **backend/.gitignore** - Pridaný `.env.production` do ignoru

### Nové Dokumenty:

- `CORS_FIX_CRITICAL.md` - Tento dokument
- `BACKEND_502_ERROR_ANALYSIS.md` - Predošlá analýza
- `EMAIL_PRE_HOSTCREATOR_502.md` - Email template (už nepotrebný)

---

## 🎓 Lessons Learned

### 1. Environment Variables Documentation
**Problém:** `.env.example` nemal všetky potrebné premenné  
**Riešenie:** Vždy updatovať `.env.example` pri pridávaní nových env vars  
**Prevention:** Automated check script

### 2. Breaking Changes in Refactoring
**Problém:** CORS whitelist bol pridaný bez dokumentácie deployment zmien  
**Riešenie:** Changelog musí obsahovať **Breaking Changes** sekciu  
**Prevention:** Deployment checklist

### 3. Production Testing
**Problém:** Refactoring nebol testovaný v production-like environment  
**Riešenie:** Staging environment s production config  
**Prevention:** CI/CD smoke tests

### 4. Git Commit Messages
**Lesson:** Commit message spomenul "CORS whitelist" ale neupozornil na **BREAKING CHANGE**  
**Better:** 
```
feat!: Add CORS whitelist (BREAKING CHANGE)

BREAKING CHANGE: CORS now uses whitelist in production.
Requires ALLOWED_ORIGINS env variable.

Before: All origins allowed
After: Only whitelisted origins allowed

Migration:
1. Add ALLOWED_ORIGINS to .env
2. Set NODE_ENV=production
```

---

## 🚀 Deployment Checklist (Updated)

### Pre-Deployment:
- [ ] Check `.env.example` má všetky required variables
- [ ] Run app lokálne s production-like config
- [ ] Test CORS s external domain (ngrok, etc.)
- [ ] Review breaking changes v CHANGELOG.md

### Deployment:
- [ ] Create `.env` file on server
- [ ] Set all required env variables
- [ ] **Especially:** `ALLOWED_ORIGINS`, `NODE_ENV`, `JWT_SECRET`
- [ ] Restart backend service
- [ ] Verify environment variables loaded: `console.log(process.env)`

### Post-Deployment:
- [ ] Test API health check
- [ ] Test CORS headers
- [ ] Test login from browser
- [ ] Check Console for CORS errors
- [ ] Monitor error logs

---

## 📞 Action Required FROM YOU

### IMMEDIATE (Now):

1. **SSH/FTP do production servera**
2. **Vytvor súbor:** `/tsdigital.sk/sub/montio/api/.env`
3. **Copy obsah z:** `backend/.env.production` template
4. **Vyplň credentials:**
   - DB_PASSWORD: `x52D_Z-lb!UX6n5`
   - JWT_SECRET: Vygeneruj s crypto (alebo použi existujúci)
5. **CRITICAL:** Set `ALLOWED_ORIGINS=https://montio.tsdigital.sk`
6. **Reštartuj backend** (Docker/PM2)

### NEXT (After restart):

1. **Test:** https://montio.tsdigital.sk
2. **Login:** admin@montio.sk / admin123
3. **Check Console:** Žiadne CORS errors
4. **Verify:** Dashboard načítanie funguje

---

## 🎯 Expected Result

Po vytvorení `.env` súboru a reštarte:

```
✅ Backend má ALLOWED_ORIGINS environment variable
✅ CORS whitelist obsahuje: https://montio.tsdigital.sk
✅ Frontend API calls fungujú
✅ Login funguje
✅ Dashboard načítanie funguje
✅ Žiadne 502 errors
✅ Žiadne CORS errors v Console
✅ Aplikácia je LIVE! 🚀
```

---

## 📊 Technical Summary

**Root Cause:**
- CORS whitelist security pridaný v refactoringu
- Environment variable `ALLOWED_ORIGINS` nebola vytvorená na serveri
- Backend použil default `localhost:3000`
- Production requesty z `montio.tsdigital.sk` boli blokované

**Solution:**
- Create `.env` file with `ALLOWED_ORIGINS=https://montio.tsdigital.sk`
- Restart backend to load environment variables
- CORS now allows production domain

**Impact:**
- Aplikácia bola **100% nefunkčná** (všetky API calls zlyhal)
- Fix trvá **~5 minút** (create .env + restart)
- **Žiadne code changes potrebné** - len config

**Prevention:**
- `.env.example` má teraz všetky variables
- `.env.production` template vytvorený
- Documentation updated

---

**Status:** ✅ **SOLUTION IDENTIFIED - READY TO DEPLOY**  
**Action:** Create `.env` file on production server  
**ETA:** 5 minút  
**Priority:** 🔴 CRITICAL

---

**Discovered by:** Claude (MONTIO Development Session)  
**Date:** 2026-04-15 09:45  
**Session:** Git refactoring analysis
