# 🚨 DEPLOYMENT FIX - Production Backend Nefunguje

**Dátum:** 2026-04-15  
**Status:** 🔴 KRITICKÝ - Backend na production nefunguje  
**Príčina:** Deploy workflow nekopíroval `utils/` adresár a chýbajú nové routes

---

## 🔍 Zistené Problémy

### 1. Production Branch je Zastaralý
- **Aktuálny commit:** `836e328` (starý)
- **Main commit:** `290c637` (nový)
- **Chýbajúce súbory v production:**
  - ❌ `api/utils/` adresár (errorHandler.js, validation.js)
  - ❌ `api/routes/settings.js` (company settings route)
  - ❌ Aktualizovaný `server.js` (bez CORS_CONFIG, errorMiddleware, settingsRoutes)
  - ❌ Aktualizovaný `auth.js` (login tracking, security fixes)
  - ❌ Aktualizované ostatné routes (employees, dashboard, orderTypes, orders)

### 2. Deploy Workflow Nekopíroval Všetko
**Pôvodná chyba v `.github/workflows/deploy.yml`:**
```yaml
cp -r backend/*.js production-deploy/api/
cp -r backend/config production-deploy/api/
cp -r backend/middleware production-deploy/api/
cp -r backend/routes production-deploy/api/
# ❌ CHÝBALO: cp -r backend/utils production-deploy/api/
```

**Dôsledok:**
- Backend sa crashol pri štarte kvôli `import { errorMiddleware } from './utils/errorHandler.js';`
- Chýbajúce `utils/` spôsobilo module resolution error

---

## ✅ Opravy Vykonané (Local)

### 1. ✅ Opravený Deploy Workflow
**Súbor:** `.github/workflows/deploy.yml`

**Zmeny:**
```yaml
# Pridané kopírovanie utils/
cp -r backend/utils production-deploy/api/

# Pridaný fallback pre *.js (kvôli možným zmenám v budúcnosti)
cp -r backend/*.js production-deploy/api/ 2>/dev/null || true
```

---

## 📋 TODO - Kroky na Opravu Production

### Fáza 1: Commit & Push Fix ✅ HOTOVO
- [x] Commitnúť opravu deploy.yml
- [x] Pushnúť na main branch
- [x] Skontrolovať GitHub Actions log

### Fáza 2: Verifikácia Buildu 🔄 ČAKÁ
- [ ] Počkať na dokončenie GitHub Actions
- [ ] Skontrolovať production branch (musi byť aktualizovaný)
- [ ] Verifikovať, že `api/utils/` existuje v production
- [ ] Verifikovať, že `api/routes/settings.js` existuje
- [ ] Verifikovať, že `api/server.js` je aktuálny (obsahuje settingsRoutes)

### Fáza 3: Production Testing 🔄 ČAKÁ
- [ ] Otvoriť https://montio.tsdigital.sk v prehliadači
- [ ] Skontrolovať, či backend beží (API health check)
- [ ] Testovať login s `admin@montio.sk / admin123`
- [ ] Skontrolovať Console v Dev Tools (žiadne chyby)
- [ ] Testovať základné funkcie (dashboard, firmy, zamestnanci)

### Fáza 4: Dokumentácia 🔄 ČAKÁ
- [ ] Aktualizovať STATUS.md
- [ ] Aktualizovať CHANGELOG.md
- [ ] Vymazať tento TODO súbor

---

## 🛠 Príkazy na Manuálne Testovanie

### Lokálne Testovanie Backend
```bash
cd backend
npm start
# Expected: "🚀 MONTIO Backend running on http://localhost:3001"
```

### Testovanie Production Branch (Local)
```bash
git checkout production
git pull origin production
ls -la api/utils/          # Musí existovať
ls -la api/routes/settings.js  # Musí existovať
cat api/server.js | grep settingsRoutes  # Musí byť v súbore
```

### Testovanie Production API
```bash
# Health check
curl https://montio.tsdigital.sk/api/health

# Expected response:
# {"status":"ok","message":"MONTIO API is running","version":"1.10.0","environment":"production","timestamp":"..."}
```

---

## 📊 Stav Deployment Pipeline

### GitHub Actions Workflow
- **Trigger:** Push to `main` branch
- **Jobs:** build-and-deploy
- **Kroky:**
  1. ✅ Checkout main branch
  2. ✅ Setup Node.js 18
  3. ✅ Install frontend dependencies
  4. ✅ Build frontend (`npm run build`)
  5. ✅ Install backend dependencies (`npm install --production`)
  6. 🔧 **OPRAVENÉ:** Prepare production files (+ utils/)
  7. ✅ Deploy to production branch (force push)
  8. ✅ Deployment summary

### Hostcreator Webhook
- **URL:** https://www.hostcreators.sk/api/v1/host/webhook/3193?signature=...
- **Trigger:** Push to `production` branch
- **Akcia:** Auto-deploy do `/tsdigital.sk/sub/montio`
- **Naposledy:** 15. apríl 2026 08:20:43

---

## 🔐 Produkčné Prihlasovacie Údaje

**Super Admin:**
- Email: `admin@montio.sk`
- Heslo: `admin123`

**Databáza (Production):**
- Host: `sql14.hostcreators.sk:3319`
- User: `u46895_montio`
- Password: `x52D_Z-lb!UX6n5`
- Database: `d46895_montio`

---

## 📝 Poznámky

1. **ES6 Modules:** Backend používa `"type": "module"` v `package.json` - všetky routes musia mať `.js` extension pri importe
2. **Environment Variables:** `.env` súbor sa nekopíruje - musí byť vytvorený manuálne na Hostcreatoru
3. **Uploads Directory:** `uploads/` adresár sa nekopíruje - musí byť vytvorený manuálne
4. **Node.js Version:** Musí byť 18+ (kvôli ES6 modules)
5. **CORS:** Production používa whitelist - len `montio.tsdigital.sk` je povolený

---

## 🎯 Očakávaný Výsledok

Po úspešnom deploymente:
- ✅ https://montio.tsdigital.sk funguje
- ✅ Login s admin@montio.sk / admin123 funguje
- ✅ Dashboard zobrazuje KPI cards
- ✅ Všetky routes fungujú (firmy, zamestnanci, kalendár, typy montáží, nastavenia)
- ✅ API health check vracia `{"status":"ok",...}`
- ✅ Console v Dev Tools neobsahuje chyby

---

**Vytvoril:** Claude (MONTIO Development Session)  
**Dátum:** 2026-04-15 08:54  
**Priorita:** 🔴 KRITICKÁ
