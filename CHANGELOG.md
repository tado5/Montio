# MONTIO - Changelog

## [1.5.0] - 2026-03-27 - FÁZA 7: Zamestnanci (Employee Management) 👥

### ✨ Nové funkcie

**Backend API Endpoints:**
- `GET /api/employees` - Zoznam zamestnancov s order štatistikami
- `GET /api/employees/:id` - Detail zamestnanca
- `POST /api/employees` - Vytvorenie zamestnanca + automatické vytvorenie user accountu
- `PUT /api/employees/:id` - Úprava zamestnanca (meno, email, pozícia, telefón, status)
- `DELETE /api/employees/:id` - Deaktivácia zamestnanca (soft delete)

**Employee Management:**
- Grid layout s employee cards
- Search & filter funkcie:
  - Real-time search podľa mena, emailu, pozície
  - Filter dropdown: Všetci / Aktívni / Neaktívni
- Order statistics na každej card:
  - Celkový počet zákaziek
  - Počet dokončených zákaziek
- Status badges (Aktívny/Neaktívny) s farbami
- CRUD operácie s modals:
  - Create: meno, email, heslo, pozícia, telefón
  - Edit: update všetkých údajov + status toggle
  - Deactivate: soft delete s warning o počte zákaziek
- Responzívny dizajn (1/2/3 columns)
- Dark mode support

### 🔧 Technické detaily

**Nové súbory:**
- `backend/routes/employees.js` - Employee CRUD API endpoints (4 endpoints)
- `frontend/src/components/EmployeesManager.jsx` - Employee management komponent
- `frontend/src/pages/EmployeesPage.jsx` - Employees stránka

**Aktualizované súbory:**
- `backend/server.js` - Pridaná employee route
- `frontend/src/App.jsx` - Pridaná /company/employees route
- `frontend/src/components/Sidebar.jsx` - Aktivovaný Zamestnanci link

**Database Operations:**
- Transaction support pre atomicity (vytvorenie user + employee súčasne)
- Password hashing s bcryptjs
- Email uniqueness validation
- Soft delete (status: active → inactive)
- LEFT JOIN pre order statistics
- Activity logging pre všetky operácie

### 🔐 Security & Permissions

- Company Admin: full CRUD access
- Employee: žiadny prístup (len svoj profil v budúcnosti)
- JWT authentication pre všetky API endpoints
- Company ID verification
- Activity logging: employee.create, employee.update, employee.deactivate
- Email uniqueness check (across all users)

### 🎨 UI/UX Improvements

- Real-time search (instant filtering)
- Status-based filtering
- Empty states (žiadni zamestnanci / žiadne výsledky)
- Loading states s spinner
- Error handling s user-friendly messages
- Confirmation modals pre deaktiváciu
- Warning badges (počet zákaziek)
- Smooth animations & hover effects

### 📝 Business Logic

- Pri vytvorení zamestnanca sa automaticky vytvára user account s rolou "employee"
- Password musí mať min. 6 znakov
- Email musí byť unique v celom systéme
- Deaktivácia neodstráni dáta, len zmení status
- Zamestnanci zostávajú viditeľní v zákazkách aj po deaktivácii
- Order statistics sa počítajú real-time z databázy

---

## [1.4.0] - 2026-03-27 - FÁZA 4: Dashboard + Kalendár 📊📅

### ✨ Nové funkcie

**Backend API Endpoints:**
- `GET /api/dashboard/stats` - KPI štatistiky (zákazky, príjmy, zamestnanci, faktúry)
- `GET /api/dashboard/chart/revenue` - Graf príjmov za posledných 12 mesiacov
- `GET /api/dashboard/chart/order-types` - Top 5 typov montáží
- `GET /api/order-types` - Zoznam typov montáží s usage štatistikami
- `POST /api/order-types` - Vytvorenie nového typu montáže
- `PUT /api/order-types/:id` - Úprava typu montáže
- `DELETE /api/order-types/:id` - Vymazanie typu montáže (kontrola usage)
- `GET /api/orders/calendar` - Zákazky pre kalendár (filtering, employee-specific)
- `GET /api/orders/:id` - Detail zákazky

**Company Admin Dashboard:**
- Real-time KPI cards s live dátami z API
  - Celkový počet zákaziek (aktívne/dokončené/zrušené)
  - Príjmy tento mesiac (€)
  - Počet aktívnych zamestnancov
  - Nezaplatené faktúry
- Quick actions buttons (Nová zákazka, Pridať zamestnanca, Vytvoriť faktúru)
- Responzívny grid layout (1/2/4 columns)
- Dark mode support

**FullCalendar Integrácia:**
- Mesačný/týždenný/denný pohľad
- Farebné kódovanie zákaziek podľa statusu:
  - Obhliadka: modrá
  - Cenová ponuka: oranžová
  - Priradené: fialová
  - V procese: smaragdová
  - Dokončené: zelená
  - Zrušené: červená
- Event detail modal s kompletným info
- Date range filtering (auto-refresh pri zmene mesiaca)
- Lokalizácia (slovenčina)
- Custom styling pre light/dark mode

**Order Types Manager:**
- Zoznam všetkých typov montáží
- CRUD operácie (Create, Update, Delete)
- Checklist editor s dynamickým pridávaním/odoberaním položiek
- Usage counter (koľkokrát bol typ použitý)
- Delete protection (nemožno vymazať ak je použitý v zákazkách)
- Modals: Create, Edit, Delete confirmation
- Responzívny grid (1/2/3 columns)

