# MONTIO APP - Plán Vývoja

## Prehľad
Webová aplikácia pre malé montážne firmy (klimatizácie, rekuperácie, tepelné čerpadlá, elektrikári, stavbári, odkresy) - komplexná správa zákaziek od obhliadky po fakturáciu.

### Cieľová skupina
- 1-10 malých montážnych firiem
- Každá firma môže mať niekoľko zamestnancov
- Majitelia firiem potrebujú evidenciu zákaziek, dokumentáciu a fakturáciu
- Zamestnanci potrebujú prehľad svojich úloh a checklist na montážach

### Kľúčové vlastnosti
- **Rýchla a responzívna:** Mobil/Tablet/PC optimalizácia
- **Vlastná autentifikácia:** JWT + bcrypt (bez externých služieb)
- **PDF protokoly:** Každý krok generuje PDF s fotkami a podpisom
- **Unikátne linky:** Pre klientov na sledovanie priebehu zákazky
- **Fakturácia s QR:** Automatické generovanie faktúr s QR platbou

## Technológie
- **Databáza:** MariaDB 11.4 (d46895_montio)
- **Používateľ DB:** u46895_montio / x52D_Z-lb!UX6n5
- **Hosting:** Hostcreator
- **Auth:** JWT + bcrypt
- **PDF:** jsPDF + QR kódy
- **Grafy:** Recharts
- **Audit Logging:** Activity logs pre debugging a bezpečnosť
- **Responzívny:** Mobil/Tablet/PC (PWA)
- **Jazyk:** Slovenčina

## Používateľské Roly

### SUPER ADMIN (Ty)
- Vytvára firmy cez pozvánky (unique registračný link)
- **Deaktivovať/aktivovať firmy** - Bezpečné s potvrdením (musí napísať názov)
- View-only prístup do všetkých firiem
- **Detail firmy:** Zobrazenie všetkých info + zoznam používateľov + activity log + logo
- **Activity Logs:** Audit trail všetkých akcií v systéme (kto, čo, kedy)
- **Dark Mode:** Osobné nastavenie témy (light/dark)
- **Collapsible Sidebar:** Zbaliteľné bočné menu
- Celková analytika

### FIRMA ADMIN (Majiteľ)
- Onboarding: názov, logo, IČO, DIČ, fakturačné údaje
- Vlastné typy montáží + checklists
- Dashboard, kalendár, zamestnanci
- Zákazky wizard (obhliadka → ponuka → montáž)
- Fakturácia s QR, financie, analytika

### ZAMESTNANCI (Montéri)
- Kalendár svojich zákaziek (bez cien)
- Checklists na montáži
- Notifikácie + dovolenka

## Workflow
1. **OBHLIADKA:** Výber typu montáže → auto-checklist + fotky + klient
2. **CENOVÁ PONÚKA:** materiál/DPH/podpis → PDF protokol
3. **MONTÁŽ:** before/after fotky + checklist check + podpis → PDF
4. **FAKTÚRA:** MONTIO-2026-001 + QR platba

---

## FÁZA 1: DATABÁZA

### Tabuľky

#### `users`
```sql
CREATE TABLE `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('superadmin','companyadmin','employee') NOT NULL,
  `company_id` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### `companies`
