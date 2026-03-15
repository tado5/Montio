# MONTIO - Dark Mode & New Features Documentation

## 📅 Verzia 2.7.0 - 2026-03-15

---

## 🌙 DARK MODE (Light/Dark Theme Toggle)

### Koncept
Každý používateľ si môže nastaviť vlastnú tému (svetlú alebo tmavú), ktorá sa uloží do databázy a automaticky načíta pri prihlásení.

### Implementácia

#### 1. **Databáza**
```sql
ALTER TABLE users
ADD COLUMN theme ENUM('light','dark') DEFAULT 'light' AFTER company_id;
```

**Stĺpec v tabuľke `users`:**
- `theme` - ENUM('light','dark') DEFAULT 'light'

#### 2. **Backend API**

**PUT /api/auth/theme** - Update témy používateľa

**Request:**
```javascript
{
  "theme": "dark" // alebo "light"
}
```

**Response:**
```javascript
{
  "message": "Téma bola zmenená.",
  "theme": "dark"
}
```

**Features:**
- Validácia: len 'light' alebo 'dark'
- Activity logging: `user.theme_change`
- Update user v localStorage

**Login endpoint** vracia `theme` v user objekte:
```javascript
{
  "token": "...",
  "user": {
    "id": 1,
    "email": "admin@montio.sk",
    "role": "superadmin",
    "company_id": null,
    "theme": "light"  // ← NOVÉ
  }
}
```

#### 3. **Frontend - ThemeContext**

**Location:** `frontend/src/context/ThemeContext.jsx`

**Provider:**
```javascript
<ThemeProvider>
  <App />
</ThemeProvider>
```

**Hook:**
```javascript
const { theme, toggleTheme } = useTheme()
```

**Funkcie:**
- `theme` - aktuálna téma ('light' alebo 'dark')
- `toggleTheme()` - prepne medzi light/dark

**Auto-load:**
- Pri prihlásení načíta `user.theme` z backendu
- Ak nie je prihlásený, načíta z localStorage
- Automaticky aplikuje `dark` class na `<html>` element

**Ukladanie:**
- Pri zmene témy → uloží do databázy (ak je user prihlásený)
- Pri zmene témy → uloží do localStorage (backup)
- Update user objektu v localStorage

#### 4. **Tailwind Config**

**File:** `frontend/tailwind.config.js`

```javascript
export default {
  darkMode: 'class',  // ← Povolenie dark mode cez class
  // ...
}
```

#### 5. **UI Components - Dark Mode Classes**

**Všetky komponenty podporujú dark mode:**

```javascript
// Príklad:
className="bg-white dark:bg-gray-800
           text-gray-900 dark:text-white
           border-gray-200 dark:border-gray-700"
```

**Komponenty s dark mode:**
- ✅ Sidebar
- ✅ UserMenu
- ✅ Login
- ✅ SuperAdminDashboard
- ✅ CompanyDetail
- ✅ CompanyAdminDashboard
- ✅ EmployeeDashboard
- ✅ CreateCompanyModal
- ✅ DeactivateCompanyModal

#### 6. **Toggle v UserMenu**

**Umiestnenie:** User ikona → dropdown menu → "Dark Mode" / "Light Mode"

**Ikony:**
- Light mode → 🌙 "Dark Mode"
- Dark mode → ☀️ "Light Mode"

**Funkcia:**
- Klik na položku → okamžité prepnutie
- Automatické uloženie do DB + localStorage
- Žiadne refreshovanie stránky

---

## 🚫 DEAKTIVÁCIA FIRMY (Company Deactivation)

### Koncept
Super Admin môže bezpečne deaktivovať firmu s potvrdením (musí napísať názov firmy). Deaktivovaná firma stratí prístup, ale dáta zostanú uložené.

### Bezpečnostné opatrenia
1. **Confirmation modal** - nie je to jednoduché kliknutie
2. **Musí napísať názov firmy** - presná zhoda (case-sensitive)
3. **Vizuálne varovanie** - červený border, warning ikony
4. **Activity logging** - zaznamená kto a kedy deaktivoval

