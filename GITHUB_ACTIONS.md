# GitHub Actions - Automatický Build & Deploy

## 🎯 Ako to funguje

### 2 Branche stratégia:

```
📁 main (zdrojový kód)
   ├── frontend/src/          ← React komponenty
   ├── backend/               ← Node.js server
   └── ...všetky zdrojové súbory

📁 production (buildnuté súbory) - AUTO GENEROVANÝ
   ├── index.html             ← Buildnutý React
   ├── assets/                ← CSS, JS súbory
   ├── api/                   ← Backend súbory
   │   ├── server.js
   │   ├── config/
   │   ├── routes/
   │   └── node_modules/
   └── .htaccess              ← Routing config
```

---

## ⚙️ Workflow proces

### Krok 1: Push do `main`
```bash
git add .
git commit -m "Nova feature"
git push origin main
```

### Krok 2: GitHub Actions automaticky
1. ✅ Checkoutne `main` branch
2. ✅ Nainštaluje Node.js
3. ✅ Buildne frontend (`npm run build`)
4. ✅ Nainštaluje backend dependencies
5. ✅ Skopíruje všetko do production štruktúry
6. ✅ Vytvorí `.htaccess` pre routing
7. ✅ Pushne do `production` branch

### Krok 3: Hostcreator webhook
- Stiahne nové súbory z `production` branch
- Aplikácia je live! 🚀

---

## 🔧 Nastavenie na Hostcreatoru

### 1. Prepoj GIT repozitár

V Hostcreator paneli:
- Aplikácie → GIT
- Pridaj nový repozitár
- **Repository URL:** `https://github.com/tado5/Montio`
- **Branch:** `production` ← DÔLEŽITÉ!
- **Doména:** tvoja doména (napr. montio.sk)
- **Path:** `/public_html/` alebo `/www/`

### 2. Vytvor Personal Access Token (GitHub)

GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token

**Permissions:**
- ✅ `repo` (Full control)

Skopíruj token a použij ho pri prepájaní v Hostcreatoru.

### 3. Webhook sa vytvorí automaticky

Hostcreator pošle webhook URL do GitHubu.
Pri každom push do `production` → auto deploy.

---

## 🎬 Prvé spustenie

Po commite a pushu tohto súboru:

1. **GitHub Actions sa spustí automaticky**
   - GitHub → Actions tab
   - Uvidíš "Build and Deploy to Production" workflow

2. **Počkaj 2-3 minúty**
   - Frontend build
   - Backend copy
   - Deploy do production

3. **Over production branch**
   - GitHub → Branches
   - Mal by si vidieť `production` branch
   - Klikni naň a uvidíš buildnuté súbory

4. **Nastav webhook na Hostcreatoru**
   - Prepoj s `production` branch
   - Prvý deploy sa spustí automaticky

---

## 📊 Monitoring

### GitHub Actions logs:
```
GitHub → Actions → klikni na konkrétny run
```

Uvidíš:
- ✅ Checkout main branch
- ✅ Setup Node.js
- ✅ Install dependencies
- ✅ Build frontend
- ✅ Deploy to production

### Hostcreator webhook logs:
```
Hostcreator panel → Aplikácie → GIT → História
```

---

## 🐛 Troubleshooting

### Problém: GitHub Actions zlyhá
**Riešenie:**
- GitHub → Actions → klikni na červený run
- Pozri si error log
- Najčastejšie: chýbajúce dependencies

### Problém: Production branch sa nevytvoril
**Riešenie:**
- Over že máš GITHUB_TOKEN permissions
- GitHub → Settings → Actions → General
- Workflow permissions: "Read and write permissions"

### Problém: Webhook nefunguje
**Riešenie:**
- Over GitHub token v Hostcreatoru
- Over že branch je `production` (nie main!)
- Skús manuálne "Stiahnut" v Hostcreator paneli

### Problém: Backend nefunguje na hostingu
**Riešenie:**
- Backend potrebuje Node.js runtime
- Hostcreator panel → Node.js Manager
- Nastav Application Root: `/public_html/api`
- Startup file: `server.js`

---

## 💡 Výhody tejto stratégie

✅ **main** branch = čistý zdrojový kód (pre vývoj)
✅ **production** branch = optimalizované súbory (pre hosting)
✅ Automatický build pri každom push
✅ Žiadne manuálne buildovanie
✅ Hostcreator webhook = instant deploy
✅ Rollback = stačí revert commit v main

---

## 📈 GitHub Actions limity

**Private repository:**
- 2000 minút/mesiac zadarmo
- Build trvá ~2-3 minúty
- = **~600-1000 buildov mesačne**

Pre tvoj projekt to je **viac než dosť!** 💪

---

## 🔄 Workflow diagram

```
┌─────────────────┐
│  Local Changes  │
└────────┬────────┘
         │
         ▼
    git push main
         │
         ▼
┌─────────────────┐
│ GitHub Actions  │
│   (2-3 min)     │
└────────┬────────┘
         │
         ▼
  Build & Deploy
         │
         ▼
┌─────────────────┐
│ production      │
│    branch       │
└────────┬────────┘
         │
         ▼
  Hostcreator Webhook
         │
         ▼
┌─────────────────┐
│   LIVE! 🚀      │
└─────────────────┘
```

---

## 🎉 Ready!

Po nastavení:
1. Push do `main` = automatický deploy
2. Žiadne manuálne buildovanie
3. Žiadny FTP upload

**Just code and push!** 💻🚀
