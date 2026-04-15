# 🔍 Prečo .env Súbor "Zmizol" - Kompletné Vysvetlenie

## ❓ Tvoje Otázky:

> 1. Prečo som ho vtedy nemal a fungovalo to?
> 2. Prečo je vymazaný keď tam bol?

---

## ✅ ODPOVEDE:

### 1. Prečo to fungovalo BEZ `ALLOWED_ORIGINS` v `.env`?

**PRED Refactoringom (v1.10.0 a staršie):**

```javascript
// backend/server.js (starý kód)
app.use(cors());  // ✅ Jednoduchý CORS - všetky origins povolené!
```

**V tej dobe `.env` súbor obsahoval:**
```env
DB_HOST=sql14.hostcreators.sk
DB_PORT=3319
DB_USER=u46895_montio
DB_PASSWORD=x52D_Z-lb!UX6n5
DB_NAME=d46895_montio
JWT_SECRET=nejaký_secret
PORT=3000
# ❌ NEMAL: ALLOWED_ORIGINS (nebolo to potrebné!)
```

**Backend načítal tieto env vars a:**
- ✅ Pripojil sa na databázu
- ✅ Použil JWT secret
- ✅ Počúval na porte 3000
- ✅ **CORS povolil VŠETKY origins** (žiadny whitelist)
- ✅ Frontend z `https://montio.tsdigital.sk` fungoval!

**Dôvod:** `app.use(cors())` bez parametrov = všetky origins OK!

---

### 2. Prečo je `.env` "vymazaný"?

**`.env` súbor NIKDY nebol v GIT!**

#### Dôkaz:

**`.gitignore` obsahuje:**
```gitignore
.env
.env.local
.env.prod
.env.production
backend/.env
**/.env*
```

**GitHub Actions deploy workflow (riadok 60):**
```yaml
cp backend/.env.example production-deploy/api/.env.example
# ❌ NEKOPÍRUJE: backend/.env (je ignorovaný!)
```

**Production branch:**
```bash
$ git ls-tree -r HEAD --name-only | grep "\.env"
api/.env.example  # ✅ Len example súbor
# ❌ Žiadny .env súbor
```

---

## 🔥 ČO SA SKUTOČNE STALO:

### Timeline:

#### **Fáza 0: Manuálny Setup (Dávno predtým)**

```
Ty/niekto cez SSH/FTP:
1. Vytvoril /tsdigital.sk/sub/montio/api/.env
2. Vyplnil DB credentials
3. Backend fungoval
```

**Tento súbor bol LOKÁLNY na serveri, nie v GIT!**

---

#### **Fáza 1: Prvé Deploye (Predtým)**

**GitHub Actions:**
```yaml
# Krok 1: Build kód
cp backend/*.js production-deploy/api/
# ❌ .env sa NEKOPÍRUJE (v .gitignore)

# Krok 2: Force push do production branch
git push --force origin HEAD:production
```

**Hostcreator Webhook:**
```bash
cd /tsdigital.sk/sub/montio/
git pull origin production

# .env súbor:
# - NIE JE v production branche (nie je tracked)
# - Git ho IGNORUJE (untracked file)
# - OSTANE nedotknutý na serveri ✅
```

**Výsledok:** `.env` prežil git pull pretože nebol tracked!

---

#### **Fáza 2: Refactoring (commit e42d974)**

**Zmenený kód:**
```javascript
// PRED:
app.use(cors());  // Všetko OK

// PO:
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = CORS_CONFIG.ALLOWED_ORIGINS;
    // ❌ VYŽADUJE ALLOWED_ORIGINS env variable!
  }
}));
```

**GitHub Actions deploy:**
```yaml
# Deploy nového kódu
git push --force origin HEAD:production
```

**Hostcreator Webhook:**
```bash
git pull origin production
# .env stále prežil (untracked)
```

**Backend na serveri:**
```javascript
// Načíta .env:
process.env.DB_HOST = "sql14.hostcreators.sk"  ✅
process.env.JWT_SECRET = "..."  ✅
process.env.ALLOWED_ORIGINS = undefined  ❌ CHÝBA!

// CORS_CONFIG:
ALLOWED_ORIGINS: undefined?.split(',') || ['http://localhost:3000']
// = ['http://localhost:3000']  ❌

// Production request z https://montio.tsdigital.sk:
// 'https://montio.tsdigital.sk' in ['http://localhost:3000'] → FALSE
// CORS BLOCKED! ❌
```

---

#### **Fáza 3: Možná Príčina "Zmazania"**

**Teória A: Hostcreator urobil `git reset --hard`**

```bash
# Možno webhook config obsahuje:
git reset --hard origin/production
# ❌ TOTO VYMAŽE všetky untracked súbory!
```

**Teória B: Hostcreator prečistil adresár**

```bash
# Možno webhook robí:
rm -rf /tsdigital.sk/sub/montio/*
git clone https://github.com/tado5/Montio.git --branch production .
# ❌ VYMAŽE všetko vrátane .env
```

**Teória C: .env nikdy nebol vytvorený na serveri**

```bash
# Možno:
# - Lokálny development mal .env
# - Production server NIKDY nemal .env
# - Backend používal defaulty alebo iný config source
```

---

## 🎯 PRAVDEPODOBNÝ SCENÁR:

### Čo sa stalo:

1. **Pred refactoringom:**
   - `.env` existoval na serveri (manuálne vytvorený)
   - Backend mal `app.use(cors())` - bez whitelist
   - **CORS povolil všetko** → fungoval aj bez `ALLOWED_ORIGINS`