### Implementácia

#### 1. **Databáza**
```sql
ALTER TABLE companies
MODIFY status ENUM('pending','active','inactive') DEFAULT 'pending';
```

**Nový status:** `inactive`

#### 2. **Backend API**

**PUT /api/companies/:id/deactivate** - Deaktivovať firmu

**Request:**
```javascript
{
  "companyName": "Test Firma s.r.o."  // Musí presne sedieť
}
```

**Response:**
```javascript
{
  "message": "Firma bola deaktivovaná.",
  "company": {
    "id": 1,
    "name": "Test Firma s.r.o.",
    "status": "inactive"
  }
}
```

**Validácie:**
- Firma existuje
- Názov sa zhoduje
- Firma nie je už deaktivovaná

**Activity log:**
```javascript
{
  "action": "company.deactivate",
  "entity_type": "company",
  "entity_id": 1,
  "details": {
    "company_name": "Test Firma s.r.o.",
    "deactivated_by": "admin@montio.sk"
  }
}
```

---

**PUT /api/companies/:id/activate** - Aktivovať firmu

**Response:**
```javascript
{
  "message": "Firma bola aktivovaná.",
  "company": {
    "id": 1,
    "name": "Test Firma s.r.o.",
    "status": "active"
  }
}
```

#### 3. **Frontend - DeactivateCompanyModal**

**Location:** `frontend/src/components/DeactivateCompanyModal.jsx`

**Props:**
```javascript
<DeactivateCompanyModal
  isOpen={boolean}
  onClose={function}
  company={object}
  onSuccess={function}
/>
```

**Features:**
- 🚨 **Červený border** (border-4 border-red-500)
- ⚠️ **Warning box** s popisom dôsledkov
- 📝 **Confirmation input** - musí napísať názov firmy
- 🔒 **Disabled button** - pokiaľ názov nesedí
- ✅ **Auto-refresh** - po úspešnej deaktivácii

**Vizuál:**
```
┌──────────────────────────────┐
│ ⚠️ Deaktivovať firmu        │  ← Červená hlavička
├──────────────────────────────┤
│ 🚨 POZOR: Toto je nebezpečná│
│    operácia!                 │
│                              │
│ Deaktivovaním firmy:         │
│ • Všetci používatelia        │
│   stratia prístup            │
│ • Dáta zostanú uložené       │
│ • Firmu môžete aktivovať     │
├──────────────────────────────┤
│ Test Firma s.r.o.  (ID: 1)  │
├──────────────────────────────┤
│ Na potvrdenie napíšte        │
│ presný názov firmy:          │
│                              │
│ [_____________________]      │
├──────────────────────────────┤
│ [Zrušiť] [⚠️ Deaktivovať]   │
└──────────────────────────────┘
```

#### 4. **UI Integration**

**CompanyDetail page:**
- Ak `company.status === 'active'` → tlačidlo "❌ Deaktivovať"
- Ak `company.status === 'inactive'` → tlačidlo "✓ Aktivovať"
- Aktivovanie je jednoduché (bez modalu)

**SuperAdminDashboard table:**
- Status badge zobrazuje:
  - `active` → 🟢 "✓ Aktívna" (zelená)
  - `pending` → 🟡 "⏳ Pending" (žltá)
  - `inactive` → 🔴 "❌ Neaktívna" (červená)

---

## 📐 COLLAPSIBLE SIDEBAR

### Koncept
Bočné menu sa dá zmenšiť na úzky pas (len ikony) alebo rozbaliť na plnú šírku (ikony + texty).

### Implementácia

#### 1. **State Management**

```javascript
const [isCollapsed, setIsCollapsed] = useState(false)
```

#### 2. **Toggle Button**

**Umiestnenie:** Vpravo na sidebari, sticky button

```javascript
<button
  onClick={() => setIsCollapsed(!isCollapsed)}
  className="absolute -right-3 top-6 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"
>
  <span className={`transform transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-180'}`}>
    ←
  </span>
