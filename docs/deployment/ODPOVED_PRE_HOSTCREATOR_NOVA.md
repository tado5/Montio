# Odpoveď Pre Hostcreator Support - Vysvetlenie Štruktúry

## 📧 Email Na Odoslanie

```
Dobrý deň,

Dnes sme ešte dorábali nejaké automatizácie, takže som sa konkrétne k Vášmu buildu dostal len teraz. Urobil som teda poriadok v tých current adresároch.

Čo sa týka tých portov 3000 alebo 3001, kľudne môžete používať akýkoľvek, viete si to u nás vo WebAdmine pri node.js aplikácii nastaviť. Nechávam teda ten 3001. Keďže to ide cez docker, tak je nám to jedno aký je ten vnútorný port.

Písali ste postup, kde spomínate cd frontend a cd backend. Tieto adresáre ale v GITe nemáte. Robíme s tými istými kódmi?
```

---

## ✅ NAŠA ODPOVEĎ

```
Dobrý deň,

Aha, rozumiem problému! Máte pravdu - v **production branchi** je iná štruktúra ako som spomínal v predošlom emaile.

### 📁 Rozdiel medzi main a production branch:

**main branch** (zdrojový kód pre vývoj):
- `frontend/` - React zdrojové súbory (src/, package.json, vite.config.js)
- `backend/` - Express.js zdrojové súbory (server.js, routes/, config/)

**production branch** (buildnutá aplikácia - pripravená na deploy):
- `/` (root) - Frontend build súbory (index.html, assets/, atď.)
- `/api/` - Backend aplikácia (server.js, routes/, config/, node_modules/)

### 🚀 Správny Deploy Proces Pre Production Branch:

GitHub Actions automaticky zbuilduje aplikáciu a pushne ju do production branchu v správnej štruktúre. Pre deploy stačí:

```bash
# 1. Backend je v /api/ adresári (NIE /backend/)
cd api
npm install  # (ak by node_modules chýbali)
node server.js  # alebo npm start

# Backend počúva na porte 3001 (nakonfigurovateľné cez PORT env variable)
```

Frontend je už buildnutý v root-e (`index.html`, `assets/`), takže nepotrebuje žiadny build proces.

### 🔧 Environment Variables Pre Backend:

Backend potrebuje `.env` súbor v `/api/` adresári:

```env
PORT=3001
DB_HOST=localhost
DB_USER=u46895_montio
DB_PASSWORD=x52D_Z-lb!UX6n5
DB_NAME=d46895_montio
JWT_SECRET=montio-super-secret-jwt-key-2026
```

### 📦 Čo Je V Production Branchi:

```
/
├── index.html          (frontend build)
├── assets/             (CSS, JS, images)
├── .htaccess          (routing config)
├── api/               (backend aplikácia)
│   ├── server.js      (main backend file)
│   ├── package.json   (dependencies list)
│   ├── node_modules/  (dependencies)
│   ├── routes/        (API endpoints)
│   ├── config/        (DB config)
│   └── middleware/    (auth middleware)
└── README.md
```

### ✅ Takže Správny Postup:

1. **Máte správny kód** - production branch je automaticky generovaný z main
2. **Backend sa spúšťa:** `cd api && node server.js` (NIE cd backend)
3. **Port:** 3001 je OK (alebo ľubovoľný cez PORT env variable)
4. **node_modules:** Sú už v production branchi (GitHub Actions ich tam dá)

### 🎯 Zhrnutie:

Prepáčte za zmätok - v predošlom emaile som opisoval vývojovú štruktúru (main branch).
Pre produkčný deploy používajte štruktúru z **production branch-u**, kde je backend v `/api/` adresári.

Ak potrebujete ešte niečo upresnené alebo naživo prediskutovať, pokojne volajte!

Ďakujem za trpezlivosť a prácu :)

S pozdravom
```

---

## 📊 Technické Info

### Production Branch Štruktúra:
```bash
# Lokálne overenie:
git checkout production
ls -la           # root obsahuje frontend build
ls -la api/      # backend aplikácia je tu
```

### Backend Package.json (v api/):
```json
{
  "name": "montio-backend",
  "version": "1.0.0",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.5",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "multer": "^2.1.1",
    "sharp": "^0.34.5",
    "uuid": "^13.0.0"
  }
}
```

### GitHub Actions Workflow:
- Zbuilduje frontend: `cd frontend && npm run build`
- Skopíruje build do root-u: `cp -r frontend/dist/* production-deploy/`
- Skopíruje backend do api/: `cp -r backend/* production-deploy/api/`
- Pushne do production branch: `git push --force origin production`

---

## 🔑 Kľúčové Body Pre Support

1. ✅ **production branch** = pripravený na deploy (nie main!)
2. ✅ Backend je v **`/api/`** adresári (nie `/backend/`)
3. ✅ Frontend build je v **root-e** (nie `/frontend/`)
4. ✅ Spustiť: `cd api && node server.js` (alebo `npm start`)
5. ✅ Port 3001 je nakonfigurovaný v `server.js` (cez `process.env.PORT || 3001`)

---

**Posledná aktualizácia:** 2026-03-24 07:45
**Status:** ✅ Odpoveď ODOSLANÁ
