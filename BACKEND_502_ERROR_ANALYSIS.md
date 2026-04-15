# 🚨 502 ERROR - Backend API Nefunguje

**Dátum:** 2026-04-15 09:15  
**Status:** 🔴 KRITICKÝ - API calls vracajú 502  
**URL:** https://montio.tsdigital.sk/api/auth/login

---

## 🔍 Root Cause Analysis

### Problém: Frontend volá API na zlej URL

**Frontend API Config:**
```javascript
// frontend/src/config/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:3001'           // ✅ Dev: OK
    : window.location.origin);          // ❌ Prod: ZLYHÁ!
```

**Čo sa deje v production:**
- Frontend: `https://montio.tsdigital.sk`
- `window.location.origin` = `https://montio.tsdigital.sk`
- API call: `https://montio.tsdigital.sk/api/auth/login`
- **Výsledok:** 502 Bad Gateway ❌

### Prečo to zlyhá?

**Backend beží v Docker containeri na INOM PORTE:**
- Backend Docker: `http://localhost:3000` (alebo 3001)
- Apache frontend: `https://montio.tsdigital.sk` (port 80/443)
- **Nie je reverse proxy medzi nimi!**

**Apache .htaccess sa snaží routovať API:**
```apache
# ❌ TOTO NEFUNGUJE - Apache nemôže spustiť Node.js
RewriteRule ^api/(.*)$ /api/server.js/$1 [L,QSA]
```

---

## 🛠 Možné Riešenia

### Riešenie 1: Reverse Proxy (PREFERRED)

**Potrebné:** Apache musí routovať `/api/*` requesty na Docker backend

**Apache .htaccess/httpd.conf:**
```apache
RewriteEngine On

# Reverse proxy pre API requesty
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3000/$1 [P,L]

# Frontend routing (React Router)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
```

**Alebo ProxyPass (ak je dostupný):**
```apache
ProxyPass /api http://localhost:3000/api
ProxyPassReverse /api http://localhost:3000/api
```

**Výhody:**
- ✅ Jedna doména pre frontend aj backend
- ✅ Žiadne CORS problémy
- ✅ Frontend API config funguje (`window.location.origin`)

**Nevýhody:**
- ⚠️ Potrebujeme `mod_proxy` Apache modul (možno nie je enabled)
- ⚠️ Musíme vedieť na akom porte beží Docker backend

---

### Riešenie 2: Subdoména pre API

**Setup:**
- Frontend: `https://montio.tsdigital.sk`
- Backend: `https://api.montio.tsdigital.sk` (DNS A záznam → Docker port)

**Frontend API Config:**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'https://api.montio.tsdigital.sk');  // Subdoména
```

**Výhody:**
- ✅ Jednoduchá konfigurácia
- ✅ Čistá separácia frontend/backend
- ✅ Skaluje dobre

**Nevýhody:**
- ⚠️ Potrebná DNS konfigurácia
- ⚠️ CORS musí byť správne nastavený (backend musí whitelistovať `montio.tsdigital.sk`)

---

### Riešenie 3: Environment Variable Pre API URL

**Build-time environment variable:**

**Deploy workflow (.github/workflows/deploy.yml):**
```yaml
# 4. Build frontend with API URL
- name: Build frontend
  run: |
    cd frontend
    echo "VITE_API_URL=https://montio.tsdigital.sk:3001" > .env.production
    npm run build