```sql
CREATE TABLE `companies` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `logo_url` TEXT,
  `ico` VARCHAR(20),
  `dic` VARCHAR(20),
  `address` TEXT,
  `billing_data` JSON,
  `invite_token` VARCHAR(255) UNIQUE,
  `status` ENUM('pending','active') DEFAULT 'pending'
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### `order_types`
```sql
CREATE TABLE `order_types` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `company_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `default_checklist` JSON NOT NULL,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Poznámka
Kompletné SQL schémy pre všetky tabuľky sú v sekcii **Databáza - Kompletné schémy** na konci dokumentu.

---

## FÁZA 2: AUTENTIFIKÁCIA ✅

### Backend (Node.js + Express)
- **DB Connection:** mysql://u46895_montio:x52D_Z-lb!UX6n5@localhost:3306/d46895_montio
- **Packages:** express, mysql2, bcryptjs, jsonwebtoken, cors

#### API Endpoints
- `POST /api/auth/register` - Registrácia s invite token check
- `POST /api/auth/login` - Prihlásenie (JWT s rolou) + activity logging
- `GET /api/auth/companies` - Zoznam firiem (superadmin only)
- `GET /api/companies/:id` - Detail firmy + users + activity logs
- `GET /api/companies/:id/logs` - Activity logs s paginationom

#### Implementované
✅ JWT autentifikácia
✅ Role-based routing (superadmin/companyadmin/employee)
✅ Activity logging middleware
✅ Audit trail všetkých akcií
✅ Quick login pre development

### Frontend (React + Vite)
- **Packages:** vite, react, react-dom, tailwind CSS
- Login page (s quick login buttons)
- SuperAdminDashboard (companies list)
- CompanyDetail (info + users + activity logs)
- CompanyAdminDashboard (placeholder)
- EmployeeDashboard (placeholder)
- ProtectedRoute komponent pre role-based access
- JWT token management

---

## FÁZA 2.5: CREATE COMPANY & UI POLISH ✅

### Super Admin - Vytvorenie novej firmy

**✅ HOTOVO:**
- Modal pre odoslanie pozvánky
- Super Admin zadá len EMAIL majiteľa
- Generovanie unique invite tokenu (crypto.randomBytes)
- Vytvorenie pending company záznamu
- Zobrazenie registračného linku (záloha)
- Copy to clipboard funkcionalita
- Success state s potvrdením
- Activity logging pri odoslaní pozvánky

**Backend Endpoint:**
```javascript
POST /api/companies
Body: { email }
Response: {
  invite: {
    email, invite_token, invite_link, company_id
  }
}
```

**Workflow:**
1. Super Admin → Zadá email → Odošle pozvánku
2. Email s linkom odíde majiteľovi (TODO: NodeMailer)
3. Majiteľ klikne na link → FÁZA 3: Onboarding Wizard
4. Majiteľ vyplní: názov, IČO, DIČ, adresu, logo, fakturačné údaje, typy montáží
5. Po dokončení → Firma sa aktivuje (status: active)

**UI Components:**
- ✅ CreateCompanyModal - Modal s formom a success state
- ✅ Sidebar - Bočný navigation panel s menu items
- ✅ UserMenu - Dropdown menu s avatárom a rolou
- ✅ Responsive layout (Sidebar + Content area)

**Future Improvements:**
- 🔲 Email notification pri vytvorení firmy
- 🔲 Search & Filter pre companies list
- 🔲 Pagination pre veľa firiem
- 🔲 Bulk actions (deactivate, delete)
- 🔲 Export to CSV
- 🔲 Dashboard widgets (total companies, active users, system stats)

### Moderný Design Upgrade ✨

**Všeobecné:**
- Gradienty namiesto solid colors
- Smooth animácie (hover, transitions, fade-in)
- Lepšie spacing a typography
- Iconografia (emoji alebo Heroicons)
- Glassmorphism efekty

**Login Page:**
- Animated gradient background
- Floating card effect
- Smooth transitions na input focus
- Better quick login buttons design

**SuperAdmin Dashboard:**
- Stats cards s gradientmi
- Better table design (hover effects, stripes)
- Search bar s ikonou
- Better badge styling

**Company Detail:**
- Timeline view pre activity logs (namiesto plain table)
- Animated stats counters
- Better user cards layout
- Color-coded action badges
- Smooth page transitions

**CompanyAdmin/Employee Dashboards:**
- Modern placeholder cards
- Better visual hierarchy
- Icon integration
- Coming soon badges

---

## FÁZA 3: FIRMA ONBOARDING ⏳ (IN PROGRESS)

### 6-krokový registračný wizard pre firmy

**Workflow:**
1. Super Admin vytvorí pozvánku (email) → pending company s invite tokenom
2. Email odíde majiteľovi s linkom `https://montio.sk/register/{inviteToken}`
3. Majiteľ klikne na link → wizard sa načíta
4. Prejde všetkými krokmi → vyplní údaje
5. Po dokončení → firma sa aktivuje (`status: 'active'`)
6. Majiteľ sa automaticky prihlási ako `companyadmin`

