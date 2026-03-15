# MONTIO APP - Setup Guide

## Príprava databázy

1. Pripojte sa k MariaDB databáze:
```bash
mysql -u u46895_montio -p -h localhost d46895_montio
```

2. Spustite SQL skripty z PLAN.md pre vytvorenie tabuliek (users, companies, order_types)

3. Vytvorte super admin používateľa:
```sql
INSERT INTO users (email, password_hash, role, company_id)
VALUES ('admin@montio.sk', '$2a$10$HASH', 'superadmin', NULL);
```

## Backend Setup

1. Nainštalujte dependencies:
```bash
cd backend
npm install
```

2. Skontrolujte `.env` súbor s databázovými údajmi

3. Spustite backend server:
```bash
npm run dev
```

Backend beží na: **http://localhost:3001**

## Frontend Setup

1. Nainštalujte dependencies:
```bash
cd frontend
npm install
```

2. Spustite development server:
```bash
npm run dev
```

Frontend beží na: **http://localhost:3000**

## Testovanie

### Super Admin Login
- Email: `admin@montio.sk`
- Heslo: (heslo, ktoré ste nastavili pri vytváraní super admin účtu)

### API Endpoints
- `POST /api/auth/login` - Prihlásenie
- `POST /api/auth/register` - Registrácia s invite token
- `GET /api/auth/companies` - Zoznam firiem (superadmin only)

## Produkcia

### Backend build:
```bash
cd backend
npm start
```

### Frontend build:
```bash
cd frontend
npm run build
```

Build súbory budú v `frontend/dist/` priečinku.

## Deployment na Hostcreator

1. Uploadujte build súbory z `frontend/dist/` na hosting
2. Nakonfigurujte Node.js backend na porte 3001
3. Nastavte environment variables v hosting paneli
4. Presmerujte domenovú adresu na aplikáciu

---

**FÁZA 2 DOKONČENÁ ✓**
- Autentifikácia (JWT)
- Login stránka
- Super Admin Dashboard
- Role-based access control