```

**Frontend bude používať:**
```javascript
import.meta.env.VITE_API_URL = "https://montio.tsdigital.sk:3001"
```

**Výhody:**
- ✅ Jednoduché (len environment variable)
- ✅ Explicitná konfigurácia

**Nevýhody:**
- ⚠️ Port musí byť verejne dostupný (možno security risk)
- ⚠️ URL s portom nevyzerá profesionálne
- ⚠️ CORS nastavenie potrebné

---

## 📊 Aktuálny Stav

### Production Branch Štruktúra

```
production/
├── index.html          ✅ Frontend (React build)
├── assets/             ✅ JS/CSS
├── .htaccess           ⚠️ Len React Router routing (nemá API proxy)
├── api/                ✅ Backend source code
│   ├── server.js       ✅ Express.js server
│   ├── routes/         ✅
│   ├── config/         ✅
│   ├── middleware/     ✅
│   ├── utils/          ✅ (opravené!)
│   ├── node_modules/   ✅
│   └── package.json    ✅
└── backend/            ❌ DUPLICITNÝ (treba vymazať)
```

### Backend Server Config

**backend/server.js:**
```javascript
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 MONTIO Backend running on http://localhost:${PORT}`);
});
```

**Otázky pre Hostcreator:**
1. **Na akom porte beží Docker backend?** (3000, 3001, iný?)
2. **Má Apache modul `mod_proxy` enabled?**
3. **Ako máme routovať `/api/*` requesty na Docker container?**
4. **Preferujú reverse proxy alebo subdoménu?**

---

## 🎯 Odporúčaný Postup (Action Plan)

### 1. Zistiť Backend Port od Hostcreator

**Email pre support:**
```
Predmet: Backend API routing - 502 Error

Dobrý deň,

nasadili sme MONTIO aplikáciu, ale frontend dostáva 502 error pri volaní API.

SITUÁCIA:
- Frontend funguje: https://montio.tsdigital.sk ✅
- Backend (Express.js) je deploynutý v /api/ ✅
- API calls zlyhajú: https://montio.tsdigital.sk/api/auth/login → 502 ❌

OTÁZKY:
1. Na akom PORTE beží náš Docker backend? (3000, 3001, iný?)
2. Má Apache modul mod_proxy enabled?
3. Ako máme routovať /api/* requesty na Docker container?
   - Option A: Reverse proxy cez Apache (.htaccess)
   - Option B: Subdoména (api.montio.tsdigital.sk)
   - Option C: Exposovať port priamo

TECHNICKÉ INFO:
- Backend počúva na: PORT=process.env.PORT || 3001
- Frontend očakáva API na: ${window.location.origin}/api
- Production branch: https://github.com/tado5/Montio/tree/production

Ďakujem!
```

### 2. Implementovať Riešenie Podľa Odpovede

**Scenario A: Reverse Proxy (Preferred)**
- Upraviť `.htaccess` v deploy.yml
- Pridať ProxyPass/RewriteRule pre `/api/*`
- Redeploy

**Scenario B: Subdoména**
- Vytvoriť DNS A záznam `api.montio.tsdigital.sk`
- Upraviť frontend API config
- Update backend CORS whitelist
- Rebuild & redeploy

**Scenario C: Port Exposing**
- Zistiť verejný port
- Upraviť frontend API config s portom
- Update backend CORS
- Rebuild & redeploy

### 3. Testovanie

```bash
# Test backend priamo
curl http://montio.tsdigital.sk:3001/api/health

# Test cez proxy/subdoménu
curl https://montio.tsdigital.sk/api/health

# Expected:
# {"status":"ok","message":"MONTIO API is running",...}
```

---

## 🔐 CORS Configuration

**Backend musí whitelistovať frontend doménu:**

**backend/config/constants.js:**
```javascript
export const CORS_CONFIG = {
  ALLOWED_ORIGINS: [
    'https://montio.tsdigital.sk',
    'http://localhost:3000'  // Dev only
  ],
  CREDENTIALS: true,
  METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  ALLOWED_HEADERS: ['Content-Type', 'Authorization']
};
```

---

## 📝 Temporary Workaround (Testing Only)

**Pre rýchle testovanie môžeme použiť subdoménu approach:**

1. **Upraviť frontend API config:**
```javascript
// frontend/src/config/api.js
const API_BASE_URL = 'https://montio.tsdigital.sk:3001'; // Hardcoded port
```

2. **Rebuild frontend:**
```bash
cd frontend && npm run build
```

3. **Push to production:**
```bash
git add frontend/src/config/api.js
git commit -m "test: Hardcoded API URL for testing"
git push origin main
```

⚠️ **WARNING:** Toto je len pre testing! Pre production použiť reverse proxy.

---

## 📞 Kontakt

**Hostcreator Support:** 0903 904 677  
**GIT Webhook:** https://www.hostcreators.sk/admin/host/domain/46895/webhook/3193/edit  
**GitHub Repo:** https://github.com/tado5/Montio

---

**Status:** ⏳ ČAKÁ NA ODPOVEĎ OD HOSTCREATOR  
**Blokuje:** Production deployment  
**Priorita:** 🔴 KRITICKÁ