**Kroky wizardu:**

### Krok 1: Invite Token Validácia
- URL: `/register/:inviteToken`
- Backend: `GET /api/invites/:token`
- Overí platnosť tokenu
- Vráti: email, company_id, status
- Error states: token invalid, expired, už použitý

### Krok 2: Základné údaje firmy
- Form fields:
  - Názov firmy (required)
  - IČO (required, validation)
  - DIČ (optional, validation)
  - Adresa (required, textarea)
- Backend: `POST /api/onboarding/step1`
- Validácia: slovenské IČO (8 číslic)
- Progress: 25%

### Krok 3: Logo Upload + Fakturačné údaje
- Logo upload (drag&drop alebo file input)
  - Max size: 2MB
  - Formats: JPG, PNG, SVG
  - Upload do `/uploads/logos/`
- Fakturačné údaje (JSON):
  - IBAN
  - SWIFT
  - Variabilný symbol pattern
  - Splatnosť faktúr (dni)
  - Poznámka na faktúre
- Backend: `POST /api/onboarding/step2`
- Progress: 50%

### Krok 4: Typy montáží + Checklists
- Možnosť pridať 1-10 typov montáží
- Pre každý typ:
  - Názov (napr. "Klimatizácia - inštalácia")
  - Popis (optional)
  - Checklist items (drag&drop editor)
    - Názov položky
    - Povinné/Voliteľné
    - Poradie (drag&drop)
- Checklist builder:
  - Add item button
  - Remove item
  - Drag&drop reorder
  - JSON storage
- Backend: `POST /api/onboarding/step3`
- Progress: 75%

### Krok 5: Preview + Confirmation
- Prehľad všetkých zadaných údajov
- Možnosť vrátiť sa späť a upraviť
- "Potvrdiť a dokončiť" button
- Progress: 90%

### Krok 6: Dokončenie
- Backend: `POST /api/onboarding/complete`
  - Update companies table (všetky údaje)
  - Zmena statusu: `pending` → `active`
  - Vytvorenie `companyadmin` user účtu
  - Vloženie `order_types` do DB
  - Activity log: `company.activated`
- Success screen:
  - "Vitajte v MONTIO!"
  - Údaje pre prihlásenie
  - Auto-redirect do Company Admin Dashboard (5s)
- Progress: 100%

**Implementačné detaily:**

### Backend Endpoints (TODO)
```javascript
// Validácia tokenu
GET /api/invites/:token
Response: { email, company_id, status }

// Step 1: Základné údaje
POST /api/onboarding/step1
Body: { inviteToken, name, ico, dic, address }
Response: { success, message }

// Step 2: Logo + Fakturačné údaje
POST /api/onboarding/step2
Body: { inviteToken, logo (file), billingData (JSON) }
Response: { success, logoUrl }

// Step 3: Typy montáží
POST /api/onboarding/step3
Body: { inviteToken, orderTypes: [{ name, description, checklist }] }
Response: { success, orderTypesCount }

// Dokončenie
POST /api/onboarding/complete
Body: { inviteToken, password }
Response: { success, user, token }
```

### Frontend Components (TODO)
```
/frontend/src/pages/
  └── OnboardingWizard.jsx      # Main wizard page

/frontend/src/components/onboarding/
  ├── StepProgress.jsx           # Progress bar (1/6, 2/6...)
  ├── Step1BasicInfo.jsx         # Základné údaje form
  ├── Step2LogoBilling.jsx       # Logo upload + billing form
  ├── Step3OrderTypes.jsx        # Order types + checklist builder
  ├── Step4Preview.jsx           # Preview všetkých údajov
  └── Step5Complete.jsx          # Success screen

/frontend/src/components/checklist/
  ├── ChecklistBuilder.jsx       # Drag&drop editor
  ├── ChecklistItem.jsx          # Single checklist item
  └── DragHandle.jsx             # Drag icon
```

### Database Updates (TODO)
- [ ] Companies table: všetky stĺpce naplnené
- [ ] Order_types table: vložené typy montáží
- [ ] Users table: nový `companyadmin` účet
- [ ] Activity_logs: `company.activated` záznam

