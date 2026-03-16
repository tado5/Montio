# MONTIO APP - Aktuálny Stav Projektu

**Dátum:** 2026-03-16
**Čas:** Aktualizované
**Verzia:** v1.3.0 Build #10

---

## ✅ ČO JE HOTOVÉ

### 1. Databáza ✅
- **Vytvorené:** 8 tabuliek v MariaDB (lokálne)
- **Umiestnenie:** Lokálny MariaDB server
- **Databáza:** d46895_montio (alebo lokálna kópia)
- **Tabuľky:**
  - `companies` - Firmy (s UUID public_id)
  - `users` - Používatelia (s theme column)
  - `order_types` - Typy montáží
  - `employees` - Zamestnanci
  - `orders` - Zákazky
  - `order_stages` - Etapy zákaziek
  - `invoices` - Faktúry
  - `activity_logs` - Audit trail (NEW)
- **Testovacie dáta:**
  - Super admin účet: `admin@montio.sk` / `admin123`
  - Testovacie firmy s invite tokenmi

### 2. Backend (Node.js + Express) ✅
- **Technológia:** Node.js 18, Express, JWT, bcrypt, uuid
- **Súbory:**
  - `backend/server.js` - Hlavný server
  - `backend/config/db.js` - MariaDB pripojenie
  - `backend/routes/auth.js` - Auth endpoints
  - `backend/routes/companies.js` - Companies endpoints
  - `backend/middleware/auth.js` - JWT middleware
  - `backend/middleware/logger.js` - Activity logging middleware
- **API Endpointy:**
  - `POST /api/auth/login` - Prihlásenie + activity log
  - `POST /api/auth/register` - Registrácia (s invite token)
  - `PUT /api/auth/theme` - Update user theme
  - `GET /api/auth/companies` - Zoznam firiem (superadmin)
  - `POST /api/companies` - Vytvorenie pozvánky (invite token)
  - `GET /api/companies/:publicId` - Detail firmy
  - `GET /api/companies/:publicId/logs` - Activity logs (pagination)
  - `PUT /api/companies/:publicId/activate` - Aktivovať firmu
  - `PUT /api/companies/:publicId/deactivate` - Deaktivovať firmu
- **Stav:** **BEŽÍ LOKÁLNE** na localhost:3001 ✅

### 3. Frontend (React + Vite + Tailwind) ✅
- **Technológia:** React 18, Vite, Tailwind CSS, React Router, Axios
- **Stránky:**
  - Login stránka (quick login, TSDigital branding)
  - Super Admin Dashboard (KPI, search, filter, sort, create company)
  - Company Detail (stats, users, activity logs timeline)
  - Company Admin Dashboard (placeholder s phase badges)
  - Employee Dashboard (placeholder s phase badges)
- **Komponenty:**
  - AuthContext - state management
  - ThemeContext - dark mode management
  - ProtectedRoute - role-based access
  - Sidebar - collapsible navigation
  - UserMenu - user dropdown menu
  - CreateCompanyModal - invite system
  - DeactivateCompanyModal - bezpečná deaktivácia
  - AppInfo - app info modal
  - Footer - TSDigital branding
- **Features:**
  - Dark Mode (light/dark toggle, DB storage)
  - Collapsible Sidebar (w-16 ↔ w-64)
  - Activity Logging (audit trail, timeline view)
  - UUID Company IDs (security)
  - Moderný dizajn (gradienty, animácie, glassmorphism)
- **Stav:** **BEŽÍ LOKÁLNE** na localhost:3000 ✅

### 4. GitHub Repository ✅
- **URL:** https://github.com/tado5/Montio
- **Visibility:** Private
- **Branche:**
  - `main` - zdrojový kód (development)
  - `production` - buildnuté súbory (auto-generované)

### 5. GitHub Actions (CI/CD) ✅
- **Workflow:** `.github/workflows/deploy.yml`
- **Proces:**
  1. Push do `main` → trigger build
  2. Build frontend (`npm run build`)
  3. Copy backend files
  4. Push do `production` branch
  5. Hostcreator webhook stiahne
