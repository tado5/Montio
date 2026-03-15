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
✅ Auth routes:
  - POST /api/auth/register (invite token check)
  - POST /api/auth/login (JWT token)
  - GET /api/auth/companies (superadmin only)

### Frontend
✅ React + Vite
✅ Tailwind CSS
✅ React Router
✅ AuthContext (global state)
✅ ProtectedRoute component
✅ Login page
✅ SuperAdminDashboard
✅ Axios HTTP client
✅ Token storage (localStorage)

## Ďalšie kroky

### FÁZA 3-9 (čakajú na špecifikáciu):
- Company admin dashboard
- Employee views
- Order workflow (obhliadka → ponuka → montáž)
- PDF generation
- Calendar & scheduling
- Invoice system
- Analytics
- File upload (photos)
- Mobile responsiveness optimization