### 🔧 Technické detaily

**Nové súbory:**
- `backend/routes/dashboard.js` - Dashboard API endpoints
- `backend/routes/orderTypes.js` - Order Types CRUD
- `backend/routes/orders.js` - Orders & Calendar API
- `frontend/src/components/Calendar.jsx` - FullCalendar komponent
- `frontend/src/components/OrderTypesManager.jsx` - Order Types management
- `frontend/src/pages/CalendarPage.jsx` - Kalendár stránka
- `frontend/src/pages/OrderTypesPage.jsx` - Order Types stránka

**Aktualizované súbory:**
- `backend/server.js` - Pridané nové routes
- `frontend/src/App.jsx` - Pridané nové routes
- `frontend/src/components/Sidebar.jsx` - Aktivované Kalendár & Typy montáží
- `frontend/src/pages/CompanyAdminDashboard.jsx` - Kompletne prepísané s API integráciou

**NPM Packages:**
- `@fullcalendar/react` - FullCalendar React wrapper
- `@fullcalendar/daygrid` - Mesačný pohľad
- `@fullcalendar/timegrid` - Týždenný/denný pohľad
- `@fullcalendar/interaction` - Date click & event handling

### 🎨 UI/UX Improvements

- Real-time data loading s loading states
- Error handling s user-friendly messages
- Smooth animations & transitions
- Gradient glassmorphism cards
- Hover effects & transform scales
- Dark mode support pre všetky komponenty
- Responzívny dizajn (mobile/tablet/desktop)

### 📊 Database Usage

- Queries optimizované pre KPI cards (single query pre všetky stats)
- LEFT JOIN pre order types usage count
- Date range filtering pre kalendár
- Employee-specific filtering pre employee role
- Status filtering pre zákazky

### 🔐 Security & Permissions

- Company Admin: full access to dashboard, calendar, order types
- Employee: read-only calendar (len svoje zákazky)
- JWT authentication pre všetky API endpoints
- Activity logging pre order type CRUD operácie
- Company ID verification pre všetky queries

### 🚀 Performance

- API data caching možné implementovať neskôr
- Lazy loading calendar events (fetch on date range change)
- Debounce pre search/filter inputs (pripravené)
- Optimalizované SQL queries s indexes

### 📝 Dokumentácia

- STATUS.md aktualizované (FÁZA 4: 100%)
- PLAN.md aktualizované (FÁZA 5 je ďalší krok)
- MEMORY.md aktualizované (nové features)
- CHANGELOG.md (tento súbor)

### ✅ Testing

- Backend endpoints testované cez Postman/curl
- Frontend komponenty testované lokálne
- Dark mode testovaný
- Responzivita testovaná (mobile/tablet/desktop)
- Role-based access testovaný

### 🎯 Ďalšie kroky - FÁZA 5

- Zákazky Wizard (5-krokový workflow)
- Order stages (survey, quote, installation, completion)
- Photo upload pre jednotlivé stage
- Checklist completion tracking
- Client signatures (signature pad)
- PDF protokoly generovanie

---

## [1.3.0] - 2026-03-16 - UI Unification & Technical Documentation 🎨📚

### 🎨 Brand Color Unification
- **Svetlejší TSDigital brand gradient** - `from-orange-400 to-red-500` (bolo orange-500)
  - Živšie farby, lepšie pasujú k logu
  - Zmenené vo všetkých 17 súboroch (pages, components, onboarding)
  - Konzistentné hover stavy: `from-orange-600 to-red-700`
- **Zelená farba pre aktívne firmy** - `from-green-500 to-emerald-500`
  - KPI karta "✓ Aktívne" v SuperAdmin dashboarde
  - Status badge v tabuľke firiem
  - Tlačidlo "✓ Aktivovať" v Company Detail
  - Jasná vizuálna logika: Zelená = aktívne/pozitívne
- **Zjednotené pozadia** pre všetkých
  - SuperAdmin, CompanyAdmin, Employee: `from-gray-50 to-gray-100`
  - Dark mode: `dark:from-gray-900 dark:to-gray-800`
  - Odstránené role-specific farby
- **Light/Dark mode** - konzistentné farby pre všetky role

### 📚 Technical Documentation
- **TECHNICAL_NOTES.md** (NEW) - Kompletná dokumentácia file upload stratégie
  - Aktuálny stav: Filesystém (development)
  - Produkčné riešenie: S3/DigitalOcean Spaces
  - Porovnávacia tabuľka všetkých riešení
  - Migračný plán krok-po-kroku
  - Vysvetlenie prečo BASE64/BLOB sú zlé riešenia
- **PLAN.md** - Pridaná sekcia "Technické Riešenia & Budúce Migrácie"
- **STATUS.md** - Pridaná sekcia "🔧 TECHNICKÉ POZNÁMKY"
- **SETUP.md** - Pridaná sekcia "File Upload & Storage"
- **README.md** - Kompletne prepísané s tech stack a quick start
- **MEMORY.md** - Zapamätaná file upload stratégia

### 🔧 File Upload Strategy (Documented)
- **Development:** Lokálny filesystém (`backend/uploads/logos/`)
  - Multer + Sharp (resize 200x200, optimize JPG)
  - URL v databáze: `/uploads/logos/{timestamp}-{uuid}.jpg`
- **Production:** Migrácia na AWS S3 / DigitalOcean Spaces (povinné pred spustením)
  - Cena: ~$5/mesiac (250GB + 1TB transfer)
  - SDK: `@aws-sdk/client-s3`
  - Dôvody: Škálovanie, CDN, zálohy, multi-server support