- **Čas buildu:** ~2-3 minúty
- **Stav:** **FUNGUJE** ✅

### 6. Hostcreator Deployment ✅
- **Doména:** https://montio.tsdigital.sk
- **GIT Webhook:** Prepojený s `production` branch
- **Auto-deploy:** ✅ Pri push do main → automatický deploy
- **Frontend:** **LIVE** ✅
- **Backend:** **NEFUNGUJE** ❌ (zatiaľ)

### 7. Dokumentácia ✅
- `PLAN.md` - Kompletný plán 9 fáz
- `SETUP.md` - Inštalačné inštrukcie
- `DEPLOYMENT.md` - Deployment guide
- `GITHUB_ACTIONS.md` - CI/CD dokumentácia
- `PROJECT_STRUCTURE.md` - Štruktúra projektu
- `database/README.md` - DB setup
- `OTAZKA_PRE_HOSTCREATOR.md` - Otázka pre support

---

## 🎯 ČO ČAKÁ - ĎALŠIE KROKY

### 1. FÁZA 3: Firma Onboarding Wizard ✅ HOTOVO

**Implementované (2026-03-16):**
- ✅ 6-krokový registračný wizard
- ✅ Backend: 5 API endpoints (validate token, step1-3, complete)
- ✅ Frontend: OnboardingWizard + 5 step komponenty + StepProgress
- ✅ Step 1: Základné údaje (názov, IČO, DIČ, adresa)
- ✅ Step 2: Logo upload (Multer + Sharp) + fakturačné údaje (IBAN, SWIFT, VS, splatnosť)
- ✅ Step 3: Typy montáží + checklists (dynamické pridávanie 1-10 typov)
- ✅ Step 4: Preview všetkých údajov + možnosť úpravy
- ✅ Step 5: Vytvorenie hesla + meno/priezvisko + auto-login
- ✅ File upload: Multer memory storage + Sharp resize (200x200) + filesystém
- ✅ Dokumentácia: TECHNICAL_NOTES.md (file upload stratégia)
- ✅ Aktivácia firmy: status pending → active
- ✅ Auto-login po dokončení → presmerovanie na Company Dashboard

**Súbory:**
- Backend: `routes/onboarding.js` (5 endpoints)
- Frontend: `pages/OnboardingWizard.jsx`, `components/onboarding/Step1-5.jsx`, `StepProgress.jsx`

### 2. UI Unification & Brand Colors ✅ HOTOVO (2026-03-16)

**Implementované:**
- ✅ Svetlejší TSDigital gradient: `from-orange-400 to-red-500` (17 súborov)
- ✅ Zelená pre aktívne firmy: `from-green-500 to-emerald-500`
- ✅ Zjednotené pozadia: `from-gray-50 to-gray-100` pre všetkých
- ✅ Konzistentné light/dark mode farby
- ✅ DiceBear avatars (namiesto iniciálov)
- ✅ Dokumentácia: TECHNICAL_NOTES.md, PLAN.md, STATUS.md, SETUP.md, README.md

### 3. Production Deployment ⏳
**Problém:**
- Hostcreator momentálne nepodporuje Node.js runtime
- Vývoj je zatiaľ len lokálny

**Možnosti:**
- Čakať na Node.js support od Hostcreator
- Prepísať backend na PHP (ak bude potrebné)
- Použiť iný hosting (napr. Railway, Render, Vercel + Serverless)

---

## 🎯 FÁZY PROJEKTU - PROGRESS

