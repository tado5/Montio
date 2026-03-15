# MONTIO - Changelog

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