- **Zamietnuté:** BASE64 v DB (+33% veľkosť), BLOB v DB (spomalenie)

### 📝 Zmenené súbory (UI)
**Pages (8):**
- SuperAdminDashboard.jsx - Svetlejší gradient + zelená aktívne
- CompanyAdminDashboard.jsx - Zjednotené farby + pozadie
- EmployeeDashboard.jsx - Zjednotené farby + pozadie
- CompanyDetail.jsx - Zelené aktivovanie + svetlejší gradient
- Login.jsx - Svetlejší gradient
- OnboardingWizard.jsx - Svetlejší gradient

**Components (11):**
- Sidebar.jsx - Svetlejší gradient
- UserMenu.jsx - Svetlejší gradient
- CreateCompanyModal.jsx - Svetlejší gradient + zelená
- AppInfo.jsx - Svetlejší gradient
- Footer.jsx - Svetlejší gradient
- Step1BasicInfo.jsx - Svetlejší gradient
- Step2LogoBilling.jsx - Svetlejší gradient
- Step3OrderTypes.jsx - Svetlejší gradient
- Step4Preview.jsx - Svetlejší gradient
- Step5Complete.jsx - Svetlejší gradient
- StepProgress.jsx - Svetlejší gradient

### 🎯 Výsledok
- ✅ Profesionálny, jednotný dizajn
- ✅ TSDigital branding konzistentný
- ✅ Svetlejšie, živšie farby
- ✅ Jasná vizuálna hierarchia (zelená = aktívne)
- ✅ Kompletná technická dokumentácia
- ✅ Pripravené na produkčnú migráciu

---

## [1.2.0] - 2026-03-16 - UUID Company IDs & Table Improvements 🔐

### 🔐 Security Enhancement - UUID Implementation
- **UUID v4 pre company IDs** namiesto sekvenčných čísel (1, 2, 3...)
  - Príklad: `890f7443-90ff-41d5-ae71-55a6013b54af`
  - Žiadne information leakage o počte firiem
  - Nemožnosť enumerácie company IDs
  - Globálne jedinečné identifikátory

### 🏗️ Backend Changes
- ✅ Pridaný `uuid` package (npm install uuid)
- ✅ Nový stĺpec `public_id VARCHAR(36) UNIQUE` v companies table
- ✅ Všetky API routes používajú `:publicId` parameter
  - `GET /api/companies/:publicId`
  - `PUT /api/companies/:publicId/activate`
  - `PUT /api/companies/:publicId/deactivate`
  - `GET /api/companies/:publicId/logs`
- ✅ Fixed bugs: undefined `id` → `company.id` v queries
- ✅ Response mapuje `public_id` ako `id` pre frontend
- ✅ Pridané `created_at` do companies list endpoint
- ✅ Interné INT `id` stále používané pre foreign keys a performance

### 🎨 Frontend - Table Layout Improvements
- ✅ **Odstránený stĺpec IČO** (duplicitný s DIČ)
- ✅ **Pridaný stĺpec "Vytvorené"** s dátumom vytvorenia
  - Formát: DD.MM.YYYY (sk-SK locale)
  - Sortovateľný (od najnovších/najstarších)
- ✅ **Upravené šírky stĺpcov** pre lepší balance:
  - ID: `w-80` (široký pre UUID)
  - Názov: auto (flex)
  - DIČ: `w-40`
  - Vytvorené: `w-48`
  - Status: `w-44`
  - Akcie: `w-40`
- ✅ **Default sort** zmenený z 'id' na 'name'
- ✅ **ID zobrazenie**: text-xs font-mono namiesto malého krúžku
- ✅ **Sortovanie**: Názov, Vytvorené, Status (odstránené IČO, DIČ, ID)

### 📋 Company Detail Page
- ✅ Pridané **ID field** na začiatok sekcie "Informácie o firme"
  - Celé UUID zobrazené v monospace fonte
  - Break-all pre správne zalamovanie dlhých UUID
- ✅ DeactivateCompanyModal: skrátené UUID na prvých 8 znakov
  - Príklad: `890f7443...`

### 🗄️ Database Structure
```sql
-- Internal INT id pre foreign keys & performance
id INT AUTO_INCREMENT PRIMARY KEY

-- External UUID pre API
public_id VARCHAR(36) UNIQUE

-- Usage
- FK relations: company_id (INT)
- API routes: public_id (UUID)
- Frontend: receives UUID as 'id'
```

### 🔧 Technical Details
**Route Changes:**
```javascript
// BEFORE
GET /api/companies/:id
PUT /api/companies/:id/activate

// AFTER
GET /api/companies/:publicId
PUT /api/companies/:publicId/activate

// Query lookup
const [companies] = await pool.query(
  'SELECT id FROM companies WHERE public_id = ?',
  [publicId]
)
```

**Date Sorting:**
```javascript
if (sortField === 'created_at') {
  aVal = aVal ? new Date(aVal).getTime() : 0
  bVal = bVal ? new Date(bVal).getTime() : 0
}
```

### 📦 Modified Files
```
backend/
  ├── package.json                  # Added uuid dependency
  ├── routes/companies.js           # UUID routes + bug fixes
  └── routes/auth.js                # Added created_at to response

frontend/src/
  ├── pages/SuperAdminDashboard.jsx # Table improvements
  ├── pages/CompanyDetail.jsx       # Added ID display
  └── components/DeactivateCompanyModal.jsx # Shortened UUID
```

