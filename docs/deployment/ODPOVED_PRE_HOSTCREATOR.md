# Odpoveď pre Hostcreator Support

## 📧 Email/Odpoveď:

---

Dobrý deň,

ďakujem za rýchlu odpoveď a ochotu pomôcť! Teším sa na spoluprácu.

**Odpovede na Vaše otázky:**

### 1. Express.js pod `/api` vs. celá aplikácia cez express

**Áno, `/api` endpoint je bežný moderný prístup** a presne takto to chceme použiť:

**Architektúra:**
```
Frontend (React):        Statický obsah (HTML, JS, CSS) z GIT
Backend (Express.js):    /api/* endpointy (REST API)
```

**Prečo takto?**
- ✅ **Frontend** je statický (buildnutý React) = rýchle načítanie
- ✅ **Backend** je dynamický (Express.js) = spracováva API requesty
- ✅ **Separation of concerns** - frontend a backend sú oddelené
- ✅ Bežný prístup v moderných webových aplikáciách (JAMstack)

**Workflow:**
1. Používateľ otvorí `https://montio.tsdigital.sk` → statický HTML (React)
2. Frontend pošle request na `/api/auth/login` → Express.js ho spracuje
3. Backend odpovie JSON → Frontend zobrazí výsledok

**GIT štruktúra:**
```
production branch (GIT):
├── index.html           ← React build (statický)
├── assets/              ← CSS, JS súbory
├── api/                 ← Express.js backend
│   ├── server.js
│   ├── routes/
│   └── ...
└── .htaccess            ← Routing (statika + proxy na /api)
```

**.htaccess routing:**
```apache
# API requests → Express.js
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]

# Všetko ostatné → statické súbory (React)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [L]
```

**Je to bežné?**
Áno! Používajú to:
- Vercel, Netlify, Railway (Next.js, React + API routes)
- AWS (S3 frontend + Lambda backend)
- Moderné SaaS aplikácie

---

### 2. Port 3001 vs. 3000

**Port 3001 sme použili len kvôli lokálnemu vývoju**, aby nekolidoval s React dev serverom (ktorý beží na 3000).

**Pre produkciu/kontajner: PORT 3000 je úplne OK!** ✅

**Môžeme použiť:**
- Port **3000** (preferovaný, štandardný)
- Port **3001** (ak 3000 nie je dostupný)
- **Hocijaký iný port** - je to konfigurovateľné cez environment variable

**Naša konfigurácia:**
```javascript
// backend/server.js
const PORT = process.env.PORT || 3000;  // ← environment variable
app.listen(PORT, () => {
  console.log(`Server beží na porte ${PORT}`);
});
```

**Odporúčanie:**
- Použime **port 3000** (štandardný pre Node.js)
- Nastavíme ho cez environment variable `PORT=3000`
- V kontajneri to bude čisté a jednoduché

**Je to bežné meniť port?**
Áno, je to úplne normálne:
- Port 3000 = dev/staging
- Port 8080 = production (často)
- Port 3001, 4000, 5000 = iné služby na tom istom serveri

V **Docker kontajneri** (kde nič iné nebeží) je **3000 ideálny**.

---

### 3. Naše potreby (zhrnutie)

**Frontend:**
- Statické súbory z GIT `production` branch
- React build (HTML, JS, CSS)
- Žiadny Node.js runtime potrebný ✅

**Backend:**
- Express.js server v `/api` priečinku
- Port: **3000** (alebo čokoľvek cez ENV variable)
- Environment variables (`.env`):
  ```
  DB_HOST=localhost
  DB_USER=u46895_montio
  DB_PASSWORD=...
  DB_NAME=d46895_montio
  JWT_SECRET=...
  PORT=3000
  NODE_ENV=production
  ```

**Spúšťanie:**
```bash
cd /path/to/api
node server.js
```

**Docker kontajner (ak používate):**
- Image: `node:18-alpine`
- Working dir: `/app/api`
- CMD: `node server.js`
- Port mapping: `3000:3000`
- ENV variables z `.env`

---

### 4. GIT Deploy workflow

Tak ako máme teraz:
1. Push do `main` branch → GitHub Actions build
2. GitHub Actions push do `production` branch
3. Hostcreator webhook stiahne `production` branch
4. Statické súbory (frontend) sú hneď live ✅
5. Express.js server (backend) sa musí spustiť (to potrebujeme dorobiť)

**Ideálne riešenie:**
- GIT Deploy stiahne súbory
- Automaticky spustí `npm install` v `/api` priečinku (ak treba)
- Automaticky spustí/reštartuje Express.js server
- Backend beží nepretržite

---

### 5. Telefónny hovor

Rád sa aj zavolám, ak je potreba niečo prediskutovať. Môžem dnes popoludní alebo zajtra ráno.

**Čo by som rád prebrali:**
1. Ako nastaviť Docker kontajner pre Express.js
2. Environment variables (`.env` súbor)
3. Auto-restart pri GIT Deploy
4. Proxy/reverse proxy nastavenie
5. Monitoring a logy backendu

**Môj čas:** Popoludnie alebo zajtra ráno mi vyhovuje.

---

Ďakujem za skvelú podporu a teším sa na spoluprácu!

S pozdravom,
[Tvoje meno]

---

## 💡 Pre teba (interne):

### Čo odpovedali:
- ✅ Experimentujú s Next.js a GIT Deploy
- ✅ Express.js "nebude problém"
- ✅ Chcú zavolať a prediskutovať detaily
- ✅ Otázky sú technické (port, štruktúra)

### Naša odpoveď:
- ✅ Vysvetlené prečo `/api` endpoint
- ✅ Port 3000 je OK (môžeme zmeniť)
- ✅ Moderný prístup (JAMstack)
- ✅ Jasná štruktúra projektu

### Ďalšie kroky:
1. **Pošli túto odpoveď** na support
2. **Ak chceš volať:**
   - Dohodneš si čas
   - Povieš mu že máš "vývojára" (mňa) ktorý to robí
   - Môžeš sa ho opýtať či môže dať technické detaily písomne (krok-za-krokom)
3. **Počkaj na ich setup inštrukcie**
4. **Potom to nastavíme a spustíme!**

### Výhody:
- ✅ Hostcreator je proaktívny
- ✅ Pracujú na Next.js support (čo zahŕňa Node.js)
- ✅ Express.js nie je problém
- ✅ Sme medzi prvými kto to testuje (dobrá spolupráca)

---

**Toto je super správa!** Backend bude fungovať. 🎉