</button>
```

**Ikona:**
- Rozbalené → šípka vľavo `←` (rotate 180°)
- Zbalené → šípka vpravo `→`

#### 3. **Responsive Width**

```javascript
<div className={`${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300`}>
```

**Šírky:**
- **Rozbalené:** `w-64` (256px)
- **Zbalené:** `w-20` (80px)

#### 4. **Conditional Rendering**

**Logo sekcia:**
```javascript
<div className="flex items-center gap-3">
  <div className="w-12 h-12">M</div>
  {!isCollapsed && (
    <div>
      <h1>MONTIO</h1>
      <p>👑 Super Admin</p>
    </div>
  )}
</div>
```

**Menu items:**
```javascript
<button className={isCollapsed ? 'justify-center' : ''}>
  <span>🏠</span>
  {!isCollapsed && (
    <>
      <span>Dashboard</span>
      {disabled && <span>Soon</span>}
    </>
  )}
</button>
```

**Footer tip:**
```javascript
{!isCollapsed && (
  <div className="tip-box">
    💡 Tip: ...
  </div>
)}
```

#### 5. **Tooltip on Hover (collapsed)**

```javascript
title={isCollapsed ? item.label : ''}
```

Keď je zbalené, zobrazí tooltip s názvom položky.

---

## 🖼️ LOGO SUPPORT V ZOZNAME FIRIEM

### Koncept
Ak má firma nahrané logo a je aktívna, zobrazí sa logo namiesto iniciály.

### Implementácia

#### 1. **Databáza**

**Tabuľka `companies`:**
- `logo_url` - TEXT field (URL na logo obrázok)

#### 2. **Frontend Logic**

**SuperAdminDashboard table:**
```javascript
{company.logo_url && company.status === 'active' ? (
  <img
    src={company.logo_url}
    alt={company.name}
    className="w-10 h-10 rounded-lg object-cover shadow-md"
  />
) : (
  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
    {company.name.charAt(0)}
  </div>
)}
```

**Podmienky:**
- Logo sa zobrazí **len ak:**
  - `logo_url` existuje
  - `company.status === 'active'`
- Inak zobrazí iniciálu firmy

**CompanyDetail header:**
```javascript
{company.logo_url ? (
  <img src={company.logo_url} className="w-14 h-14 rounded-xl" />
) : (
  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500">
    {company.name.charAt(0)}
  </div>
)}
```

#### 3. **Styling**

**Logo obrázok:**
- `rounded-lg` alebo `rounded-xl` (zaoblené rohy)
- `object-cover` (proporcionálne orezanie)
- `shadow-md` alebo `shadow-lg` (tieň)
- Fixná šírka/výška (napr. `w-10 h-10`, `w-14 h-14`)

**Fallback (iniciála):**
- Gradient background (blue → purple)
- Biely text
- Font-bold
- Centrovanie (flex items-center justify-center)

---

## 📝 ACTIVITY LOGGING

### Nové akcie

**Theme change:**
```javascript
{
  "action": "user.theme_change",
  "entity_type": "user",
  "entity_id": 1,
  "details": { "theme": "dark" }
}
```

**Company deactivate:**
```javascript
{
  "action": "company.deactivate",
  "entity_type": "company",
  "entity_id": 1,
  "details": {
    "company_name": "Test Firma s.r.o.",
    "deactivated_by": "admin@montio.sk"
  }
}
```

**Company activate:**
```javascript
{
  "action": "company.activate",
  "entity_type": "company",
  "entity_id": 1,
  "details": {
    "company_name": "Test Firma s.r.o.",
    "activated_by": "admin@montio.sk"
  }
}
```

---

## 🧪 TESTING CHECKLIST

### Dark Mode
- [ ] Toggle prepína medzi light/dark okamžite
- [ ] Theme sa uloží do databázy
- [ ] Theme sa načíta pri prihlásení
- [ ] localStorage backup funguje
- [ ] Všetky stránky majú dark mode classes
- [ ] Gradient farby sú čitateľné v dark mode

### Deactivate Company
- [ ] Super Admin vidí tlačidlo "Deaktivovať"
- [ ] Modal sa zobrazí po kliknutí
- [ ] Musí napísať presný názov firmy
- [ ] Button je disabled kým názov nesedí
- [ ] Po deaktivácii sa status zmení na "inactive"
- [ ] Activity log sa vytvorí
- [ ] Aktivovanie funguje jednoducho (bez modalu)

### Collapsible Sidebar
- [ ] Toggle button funguje
- [ ] Animácia je smooth (300ms)
- [ ] Zbalené menu zobrazuje len ikony
- [ ] Tooltip sa zobrazí na hover (collapsed)
- [ ] Footer tip sa skryje v collapsed mode
- [ ] Logo zostáva vždy viditeľné

### Logo Support
- [ ] Ak firma má logo a je active → zobrazí logo
- [ ] Ak firma nemá logo → zobrazí iniciálu
- [ ] Logo má správny styling (rounded, shadow)
- [ ] Logo v table aj v CompanyDetail header

---

## 🔧 SÚBORY ZMENENÉ/PRIDANÉ

### Backend
```
backend/routes/
  ├── companies.js ✨ (added deactivate/activate endpoints)
  └── auth.js ✨ (added PUT /api/auth/theme)