### Libraries potrebné
```bash
# Frontend
npm install react-dropzone      # File upload
npm install react-dnd            # Drag & drop
npm install react-dnd-html5-backend

# Backend
npm install multer              # File upload handling
npm install sharp               # Image processing/resize
```

**Estimate času:**
- Backend endpoints: 2-3 hodiny
- Frontend wizard components: 4-6 hodín
- Checklist builder: 2-3 hodiny
- Testing & polish: 2-3 hodiny
- **CELKOM:** ~10-15 hodín práce

**Budúce vylepšenia (TODO pre neskoršie verzie):**
- 📧 Email notifikácie (NodeMailer) - odoslanie invite emailu namiesto copy/paste tokenu
- 🎨 Drag&drop reorder pre checklist items (react-dnd)
- ✂️ Image crop/editor pre logo upload (react-image-crop)
- ✅ IBAN format validation (slovenský/EU IBAN checker)
- 📱 Mobile-first optimization pre wizard (lepšia responzivita)
- 💾 Auto-save draft (localStorage backup počas vyplňovania)
- 🔄 Progress resume (pokračovať kde som skončil ak refreshnem stránku)
- 👤 **Výber avatara** - možnosť vybrať si vlastný avatar alebo nahrať foto v User Settings
  - Avatar picker s výberom DiceBear štýlov (avataaars, bottts, personas...)
  - Upload vlastného avatara (photo)
  - Preview zmeny pred uložením
  - Uloženie do DB (users.avatar_url)

---

## FÁZA 4: DASHBOARD + KALENDÁR

### Firma Dashboard (Tailwind grid layout)

**KPI Cards (4 metriky):**
- Aktuálne zákazky
- Plánované zákazky
- Dokončené zákazky
- Zrušené zákazky

**Kalendár:**
- FullCalendar integrácia
- Filtre: [typ montáže / zamestnanec]
- Drag&drop pre zmenu termínov
- Color coding podľa statusu

**OrderTypesManager:**
- CRUD operácie pre vlastné typy montáží
- Checklist editor s preview
- Možnosť duplikovať typy
- Štatistiky použitia jednotlivých typov

**Implementácia:**
- React komponenty pre KPI
- FullCalendar library
- Recharts pre grafy
- Real-time updates

---

## FÁZA 4.5: COMPANY SETTINGS (TODO - Po obede)

### Company Settings Management pre Company Admin

**Cieľ:** Company Admin si môže upraviť všetky nastavenia svojej firmy.

**Funkcie:**
- Úprava základných údajov firmy (názov, IČO, DIČ, adresa)
- Zmena/nahratie nového loga
- Úprava fakturačných údajov (IBAN, SWIFT, VS pattern, splatnosť)
- Zmena poznámky na faktúre
- Preview zmien pred uložením

**Backend Endpoints (TODO):**
```javascript
GET /api/company/settings - Načítanie aktuálnych nastavení
PUT /api/company/settings/basic - Úprava základných údajov
PUT /api/company/settings/logo - Zmena loga (file upload)
PUT /api/company/settings/billing - Úprava fakturačných údajov
```

**Frontend Components (TODO):**
```
/frontend/src/pages/
  └── CompanySettingsPage.jsx      # Settings page

/frontend/src/components/
  ├── CompanyBasicSettings.jsx     # Názov, IČO, DIČ, adresa
  ├── CompanyLogoUpload.jsx        # Logo upload s preview
  └── CompanyBillingSettings.jsx   # IBAN, SWIFT, VS, splatnosť
```

**Features:**
- Form validation (IČO, DIČ, IBAN formáty)
- Live preview zmien
- Potvrdenie pred uložením
- Activity logging všetkých zmien
- Možnosť zrušiť zmeny (revert)
- Success/error notifikácie

**Security:**
- Iba Company Admin môže upravovať nastavenia svojej firmy
- Super Admin nemôže upravovať (len view-only)
- JWT auth + company_id verification
- Activity log: `company.settings_update`

