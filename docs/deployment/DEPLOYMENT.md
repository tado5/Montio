# MONTIO APP - Deployment Guide (Hostcreator)

## 🎯 Prehľad

Tento návod ťa prevedie deploymentom MONTIO aplikácie na Hostcreator hosting.

---

## 📋 Pred deploymentom

### ✅ Checklist:
- [x] Databáza vytvorená (d46895_montio)
- [x] Tabuľky vytvorené (7 tabuliek)
- [x] Super admin účet vytvorený
- [ ] Backend environment variables nastavené
- [ ] Frontend buildnutý
- [ ] Súbory uploadnuté na hosting

---

## 🔨 Krok 1: Build Frontend

Na svojom počítači (v projekte):

```bash
cd frontend
npm install
npm run build
```

Vytvorí sa priečinok `frontend/dist/` s produkčnými súbormi.

---

## 📤 Krok 2: Upload súborov na Hostcreator

### Frontend (Statické súbory):
Upload obsah `frontend/dist/` do root web priečinka (public_html alebo www):

```
public_html/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── ...
```

### Backend (Node.js):
Upload celý `backend/` priečinok do samostatného priečinka:

```
/home/u46895/montio-backend/
├── config/
├── middleware/
├── routes/
├── server.js
├── package.json
└── .env
```

---

## ⚙️ Krok 3: Konfigurácia Backend

### 3.1 Vytvor `.env` súbor na serveri

V priečinku `/home/u46895/montio-backend/` vytvor `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=u46895_montio
DB_PASSWORD=x52D_Z-lb!UX6n5
DB_NAME=d46895_montio

JWT_SECRET=montio_production_secret_key_2026_change_this
JWT_EXPIRES_IN=7d

PORT=3001
NODE_ENV=production
```

⚠️ **DÔLEŽITÉ:** Zmeň `JWT_SECRET` na silný random string!

### 3.2 Nainštaluj dependencies

```bash
cd /home/u46895/montio-backend
npm install --production
```

### 3.3 Spusti Node.js aplikáciu

Cez Hostcreator panel:
- **Node.js Manager**
- Vyber verziu: **Node 18.x**
- Application Root: `/home/u46895/montio-backend`
- Application Startup File: `server.js`
- Environment variables: načítaj z `.env`

---

## 🌐 Krok 4: Proxy/Reverse Proxy nastavenie

V `.htaccess` súbore v `public_html/`:

```apache
RewriteEngine On

# API requests → Backend (port 3001)
RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]

# Frontend routing (React Router)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
```

---

## 🔒 Krok 5: SSL Certifikát

V Hostcreator paneli:
1. SSL/TLS Manager
2. Let's Encrypt Free SSL
3. Aktivuj pre tvoju doménu

---

## 🧪 Krok 6: Testovanie

### Frontend Test:
```
https://tvojadomena.sk
```
Mal by sa načítať login screen.

### Backend Test:
```
https://tvojadomena.sk/api/health
```
Odpoveď:
```json
{
  "status": "ok",
  "message": "MONTIO API is running"
}
```

### Login Test:
- Email: `admin@montio.sk`
- Heslo: `admin123`

---

## 🐛 Troubleshooting

### Problém: "Cannot connect to database"
**Riešenie:**
- Over DB credentials v `.env`
- Over že databáza beží
- Over firewall pravidlá

### Problém: "CORS error"
**Riešenie:**
V `backend/server.js` over CORS nastavenie:
```javascript
app.use(cors({
  origin: 'https://tvojadomena.sk',
  credentials: true
}));
```

### Problém: "404 Not Found" na refresh
**Riešenie:**
Over `.htaccess` redirect pravidlá pre React Router.

### Problém: "JWT token invalid"
**Riešenie:**
- Over že `JWT_SECRET` je rovnaký ako pri generovaní tokenu
- Vymaž localStorage a prihlás sa znova

---

## 📊 Monitoring

### Logy Backend:
```bash
tail -f /home/u46895/montio-backend/logs/app.log
```

### Logy Node.js:
Hostcreator panel → Node.js Manager → View Logs

---

## 🔄 Update aplikácie

### 1. Build nová verzia:
```bash
cd frontend
npm run build
```

### 2. Upload nové súbory:
Nahraď súbory v `public_html/` novými z `dist/`

### 3. Restart backend:
Hostcreator panel → Node.js Manager → Restart

---

## 🎉 Hotovo!

Tvoja MONTIO aplikácia by mala byť live na:
**https://tvojadomena.sk**

Super admin login:
- Email: `admin@montio.sk`
- Heslo: `admin123`

⚠️ **Po prvom prihlásení zmeň heslo!**

---

## 📞 Support

Ak niečo nefunguje, skontroluj:
1. Database connection (phpMyAdmin)
2. Backend logs (Node.js panel)
3. Browser console (F12)
4. Network tab (API calls)

GitLab Repository: https://github.com/tado5/Montio