### ✅ Benefits
- 🔒 **Security**: Nemožnosť uhádnuť company IDs
- 📊 **Privacy**: Skrytý počet firiem v systéme
- 🌍 **Unique**: Globálne jedinečné bez kolízií
- ⚡ **Performance**: Interné INT ID stále rýchle pre JOIN queries
- 🎨 **UX**: Lepší table layout s relevantnejšími stĺpcami

---

## [1.1.0] - 2026-03-16 - TSDigital Brand Gradient 🎨

### 🎨 Brand Identity Update
- **Nový gradient z TSDigital loga**
  - Z loga SVG: `#ffc500` (žltá/amber) → `#c21500` (červená)
  - Tailwind: `from-amber-500 to-red-600`
  - Nahradené všetky purple-pink gradienty

### 🔄 Zmeny gradientov

**Pred (Purple-Pink):**
```css
from-purple-500 to-pink-500      /* Primary */
from-purple-600 to-pink-600      /* Hover */
from-blue-500 to-purple-500      /* Accent */
```

**Po (Amber-Orange-Red):**
```css
from-amber-500 to-red-600        /* Primary */
from-amber-600 to-red-700        /* Hover */
from-orange-500 to-red-600       /* Accent */
```

### 📦 Aktualizované komponenty
```
✅ Sidebar - collapse button, active states
✅ AppInfo - header, footer button
✅ UserMenu - avatar, menu items
✅ Footer - version text
✅ CreateCompanyModal - buttons
✅ SuperAdminDashboard - buttons, logo, KPI
✅ CompanyAdminDashboard - phase badges
✅ EmployeeDashboard - phase badges
✅ CompanyDetail - logos, back button, status
✅ Login - quick login buttons
```

### 🎯 Text Colors
```
text-purple-700 → text-orange-600
text-purple-600 → text-orange-600
text-purple-500 → text-orange-500
text-purple-400 → text-orange-400
text-purple-200 → text-orange-200
```

### 🌈 Background & Hover
```
hover:from-blue-50 hover:to-purple-50 → hover:from-orange-50 hover:to-red-50
hover:from-purple-100 hover:to-pink-100 → hover:from-amber-100 hover:to-red-100
bg-purple-100 → bg-orange-100
```

### ✨ Výsledok
Aplikácia teraz používa konzistentný TSDigital brand gradient naprieč celým UI!

---

## [1.0.6] - 2026-03-16 - Modal Close Enhancements ⌨️

### ✨ Features
- **ESC klávesa zatvorí modal** - useEffect listener pre Escape key
- **Klik mimo modal ho zatvorí** - onClick na backdrop
- **Klik na X button** - už existujúce (stále funguje)

### 🎨 UX Improvements
Používateľ má teraz 3 spôsoby ako zatvoriť Info modal:
1. ✅ Stlačiť **ESC** klávesu
2. ✅ Kliknúť **mimo modalu** (na backdrop)
3. ✅ Kliknúť na **X** button

### 🔧 Technical Implementation
```jsx
// 1. ESC key listener
useEffect(() => {
  const handleEscape = (event) => {
    if (event.key === 'Escape' && isOpen) {
      setIsOpen(false)
    }
  }
  document.addEventListener('keydown', handleEscape)
  return () => document.removeEventListener('keydown', handleEscape)
}, [isOpen, setIsOpen])

// 2. Backdrop click
<div onClick={() => setIsOpen(false)}>

// 3. Prevent modal content from closing
<div onClick={(e) => e.stopPropagation()}>
  {/* Modal content */}
</div>
```

### 📦 Modified Files
```
/frontend/src/components/AppInfo.jsx   # ESC + backdrop close
/version.json                          # v1.0.6, Build #7
```

---

## [1.0.5] - 2026-03-16 - Info Button UX Fix 🔧

### 🐛 Bug Fix
- **Fixed Info button v collapsed móde**
  - PRED: Prvý klik rozbalil sidebar, druhý klik otvoril modal
  - PO: Jeden klik priamo otvorí modal
  - Sidebar zostane collapsed

### 🎨 UX Improvement
- AppInfo komponent teraz podporuje controlled state
- Props: `showButton`, `isOpen`, `onOpenChange`
- V collapsed móde: ikona rovno otvorí modal
- V expanded móde: button s textom otvorí modal

### 🔧 Technical Changes
```jsx
// Sidebar state
const [isInfoOpen, setIsInfoOpen] = useState(false)

// Collapsed mode - direct modal open
<button onClick={() => setIsInfoOpen(true)}>
  <span>ℹ️</span>
</button>
<AppInfo showButton={false} isOpen={isInfoOpen} onOpenChange={setIsInfoOpen} />

// Expanded mode - normal button
<AppInfo isOpen={isInfoOpen} onOpenChange={setIsInfoOpen} />
```

### 📦 Modified Files
```
/frontend/src/components/AppInfo.jsx   # Controlled state support
/frontend/src/components/Sidebar.jsx   # Fixed collapsed mode behavior
/version.json                          # v1.0.5, Build #6
```

---

## [1.0.4] - 2026-03-16 - Sidebar Full Height Fix 📏

### 🐛 Bug Fixes
- **Sidebar teraz na celú výšku** medzi headerom a footerom
  - Fixed: `min-h-screen` → `h-screen` na wrapper
  - Fixed: `flex-shrink-0` na header a footer (nezmenšujú sa)
  - Fixed: `min-h-0` na middle container (flex fix)
  - Sidebar správne vyplní priestor `h-full`

