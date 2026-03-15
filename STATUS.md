# MONTIO APP - Aktuálny Stav Projektu

**Dátum:** 2026-03-15
**Čas:** 19:30

---

## ✅ ČO JE HOTOVÉ

### 1. Databáza ✅
- **Vytvorené:** 7 tabuliek v MariaDB
- **Umiestnenie:** Hostcreator phpMyAdmin
- **Databáza:** d46895_montio
- **Tabuľky:**
  - `companies` - Firmy
  - `users` - Používatelia
  - `order_types` - Typy montáží
  - `employees` - Zamestnanci
  - `orders` - Zákazky
  - `order_stages` - Etapy zákaziek
  - `invoices` - Faktúry
- **Testovacie dáta:**
  - Super admin účet: `admin@montio.sk` / `admin123`
  - Testovacia firma s invite tokenom

### 2. Backend (Node.js + Express) ✅
- **Technológia:** Node.js 18, Express, JWT, bcrypt
- **Súbory:**
  - `backend/server.js` - Hlavný server
  - `backend/config/db.js` - MariaDB pripojenie
  - `backend/routes/auth.js` - Auth endpoints
  - `backend/middleware/auth.js` - JWT middleware
- **API Endpointy:**
  - `POST /api/auth/login` - Prihlásenie
  - `POST /api/auth/register` - Registrácia (s invite token)
  - `GET /api/auth/companies` - Zoznam firiem (superadmin)
- **Stav:** Kód hotový, **NIE JE NASADENÝ** na server

### 3. Frontend (React + Vite + Tailwind) ✅
- **Technológia:** React 18, Vite, Tailwind CSS
- **Stránky:**
  - Login stránka (slovenčina)
  - Super Admin Dashboard
  - ProtectedRoute (role-based access)
- **Komponenty:**
  - AuthContext - state management
  - ProtectedRoute - ochrana routes
- **Stav:** **LIVE na https://montio.tsdigital.sk** ✅

### 4. GitHub Repository ✅
- **URL:** https://github.com/tado5/Montio
- **Visibility:** Private
- **Branche:**
  - `main` - zdrojový kód (development)
  - `production` - buildnuté súbory (auto-generované)

### 5. GitHub Actions (CI/CD) ✅
- **Workflow:** `.github/workflows/deploy.yml`
- **Proces:**
  1. Push do `main` → trigger build
  2. Build frontend (`npm run build`)
  3. Copy backend files
  4. Push do `production` branch
  5. Hostcreator webhook stiahne
- **Čas buildu:** ~2-3 minúty
- **Stav:** **FUNGUJE** ✅

### 6. Hostcreator Deployment ✅
- **Doména:** https://montio.tsdigital.sk
- **GIT Webhook:** Prepojený s `production` branch
- **Auto-deploy:** ✅ Pri push do main → automatický deploy
- **Frontend:** **LIVE** ✅
- **Backend:** **NEFUNGUJE** ❌ (zatiaľ)

### 7. Dokumentácia ✅
- `PLAN.md` - Kompletný plán 9 fáz
- `SETUP.md` - Inštalačné inštrukcie
- `DEPLOYMENT.md` - Deployment guide
- `GITHUB_ACTIONS.md` - CI/CD dokumentácia
- `PROJECT_STRUCTURE.md` - Štruktúra projektu
- `database/README.md` - DB setup
- `OTAZKA_PRE_HOSTCREATOR.md` - Otázka pre support

---

## ❌ ČO NEFUNGUJE / ČAKÁ

### 1. Backend Runtime ❌
**Problém:**
- Backend (Node.js) nie je nasadený na server
- Hostcreator možno nepodporuje Node.js runtime
- Bez backendu → login nefunguje

**Čaká na:**
- Odpoveď od Hostcreator support
- Zistiť či podporujú Node.js
- Alternatíva: Prepísať na PHP

### 2. API Endpointy ❌
**Problém:**
- Frontend sa pokúša volať `/api/auth/login`
- Backend server nebeží → 404 error
- Žiadne API calls nefungujú

**Čaká na:**
- Nasadenie backendu

### 3. Login funkcionalita ❌
**Problém:**
- Login stránka je viditeľná ✅
- Ale prihlásenie nefunguje ❌
- Super admin sa nemôže prihlásiť

**Čaká na:**
- Funkčný backend

---