database/
  └── init.sql ✨ (updated: theme column, inactive status)
```

### Frontend
```
frontend/src/context/
  └── ThemeContext.jsx ✨ (NEW)

frontend/src/components/
  ├── Sidebar.jsx ✨ (collapsible feature)
  ├── UserMenu.jsx ✨ (theme toggle)
  └── DeactivateCompanyModal.jsx ✨ (NEW)

frontend/src/pages/
  ├── Login.jsx ✨ (dark mode)
  ├── SuperAdminDashboard.jsx ✨ (logo support, status colors)
  ├── CompanyDetail.jsx ✨ (deactivate button, logo, activate button)
  ├── CompanyAdminDashboard.jsx ✨ (dark mode)
  └── EmployeeDashboard.jsx ✨ (dark mode)

frontend/
  └── tailwind.config.js ✨ (darkMode: 'class')
```

---

## 🚀 DEPLOYMENT NOTES

### Database Migration (Production)
```sql
-- Add theme column
ALTER TABLE users
ADD COLUMN theme ENUM('light','dark') DEFAULT 'light' AFTER company_id;

-- Update status enum
ALTER TABLE companies
MODIFY status ENUM('pending','active','inactive') DEFAULT 'pending';
```

### Environment Variables
Žiadne nové environment variables.

---

## 📖 USER GUIDE

### Ako prepnúť tému (Light/Dark Mode)?
1. Kliknite na svoju ikonu v pravom hornom rohu
2. V menu nájdite položku "Dark Mode" alebo "Light Mode"
3. Kliknite → téma sa okamžite prepne
4. Vaše nastavenie sa automaticky uloží

### Ako deaktivovať firmu? (Super Admin)
1. Prejdite na detail firmy
2. Kliknite na tlačidlo "❌ Deaktivovať"
3. V modali napíšte presný názov firmy
4. Kliknite "⚠️ Deaktivovať firmu"
5. Firma stratí prístup, ale dáta zostanú

### Ako aktivovať firmu? (Super Admin)
1. Prejdite na detail firmy
2. Kliknite na tlačidlo "✓ Aktivovať"
3. Firma získa prístup okamžite

### Ako zbaliť/rozbaliť sidebar?
1. Kliknite na okrúhle tlačidlo s šípkou vpravo na sidebari
2. Sidebar sa zbalí na úzky pas (len ikony)
3. Kliknutím znovu rozbalíte na plnú šírku

---

---

## 📊 SUPER ADMIN DASHBOARD - ENHANCEMENTS (v2.8.0)

### KPI Cards (Stats navrchu)

**4 klikateľné karty:**
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ CELKOM: 5   │ AKTÍVNE: 3  │ PENDING: 1  │ NEAKTÍVNE:1 │
│ (modrá)     │ (zelená)    │ (žltá)      │ (červená)   │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

**Funkcie:**
- Kliknutím na kartu filtruje tabuľku podľa statusu
- Real-time update (počíta z aktuálnych firiem)
- Gradient farby + hover efekt (scale-105)
- Dark mode support

---

### Search & Filter

**Search bar:**
```javascript
🔍 [Hľadať firmu...]
```

**Funkcie:**
- Real-time filtering (píšeš a okamžite filtruje)
- Hľadá v: názov, IČO, DIČ
- Case-insensitive
- Kombinovateľné s filterom a sortingom

**Filter dropdown:**
```javascript
[Všetky stavy ▼]
- Všetky stavy
- ✓ Aktívne
- ⏳ Pending
- ❌ Neaktívne
```

---

### Table Sorting

**Klikateľné hlavičky:**
```
┌──────────────────────────────────┐
│ ID ↑  │ Názov ⇅  │ IČO ⇅  │ ...  │
└──────────────────────────────────┘
```

**Funkcie:**
- Klikni na hlavičku → zoradí
- Prvý klik: vzostupne (A→Z)
- Druhý klik: zostupne (Z→A)
- Ikony: ⇅ (default), ↑ (asc), ↓ (desc)
- Fialová farba ikôn
- Hover efekt na hlavičkách

**Stĺpce s sortingom:**
- ID
- Názov
- IČO
- DIČ
- Status

---

### Simple Action Button

**Namiesto dropdown menu:**
```
[👁️ Detail]
```

**Styling:**
- Gradient button (blue → purple)
- Hover: tmavší gradient + shadow
- Scale efekt (1.05 hover, 0.95 click)
- Ikona + text
- Dark mode support

**Akcia:**
- Prejde na detail firmy
- Tam môže deaktivovať/aktivovať

---

### Sidebar Improvements

**Menu zmeny:**
```
BOLO:
🏠 Dashboard
🏢 Firmy

