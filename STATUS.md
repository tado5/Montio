# MONTIO APP - Aktuálny Stav Projektu

**Dátum:** 2026-03-30
**Čas:** Aktualizované
**Verzia:** v1.7.0 Build #15

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
  - **`GET /api/dashboard/stats`** - KPI štatistiky
  - **`GET /api/dashboard/chart/revenue`** - Graf príjmov
  - **`GET /api/dashboard/chart/order-types`** - Top typy montáží
  - **`GET /api/order-types`** - Zoznam typov montáží
  - **`POST /api/order-types`** - Vytvorenie typu
  - **`PUT /api/order-types/:id`** - Úprava typu
  - **`DELETE /api/order-types/:id`** - Vymazanie typu
  - **`GET /api/orders/calendar`** - Zákazky pre kalendár
  - **`GET /api/orders/:id`** - Detail zákazky
  - **`GET /api/employees`** - Zoznam zamestnancov
  - **`GET /api/employees/:id`** - Detail zamestnanca
  - **`POST /api/employees`** - Vytvorenie zamestnanca + user account
  - **`PUT /api/employees/:id`** - Úprava zamestnanca
  - **`DELETE /api/employees/:id`** - Deaktivácia zamestnanca
  - **`POST /api/employees/:id/change-password`** - Zmena default hesla
  - **`POST /api/employees/:id/approve`** - Schválenie zamestnanca
  - **`POST /api/employees/:id/reactivate`** - Reaktivácia zamestnanca
  - **`DELETE /api/employees/:id/hard-delete`** - Trvalé vymazanie
  - **`POST /api/employees/:id/resend-credentials`** - Opätovné odoslanie prihlasovacích údajov
  - **`GET /api/notifications`** - Zoznam notifikácií (pagination)
  - **`GET /api/notifications/unread-count`** - Počet neprečítaných
  - **`PUT /api/notifications/:id/read`** - Označiť ako prečítané
  - **`PUT /api/notifications/:id/unread`** - Označiť ako neprečítané
  - **`PUT /api/notifications/mark-all-read`** - Všetky ako prečítané
  - **`DELETE /api/notifications/:id`** - Vymazať notifikáciu
  - **`DELETE /api/notifications/delete-all-read`** - Vymazať všetky prečítané
- **Stav:** **BEŽÍ LOKÁLNE** na localhost:3001 ✅

### 3. Frontend (React + Vite + Tailwind) ✅
- **Technológia:** React 18, Vite, Tailwind CSS, React Router, Axios, FullCalendar
- **Stránky:**
  - Login stránka (quick login, TSDigital branding)
  - Super Admin Dashboard (KPI, search, filter, sort, create company)
  - Company Detail (stats, users, activity logs timeline)
  - Company Admin Dashboard (real KPI cards s live dátami)
  - Calendar Page (FullCalendar integrácia)
  - Order Types Page (CRUD management)
  - Employees Page (CRUD management)
  - Employee Dashboard (placeholder s phase badges)
- **Komponenty:**
  - AuthContext - state management
  - ThemeContext - dark mode management
  - ProtectedRoute - role-based access
  - Sidebar - collapsible navigation (Calendar, Order Types & Employees aktívne)
  - UserMenu - user dropdown menu
  - CreateCompanyModal - invite system
  - DeactivateCompanyModal - bezpečná deaktivácia
  - Calendar - FullCalendar integrácia
  - OrderTypesManager - CRUD pre typy montáží
  - EmployeesManager - CRUD pre zamestnancov
  - AppInfo - app info modal
  - Footer - TSDigital branding
- **Features:**
  - Dark Mode (light/dark toggle, DB storage)
  - Collapsible Sidebar (w-16 ↔ w-64)
  - Activity Logging (audit trail, timeline view)
  - UUID Company IDs (security)
  - **Dashboard KPI Cards** (real-time dáta z API)
  - **FullCalendar** (mesiac/týždeň/deň, event details)
  - **Order Types Manager** (CRUD, checklist editor)
  - **Employees Manager** (CRUD, user account creation, stats)
  - **Industrial Command Center UI** (v1.7.0 - complete redesign)
    - Role-specific layouts: SuperAdminLayout, CompanyAdminLayout, EmployeeLayout
    - Role-specific color schemes: Orange/Red (Super Admin), Blue/Cyan (Company Admin), Green/Emerald (Employee)
    - Custom typography: Archivo Black (headlines), IBM Plex Mono (data/metrics)
    - Dot matrix backgrounds with gradient overlays
    - Staggered animation system (slideInRight, slideUp, slideDown, pulse, ping)
    - DynamicLayout for shared pages (Profile, Notifications)
    - Dark-only theme (light/dark toggle disabled)
    - All pages redesigned with consistent aesthetic
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
**Hlavné dokumenty:**
- `README.md` - Project overview
- `PLAN.md` - Kompletný plán 9 fáz
- `STATUS.md` - Aktuálny stav projektu (tento súbor)
- `SETUP.md` - Inštalačné inštrukcie
- `CHANGELOG.md` - História verzií
- `PROJECT_STRUCTURE.md` - Štruktúra projektu
- `TECHNICAL_NOTES.md` - Technické poznámky
- `TESTING.md` - Testing dokumentácia
- `DEV_CREDENTIALS.md` - Credentials