## 🎯 FÁZY PROJEKTU - PROGRESS

| Fáza | Názov | Status | Poznámka |
|------|-------|--------|----------|
| ✅ FÁZA 1 | Databáza | **100%** | 7 tabuliek vytvorených |
| ✅ FÁZA 2 | Autentifikácia | **80%** | Kód hotový, backend nefunguje |
| 🔲 FÁZA 3 | Firma Onboarding | **0%** | Čaká na FÁZU 2 |
| 🔲 FÁZA 4 | Dashboard + Kalendár | **0%** | Čaká |
| 🔲 FÁZA 5 | Zákazky Wizard | **0%** | Čaká |
| 🔲 FÁZA 6 | Fakturácia | **0%** | Čaká |
| 🔲 FÁZA 7 | Zamestnanci | **0%** | Čaká |
| 🔲 FÁZA 8 | Analytika | **0%** | Čaká |
| 🔲 FÁZA 9 | Deploy & PWA | **50%** | Deploy funguje, PWA čaká |

---

## 📋 ĎALŠIE KROKY (ZAJTRA)

### Krok 1: Hostcreator Support
1. **Otvor:** `OTAZKA_PRE_HOSTCREATOR.md`
2. **Skopíruj** text (slovensky alebo anglicky)
3. **Pošli** na Hostcreator support
4. **Počkaj** na odpoveď

### Krok 2: Na základe odpovede

#### Scenár A: Node.js je podporovaný ✅
1. Nastaviť Node.js runtime podľa návodu
2. Spustiť backend na serveri
3. Otestovať login
4. **Pokračovať FÁZA 3**

#### Scenár B: Node.js NIE JE podporovaný ❌
1. Prepísať backend na PHP
2. Nasadiť PHP backend
3. Otestovať login
4. **Pokračovať FÁZA 3**

### Krok 3: Po funkčnom backende
- Otestovať super admin login
- Vytvoriť testovaciu firmu
- Začať **FÁZA 3: Firma Onboarding**
  - 6-krokový registračný wizard
  - Logo upload
  - Typy montáží

---

## 🔧 TECHNICKÉ DETAILY

### Prihlasovacie údaje

**Super Admin:**
- Email: `admin@montio.sk`
- Heslo: `admin123`
- Role: `superadmin`

**Testovacia firma:**
- Názov: Test Montáže s.r.o.
- Invite token: `test-invite-token-12345`
- Status: `pending`

**Databáza:**
- Host: `localhost` (na serveri)
- User: `u46895_montio`
- Password: `x52D_Z-lb!UX6n5`
- Database: `d46895_montio`

**JWT:**
- Secret: `montio_secret_key_2026_change_in_production`
- Expires: 7 dní

### URLs

- **Frontend LIVE:** https://montio.tsdigital.sk
- **GitHub Repo:** https://github.com/tado5/Montio (private)
- **Main branch:** Zdrojový kód
- **Production branch:** Buildnuté súbory

### Workflow

```
Local changes
    ↓
git push origin main
    ↓
GitHub Actions (2-3 min)
    ↓
Build frontend
    ↓
Push to production branch
    ↓
Hostcreator webhook
    ↓
LIVE na montio.tsdigital.sk
```

---

## 💡 POZNÁMKY

### Čo funguje perfektne:
- ✅ GitHub Actions automatický build
- ✅ Webhook deployment
- ✅ Frontend je rýchly a responzívny
- ✅ Databáza je správne nastavená
- ✅ Workflow je automatizovaný

### Jediný problém:
- ❌ Backend server (Node.js runtime)
- **Riešenie je na ceste** - čakáme na support

### Estimate času:
- **Ak Node.js je podporovaný:** 30 min - 1 hodina setup
- **Ak treba PHP backend:** 1-2 hodiny prepis
- **FÁZA 3 potom:** 4-6 hodín práce

---

## 📞 NA POKRAČOVANIE ZAJTRA

1. Otvor tento súbor: `STATUS.md`
2. Pozri sekciu "ĎALŠIE KROKY"
3. Otvor `OTAZKA_PRE_HOSTCREATOR.md`
4. Kontaktuj support
5. Daj mi vedieť odpoveď → pokračujeme! 🚀

---

**Projekt je vo výbornom stave!** Frontend funguje, deployment je automatický, len backend potrebuje doriešiť. Zajtra to dokončíme! 💪
