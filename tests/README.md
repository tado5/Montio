# MONTIO Testing Suite

Kompletná sada testov pre MONTIO aplikáciu.

## 📋 Obsah

```
tests/
├── e2e/                          # End-to-End testy (Playwright)
│   ├── helpers/
│   │   └── auth.js              # Pomocné funkcie pre prihlasovanie
│   ├── 01-auth.spec.js          # Autentifikácia testy
│   ├── 02-superadmin-dashboard.spec.js  # SuperAdmin dashboard
│   └── 03-employees.spec.js     # Employee management
└── README.md                     # Tento súbor

backend/__tests__/                # Backend API testy (Jest + Supertest)
└── auth.test.js                  # Auth API testy
```

---

## 🚀 Spustenie Testov

### Všetky testy naraz

```bash
# Z root adresára projektu
npm test
```

### E2E Testy (Playwright)

```bash
# Základné spustenie
npm run test:e2e

# UI Mode (vizuálne testovanie)
npm run test:e2e:ui

# Headed mode (vidieť prehliadač)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug
```

### Backend API Testy (Jest)

```bash
# Základné spustenie
npm run test:backend

# Watch mode (automatický rerun pri zmene)
cd backend && npm run test:watch

# Coverage report
cd backend && npm run test:coverage
```

---

## ⚙️ Setup & Konfigurácia

### Prvé spustenie

```bash
# 1. Nainštalovať dependencies
npm run install:all

# 2. Nainštalovať Playwright browsery (len prvýkrát)
cd frontend && npx playwright install

# 3. Spustiť lokálny development server
cd frontend && npm run dev

# 4. Spustiť testy (v novom termináli)
npm run test:e2e
```

### Environment Variables

**E2E testy:**
- Defaultne testujú na `http://localhost:3000`
- Pre produkciu: `BASE_URL=https://montio.tsdigital.sk npm run test:e2e`

**Backend testy:**
- Používajú development databázu (MariaDB Docker kontajner)
- Убедись что контейнер běží: `docker start montio-mariadb`

---

## 📝 Štruktúra Testov

### E2E Tests (Playwright)

**01-auth.spec.js** - Autentifikácia
- ✅ Login page zobrazenie
- ✅ Error handling pre neplatné údaje
- ✅ Úspešné prihlásenie
- ✅ Session persistence
- ✅ Logout funkcia
- ✅ Quick login buttons

**02-superadmin-dashboard.spec.js** - SuperAdmin Dashboard
- ✅ KPI cards zobrazenie
- ✅ Companies table loading
- ✅ Search funkcia
- ✅ Filter dropdown
- ✅ Create company modal
- ✅ Navigácia na company detail
- ✅ Sidebar navigation
- ✅ User menu
- ✅ Notification bell

**03-employees.spec.js** - Employee Management
- ✅ Employees page zobrazenie
- ✅ Employee list/empty state
- ✅ Search & filter
- ✅ Create employee modal

### Backend Tests (Jest + Supertest)

**auth.test.js** - Auth API
- ✅ Login endpoint validation
- ✅ Invalid credentials handling
- ✅ Valid login response
- ✅ Register endpoint
- ✅ Theme update endpoint

---

## 🔍 Debugging

### Playwright

```bash
# Spustiť konkrétny test súbor
npx playwright test 01-auth.spec.js

# Spustiť konkrétny test
npx playwright test -g "should login successfully"

# Debug mode s breakpointami
npx playwright test --debug

# UI mode - najlepší na debugging
npx playwright test --ui
```

### Jest

```bash
# Spustiť konkrétny test súbor
npm test -- auth.test.js

# Watch mode
npm run test:watch

# Verbose output
npm test -- --verbose
```

---

## 📊 Test Reports

### Playwright Reports

Po spustení testov:
```bash
npx playwright show-report
```

Report sa generuje do `playwright-report/` adresára.

### Jest Coverage

```bash
cd backend && npm run test:coverage
```

Coverage report: `backend/coverage/index.html`

---

## ✅ Best Practices

### Pred Commitom

```bash
# 1. Spustiť všetky testy
npm test

# 2. Ak testy PASS → môžeš commitnúť
git commit -m "feat: nova funkcionalita"

# 3. Ak testy FAIL → oprav chyby
```

### Pred Zmenou Dizajnu

```bash
# 1. Spustiť E2E testy s UI mode
npm run test:e2e:ui

# 2. Overiť že všetky testy PASS
# 3. Urobiť zmeny dizajnu
# 4. Znova spustiť testy
# 5. Ak niečo FAILUJE → oprav selektory
```

### Pridanie Nového Testu

```bash
# 1. Vytvor nový súbor v tests/e2e/
touch tests/e2e/04-orders.spec.js

# 2. Importuj pomocné funkcie
import { login } from './helpers/auth.js';

# 3. Napíš testy s describe() a test()

# 4. Spusti nový test
npx playwright test 04-orders.spec.js
```

---

## 🐛 Troubleshooting

### "Browser not found"
```bash
cd frontend && npx playwright install
```

### "Connection refused" pri E2E testoch
```bash
# Убедись что dev server běží
cd frontend && npm run dev
```

### "Database connection error" pri backend testoch
```bash
# Убедись что MariaDB kontajner běží
docker start montio-mariadb
docker ps | grep montio
```

### Testy FAILUJÚ po zmene dizajnu
```bash
# Aktualizuj selektory v test súboroch
# Používaj data-testid attributes pre stabilné selektory

# Príklad:
<button data-testid="login-button">Prihlásiť sa</button>

// V teste:
await page.click('[data-testid="login-button"]');
```

---

## 🎯 CI/CD Integration

Testy sa môžu spustiť aj v GitHub Actions:

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm run install:all
      - run: npm test
```

---

## 📚 Dokumentácia

- **Playwright:** https://playwright.dev
- **Jest:** https://jestjs.io
- **Supertest:** https://github.com/ladjs/supertest
- **Testing Library:** https://testing-library.com

---

## ✨ Ďalšie Kroky

- [ ] Pridať viac E2E testov (Orders, Calendar, Invoices)
- [ ] Pridať frontend component testy (Vitest)
- [ ] Pridať viac backend API testov
- [ ] Setup GitHub Actions workflow
- [ ] Pridať performance testy (Lighthouse)
- [ ] Pridať accessibility testy (axe-core)

---

**Happy Testing! 🧪**