| Fáza | Názov | Status | Poznámka |
|------|-------|--------|----------|
| ✅ FÁZA 1 | Databáza | **100%** | 8 tabuliek vytvorených (+ activity_logs) |
| ✅ FÁZA 2 | Autentifikácia | **100%** | Backend + Frontend hotové, beží lokálne |
| ✅ FÁZA 2.5 | UI Polish & Create Company | **100%** | Moderný dizajn, Sidebar, Create Company modal |
| ✅ FÁZA 2.7 | Dark Mode + Advanced Features | **100%** | Dark mode, Deactivate, Collapsible, UUID, Logo |
| ✅ FÁZA 3 | Firma Onboarding | **100%** | 6-krokový wizard, logo upload, auto-login |
| 🎯 FÁZA 4 | Dashboard + Kalendár | **0%** | **ĎALŠÍ KROK** - KPI, FullCalendar, OrderTypes |
| 🔲 FÁZA 5 | Zákazky Wizard | **0%** | **CORE** - 5 krokov workflow |
| 🔲 FÁZA 6 | Fakturácia | **0%** | PDF + QR kódy |
| 🔲 FÁZA 7 | Zamestnanci | **0%** | Employee Portal |
| 🔲 FÁZA 8 | Analytika | **0%** | Grafy + KPI |
| 🔲 FÁZA 9 | Deploy & PWA | **0%** | Čaká na Node.js support alebo PHP prepis |

---

## 📋 ĎALŠIE KROKY - FÁZA 4

### 🎯 PRIORITA: Dashboard + Kalendár

**Cieľ:** Vytvoriť funkčný Company Admin Dashboard s KPI metrikami a kalendárom zákaziek.

**Features:**

### 1. Company Admin Dashboard
- [ ] **KPI Cards:**
  - Celkový počet zákaziek (aktívne/dokončené/zrušené)
  - Príjmy tento mesiac
  - Počet aktívnych zamestnancov
  - Pending faktúry
- [ ] **Grafy:**
  - Príjmy za posledných 12 mesiacov (line chart)
  - Zákazky podľa statusu (pie chart)
  - Top 5 typov montáží (bar chart)
- [ ] **Rýchle akcie:**
  - Vytvoriť novú zákazku (button → wizard)
  - Pridať zamestnanca
  - Vytvoriť faktúru

### 2. Kalendár (FullCalendar)
- [ ] **Integrácia FullCalendar.js**
  - Mesačný pohľad
  - Týždenný pohľad
  - Denný pohľad
- [ ] **Zobrazenie zákaziek:**
  - Farba podľa statusu (pending/in-progress/completed)
  - Klik na zákazku → detail modal
  - Drag & drop na presun dátumu
- [ ] **Filter:**
  - Podľa zamestnanca
  - Podľa typu montáže
  - Podľa statusu

### 3. Order Types Management
- [ ] **CRUD pre typy montáží:**
  - Vytvorenie nového typu
  - Úprava existujúceho typu
  - Mazanie typu
  - Správa checklistu pre každý typ
- [ ] **Checklist Builder:**
  - Pridávanie položiek
  - Drag & drop reorder
  - Označenie ako povinné/voliteľné

### 4. Backend Endpoints
- [ ] `GET /api/dashboard/stats` - KPI štatistiky
- [ ] `GET /api/dashboard/chart/:type` - Dáta pre grafy
- [ ] `GET /api/orders/calendar` - Zákazky pre kalendár
- [ ] `GET /api/order-types` - Zoznam typov montáží
- [ ] `POST /api/order-types` - Vytvorenie typu
- [ ] `PUT /api/order-types/:id` - Úprava typu
- [ ] `DELETE /api/order-types/:id` - Mazanie typu

### 5. Testing
- [ ] Dashboard načítanie a zobrazenie KPI
- [ ] Grafy renderujú správne dáta
- [ ] Kalendár zobrazuje zákazky
- [ ] Order types CRUD operácie

---

## 🔧 TECHNICKÉ DETAILY

### Prihlasovacie údaje

**Super Admin:**
- Email: `admin@montio.sk`
- Heslo: `admin123`
- Role: `superadmin`

**Testovacia firma:**
- Názov: Test Montáže s.r.o.
- Invite token: `test-invite-token-12345`
- Status: `pending`

**Databáza:**
- Host: `localhost` (na serveri)
- User: `u46895_montio`
- Password: `x52D_Z-lb!UX6n5`
- Database: `d46895_montio`