### 🔧 Technical Changes
```css
/* PRED - nefungoval správne flex */
.wrapper { min-h-screen }
.header { }
.middle { flex: 1 }
.footer { }

/* PO - flex funguje správne */
.wrapper { h-screen }           ← Fixed výška
.header { flex-shrink-0 }       ← Nezmenšuje sa
.middle { flex: 1, min-h-0 }    ← Flex fix
.footer { flex-shrink-0 }       ← Nezmenšuje sa
```

### 📦 Modified Files
```
/frontend/src/components/Footer.jsx              # flex-shrink-0
/frontend/src/pages/SuperAdminDashboard.jsx     # h-screen layout
/frontend/src/pages/CompanyAdminDashboard.jsx   # h-screen layout
/frontend/src/pages/EmployeeDashboard.jsx       # h-screen layout
/frontend/src/pages/CompanyDetail.jsx           # h-screen layout
/version.json                                    # v1.0.4, Build #5
```

### ✅ Result
Sidebar teraz správne vyplní celú výšku medzi headerom a footerom na všetkých stránkach!

---

## [1.0.3] - 2026-03-16 - Sidebar Redesign & UX Improvements ☰

### ✨ Sidebar Redesign
- **Collapse button hore** - Presunutý z dolnej časti nahor
  - Namiesto "MONTIO + role" textu
  - Krajší dizajn s ikonou ☰
  - V collapsed móde len ikona ☰
  - V expanded móde: "☰ Menu" + šípka ←

- **Kompaktnejší sidebar**
  - Collapsed šírka: `w-20` → `w-16` (ešte užší)
  - Expanded šírka: `w-64` (bez zmeny)
  - Menšie paddingy v collapsed móde
  - Ikony zmenšené z text-2xl na text-xl v collapsed

- **AppInfo dole** - Len menší "O aplikácii" button
  - Odstránený toggle button zo spodku
  - AppInfo menší: py-2, text-sm
  - V collapsed móde len ikona ℹ️
  - Padding zmensený z p-4 na p-2

### 🎨 Navigation Improvements
- Menšie menu items v collapsed móde
- Text size zmenšený z `font-semibold` na `text-sm`
- Zaoblenie z `rounded-xl` na `rounded-lg`
- Lepšie centrované ikony v collapsed móde
- `overflow-y-auto` na navigácii pre lepší scroll

### 🔧 Technical Details
**Pred:**
```
┌────────────────┐
│ MONTIO Logo    │
│ Super Admin    │
├────────────────┤
│ Menu Items     │
│                │
├────────────────┤
│ AppInfo Button │
│ Toggle Button  │
└────────────────┘
```

**Po:**
```
┌────────────────┐
│ ☰ Menu      ← │  ← Collapse hore
├────────────────┤
│ Menu Items     │
│                │
│                │
├────────────────┤
│ ℹ️ O aplikácii │  ← Len AppInfo
└────────────────┘
```

### 📦 Modified Files
```
/frontend/src/components/Sidebar.jsx    # Kompletný redesign
/frontend/src/components/AppInfo.jsx    # Menší button
/version.json                           # v1.0.3, Build #4
```

---

## [1.0.2] - 2026-03-16 - Optimalizovaný Layout & Kompaktný Dizajn 📐

### 🎨 UI/UX Improvements
- **Kompaktnejší Header** - Znížený padding z `py-3` na `py-2`
  - Text size z `text-xl` na `text-lg`
  - Logo v CompanyDetail zmenšené z 14x14 na 10x10
  - "Späť" button menší (text-xs, mb-2)
  - Viac priestoru pre obsah

- **Kompaktnejší Footer** - Znížený padding z `py-4` na `py-2`
  - Logo zmenšené z 8x8 na 6x6
  - Single-line layout na mobile aj desktop
  - Kompaktnejšia typografia (text-xs)

- **Footer cez celú šírku** - Nový layout štruktúra
  - Footer teraz pod celou stránkou (aj pod sidebarom)
  - Header nad celou stránkou
  - Sidebar len medzi headerom a footerom
  - Konzistentný dizajn naprieč aplikáciou

### 🏗️ Layout Changes
```
Starý layout:              Nový layout:
┌────────────────┐         ┌─────────────────────┐
│ Sidebar │ Main │         │   Header (full)     │
│         │ Head │         ├────────┬────────────┤
│         │ Cont │   →     │Sidebar │  Content   │
│         │ Foot │         │        │            │
└────────────────┘         ├────────┴────────────┤
                           │   Footer (full)     │
                           └─────────────────────┘
```

### 🔧 Technical Changes
- Sidebar: `min-h-screen` → `h-full`
- All dashboards: `flex` → `flex flex-col`
- Header moved outside sidebar container
- Footer moved outside sidebar container
- Main content area with `overflow-hidden` parent

### 📦 Modified Files
```
/frontend/src/components/Footer.jsx              # Kompaktnejší dizajn
/frontend/src/components/Sidebar.jsx             # h-full namiesto min-h-screen
/frontend/src/pages/SuperAdminDashboard.jsx     # Nový layout
/frontend/src/pages/CompanyAdminDashboard.jsx   # Nový layout
/frontend/src/pages/EmployeeDashboard.jsx       # Nový layout
/frontend/src/pages/CompanyDetail.jsx           # Nový layout + menší header
/version.json                                    # v1.0.2, Build #3
```

---

