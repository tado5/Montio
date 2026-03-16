# MONTIO APP - Setup Guide

**Verzia:** v1.3.0 Build #10
**Dátum:** 2026-03-16
**Status:** Lokálny vývoj

---

## Príprava databázy

### 1. Lokálna MariaDB inštalácia

```bash
# macOS (Homebrew)
brew install mariadb
brew services start mariadb

# Linux (Ubuntu/Debian)
sudo apt-get install mariadb-server
sudo systemctl start mariadb

# Windows
# Stiahnite z: https://mariadb.org/download/
```

### 2. Vytvorenie databázy

```bash
# Prihlásenie do MariaDB
mysql -u root -p

# Vytvorenie databázy
CREATE DATABASE montio_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Vytvorenie používateľa (optional)
CREATE USER 'montio_user'@'localhost' IDENTIFIED BY 'montio_password';
GRANT ALL PRIVILEGES ON montio_dev.* TO 'montio_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Import tabuliek

Všetky SQL schémy sú v **PLAN.md** v sekcii "Databáza - Kompletné schémy".

```bash
# Pripojenie k databáze
mysql -u montio_user -p montio_dev

# Alebo import z SQL súboru (ak existuje)
mysql -u montio_user -p montio_dev < database/schema.sql
```

### 4. Vytvorenie super admin používateľa

```sql
-- Heslo: admin123 (bcrypt hash)
INSERT INTO users (email, password_hash, role, company_id, theme, created_at)
VALUES (
  'admin@montio.sk',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'superadmin',
  NULL,
  'light',
  NOW()
);
```

### 5. Testovacia firma (optional)

```sql
-- UUID pre company
INSERT INTO companies (public_id, name, status, invite_token, created_at)
VALUES (
  UUID(),
  'Test Montáže s.r.o.',
  'pending',
  'test-invite-token-12345',
  NOW()
);
```

## Backend Setup

### 1. Nainštalujte Node.js

Potrebujete Node.js 18 alebo vyššiu verziu:

```bash
# Skontrolujte verziu
node --version   # v18.x.x alebo vyššia
npm --version    # v9.x.x alebo vyššia
```

### 2. Nainštalujte dependencies

```bash
cd backend
npm install
```

**Nainštalované packages:**
- express - Web framework
- mysql2 - MariaDB driver
- bcryptjs - Password hashing
- jsonwebtoken - JWT auth
- cors - CORS middleware
- dotenv - Environment variables
- uuid - UUID generation
- multer - File uploads (pre FÁZU 3)
- sharp - Image processing (pre FÁZU 3)

### 3. Konfigurácia `.env` súboru

Vytvorte `.env` súbor v `backend/` priečinku:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=montio_user
DB_PASSWORD=montio_password
DB_NAME=montio_dev

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# File Upload (pre FÁZU 3)
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=2097152
```

⚠️ **DÔLEŽITÉ:** Zmeňte `JWT_SECRET` na silný random string!

### 4. Spustite backend server

```bash
npm run dev
```

Backend beží na: **http://localhost:3001**

**Dostupné endpointy:**
- `POST /api/auth/login` - Prihlásenie
- `POST /api/auth/register` - Registrácia (invite token)
- `PUT /api/auth/theme` - Update témy
- `GET /api/auth/companies` - Zoznam firiem (superadmin)
- `POST /api/companies` - Vytvorenie pozvánky
- `GET /api/companies/:publicId` - Detail firmy
- `PUT /api/companies/:publicId/activate` - Aktivovať firmu
- `PUT /api/companies/:publicId/deactivate` - Deaktivovať firmu
- `GET /api/companies/:publicId/logs` - Activity logs

## Frontend Setup

### 1. Nainštalujte dependencies

```bash
cd frontend
npm install
```

**Nainštalované packages:**
- react - UI framework
- react-dom - React DOM rendering
- react-router-dom - Routing
- vite - Build tool
- tailwindcss - CSS framework
- axios - HTTP client
- postcss - CSS processing
- autoprefixer - CSS prefixes

**Pre FÁZU 3 (nainštalujeme neskôr):**
- react-dropzone - File upload
- react-dnd - Drag & drop
- react-dnd-html5-backend - HTML5 DnD backend

### 2. Konfigurácia Vite proxy

V `frontend/vite.config.js` je nastavený proxy pre API calls:

```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true
    }
  }
}
```

Všetky `/api/*` requesty sa presmerujú na backend (port 3001).

### 3. Spustite development server

```bash
npm run dev
```

Frontend beží na: **http://localhost:3000**

### 4. Prihlásenie (Quick Login - Development)

Login page má quick login buttons pre testovanie:

- **Super Admin:** admin@montio.sk / admin123
- **Company Admin:** (vytvorte cez onboarding)
- **Employee:** (vytvorte cez company admin)

### 5. Produkčný build (zatiaľ nepoužívame)

```bash
npm run build
```

Build súbory sa vytvoria v `frontend/dist/` priečinku.

## Testovanie

### 1. Backend Test (Postman/curl)

```bash
# Health check (TODO: pridať endpoint)
curl http://localhost:3001/api/health

# Login test
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@montio.sk","password":"admin123"}'

# Response: { user: {...}, token: "..." }
```