**Estimate času:**
- Backend endpoints: 1-2 hodiny
- Frontend komponenty: 2-3 hodiny
- Testing & polish: 1 hodina
- **CELKOM:** ~4-6 hodín práce

---

## FÁZA 5: ZÁKAZKY WIZARD (CORE)

### 5-krokový OrderWizard (React Hook Form + Zustand)

**KROK 1: OBHLIADKA**
- ▼ Výber typu montáže (dropdown)
- Auto-načítanie checklist
- Informácie o klientovi
- Nahratie fotiek
- Generovanie PDF protokolu

**KROK 2: CENOVÁ PONÚKA**
- Tabuľka materiálov (názov/množstvo/cena)
- Výpočet DPH (20%)
- Celková suma
- Podpis zákazníka (signature pad)
- PDF protokol + email klientovi

**KROK 3: PRIRADENIE ZAMESTNANCA**
- Výber zamestnanca
- Výber termínu montáže
- Notifikácia zamestnancovi

**KROK 4: MONTÁŽ**
- Before/After fotky
- Checklist (checkbox na každú položku)
- Poznámky k montáži
- Podpis zákazníka
- PDF protokol dokončenia

**KROK 5: FAKTÚRA**
- Auto-generovanie čísla faktúry
- Prevzatie údajov z cenovej ponuky
- PDF faktúra s QR kódom
- Email klientovi
- Unikátny link pre sledovanie

**Každý krok generuje:**
- PDF protokol s fotkami
- Email notifikáciu
- Unikátny online link pre klienta

**Implementácia:**
- React Hook Form pre validáciu
- Zustand pre state management
- jsPDF pre PDF generovanie
- Signature pad pre podpisy
- Multer pre file upload
- Email service (NodeMailer)

---

## FÁZA 6: FAKTURÁCIA

### Invoices Module

**Auto-číslovanie:**
- Pattern: `MONTIO-YYYY-###`
- Príklad: MONTIO-2026-001, MONTIO-2026-002...
- Unique constraint v databáze

**PDF Generovanie:**
- Firemná hlavička (logo + údaje)
- Detail položiek
- QR kód pre platbu (jsPDF + qrcode.react)
- IBAN + variabilný symbol

**Stavy faktúr:**
- `pending` - Čaká na zaplatenie
- `paid` - Zaplatená
- `overdue` - Po termíne splatnosti
- `cancelled` - Zrušená

**Features:**
- Filtrovanie podľa stavu
- Vyhľadávanie
- Hromadný export (PDF/CSV)
- Dashboard widget s overview
- Upomienky (auto-email pre overdue)

**Implementácia:**
- jsPDF pre generovanie
- qrcode.react pre QR platbu
- Tabuľka s paginationom
- Email notifikácie

---

## FÁZA 7: ZAMESTNANCI ✅ HOTOVO (2026-03-27)

### Employee Lifecycle Management + Notifications System

**✅ IMPLEMENTOVANÉ:**

**Employee Lifecycle (5 statusov):**
- created → pending_approval → active → inactive → deleted
- Forced password change on first login (must_change_password flag)
- Admin approval workflow after password change
- Reactivate inactive employees
- Hard delete with FK cleanup (only if 0 orders)
- Resend credentials for created employees
- READ-ONLY mode for inactive (can login, cannot edit)

**Notifications System:**
- 7 API endpoints (list, count, read/unread, delete)
- NotificationBell component with 30s polling
- NotificationsPage with pagination & filters
- 8 notification types (created, approved, deactivated, etc.)
- Real-time badge count
- Mark as read/unread, delete individual/bulk

**Backend Endpoints (10 total):**
- GET /api/employees - List with order stats
- GET /api/employees/:id - Detail
- POST /api/employees - Create + user account
- PUT /api/employees/:id - Update
- DELETE /api/employees/:id - Deactivate (soft delete)
- POST /api/employees/:id/change-password - Change default password
- POST /api/employees/:id/approve - Approve (pending → active)
- POST /api/employees/:id/reactivate - Reactivate (inactive → active)
- DELETE /api/employees/:id/hard-delete - Permanent delete + FK cleanup
- POST /api/employees/:id/resend-credentials - Resend login info

