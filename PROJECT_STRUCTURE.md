# MONTIO APP - Štruktúra Projektu

**Verzia:** v1.7.0 Build #15
**Updated:** 2026-03-30

```
Montio/
├── backend/                            # Node.js Express API
│   ├── config/
│   │   └── db.js                      # MariaDB connection pool
│   ├── middleware/
│   │   ├── auth.js                    # JWT verification & role check
│   │   └── logger.js                  # Activity logging middleware
│   ├── routes/
│   │   ├── auth.js                    # Auth endpoints (login, register)
│   │   ├── companies.js               # Company CRUD endpoints
│   │   ├── dashboard.js               # Dashboard stats & charts
│   │   ├── orderTypes.js              # Order types CRUD
│   │   ├── orders.js                  # Orders & calendar endpoints
│   │   ├── employees.js               # Employee CRUD + lifecycle
│   │   └── notifications.js           # Notifications system
│   ├── migrations/
│   │   └── notifications_system.sql   # DB migration for notifications
│   ├── uploads/                       # File uploads (dev only)
│   │   └── logos/                     # Company logos
│   ├── .env                           # Environment variables
│   ├── package.json
│   └── server.js                      # Express server entry point
│
├── frontend/                           # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── SuperAdminLayout.jsx           # Super Admin main layout
│   │   │   ├── SuperAdminHeader.jsx           # Super Admin header
│   │   │   ├── SuperAdminSidebar.jsx          # Super Admin sidebar
│   │   │   ├── SuperAdminFooter.jsx           # Super Admin footer
│   │   │   ├── CompanyAdminLayout.jsx         # Company Admin layout
│   │   │   ├── CompanyAdminHeader.jsx         # Company Admin header
│   │   │   ├── CompanyAdminSidebar.jsx        # Company Admin sidebar
│   │   │   ├── CompanyAdminFooter.jsx         # Company Admin footer
│   │   │   ├── EmployeeLayout.jsx             # Employee layout
│   │   │   ├── EmployeeHeader.jsx             # Employee header
│   │   │   ├── EmployeeSidebar.jsx            # Employee sidebar
│   │   │   ├── EmployeeFooter.jsx             # Employee footer
│   │   │   ├── DynamicLayout.jsx              # Auto-select layout by role
│   │   │   ├── ProtectedRoute.jsx             # Role-based route guard
│   │   │   ├── UserMenu.jsx                   # User dropdown menu
│   │   │   ├── NotificationBell.jsx           # Notifications bell icon
│   │   │   ├── CreateCompanyModal.jsx         # Create company modal
│   │   │   ├── DeactivateCompanyModal.jsx     # Deactivate company modal
│   │   │   ├── Calendar.jsx                   # FullCalendar component
│   │   │   ├── OrderTypesManager.jsx          # Order types CRUD
│   │   │   ├── EmployeesManager.jsx           # Employees CRUD
│   │   │   ├── PasswordChangeModal.jsx        # Forced password change
│   │   │   ├── ReadOnlyBanner.jsx             # Inactive employee banner
│   │   │   ├── KPICard.jsx                    # Dashboard KPI card
│   │   │   ├── Layout.jsx                     # Legacy layout (being phased out)
│   │   │   ├── Header.jsx                     # Legacy header
│   │   │   ├── Sidebar.jsx                    # Legacy sidebar
│   │   │   └── Footer.jsx                     # Legacy footer
│   │   ├── context/
│   │   │   ├── AuthContext.jsx                # Auth state management
│   │   │   └── ThemeContext.jsx               # Theme management (legacy)
│   │   ├── pages/
│   │   │   ├── Login.jsx                      # Login page
│   │   │   ├── SuperAdminDashboard.jsx        # Super Admin dashboard
│   │   │   ├── CompanyDetail.jsx              # Company detail page
│   │   │   ├── CompanyAdminDashboard.jsx      # Company Admin dashboard
│   │   │   ├── CalendarPage.jsx               # Calendar page
│   │   │   ├── OrderTypesPage.jsx             # Order types management
│   │   │   ├── EmployeesPage.jsx              # Employees management
│   │   │   ├── EmployeeDashboard.jsx          # Employee dashboard
│   │   │   ├── ProfilePage.jsx                # User profile page
│   │   │   └── NotificationsPage.jsx          # Notifications page
│   │   ├── App.jsx                            # Router setup
│   │   ├── main.jsx                           # React entry point
│   │   └── index.css                          # Tailwind + custom fonts
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js                         # Vite + proxy config
│   ├── tailwind.config.js                     # Tailwind + animations
│   └── postcss.config.js
│
├── docs/                                       # Documentation
│   ├── design/                                 # Design system documentation
│   │   ├── README.md                          # Design docs index
│   │   ├── DESIGN_README.md                   # Main design overview
│   │   ├── DESIGN_SYSTEM.md                   # Complete design bible (30KB)
│   │   ├── DESIGN_QUICK_REFERENCE.md          # Quick reference
│   │   ├── COMPONENTS_LIBRARY.md              # Component code library
│   │   ├── ANIMATION_GUIDE.md                 # Animation system guide
│   │   ├── FULL_REDESIGN_SUMMARY.md           # Implementation summary
│   │   ├── SUPERADMIN_REDESIGN.md             # Super Admin specifics
│   │   └── DESIGN_PREVIEW.md                  # ASCII visualizations
│   ├── deployment/                             # Deployment documentation
│   │   ├── README.md                          # Deployment docs index
│   │   ├── DEPLOYMENT.md                      # Deployment guide
│   │   ├── GITHUB_ACTIONS.md                  # CI/CD documentation
│   │   ├── HOSTCREATOR_KOMUNIKACIA.md         # Hostcreator support history
│   │   ├── OTAZKA_PRE_HOSTCREATOR.md         # Questions for Hostcreator
│   │   ├── ODPOVED_PRE_HOSTCREATOR.md        # First response
│   │   └── ODPOVED_PRE_HOSTCREATOR_NOVA.md   # Latest response
│   └── archive/                                # Outdated documentation
│       ├── README.md                          # Archive info
│       ├── DARK_MODE_AND_FEATURES.md          # Dark mode (postponed)
│       ├── IMPLEMENTATION_NOTES.md            # Old implementation notes
│       ├── FAZA_3_PLAN.md                     # FÁZA 3 plan (completed)
│       ├── DESIGN_NOTES.md                    # Old design (purple-pink)
│       └── NEW_LAYOUT_DESIGN.md               # Old layout design
│
├── .github/
│   └── workflows/
│       └── deploy.yml                          # GitHub Actions CI/CD
│
├── database/
│   ├── schema.sql                             # Database schema
│   └── README.md                              # Database documentation
│
├── version.json                               # Version & build number
├── README.md                                  # Project overview
├── STATUS.md                                  # Current project status
├── PLAN.md                                    # Development roadmap (9 phases)
├── SETUP.md                                   # Installation instructions
├── CHANGELOG.md                               # Version history
├── PROJECT_STRUCTURE.md                       # This file
├── TECHNICAL_NOTES.md                         # Technical notes
├── TESTING.md                                 # Testing documentation
├── DEV_CREDENTIALS.md                         # Development credentials
├── .gitignore
└── index.html                                 # Test deployment page
```