### 2. Frontend Test

1. Otvorte **http://localhost:3000**
2. Použite quick login button "Super Admin"
3. Mali by ste vidieť Super Admin Dashboard

### 3. Full Flow Test

**Super Admin:**
1. Prihlásenie → Dashboard
2. Vytvorenie novej firmy (email pozvánka)
3. Skopírovanie invite tokenu
4. Zobrazenie detailu firmy
5. Activity logs (timeline)
6. Dark mode toggle
7. Deactivate/Activate company

**Company Admin (po FÁZE 3):**
1. Registrácia cez invite link
2. Onboarding wizard (6 krokov)
3. Prihlásenie do Company Admin Dashboard

**Employee (po FÁZE 7):**
1. Vytvorenie employee účtu company adminom
2. Prihlásenie do Employee Dashboard

## Troubleshooting

### Problém: Backend nefunguje

**Error:** `Cannot connect to database`
```bash
# Skontrolujte či MariaDB beží
brew services list | grep mariadb   # macOS
systemctl status mariadb            # Linux

# Skontrolujte .env údaje
cat backend/.env

# Test pripojenia
mysql -u montio_user -p montio_dev
```

**Error:** `Port 3001 already in use`
```bash
# Nájdite proces na porte 3001
lsof -i :3001

# Zastavte proces
kill -9 <PID>

# Alebo zmeňte port v .env
PORT=3002
```

### Problém: Frontend nefunguje

**Error:** `Cannot connect to backend`
```bash
# Skontrolujte či backend beží
curl http://localhost:3001/api/health

# Skontrolujte vite.config.js proxy nastavenie
cat frontend/vite.config.js
```

**Error:** `Module not found`
```bash
# Reinstalujte dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Problém: JWT token invalid

```bash
# Vymaž localStorage
# V browser console:
localStorage.clear()

# Alebo prihlás sa znova
```

### Problém: Dark mode nefunguje

```bash
# Check database
SELECT theme FROM users WHERE email = 'admin@montio.sk';

# Ak NULL, update:
UPDATE users SET theme = 'light' WHERE email = 'admin@montio.sk';
```

---

## Produkcia (Čaká)

**Status:** Hostcreator momentálne nepodporuje Node.js runtime.

**Možnosti:**
1. Čakať na Node.js support od Hostcreator
2. Prepísať backend na PHP
3. Použiť iný hosting:
   - Railway.app (Node.js support)
   - Render.com (Node.js support)
   - Vercel (Serverless functions)
   - DigitalOcean (VPS)

**Build príkazy (keď bude deployment ready):**
```bash
# Frontend build
cd frontend && npm run build

# Backend (production mode)
cd backend && npm start
```

---

## Development Workflow

### Denný workflow:

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Git commands
git status
git add .
git commit -m "feat: ..."
git push origin main
```

### Git branching:

- `main` - development branch (všetok vývoj)
- `production` - auto-generovaný (GitHub Actions, zatiaľ nepoužívame)

### Commit conventions:

```
feat: nová funkcionalita
fix: oprava bugu
docs: dokumentácia
style: formatting, CSS
refactor: code refactoring
test: testy
chore: build, dependencies
```

---

**FÁZY DOKONČENÉ ✓**
- ✅ FÁZA 1: Databáza
- ✅ FÁZA 2: Autentifikácia
- ✅ FÁZA 2.5: UI Polish & Create Company
- ✅ FÁZA 2.7: Dark Mode + Advanced Features

---

## 🔧 Technické Poznámky

### File Upload & Storage

**Aktuálne riešenie (Development):**
```javascript
// Backend: backend/routes/onboarding.js
// Multer + Sharp processing
const filename = `${Date.now()}-${company.public_id}.jpg`
const filepath = path.join(__dirname, '../uploads/logos', filename)

await sharp(logoFile.buffer)
  .resize(200, 200, { fit: 'contain' })
  .jpeg({ quality: 90 })
  .toFile(filepath)

// V databáze: len URL cesta
logo_url = `/uploads/logos/${filename}`
```

**Štruktúra:**
```
backend/
  ├── uploads/
  │   └── logos/
  │       ├── 1710612345678-uuid-1.jpg
  │       └── 1710612345679-uuid-2.jpg
  └── server.js  // Servuje: app.use('/uploads', express.static(...))
```

**Pred produkciou - Migrácia:**
- ☁️ **Prečo:** Multi-server škálovanie, CDN, zálohy
- 💡 **Riešenie:** AWS S3 alebo DigitalOcean Spaces
- 📦 **Balíček:** `npm install @aws-sdk/client-s3`
- 💵 **Cena:** ~$5/mesiac (250GB storage + 1TB transfer)

**Zamietnuté alternatívy:**
- ❌ BASE64 v databáze (+33% veľkosť, spomalenie, žiadny cache)
- ❌ BLOB v databáze (spomaľuje queries, veľké backupy)

**Poznámka:** Filesystém je dostatočný pre development. Pred spustením produkcie je nutné migrovať na cloud storage.

---

**ĎALŠÍ KROK:**
- 🎯 FÁZA 3: Firma Onboarding Wizard