**Notifications Endpoints (7 total):**
- GET /api/notifications - List (pagination, filters)
- GET /api/notifications/unread-count - Badge count
- PUT /api/notifications/:id/read - Mark as read
- PUT /api/notifications/:id/unread - Mark as unread
- PUT /api/notifications/mark-all-read - Bulk mark
- DELETE /api/notifications/:id - Delete one
- DELETE /api/notifications/delete-all-read - Bulk delete

**Frontend Components:**
- EmployeesPage.jsx - Main page wrapper
- EmployeesManager.jsx - CRUD management (upgraded with lifecycle actions)
- PasswordChangeModal.jsx - Forced password change UI
- ReadOnlyBanner.jsx - Yellow warning for inactive users
- NotificationBell.jsx - Bell icon with badge (30s polling)
- NotificationsPage.jsx - Full notifications view (pagination)
- ProfilePage.jsx - READ-ONLY protection (disabled buttons)

**Database:**
- employees table: status ENUM (5 values), must_change_password, default_password_hash
- notifications table (NEW): tracks all system notifications
- activity_logs: logs all employee actions

**Features:**
- Status badges with colors (Vytvorený, Čaká na schválenie, Aktívny, Neaktívny)
- Conditional action buttons based on status
- Search & filter (name, email, position, status)
- Order statistics on cards (total, completed)
- Transaction support for atomic operations
- Activity logging for audit trail
- Dark mode support

**Security:**
- Password hashing (bcryptjs)
- JWT with isReadOnly flag for inactive users
- Status-based access control
- FK cascade cleanup on hard delete
- Email uniqueness validation

**🔲 TODO (Budúce verzie):**
- Email notifikácie (NodeMailer) - actually send emails
- Employee self-service dashboard (tasks, calendar, photos, time-off)
- Push notifikácie (PWA)
- Drag&drop prideľovanie zákaziek
- Employee performance metrics
- Možnosť pridať seba ako zamestnanca
- Batch operations (approve/deactivate multiple)

---

## FÁZA 8: ANALYTIKA

### FinanceDashboard (Recharts)

**KPI Metriky:**
- 💰 Hotovosť (zaplatené faktúry)
- 📄 Nezaplatené faktúry (pending + overdue)
- 📊 Pipeline (rozpracované zákazky)
- 📈 Mesačný obrat

**Grafy:**
1. **Line Chart** - Obrat v čase (mesačne/týždenne)
2. **Pie Chart** - TOP typy montáží (podľa počtu)
3. **Bar Chart** - TOP zamestnanci (podľa dokončených zákaziek)
4. **Area Chart** - Cash flow (príjmy vs výdavky)

**Filtre:**
- Časové obdobie (týždeň/mesiac/rok)
- Typ montáže
- Zamestnanec
- Status zákazky

**Export:**
- PDF report
- CSV export
- Email summary (mesačný prehľad)

**Implementácia:**
- Recharts library
- Aggregované SQL queries
- Caching pre rýchlosť
- Real-time updates

---

## FÁZA 9: DEPLOY & OPTIMALIZÁCIA

### Production Build (Hostcreator)

**Frontend (Vite Build):**
- `npm run build` → `dist/` folder
- PWA Manifest (app-like experience)
- Service Worker (offline support)
- Code splitting + lazy loading
- Asset optimization (images, fonts)

**Backend:**
- Environment variables (.env)
  - `DB_HOST`, `DB_USER`, `DB_PASSWORD`
  - `JWT_SECRET`
  - `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`
- PM2 process manager
- Rate limiting
- CORS configuration
- Security headers

**PWA Features:**
- Offline cache pre základné routes
- Push notifications
- Add to Home Screen
- App icons (192x192, 512x512)

**Optimalizácie:**
- Lazy loading routes
- Image compression
- Minifikácia JS/CSS
- Gzip compression
- CDN pre statické súbory (optional)