TERAZ:
🏢 Firmy
📊 Analytika (Soon)
👥 Používatelia (Soon)
⚙️ Nastavenia (Soon)
```

**Toggle button:**
- Presunutý na spodok sidebaru
- Gradient button (purple → pink)
- Text: "← Zbaliť menu" / ikona "→"
- Žiadne prekrývanie s logom

**Odstránené:**
- 💡 Tip box
- Duplicitné menu items

---

### Empty States

**Keď filter nič nenájde:**
```
         🔍
Žiadne výsledky pre zadané kritériá
     [Vymazať filtre]
```

**Features:**
- Inteligentné hlášky
- Button na reset
- Ikona mení podľa kontextu (🏢 / 🔍)

---

### Responsive Design

**Breakpoints:**
- KPI cards: 1 col mobil → 4 cols desktop
- Search + filter: stack na mobile
- Table: horizontal scroll ak treba
- Buttons: full-width na mobile

---

## 🧪 TESTING CHECKLIST (v2.8.0)

### KPI Cards
- [ ] Kliknutie na kartu filtruje tabuľku
- [ ] Počty sa správne počítajú
- [ ] Hover efekt funguje
- [ ] Dark mode farby OK

### Search & Filter
- [ ] Search real-time funguje
- [ ] Hľadá v názve, IČO, DIČ
- [ ] Filter kombinuje so search
- [ ] Reset filtrov funguje

### Sorting
- [ ] Klik na hlavičku radí
- [ ] Ikony sa menia (⇅ ↑ ↓)
- [ ] Zoradenie správne (asc/desc)
- [ ] Kombinuje s filterom

### Action Button
- [ ] Detail button viditeľný
- [ ] Gradient + hover funguje
- [ ] Prejde na detail
- [ ] Dark mode OK

### Sidebar
- [ ] Žiadne duplicity v menu
- [ ] Toggle button na spodku
- [ ] Žiadny tip box
- [ ] Collapse/expand funguje

---

**Last Updated:** 2026-03-15
**Version:** 2.8.0