---

## 📦 Implementované Featúry

### Backend API (Node.js + Express)

**Technológie:**
- Node.js 18
- Express.js
- JWT authentication
- bcryptjs password hashing
- MariaDB (via mysql2)
- Multer (file uploads)
- Sharp (image processing)

**Endpoints (50+ total):**

**Auth (`routes/auth.js`):**
- `POST /api/auth/register` - Registration with invite token
- `POST /api/auth/login` - Login with JWT + activity logging
- `PUT /api/auth/theme` - Update user theme preference
- `GET /api/auth/companies` - List companies (superadmin only)

**Companies (`routes/companies.js`):**
- `POST /api/companies` - Create company invite
- `GET /api/companies/:publicId` - Company detail
- `GET /api/companies/:publicId/logs` - Activity logs with pagination
- `PUT /api/companies/:publicId/activate` - Activate company
- `PUT /api/companies/:publicId/deactivate` - Deactivate company

**Dashboard (`routes/dashboard.js`):**
- `GET /api/dashboard/stats` - KPI statistics
- `GET /api/dashboard/chart/revenue` - Revenue chart data
- `GET /api/dashboard/chart/order-types` - Top order types

**Order Types (`routes/orderTypes.js`):**
- `GET /api/order-types` - List order types
- `POST /api/order-types` - Create order type
- `PUT /api/order-types/:id` - Update order type
- `DELETE /api/order-types/:id` - Delete order type (with protection)

