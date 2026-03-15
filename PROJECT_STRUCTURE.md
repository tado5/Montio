# MONTIO APP - Štruktúra Projektu

```
Montio/
├── backend/                    # Node.js Express API
│   ├── config/
│   │   └── db.js              # MariaDB connection pool
│   ├── middleware/
│   │   └── auth.js            # JWT verification & role check
│   ├── routes/
│   │   └── auth.js            # Auth endpoints (login, register, companies)
│   ├── .env                   # Environment variables (DATABASE, JWT)
│   ├── package.json
│   └── server.js              # Express server entry point
│
├── frontend/                   # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx    # Role-based route guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Auth state management
│   │   ├── pages/
│   │   │   ├── Login.jsx             # Login page
│   │   │   └── SuperAdminDashboard.jsx
│   │   ├── App.jsx            # Router setup
│   │   ├── main.jsx           # React entry point
│   │   └── index.css          # Tailwind imports
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js         # Vite + proxy config
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── index.html                 # Test deployment page
├── PLAN.md                    # Development phases (1-9)
├── SETUP.md                   # Installation instructions
├── .gitignore
└── README.md
```

## Implementované featúry (FÁZA 2)

### Backend API
✅ JWT autentifikácia
✅ bcrypt password hashing
✅ Role-based middleware
✅ MariaDB connection
✅ Activity logging middleware (audit trail)
✅ Auth routes:
  - POST /api/auth/register (invite token check)
  - POST /api/auth/login (JWT token)
  - GET /api/auth/companies (superadmin only)
✅ Company routes:
  - POST /api/companies (create company + invite token generation)
  - GET /api/companies/:id (company detail + users + logs)
  - GET /api/companies/:id/logs (activity logs with pagination)

### Frontend
✅ React + Vite
✅ Tailwind CSS
✅ React Router
✅ AuthContext (global state)
✅ ProtectedRoute component
✅ Role-based routing (auto-redirect)
✅ Quick login (development mode)
✅ Modern UI Design:
  - Gradient backgrounds
  - Smooth animations & transitions
  - Glassmorphism effects
  - Timeline view for activity logs
  - Interactive hover effects
  - Custom scrollbar styling
  - Sidebar navigation
  - User menu dropdown
✅ Components:
  - Sidebar (role-based navigation menu)
  - UserMenu (dropdown s avatárom)
  - CreateCompanyModal (modal pre vytvorenie firmy)
  - ProtectedRoute (role guard)
✅ Pages:
  - Login (animated gradient + quick login buttons)
  - SuperAdminDashboard (sidebar + create company + table)
  - CompanyDetail (sidebar + timeline logs + stats)
  - CompanyAdminDashboard (sidebar + placeholders)
  - EmployeeDashboard (sidebar + employee portal)
✅ Axios HTTP client
✅ Token storage (localStorage)

## Ďalšie kroky

### FÁZA 3-9 (čakajú na implementáciu):
- Company onboarding wizard (6 krokov)
- Company admin dashboard (KPI + kalendár)
- Employee portal (úlohy + kalendár)
- Order workflow (obhliadka → ponuka → montáž)
- PDF generation (protokoly + faktúry)
- Calendar & scheduling (FullCalendar)
- Invoice system (auto-numbering + QR)
- Analytics (Recharts + dashboard)
- File upload (photos + logo)
- Mobile PWA optimization

---

## Design System

Pre detaily o dizajne, farbách, komponentoch a animáciách pozri **DESIGN_NOTES.md**