**JWT:**
- Secret: `montio_secret_key_2026_change_in_production`
- Expires: 7 dní

### URLs

- **Frontend LIVE:** https://montio.tsdigital.sk
- **GitHub Repo:** https://github.com/tado5/Montio (private)
- **Main branch:** Zdrojový kód
- **Production branch:** Buildnuté súbory

### Workflow

```
Local changes
    ↓
git push origin main
    ↓
GitHub Actions (2-3 min)
    ↓
Build frontend
    ↓
Push to production branch
    ↓
Hostcreator webhook
    ↓
LIVE na montio.tsdigital.sk
```

---

## 💡 POZNÁMKY

### Čo funguje perfektne:
- ✅ Backend beží lokálne (localhost:3001)
- ✅ Frontend beží lokálne (localhost:3000)
- ✅ Databáza funguje správne (8 tabuliek)
- ✅ Dark Mode + všetky FÁZA 2.7 features
- ✅ Moderný dizajn s TSDigital brandingom
- ✅ Activity logging a audit trail
- ✅ UUID security pre company IDs
- ✅ **FÁZA 3: Onboarding Wizard** (6 krokov, logo upload, auto-login)
- ✅ UI Unification (svetlejšie farby, zelená pre aktívne)
- ✅ File upload dokumentácia (TECHNICAL_NOTES.md)

### Aktuálna situácia:
- 🔶 Vývoj je **LOKÁLNY** (Hostcreator nemá Node.js support)
- 🎯 Začíname **FÁZA 4: Dashboard + Kalendár**
- 📝 Dokumentácia sa aktualizuje priebežne

### Estimate času pre FÁZU 3:
- **Backend endpoints:** 2-3 hodiny
- **Frontend wizard:** 4-6 hodín
- **Testing & polish:** 2-3 hodiny
- **CELKOM:** ~8-12 hodín práce

### Production deployment:
- Čaká na riešenie (Node.js support alebo PHP prepis)
- Možno použiť iný hosting (Railway, Render, Vercel)

---

## 📞 NA POKRAČOVANIE

1. **Otvor tento súbor:** `STATUS.md` - Aktuálny stav projektu
2. **Pozri sekciu:** "ĎALŠIE KROKY - FÁZA 3" - Detailný plán
3. **Začni s implementáciou:** Onboarding Wizard
4. **Aktualizuj dokumentáciu:** Pri každej zmene

**Príkazy na spustenie:**
```bash
# Backend
cd backend && npm run dev

# Frontend (v novom termináli)
cd frontend && npm run dev
```

---

## 🔧 TECHNICKÉ POZNÁMKY

### File Upload Strategy
**Aktuálne riešenie (Development):**
- 📁 **Metóda:** Lokálny filesystém (`backend/uploads/logos/`)
- 🖼️ **Spracovanie:** Multer + Sharp (resize 200x200, optimize JPG)
- 💾 **Databáza:** Len URL cesta `/uploads/logos/{timestamp}-{uuid}.jpg`
- 🌐 **Servovanie:** Express static middleware
- ✅ **Status:** Funguje OK pre development

**Pred Produkciou - Migrácia povinná:**
- ☁️ **Riešenie:** AWS S3 alebo DigitalOcean Spaces
- 💵 **Cena:** ~$5/mesiac (250GB + 1TB transfer)
- 📦 **SDK:** `@aws-sdk/client-s3`
- 🎯 **Dôvody:** Škálovanie, CDN, zálohy, multi-server support

**Zamietnuté riešenia:**
- ❌ BASE64 v DB (+33% veľkosť, spomalenie, žiadny cache)
- ❌ BLOB v DB (spomaľuje queries, veľké backupy)

---

**Projekt je vo výbornom stave!**
- ✅ FÁZY 1, 2, 2.5, 2.7 dokončené
- 🎯 FÁZA 3 čaká na implementáciu
- 💪 Vývoj je lokálny, všetko funguje perfektne!

**Verzia:** v1.2.0 Build #9 | **Dátum:** 2026-03-16