**Orders (`routes/orders.js`):**
- `GET /api/orders/calendar` - Orders for calendar
- `GET /api/orders/:id` - Order detail

**Employees (`routes/employees.js`):**
- `GET /api/employees` - List employees with stats
- `GET /api/employees/:id` - Employee detail
- `POST /api/employees` - Create employee + user account
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Deactivate employee
- `POST /api/employees/:id/change-password` - Change password
- `POST /api/employees/:id/approve` - Approve employee
- `POST /api/employees/:id/reactivate` - Reactivate employee
- `DELETE /api/employees/:id/hard-delete` - Permanent delete
- `POST /api/employees/:id/resend-credentials` - Resend credentials

**Notifications (`routes/notifications.js`):**
- `GET /api/notifications` - List notifications with pagination
- `GET /api/notifications/unread-count` - Unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/:id/unread` - Mark as unread
- `PUT /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `DELETE /api/notifications/delete-all-read` - Delete all read

**Middleware:**
- JWT verification & role check (`middleware/auth.js`)
- Activity logging (`middleware/logger.js`)

---

### Frontend (React + Vite + Tailwind)

**Technológie:**
- React 18
- Vite 5
- Tailwind CSS 3
- React Router 6
- Axios
- FullCalendar
- Lucide Icons
- DiceBear Avatars