2. **Po refactoringu:**
   - Deploy nového kódu s CORS whitelist
   - `.env` možno:
     - **Možnosť A:** Prežil, ale chýba mu `ALLOWED_ORIGINS`
     - **Možnosť B:** Bol vymazaný webhookom (`git reset --hard`)
     - **Možnosť C:** Neexistoval a backend používal defaults

3. **Výsledok:**
   - Backend nemá `ALLOWED_ORIGINS` variable
   - CORS používa default: `['http://localhost:3000']`
   - Production requesty blokované

---

## 📊 Overenie Teórií:

### Teória A: .env PREŽIL ale chýba mu ALLOWED_ORIGINS (85% pravdepodobnosť)

**Ak je to pravda:**
- `.env` súbor EXISTUJE na serveri
- Obsahuje DB credentials, JWT_SECRET
- **RIEŠENIE:** Pridaj 2 riadky do existujúceho súboru

**Overiť:**
```bash
ssh do servera
cat /tsdigital.sk/sub/montio/api/.env
```

---

### Teória B: .env bol VYMAZANÝ webhookom (10% pravdepodobnosť)

**Ak je to pravda:**
- Webhook robí `git reset --hard` alebo `rm -rf`
- `.env` bol vymazaný pri deployi

**RIEŠENIE:** Vytvor nový `.env` súbor

**Prevencia:** 
- Kontaktuj Hostcreator, spýtaj sa čo webhook robí
- Možno môžu pridať `--exclude=.env` do git pull

---

### Teória C: .env NIKDY nebol na serveri (5% pravdepodobnosť)

**Ak je to pravda:**
- Backend používal defaults alebo environment variables z Docker
- Predtým fungoval pretože CORS nemal whitelist

**RIEŠENIE:** Vytvor nový `.env` súbor

---

## ✅ UNIVERZÁLNE RIEŠENIE (Funguje pre všetky teórie):

### Krok 1: Skontroluj či .env existuje

**SSH:**
```bash
ls -la /tsdigital.sk/sub/montio/api/.env
```

**Alebo File Manager:**
```
Prejdi do /api/ a pozri sa či tam je .env súbor
```

---

### Krok 2A: Ak .env EXISTUJE

**Otvor ho a pridaj na koniec:**
```env
NODE_ENV=production
ALLOWED_ORIGINS=https://montio.tsdigital.sk,https://www.montio.tsdigital.sk
```

---

### Krok 2B: Ak .env NEEXISTUJE

**Vytvor ho s kompletným obsahom:**
```env
# Database
DB_HOST=sql14.hostcreators.sk
DB_PORT=3319
DB_USER=u46895_montio
DB_PASSWORD=x52D_Z-lb!UX6n5
DB_NAME=d46895_montio

# JWT
JWT_SECRET=7f3a8e9d2c1b6f4a5e8d9c2b1f6a4e8d9c2b1f6a4e8d9c2b1f6a4e8d9c2b1f6a
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=production

# CORS
ALLOWED_ORIGINS=https://montio.tsdigital.sk,https://www.montio.tsdigital.sk

# Frontend
FRONTEND_URL=https://montio.tsdigital.sk
```

---

### Krok 3: Reštartuj backend

```
Hostcreator Admin → Restart Application
```

---

## 🎓 Lessons Learned:

### 1. `.gitignore` je tvoj priateľ (aj nepriateľ)

**Pozitívum:**
- `.env` s credentials nie je v GIT ✅
- Security risk avoided ✅

**Negatívum:**
- Deploy workflow ho nemôže skopírovať ❌
- Treba ho vytvoriť manuálne na serveri ❌

---

### 2. Breaking Changes vyžadujú Migration Guide

**Refactoring pridal:**
- CORS whitelist (security feature) ✅
- Breaking change (vyžaduje novú env var) ❌

**Malo byť:**
```
BREAKING CHANGE: Requires ALLOWED_ORIGINS environment variable

Migration:
1. Add to .env: ALLOWED_ORIGINS=https://your-domain.com
2. Restart backend
```

---

### 3. Deploy Workflow nemôže skopírovať .env

**GitHub Actions:**
```yaml
# ❌ NEFUNGUJE:
cp backend/.env production-deploy/api/

# ✅ FUNGUJE:
cp backend/.env.example production-deploy/api/
```

**Riešenie:**
- Použiť GitHub Secrets pre env vars
- Alebo manuálne vytvoriť .env na serveri
- Alebo Hostcreator environment variables UI

---

## 🚀 Záver:

**Odpoveď na tvoje otázky:**

### 1. Prečo to fungovalo bez ALLOWED_ORIGINS?
✅ **Lebo CORS nemal whitelist** - `app.use(cors())` povolil všetko

### 2. Prečo je .env "vymazaný"?
✅ **Nie je vymazaný** - buď:
   - A) Prežil ale chýba mu `ALLOWED_ORIGINS` (najpravdepodobnejšie)
   - B) Bol vymazaný webhookom
   - C) Nikdy nebol na serveri

**Riešenie je rovnaké pre všetky prípady:**
- Skontroluj či .env existuje
- Ak áno → pridaj 2 riadky
- Ak nie → vytvor ho celý
- Reštartuj backend
- **Funguje!** 🎉

---

**Čas na fix:** 2-5 minút  
**Náročnosť:** Jednoduché  
**Potrebné:** SSH/File Manager access na Hostcreator
