# Montio

**Verzia:** v1.3.0 Build #10
**Status:** Development (Lokálny vývoj)

MONTIO APP je webová aplikácia pre malé montážne firmy (klimatizácie, rekuperácie, tepelné čerpadlá, elektrikári, stavbári). Zabezpečuje kompletnú dokumentáciu, ochranu firmy aj klienta, plánovanie a fakturáciu.

## 🚀 Quick Start

```bash
# Backend
cd backend && npm run dev

# Frontend (nový terminál)
cd frontend && npm run dev
```

## 📚 Dokumentácia

- **[STATUS.md](STATUS.md)** - Aktuálny stav projektu, čo je hotové
- **[PLAN.md](PLAN.md)** - Kompletný plán všetkých fáz vývoja
- **[SETUP.md](SETUP.md)** - Inštalačné inštrukcie, troubleshooting
- **[CHANGELOG.md](CHANGELOG.md)** - História verzií a zmien

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router
- **Backend:** Node.js 18, Express, JWT, bcrypt, Multer, Sharp
- **Databáza:** MariaDB 11.4
- **File Storage:** Filesystém (dev), S3/Spaces (production)

## 📦 Implementované Features

✅ FÁZA 1: Databáza (8 tabuliek)
✅ FÁZA 2: Autentifikácia (JWT + bcrypt)
✅ FÁZA 2.5: UI Polish (Dark Mode, Sidebar, Modals)
✅ FÁZA 2.7: Advanced Features (Activity Logs, Company Management)
🎯 FÁZA 3: Firma Onboarding Wizard (Next)

## 🔧 Technické Poznámky

### File Upload
- **Dev:** Lokálny filesystém (`backend/uploads/`)
- **Prod:** Migrácia na AWS S3 / DigitalOcean Spaces (pred spustením)
- **Spracovanie:** Multer + Sharp (resize, optimize)

Viac detailov v **[PLAN.md](PLAN.md)** a **[STATUS.md](STATUS.md)**.