**Deployment kroky:**
1. Build frontend: `cd frontend && npm run build`
2. Upload dist/ na hosting
3. Nastavenie Node.js backend
4. Konfigurácia environment variables
5. SSL certifikát (Let's Encrypt)
6. Doménové nastavenie
7. Testing na production

**Monitoring:**
- Error logging
- Performance monitoring
- Uptime checks

---

## Databáza - Kompletné schémy

### Zostávajúce tabuľky

#### `employees`
```sql
CREATE TABLE `employees` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `company_id` INT NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20),
  `position` VARCHAR(100),
  `status` ENUM('active','inactive') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### `orders`
```sql
CREATE TABLE `orders` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `company_id` INT NOT NULL,
  `order_type_id` INT NOT NULL,
  `order_number` VARCHAR(50) UNIQUE NOT NULL,
  `client_name` VARCHAR(255) NOT NULL,
  `client_email` VARCHAR(255),
  `client_phone` VARCHAR(20),
  `client_address` TEXT,
  `assigned_employee_id` INT,
  `scheduled_date` DATE,
  `status` ENUM('survey','quote','assigned','in_progress','completed','cancelled') DEFAULT 'survey',
  `total_price` DECIMAL(10,2),
  `notes` TEXT,
  `unique_link` VARCHAR(255) UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`),
  FOREIGN KEY (`order_type_id`) REFERENCES `order_types`(`id`),
  FOREIGN KEY (`assigned_employee_id`) REFERENCES `employees`(`id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### `order_stages`
```sql
CREATE TABLE `order_stages` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `stage` ENUM('survey','quote','installation','completion') NOT NULL,
  `checklist_data` JSON,
  `photos` JSON,
  `signature_data` TEXT,
  `pdf_url` TEXT,
  `completed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### `invoices`
```sql
CREATE TABLE `invoices` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `company_id` INT NOT NULL,
  `order_id` INT NOT NULL,
  `invoice_number` VARCHAR(50) UNIQUE NOT NULL,
  `issue_date` DATE NOT NULL,
  `due_date` DATE NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `vat_amount` DECIMAL(10,2) NOT NULL,
  `status` ENUM('pending','paid','overdue','cancelled') DEFAULT 'pending',
  `pdf_url` TEXT,
  `qr_code_data` TEXT,
  `paid_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### `activity_logs`
```sql
CREATE TABLE `activity_logs` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `company_id` INT NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(50) NOT NULL,
  `entity_id` INT NULL,
  `details` JSON,
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_company_id` (`company_id`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_entity` (`entity_type`, `entity_id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Activity Log Actions:**
- `user.login` - Prihlásenie
- `user.logout` - Odhlásenie
- `company.create` - Vytvorenie firmy
- `company.update` - Úprava firmy
- `order.create` - Vytvorenie zákazky
- `order.update` - Úprava zákazky
- `order.complete` - Dokončenie zákazky
- `invoice.create` - Vytvorenie faktúry
- `invoice.paid` - Zaplatenie faktúry
- `employee.create` - Pridanie zamestnanca
- `employee.update` - Úprava zamestnanca
- `settings.update` - Zmena nastavení

---

## Status Implementácie

| Fáza | Názov | Status | Poznámka |
|------|-------|--------|----------|
| ✅ FÁZA 1 | Databáza | **HOTOVO** | SQL schémy vytvorené + activity_logs |
| ✅ FÁZA 2 | Autentifikácia | **HOTOVO** | Backend + Frontend + Login + Dashboardy + Activity Logging + Company Detail |
| ✅ FÁZA 2.5 | UI Polish & Create Company | **HOTOVO** | Moderný dizajn + Sidebar + User Menu + Create Company modal |
| ✅ FÁZA 2.7 | Dark Mode + Advanced Features | **HOTOVO** | Dark Mode, Deactivate Company, Collapsible Sidebar, Logo Support |
| ✅ FÁZA 3 | Firma Onboarding | **HOTOVO** | 6-krokový wizard + logo upload + auto-login |
| ✅ FÁZA 4 | Dashboard + Kalendár | **HOTOVO** | KPI + FullCalendar + OrderTypes |
| 🎯 FÁZA 4.5 | Company Settings | **PO OBEDE** | Nastavenia firmy (Company Admin) |
| ✅ FÁZA 7 | Zamestnanci | **HOTOVO** | Employee Lifecycle + Notifications + READ-ONLY |
| 🔲 FÁZA 5 | Zákazky Wizard | Čaká | **CORE** - 5 krokov workflow |
| 🔲 FÁZA 6 | Fakturácia | Čaká | PDF + QR kódy |
| 🔲 FÁZA 8 | Analytika | Čaká | Grafy + KPI |
| 🔲 FÁZA 9 | Deploy | Čaká | Production build + PWA |

### FÁZA 2.7 Detaily (DONE)
- ✅ **Dark Mode** - ThemeContext, toggle v user menu, DB storage, auto-load
- ✅ **Deactivate Company** - Bezpečný modal, name validation, status: inactive
- ✅ **Collapsible Sidebar** - Toggle button, smooth animations, w-20 ↔ w-64
- ✅ **Logo Support** - Zobrazenie loga v table/detail, fallback na iniciálu
- ✅ **Documentation** - `DARK_MODE_AND_FEATURES.md`

### FÁZA 3 Detaily (DONE - 2026-03-16)
- ✅ **Backend Endpoints** - 5 API endpoints (validate token, step1-3, complete)
- ✅ **Onboarding Wizard** - 6-krokový proces registrácie firmy
- ✅ **Step 1: Základné údaje** - Názov, IČO, DIČ, adresa + validácia
- ✅ **Step 2: Logo + Fakturácia** - Multer file upload, Sharp resize, IBAN, SWIFT, VS pattern
- ✅ **Step 3: Typy montáží** - Dynamické pridávanie 1-10 typov + checklists
- ✅ **Step 4: Preview** - Prehľad všetkých údajov + možnosť úpravy
- ✅ **Step 5: Dokončenie** - Heslo, meno/priezvisko, auto-login, aktivácia firmy
- ✅ **File Upload** - Filesystém (dev) + dokumentácia migrácie na S3 (prod)
- ✅ **UI Unification** - Svetlejší gradient (orange-400), zelená pre aktívne
- ✅ **Documentation** - TECHNICAL_NOTES.md (file upload stratégia)

### Ďalší krok
**FÁZA 4: DASHBOARD + KALENDÁR** - KPI metriky, FullCalendar, Order Types management.

---

## Technické Riešenia & Budúce Migrácie

### File Upload Strategy

#### Aktuálny stav (Development):
- **Metóda:** Filesystém - lokálne ukladanie do `backend/uploads/logos/`
- **Spracovanie:** Multer + Sharp (resize 200x200, optimize JPG)
- **Databáza:** Len URL cesta `/uploads/logos/{timestamp}-{uuid}.jpg`
- **Servovanie:** Express static middleware `/uploads`
- **Status:** ✅ Funguje dobre pre development

#### Pred Produkciou - TODO:
- **Migrovať na:** AWS S3 alebo DigitalOcean Spaces
- **Dôvody:**
  - ✅ Škálovateľnosť (multi-server support)
  - ✅ Automatické zálohy
  - ✅ CDN integrácia (rýchle načítanie)
  - ✅ Neobmedzený priestor
  - ✅ Bezpečnosť (nezávislé od servera)
- **Cena:** ~$5/mesiac (250GB + 1TB transfer)
- **Implementácia:** `@aws-sdk/client-s3` alebo DigitalOcean Spaces API

#### Zamietnuté riešenia:
- ❌ **BASE64 v databáze** - +33% veľkosť, spomalenie queries, žiadny browser cache
- ❌ **BLOB v databáze** - spomalenie DB, veľké backupy, zlý performance

#### Budúca implementácia:
1. Nastaviť S3/Spaces bucket
2. Pridať environment variables (AWS_ACCESS_KEY, AWS_SECRET_KEY, S3_BUCKET)
3. Nahradiť `sharp().toFile()` za `s3.putObject()`
4. Migrovať existujúce súbory z filesystému na S3
5. Aktualizovať URL cesty v databáze

**Poznámka:** Filesystem je OK pre development a testovacie účely. Migrácia na cloud storage je povinná pred spustením produkcie.
