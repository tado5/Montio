# 🧪 MONTIO Testing Guide

**Last Updated:** 2026-04-13  
**Version:** v1.10.0  
**Status:** ✅ Manual testing complete, Playwright tests available

## 🚀 Quick Start

```bash
# 1. Nainštalovať Playwright browsers (len prvýkrát)
cd frontend && npx playwright install

# 2. Spustiť development server (v jednom termináli)
cd frontend && npm run dev

# 3. Spustiť E2E testy (v druhom termináli)
npm run test:e2e

# Alebo spustiť v UI mode (odporúčané)
npm run test:e2e:ui
```

---

## 📋 Dostupné Testy

### ✅ E2E Tests (Playwright) - **IMPLEMENTED**
- **01-auth.spec.js** - Login, logout, session persistence
- **02-superadmin-dashboard.spec.js** - Dashboard, KPI, tables, navigation
- **03-employees.spec.js** - Employee management

### ✅ Backend API Tests (Jest) - **IMPLEMENTED**
- **auth.test.js** - Auth endpoints validation

### 🆕 New Features to Test (v1.10.0)
- **User Profile Page** - View, edit, password change
- **Avatar Upload System** - Upload custom avatar, delete avatar
- **Employee Dashboard** - Real KPI cards, assigned orders, recent activity
- **UX Components** - LoadingSpinner, EmptyState, ErrorState
- **Database Migration** - `avatar_url`, `name`, `position` columns added to users table

---

## 🎯 Použitie Pred Zmenami Dizajnu

### Workflow:

```bash
# KROK 1: Spustiť testy PRED zmenami
npm run test:e2e:ui

# KROK 2: Overiť že všetky testy PASS ✅

# KROK 3: Urobiť zmeny dizajnu (CSS, Tailwind, komponenty)

# KROK 4: Znova spustiť testy
npm run test:e2e:ui

# KROK 5: Ak testy FAIL ❌:
#   - Skontrolovať ktorý test failuje
#   - Opraviť broken selector alebo komponent
#   - Znova spustiť test

# KROK 6: Keď všetky testy PASS ✅ → COMMIT
git commit -m "design: nový dizajn (všetky testy PASS)"
```

---

## 🎬 Príkazy

```bash
# E2E testy
npm run test:e2e              # Spustiť všetky E2E testy
npm run test:e2e:ui           # UI mode (najlepší na debugging)
npm run test:e2e:headed       # Viditeľný prehliadač
npm run test:e2e:debug        # Debug mode s breakpointami

# Backend testy
npm run test:backend          # Spustiť backend API testy
cd backend && npm run test:watch    # Watch mode

# Všetko naraz
npm test                      # Backend + E2E testy
```

---

## 📊 Test Reports

Po spustení E2E testov:

```bash
npx playwright show-report
```

---

## 🐛 Troubleshooting

**"Browser not found"**
```bash
cd frontend && npx playwright install
```

**"Connection refused"**
```bash
# Убедись что dev server běží
cd frontend && npm run dev
```

**Test failuje po zmene dizajnu**
```bash
# Aktualizuj selector v test súbore
# Používaj data-testid pre stabilné selektory:

<button data-testid="login-button">Prihlásiť</button>

// V teste:
await page.click('[data-testid="login-button"]');
```

---

## 📚 Viac Info

Detailná dokumentácia: `tests/README.md`

---

**Happy Testing! 🚀**