## [1.0.1] - 2026-03-16 - App Info, Versioning & TSDigital Branding 🎨

### ✨ New Features
- **App Info Modal** - Nová položka "O aplikácii" v spodnej časti sidebaru
  - Zobrazuje verziu aplikácie, build number, dátum vydania
  - Info o autorovi (TSDigital) s logom
  - Zoznam noviniek v aktuálnej verzii
  - Dostupné pre všetkých používateľov (SuperAdmin, CompanyAdmin, Employee)

- **Version Management** - `version.json` v root adresári
  - Semantic versioning (MAJOR.MINOR.PATCH)
  - Build number (automaticky sa zvyšuje)
  - Changelog history pre každú verziu
  - Typ zmeny: major, minor, patch

- **Footer Component** - Nový footer na všetkých stránkach
  - TSDigital logo a branding
  - "Created with ❤️ by TSDigital"
  - Verzia aplikácie a build number
  - Copyright informácie

- **Login Page Enhancement** - TSDigital branding
  - "Created with ❤️ by TSDigital" na login stránke
  - TSDigital logo zobrazené
  - Elegantný dizajn s gradientmi

### 🎨 UI Improvements
- ✅ **Compact Header** - Zmenšený header z py-5 na py-3, text-2xl na text-xl
  - Viac priestoru pre obsah
  - Konzistentné naprieč všetkými stránkami
  - Zachovaná čitateľnosť

- ✅ **Footer na všetkých dashboardoch**
  - SuperAdminDashboard
  - CompanyAdminDashboard
  - EmployeeDashboard
  - CompanyDetail

- ✅ **TSDigital Logo Integration**
  - Logo skopírované do `/frontend/src/assets/tsdigital-logo.svg`
  - Použité v AppInfo, Footer a Login page
  - Gradient branding colors (orange → red)

### 📦 New Files
```
/version.json                            # Version management
/frontend/src/assets/tsdigital-logo.svg  # TSDigital logo
/frontend/src/components/AppInfo.jsx     # App info modal
/frontend/src/components/Footer.jsx      # Footer component
```

### 🔧 Modified Files
```
/frontend/src/components/Sidebar.jsx           # Added AppInfo button
/frontend/src/pages/SuperAdminDashboard.jsx   # Compact header + Footer
/frontend/src/pages/CompanyAdminDashboard.jsx # Compact header + Footer
/frontend/src/pages/EmployeeDashboard.jsx     # Compact header + Footer
/frontend/src/pages/CompanyDetail.jsx         # Compact header + Footer
/frontend/src/pages/Login.jsx                 # TSDigital branding
```