**Design System Documentation (docs/design/):**
- `DESIGN_README.md` - Hlavný prehľad design systému
- `DESIGN_SYSTEM.md` - Kompletná design bible (30KB)
- `DESIGN_QUICK_REFERENCE.md` - Rýchla referencia
- `COMPONENTS_LIBRARY.md` - Knižnica ready-to-use komponentov
- `ANIMATION_GUIDE.md` - Animation system guide
- `FULL_REDESIGN_SUMMARY.md` - Implementation summary
- `SUPERADMIN_REDESIGN.md` - Super Admin špecifiká
- `DESIGN_PREVIEW.md` - ASCII visualizations

**Deployment Documentation (docs/deployment/):**
- `DEPLOYMENT.md` - Deployment guide
- `GITHUB_ACTIONS.md` - CI/CD dokumentácia
- `HOSTCREATOR_KOMUNIKACIA.md` - História komunikácie so supportom
- `OTAZKA_PRE_HOSTCREATOR.md` - Otázky pre Hostcreator
- `ODPOVED_PRE_HOSTCREATOR.md` - Prvá odpoveď
- `ODPOVED_PRE_HOSTCREATOR_NOVA.md` - Najnovšia odpoveď

**Archive (docs/archive/):**
- Neaktuálne dokumenty z predchádzajúcich fáz

---

## 🎯 ČO ČAKÁ - ĎALŠIE KROKY

### 1. FÁZA 4: Dashboard + Kalendár ✅ HOTOVO (2026-03-27)

**Implementované:**
- ✅ Backend API endpoints (9 nových endpoints)
- ✅ Company Admin Dashboard s KPI cards (real-time dáta)
- ✅ FullCalendar integrácia (mesiac/týždeň/deň)
- ✅ Order Types Manager (CRUD + checklist editor)
- ✅ Event detail modal s kompletným info
- ✅ Farebné kódovanie zákaziek podľa statusu
- ✅ Date range filtering
- ✅ Employee-specific calendar filtering
- ✅ Delete protection pre používané typy montáží
- ✅ Dark mode support pre všetky komponenty
- ✅ NPM packages: @fullcalendar/react, daygrid, timegrid, interaction
- ✅ Dokumentácia: CHANGELOG.md, STATUS.md, PLAN.md, MEMORY.md

**Súbory:**
- Backend: `routes/dashboard.js`, `routes/orderTypes.js`, `routes/orders.js`
- Frontend: `pages/CalendarPage.jsx`, `pages/OrderTypesPage.jsx`, `components/Calendar.jsx`, `components/OrderTypesManager.jsx`
- Aktualizované: `server.js`, `App.jsx`, `Sidebar.jsx`, `CompanyAdminDashboard.jsx`

### 2. FÁZA 7: Zamestnanci (Employee Management) ✅ HOTOVO (2026-03-27)

**Implementované:**
- ✅ Backend API endpoints (10 endpoints total)
- ✅ **Employee Lifecycle Management** - 5 statusov (created → pending_approval → active → inactive → deleted)
- ✅ **Forced password change** on first login (must_change_password flag)
- ✅ **Admin approval workflow** after password change
- ✅ **Reactivate** inactive employees
- ✅ **Hard delete** with FK cleanup (notifications + activity_logs)
- ✅ **Resend credentials** for created employees
- ✅ **READ-ONLY mode** for inactive employees (login allowed, edits disabled)
- ✅ Create employee + automatic user account creation
- ✅ Edit employee (name, email, position, phone, status)
- ✅ Employee list with order statistics (total orders, completed orders)
- ✅ Search & filter (by name, email, position, status)
- ✅ Activity logging for all operations
- ✅ Transaction support for atomicity
- ✅ Email uniqueness validation
- ✅ Password hashing with bcryptjs
- ✅ Dark mode support

**Súbory:**
- Backend: `routes/employees.js` (10 endpoints), `routes/notifications.js` (7 endpoints), `routes/auth.js` (modified login)
- Frontend: `pages/EmployeesPage.jsx`, `components/EmployeesManager.jsx`, `components/PasswordChangeModal.jsx`, `components/ReadOnlyBanner.jsx`, `components/NotificationBell.jsx`, `components/NotificationsPage.jsx`, `pages/ProfilePage.jsx` (READ-ONLY protection)
- Migrations: `backend/migrations/notifications_system.sql`
- Aktualizované: `server.js`, `App.jsx`, `Sidebar.jsx`, `Login.jsx`, `AuthContext.jsx`, 8 pages (NotificationBell)

