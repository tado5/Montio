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

## FÁZA 3: FIRMA ONBOARDING

### 6-krokový registračný wizard pre firmy

**Kroky:**
1. **Invite token validácia** - Overenie registračného linku
2. **Základné údaje** - Názov/IČO/DIČ/adresa
3. **Logo upload + fakturačné údaje** - Nahratie loga a kompletné fakturačné info
4. **Vytvorenie vlastných typov montáží** - Názov + drag&drop checklist editor
5. **Dokončenie** - Aktivácia companyadmin role
6. **CompanySettings page** - Správa nastavení firmy

**Implementácia:**
- Multi-step form s validáciou
- File upload pre logo
- Drag&drop checklist builder
- JSON storage pre checklist šablóny
- Automatická aktivácia firmy po dokončení

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

## FÁZA 7: ZAMESTNANCI

### EmployeePortal (Mobile-first)

**Zamestnanec vidí:**
- Kalendár svojich zákaziek (bez cien!)
- Detail zákazky s checklistom
- Notifikácie o nových úlohách
- História dokončených montáží
- Možnosť požiadať o voľno/dovolenku

**Admin firmy vidí:**
- Zoznam všetkých zamestnancov
- Prideľovanie zákaziek
- Odoberanie/zmena zákaziek
- Prehľad výkonu (dokončené zákazky)
- Správa požiadaviek na voľno

**Features:**
- Push notifikácie (PWA)
- Možnosť pridať seba ako zamestnanca
- Role: "employee" vs "companyadmin+employee"
- Real-time sync

**Implementácia:**
- Samostatný EmployeeDashboard
- Push API pre notifikácie
- Calendar view (FullCalendar)
- Drag&drop prideľovanie

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
| 🔲 FÁZA 3 | Firma Onboarding | Čaká | 6-krokový wizard |
| 🔲 FÁZA 4 | Dashboard + Kalendár | Čaká | KPI + FullCalendar + OrderTypes |
| 🔲 FÁZA 5 | Zákazky Wizard | Čaká | **CORE** - 5 krokov workflow |
| 🔲 FÁZA 6 | Fakturácia | Čaká | PDF + QR kódy |
| 🔲 FÁZA 7 | Zamestnanci | Čaká | Employee Portal |
| 🔲 FÁZA 8 | Analytika | Čaká | Grafy + KPI |
| 🔲 FÁZA 9 | Deploy | Čaká | Production build + PWA |

### FÁZA 2.7 Detaily (DONE)
- ✅ **Dark Mode** - ThemeContext, toggle v user menu, DB storage, auto-load
- ✅ **Deactivate Company** - Bezpečný modal, name validation, status: inactive
- ✅ **Collapsible Sidebar** - Toggle button, smooth animations, w-20 ↔ w-64
- ✅ **Logo Support** - Zobrazenie loga v table/detail, fallback na iniciálu
- ✅ **Documentation** - `DARK_MODE_AND_FEATURES.md`

### Ďalší krok
**FÁZA 3: FIRMA ONBOARDING** - Vytvorenie registračného wizardu pre nové firmy.