### 📊 Versioning Strategy
- **MAJOR** (X.0.0) - Breaking changes, major rewrites
- **MINOR** (1.X.0) - New features, enhancements
- **PATCH** (1.0.X) - Bug fixes, small improvements
- **BUILD** (#1, #2, #3...) - Každý build/deploy zvýši build number

### 🎯 Next Steps
- Build number sa bude zvyšovať automaticky s každým CI/CD build
- Version bump stratégia podľa typu zmien
- Changelog entries pri každej novej verzii

---

## [2.8.0] - 2026-03-15 - Super Admin Dashboard Enhancements 📊

### ✨ New Features - Super Admin Dashboard
- **KPI Cards** - 4 štatistické karty navrchu (Celkom, Aktívne, Pending, Neaktívne)
- **Search & Filter** - Vyhľadávanie podľa názvu/IČO/DIČ + filter podľa statusu
- **Table Sorting** - Klikateľné hlavičky stĺpcov (ID, Názov, IČO, DIČ, Status)
- **Simple Actions** - Jednoduchý gradient button "👁️ Detail" namiesto dropdown

### 🎨 UI Improvements
- ✅ **KPI Cards** sú klikateľné → filtruje tabuľku podľa statusu
- ✅ **Search bar** s ikonou 🔍 - real-time filtering
- ✅ **Status filter** dropdown - kombinovateľný so search
- ✅ **Sort indicators** - ↑ ↓ ⇅ ikony s fialovou farbou
- ✅ **Zobrazených: X z Y firiem** - real-time counter
- ✅ **Empty state** s reset button ak nič nenájde
- ✅ Responsive layout (cards, search, filters)

### 🔧 Sidebar Updates
- ✅ Odstránený duplicitný "Dashboard" item
- ✅ Menu: 🏢 Firmy, 📊 Analytika, 👥 Používatelia, ⚙️ Nastavenia
- ✅ Toggle button presunutý na spodok sidebaru
- ✅ Odstránený 💡 Tip box
- ✅ Gradient toggle button (purple → pink)
- ✅ Lepší collapsed mode (→ / ← ikony)

### 🎯 Features
```javascript
// Search
Hľadá: názov, IČO, DIČ (real-time)

// Filter
Všetky stavy / Aktívne / Pending / Neaktívne

// Sorting
Klikni na hlavičku → vzostupne/zostupne
Ikony: ⇅ (default), ↑ (asc), ↓ (desc)

// Kombinácia
Search + Filter + Sort = plná kontrola
```

### 🗂️ Removed
- ❌ Quick actions dropdown (⋮) - zjednodušené na button "Detail"
- ❌ Komplexný dropdown positioning logic
- ❌ Backdrop overlay
- ❌ Tip box v sidebari

---

## [2.7.0] - 2026-03-15 - Dark Mode + Advanced Features 🌙

### ✨ New Features
- **Dark Mode** - Light/Dark theme toggle pre každého používateľa
- **Deactivate Company** - Super Admin môže bezpečne deaktivovať firmy
- **Collapsible Sidebar** - Bočné menu sa dá zbaliť na úzky pas
- **Logo Support** - Zobrazenie loga firiem v zoznamoch

### 🌙 Dark Mode
- ✅ Theme toggle v user menu (🌙 / ☀️)
- ✅ Ukladanie témy do databázy pre každého usera
- ✅ Auto-load pri prihlásení
- ✅ LocalStorage backup pre ne-prihlásených
- ✅ Všetky stránky podporujú dark mode
- ✅ Activity logging: `user.theme_change`

### 🚫 Company Deactivation (Super Admin Only)
- ✅ Bezpečný modal s potvrdením
- ✅ Musí napísať presný názov firmy
- ✅ Vizuálne varovanie (červený border)
- ✅ Status: `active` → `inactive`
- ✅ Možnosť aktivovať späť jedným klikom
- ✅ Activity logging: `company.deactivate`, `company.activate`
- ✅ Deaktivovaní používatelia stratia prístup

### 📐 Collapsible Sidebar
- ✅ Toggle button na sidebari
- ✅ Zbalené: len ikony (w-20)
- ✅ Rozbalené: ikony + texty (w-64)
- ✅ Smooth animácie (300ms)
- ✅ Tooltip na hover v collapsed mode
- ✅ Footer tip sa skrýva v collapsed mode

### 🖼️ Logo Support
- ✅ Zobrazenie loga v SuperAdmin companies table
- ✅ Zobrazenie loga v CompanyDetail header
- ✅ Fallback na iniciálu ak logo chýba
- ✅ Logo len pre aktívne firmy

### 🏗️ Backend Updates
- ✅ `PUT /api/auth/theme` - Update témy používateľa
- ✅ `PUT /api/companies/:id/deactivate` - Deaktivovať firmu (+ name validation)
- ✅ `PUT /api/companies/:id/activate` - Aktivovať firmu
- ✅ Login endpoint vracia `theme` field
- ✅ Database: `users.theme` column
- ✅ Database: `companies.status` updated to include 'inactive'

### 🎨 Frontend Components
- ✅ **ThemeContext** - Global theme management
- ✅ **DeactivateCompanyModal** - Bezpečný deactivate UI
- ✅ **Sidebar** - Collapsible feature
- ✅ **UserMenu** - Theme toggle button
- ✅ **All pages** - Dark mode classes

### 📝 Documentation
- ✅ Created `DARK_MODE_AND_FEATURES.md` - Kompletná dokumentácia
- ✅ Testing checklist
- ✅ User guide
- ✅ Deployment notes

---

## [2.6.1] - 2026-03-15 - Invite System (Updated) 📧

### 🔄 Changes
- **Simplified Invite Flow** - Super Admin teraz zadá len EMAIL
- **Pending Company** - Firma sa vytvorí ako "pending" až kým majiteľ nedokončí registráciu
- **Email Input Only** - Odstránené polia pre názov, IČO, DIČ, adresu (vyplní si majiteľ)
- **Better UX** - Jasnejší workflow pre pozvánky

### ✨ Updated Features
- ✅ Modal: Len email input namiesto komplexného formu
- ✅ Success: "Pozvánka odoslaná" namiesto "Firma vytvorená"
- ✅ Backup link: Pre prípad že email nepríde
- ✅ Tlačidlo: "📧 Pozvať firmu" namiesto "➕ Pridať firmu"

### 🏗️ Backend (Updated)
- ✅ `POST /api/companies` - Teraz berie len `{ email }`
- ✅ Vytvorí pending company bez detailov
- ✅ Email validation
- ✅ Duplicate check
- ✅ Activity logging: `company.invite`

### 🎯 Workflow
1. Super Admin → Zadá email majiteľa → Klikne "Poslať pozvánku"
2. Systém vytvorí pending company
3. (TODO) Email s linkom odíde majiteľovi
4. Majiteľ klikne na link → **FÁZA 3: Onboarding Wizard**
5. Majiteľ vyplní všetky údaje
6. Po dokončení → Firma sa aktivuje

---

## [2.6.0] - 2026-03-15 - Create Company & Navigation 🚀

### ✨ New Features
- **Sidebar Navigation** - Bočný panel s menu pre všetky roly
- **User Menu** - Dropdown menu s avatárom a profilom
- **Invite Token Generator** - Crypto-based unique token generation
- **Copy to Clipboard** - Jednoduché kopírovanie linkov

### 🏗️ Backend
- ✅ `POST /api/companies` - Invite company endpoint
- ✅ Crypto invite token generation
- ✅ Activity logging pre company invites
- ✅ Invite link generation

### 🎨 Frontend Components
- ✅ **CreateCompanyModal** - Modal s formom a success state
  - Form validation
  - Loading states
  - Success screen s invite link/token
  - Copy to clipboard buttons
- ✅ **Sidebar** - Bočný navigation panel
  - Role-based menu items
  - Active state highlighting
  - Disabled items (coming soon badges)
  - Responsive MONTIO logo
- ✅ **UserMenu** - User dropdown menu
  - Avatar s iniciálami
  - Role-specific gradient colors
  - Profile/Settings placeholders
  - Logout option
  - Click outside to close

### 📱 Layout Changes
- ✅ Flex layout (Sidebar + Content area)
- ✅ All dashboards now use Sidebar + UserMenu
- ✅ Consistent header across all pages
- ✅ Better responsive structure

### 🎯 Role-Specific Features

#### Super Admin
- ✅ Dashboard + Companies menu
- ✅ Create Company button functional
- ✅ Purple-Pink gradient theme

#### Company Admin
- ✅ Dashboard + Calendar + Orders + Employees + Invoices + Order Types menu
- ✅ Green-Emerald gradient theme
- ✅ All items show "Soon" badge

#### Employee
- ✅ Dashboard + Calendar + Tasks + Photos + Time-off menu
- ✅ Orange-Amber gradient theme
- ✅ All items show "Soon" badge

### 🔧 Files Changed/Added
```
backend/routes/
  └── companies.js ✨ (added POST /api/companies)

frontend/src/components/
  ├── CreateCompanyModal.jsx ✨ (NEW)
  ├── Sidebar.jsx ✨ (NEW)
  └── UserMenu.jsx ✨ (NEW)

frontend/src/pages/
  ├── SuperAdminDashboard.jsx ✨ (sidebar + user menu + modal)
  ├── CompanyDetail.jsx ✨ (sidebar + user menu)
  ├── CompanyAdminDashboard.jsx ✨ (sidebar + user menu)
  └── EmployeeDashboard.jsx ✨ (sidebar + user menu)

docs/
  ├── PLAN.md ✨ (updated FÁZA 2.5)
  └── CHANGELOG.md ✨ (updated)
```

---

## [2.5.0] - 2026-03-15 - Design Upgrade 🎨

### ✨ New Features
- **Modern UI Design** - Kompletný redesign všetkých stránok
- **Activity Log Timeline** - Timeline view namiesto nudnej tabuľky
- **Gradient Backgrounds** - Animated gradienty pre lepší vizuál
- **Glassmorphism Effects** - Moderné sklenené efekty na kartách
- **Smooth Animations** - Hover efekty, transitions, scale transforms
- **Custom Scrollbar** - Gradient scrollbar styling
- **Interactive Stats Cards** - Animované štatistické karty s hover efektmi

### 🎨 Design Changes

#### Login Page
- ✅ Animated gradient background (blue → purple → pink)
- ✅ Floating glassmorphic card
- ✅ Better input styling s focus states
- ✅ Gradient quick login buttons
- ✅ Smooth transitions

#### Super Admin Dashboard
- ✅ Gradient header s ikonou
- ✅ Moderná tabuľka s hover efektmi
- ✅ Avatar iniciály pre firmy
- ✅ Gradient status badges
- ✅ Scale animations na riadkoch

#### Company Detail Page
- ✅ 4 gradient stats karty (users, order types, orders, invoices)
- ✅ Timeline view pre activity logs namiesto tabuľky
- ✅ User cards s avatarmi a gradient badges
- ✅ Better info cards layout
- ✅ Color-coded action badges
- ✅ Hover effects všade

#### Company Admin Dashboard
- ✅ Green gradient téma
- ✅ Glassmorphism placeholder karty
- ✅ Blur efekty na hover
- ✅ Phase badges (FÁZA 4, 5, 6, 7)
- ✅ Better visual hierarchy

#### Employee Dashboard
- ✅ Orange gradient téma
- ✅ Large feature cards s ikonami
- ✅ Employee-specific messaging
- ✅ Better placeholder design

### 🎯 Technical Improvements
- ✅ Custom CSS animations (fadeIn, slideIn, gradient)
- ✅ Optimized transitions (cubic-bezier timing)
- ✅ Better color palette organization
- ✅ Consistent spacing & typography
- ✅ Responsive grid layouts

### 📚 Documentation
- ✅ Created `DESIGN_NOTES.md` - Complete design system documentation
- ✅ Updated `PLAN.md` - Added FÁZA 2.5
- ✅ Updated `PROJECT_STRUCTURE.md` - Design improvements noted

---

## [2.0.0] - 2026-03-15 - Activity Logging & Company Detail

### ✨ New Features
- **Activity Logs** - Kompletný audit trail systém
- **Company Detail Page** - Detail firmy s používateľmi a logmi
- **Logging Middleware** - Automatické logovanie akcií
- **Timeline Activity View** - Vizualizácia activity logov

### 🗄️ Database
- ✅ Added `activity_logs` table
- ✅ Indexes for performance
- ✅ Test data seeding

### 🔧 Backend
- ✅ `GET /api/companies/:id` - Company detail endpoint
- ✅ `GET /api/companies/:id/logs` - Activity logs with pagination
- ✅ Logging middleware (`logger.js`)
- ✅ Automatic login logging

### 🎨 Frontend
- ✅ Company Detail page (`/superadmin/company/:id`)
- ✅ Stats cards (users, order types, orders, invoices)
- ✅ User list with roles
- ✅ Activity log table (last 50)
- ✅ Clickable company rows in SuperAdmin dashboard

---

## [1.0.0] - 2026-03-15 - Initial Release

### ✨ Features
- **Authentication** - JWT + bcrypt
- **Role-based Access** - superadmin, companyadmin, employee
- **3 Dashboards** - Role-specific views
- **Quick Login** - Development mode shortcuts
- **MariaDB** - Docker setup

### 🔐 Security
- ✅ JWT tokens
- ✅ Password hashing (bcrypt)
- ✅ Role-based middleware
- ✅ Protected routes

### 📱 Pages
- Login page
- Super Admin Dashboard
- Company Admin Dashboard (placeholder)
- Employee Dashboard (placeholder)

---

**Next Up:** FÁZA 3 - Company Onboarding Wizard (6 krokov)