**Features:**
- Grid layout s employee cards
- Create modal: meno, email, heslo, pozícia, telefón → status: created

### 3. UI REDESIGN: Industrial Command Center ✅ HOTOVO (2026-03-30) - v1.7.0 Build #15

**Implementované:**
- ✅ **Complete UI Redesign** - Industrial Command Center aesthetic
- ✅ **Role-specific Layouts** - 12 komponentov:
  - SuperAdminLayout, SuperAdminHeader, SuperAdminSidebar, SuperAdminFooter
  - CompanyAdminLayout, CompanyAdminHeader, CompanyAdminSidebar, CompanyAdminFooter
  - EmployeeLayout, EmployeeHeader, EmployeeSidebar, EmployeeFooter
  - DynamicLayout (auto-selects based on user role)
- ✅ **Role-specific Color Schemes:**
  - Super Admin: Orange (#f97316) → Red (#dc2626)
  - Company Admin: Blue (#3b82f6) → Cyan (#06b6d4)
  - Employee: Emerald (#10b981) → Green (#16a34a)
- ✅ **Custom Typography System:**
  - Headlines: Archivo Black (UPPERCASE)
  - Data/Metrics: IBM Plex Mono (all weights)
  - Google Fonts integration
- ✅ **Visual Patterns:**
  - Dot matrix backgrounds (32px grid, role-specific colors)
  - Gradient overlays for depth
  - Gradient accent lines on headers/footers
  - Backdrop blur effects on elevated elements
- ✅ **Animation System:**
  - Entrance: slideInRight (menu), slideUp (cards), slideDown (headers)
  - Status: pulse (active indicators), ping (notifications)
  - Stagger patterns: 0.05s delays for menu items, 0.1s for cards
  - Tailwind config with custom keyframes
- ✅ **Redesigned Pages (8 total):**
  - SuperAdminDashboard → "SYSTEM CONTROL"
  - CompanyAdminDashboard → "OPERATIONS HUB"
  - CalendarPage → "SCHEDULE CENTER"
  - OrderTypesPage → "OPERATIONS CONFIG"
  - EmployeesPage → "TEAM CONTROL"
  - EmployeeDashboard → "FIELD PORTAL"
  - ProfilePage → DynamicLayout, camera overlay, edit mode
  - NotificationsPage → DynamicLayout
  - CompanyDetail → SuperAdminLayout, KPI cards, timeline
- ✅ **Dark-only Theme:**
  - Light/Dark toggle disabled
  - Slate-950 base background
  - Consistent dark palette across all pages
- ✅ **Comprehensive Documentation (5 guides, 125KB total):**
  - DESIGN_README.md - Main overview (13KB)
  - DESIGN_SYSTEM.md - Complete design bible (30KB)
  - DESIGN_QUICK_REFERENCE.md - Quick reference (5KB)
  - COMPONENTS_LIBRARY.md - Ready-to-use components (19KB)
  - ANIMATION_GUIDE.md - Animation system (15KB)
- ✅ **Documentation Reorganization:**
  - docs/design/ - All design docs (10 files)
  - docs/deployment/ - Deployment & Hostcreator (7 files)
  - docs/archive/ - Outdated docs (5 files)
  - Root cleaned: 28 files → 9 core files

**Súbory:**
- Layouts: 12 nových komponentov v `frontend/src/components/`
- Pages: 8 kompletne redesigned
- Fonts: `frontend/src/index.css` (Archivo Black, IBM Plex Mono)
- Version: `version.json` (v1.7.0 Build #15)
- Documentation: `docs/design/`, `docs/deployment/`, `docs/archive/`

**Design Philosophy:**
- "Industrial Command Center" - Technický, precízny, premium
- Každá user level má distinctive visual identity cez farby
- Konzistentný animation language naprieč aplikáciou
- Production-ready, škálovateľný design system
- Edit modal: update všetkých údajov + status toggle
- Deactivate modal: soft delete s warning o počte zákaziek → status: inactive
- **Approve button**: Schválenie zamestnanca po zmene hesla → status: active
- **Reactivate button**: Reaktivácia neaktívneho zamestnanca
- **Hard delete button**: Trvalé vymazanie (len ak 0 orders) + FK cleanup
- **Resend credentials button**: Opätovné odoslanie prihlasovacích údajov
- **Password change modal**: Forced password change on first login
- **Notifications system**: Bell icon s badge, 30s polling, pagination, filters
- **READ-ONLY banner**: Yellow warning banner for inactive employees
- **Profile READ-ONLY protection**: Disabled buttons for inactive users
- Status badges: Vytvorený (modrý), Čaká na schválenie (žltý), Aktívny (zelený), Neaktívny (šedý)
- Order statistics: celkový počet a dokončené zákazky
- Search: real-time filter podľa mena, emailu, pozície
- Filter dropdown: Všetci / Aktívni / Neaktívni / Vytvorení / Čakajúci

### 3. FÁZA 3: Firma Onboarding Wizard ✅ HOTOVO (2026-03-16)

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
| ✅ FÁZA 4 | Dashboard + Kalendár | **100%** | KPI cards, FullCalendar, OrderTypes CRUD |
| 🎯 FÁZA 4.5 | Company Settings | **0%** | **PO OBEDE** - Nastavenia firmy (Company Admin) |
| ✅ FÁZA 7 | Zamestnanci | **100%** | Employee Lifecycle, Notifications, READ-ONLY mode |
| 🔲 FÁZA 5 | Zákazky Wizard | **0%** | 5 krokov workflow |
| 🔲 FÁZA 6 | Fakturácia | **0%** | PDF + QR kódy |
| 🔲 FÁZA 8 | Analytika | **0%** | Grafy + KPI |
| 🔲 FÁZA 9 | Deploy & PWA | **0%** | Čaká na Node.js support alebo PHP prepis |

---

## 📋 ĎALŠIE KROKY

### 🎯 PRIORITA 1: Company Settings Management (Po obede)

**Cieľ:** Company Admin si môže upraviť nastavenia svojej firmy.

**TODO:**
- [ ] Backend endpoints (GET + 3x PUT)
  - GET /api/company/settings - Načítanie nastavení
  - PUT /api/company/settings/basic - Základné údaje (názov, IČO, DIČ, adresa)
  - PUT /api/company/settings/logo - Zmena loga (file upload)
  - PUT /api/company/settings/billing - Fakturačné údaje (IBAN, SWIFT, VS, splatnosť)
- [ ] Frontend stránka CompanySettingsPage.jsx
- [ ] 3 komponenty: BasicSettings, LogoUpload, BillingSettings
- [ ] Form validation (IČO, DIČ, IBAN)
- [ ] Live preview zmien
- [ ] Activity logging
- [ ] Success/error notifikácie
- [ ] Link v Sidebar: "⚙️ Nastavenia firmy"

**Estimate:** ~4-6 hodín

---

## 📋 ĎALŠIE KROKY - FÁZA 4 (HOTOVO)

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
- ✅ Databáza funguje správne (8 tabuliek + notifications)
- ✅ Dark Mode + všetky FÁZA 2.7 features
- ✅ Moderný dizajn s TSDigital brandingom
- ✅ Activity logging a audit trail
- ✅ UUID security pre company IDs
- ✅ **FÁZA 3: Onboarding Wizard** (6 krokov, logo upload, auto-login)
- ✅ **FÁZA 4: Dashboard + Kalendár** (KPI, FullCalendar, OrderTypes)
- ✅ **FÁZA 7: Employee Lifecycle** (5 statusov, forced password change, approval workflow)
- ✅ **Notifications System** (real-time, 30s polling, pagination)
- ✅ **READ-ONLY Mode** (inactive employees can login but not edit)
- ✅ UI Unification (svetlejšie farby, zelená pre aktívne)
- ✅ File upload dokumentácia (TECHNICAL_NOTES.md)

### Aktuálna situácia:
- 🔶 Vývoj je **LOKÁLNY** (Hostcreator nemá Node.js support)
- 🎯 Ďalší krok: **FÁZA 5: Zákazky Wizard** (5 krokov workflow)
- ✅ **v1.6.0 HOTOVO** - Employee Lifecycle + Notifications System
- 📝 Dokumentácia sa aktualizuje priebežne

### Estimate času pre FÁZU 5 (Zákazky Wizard):
- **Backend endpoints:** 3-4 hodiny (obhliadka, ponuka, montáž, faktúra)
- **Frontend wizard:** 6-8 hodín (5-krokový wizard, fotky, podpisy)
- **PDF generovanie:** 2-3 hodiny (jsPDF, QR kódy)
- **Testing & polish:** 3-4 hodiny
- **CELKOM:** ~14-19 hodín práce

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
- ✅ FÁZY 1, 2, 2.5, 2.7, 3, 4, 7 dokončené
- 🎯 FÁZA 5 (Zákazky Wizard) je ďalší krok
- 💪 Vývoj je lokálny, všetko funguje perfektne!
- 🔔 Notifications System implementovaný
- 🔐 Employee Lifecycle Management kompletný
- 📖 READ-ONLY mode pre inactive employees

**Verzia:** v1.6.0 Build #14 | **Dátum:** 2026-03-27