**Design System:**
- **Aesthetic:** Industrial Command Center
- **Typography:** Archivo Black (headlines), IBM Plex Mono (data)
- **Theme:** Dark-only (slate-950 base)
- **Color Schemes:**
  - Super Admin: Orange (#f97316) → Red (#dc2626)
  - Company Admin: Blue (#3b82f6) → Cyan (#06b6d4)
  - Employee: Emerald (#10b981) → Green (#16a34a)
- **Patterns:**
  - Dot matrix backgrounds (32px grid)
  - Gradient overlays
  - Gradient accent lines
  - Backdrop blur effects
- **Animations:**
  - slideInRight (menu items, 0.3s, stagger 0.05s)
  - slideUp (cards, 0.4s, stagger 0.1s)
  - slideDown (headers, 0.4s)
  - pulse (status indicators, 2s infinite)
  - ping (notifications, 1s infinite)

**Layouts (12 role-specific components):**
- SuperAdminLayout, SuperAdminHeader, SuperAdminSidebar, SuperAdminFooter
- CompanyAdminLayout, CompanyAdminHeader, CompanyAdminSidebar, CompanyAdminFooter
- EmployeeLayout, EmployeeHeader, EmployeeSidebar, EmployeeFooter
- DynamicLayout (auto-selects based on user role)

**Pages (10 total):**
- Login - Animated gradient + quick login
- SuperAdminDashboard - "SYSTEM CONTROL" (KPI, companies table, search)
- CompanyDetail - "COMPANY DETAIL" (info, users, activity timeline)
- CompanyAdminDashboard - "OPERATIONS HUB" (real KPI cards)
- CalendarPage - "SCHEDULE CENTER" (FullCalendar integration)
- OrderTypesPage - "OPERATIONS CONFIG" (CRUD management)
- EmployeesPage - "TEAM CONTROL" (Employee CRUD + lifecycle)
- EmployeeDashboard - "FIELD PORTAL" (Employee tasks)
- ProfilePage - "USER PROFILE" (DynamicLayout, edit mode, camera overlay)
- NotificationsPage - "NOTIFICATIONS" (DynamicLayout, pagination, filters)

**Features:**
- JWT authentication with role-based routing
- Activity logging (audit trail)
- Dark-only theme
- Collapsible sidebar (w-16 collapsed, w-64 expanded)
- DiceBear avatars
- FullCalendar integration (month/week/day views)
- Order types CRUD with checklist editor
- Employee lifecycle management (5 statuses)
- Forced password change on first login
- Admin approval workflow
- Notifications system (30s polling, badge, pagination)
- READ-ONLY mode for inactive employees
- File upload (Multer + Sharp)
- Real-time KPI cards
- Staggered animations
- Responsive design

---

## 🎨 Design Documentation

Kompletná design dokumentácia v **docs/design/**:

1. **DESIGN_README.md** (13KB) - Hlavný prehľad design systému
2. **DESIGN_SYSTEM.md** (30KB) - Kompletná design bible
3. **DESIGN_QUICK_REFERENCE.md** (5KB) - Rýchla referencia pre developera
4. **COMPONENTS_LIBRARY.md** (19KB) - Ready-to-use component snippets
5. **ANIMATION_GUIDE.md** (15KB) - Animation system guide

**Design Philosophy:** "Industrial Command Center" - technický, precízny, premium aesthetic s role-specific color schemes a staggered animations.

---

## 🚀 Deployment

**CI/CD:** GitHub Actions (`.github/workflows/deploy.yml`)
- Push do `main` → auto-build → push do `production` branch
- Build time: ~2-3 minúty

**Hosting:** Hostcreator (montio.tsdigital.sk)
- GIT webhook prepojený s `production` branch
- Frontend: LIVE ✅
- Backend: Čaká na Node.js support ⏳

**Documentation:** `docs/deployment/`

---

## 📊 Database Schema

**MariaDB 11.4** - 8 tabuliek:

1. **companies** - Firmy (UUID public_id, logo, status)
2. **users** - Používatelia (JWT, bcrypt, role, theme)
3. **order_types** - Typy montáží (checklist JSON)
4. **employees** - Zamestnanci (5 statusov, FK to users)
5. **orders** - Zákazky (kalendár, photos, status)
6. **order_stages** - Etapy zákaziek (survey, quote, installation, completion)
7. **invoices** - Faktúry (PDF, QR kód)
8. **activity_logs** - Audit trail (user actions, timestamps)

**Schema:** `database/schema.sql`

---

## 🛠️ Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3 |
| **Backend** | Node.js 18, Express.js |
| **Database** | MariaDB 11.4 |
| **Auth** | JWT, bcryptjs |
| **File Upload** | Multer, Sharp |
| **Calendar** | FullCalendar |
| **Icons** | Lucide React |
| **Avatars** | DiceBear |
| **Fonts** | Archivo Black, IBM Plex Mono |
| **CI/CD** | GitHub Actions |
| **Hosting** | Hostcreator |
| **Styling** | Tailwind CSS + custom animations |

---

## 🎯 Development Status

**Completed Phases:**
- ✅ FÁZA 1: Databáza (8 tabuliek)
- ✅ FÁZA 2: Autentifikácia (JWT + bcrypt)
- ✅ FÁZA 2.5: UI Polish (modals, sidebar, dark mode)
- ✅ FÁZA 2.7: Advanced Features (activity logs, company management)
- ✅ FÁZA 3: Firma Onboarding Wizard (6 krokov)
- ✅ FÁZA 4: Dashboard + Kalendár (KPI, FullCalendar, Order Types)
- ✅ FÁZA 7: Zamestnanci (Employee CRUD + lifecycle)
- ✅ UI Redesign: Industrial Command Center (v1.7.0)

**Next Phase:**
- 🎯 FÁZA 5: Zákazky Wizard (order workflow)

---

**Pre viac detailov pozri:**
- [STATUS.md](STATUS.md) - Aktuálny stav projektu
- [PLAN.md](PLAN.md) - Kompletný plán 9 fáz
- [docs/design/](docs/design/) - Design system dokumentácia
