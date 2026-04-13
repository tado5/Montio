# 🔴 TODO - NABUDÚCE RIEŠIŤ

**Dátum:** 2026-04-14  
**Stav:** Backend nefunguje (502 Bad Gateway)  
**Deployment:** Úspešný, ale backend sa nespúšťa

---

## 🚨 PROBLÉM

**Symptóm:**
```
POST https://montio.tsdigital.sk/api/auth/login
Status: 502 Bad Gateway
```

**Nginx funguje, ale backend neodpovedá.**

---

## ✅ ČO SME ZISTILI

1. **Deployment prebehol úspešne** (GitHub Actions → Hostcreator webhook)
2. **Backend beží v DOCKER containeri**, nie cez PM2!
   - Container ID: `df55f994dc2d`
   - Image: `node:24.14.0-alpine`
   - Working path: `/api/`
3. **Production setup:**
   - Hosting: Hostcreator
   - Path: `/var/www16/p46894/tsdigital.sk/sub/montio/`
   - Current release: `release_20260414002523`
   - Symlink: `current → release_20260414002523`
4. **.env súbor existuje lokálne** s týmito premennými:
   ```
   PORT=3001
   DB_HOST=sql14.hostcreators.sk
   DB_PORT=3319
   DB_USER=u46895_montio
   DB_PASSWORD=x52D_Z-lb!UX6n5
   DB_NAME=d46895_montio
   JWT_SECRET=montio-super-secret-jwt-key-2026
   JWT_EXPIRES_IN=7d
   ```
   **ALE chýbajú:**
   - `NODE_ENV=production`
   - `CORS_ORIGIN=https://montio.tsdigital.sk`

---

## 🔍 DIAGNOSTIKA NA ĎALŠEJ SESSION

SSH na production server a spusti:

### 1. Check Docker containers
```bash
docker ps -a
```
**Hľadaj:** Container s `montio` alebo `df55f994dc2d`

### 2. Check Docker logs
```bash
docker logs df55f994dc2d
# alebo
docker logs $(docker ps -q --filter ancestor=node:24.14.0-alpine)
```
**Hľadaj:**
- DB connection errors (`ECONNREFUSED`, `ER_ACCESS_DENIED_ERROR`)
- Missing column errors (`Unknown column 'avatar_url'`)
- Port errors (`EADDRINUSE`)
- Missing .env errors

### 3. Check .env v containeri
```bash
cd /var/www16/p46894/tsdigital.sk/sub/montio/current/backend
ls -la | grep .env
cat .env
```
**Overiť:**
- Súbor existuje?
- Obsahuje všetky premenné?
- Má `NODE_ENV=production` a `CORS_ORIGIN`?

### 4. Check čo beží na porte 3001
```bash
netstat -tlnp | grep 3001
# alebo
lsof -i :3001
```
**Očakávané:** Node.js process na porte 3001

### 5. Check Nginx config
```bash
cat /etc/nginx/sites-enabled/montio.tsdigital.sk
# alebo
nginx -T | grep -A10 "montio.tsdigital.sk"
```
**Overiť:**
```nginx
location /api {
    proxy_pass http://localhost:3001;
}
```

---

## 🔧 PRAVDEPODOBNÉ RIEŠENIA

### Scenár A: .env súbor nie je v Docker containeri

**Problém:** Deployment neprepísal .env do current release

**Fix:**
```bash
cd /var/www16/p46894/tsdigital.sk/sub/montio/current/backend

# Vytvor/uprav .env
nano .env

# Pridaj všetky premenné:
PORT=3001
DB_HOST=sql14.hostcreators.sk
DB_PORT=3319
DB_USER=u46895_montio
DB_PASSWORD=x52D_Z-lb!UX6n5
DB_NAME=d46895_montio
JWT_SECRET=montio-super-secret-jwt-key-2026
JWT_EXPIRES_IN=7d
NODE_ENV=production
CORS_ORIGIN=https://montio.tsdigital.sk

# Restart Docker container
docker restart df55f994dc2d

# Check logs
docker logs -f df55f994dc2d
```

---

### Scenár B: Docker container crashol

**Problém:** Backend sa spustil, ale hneď crashol (DB error, missing column, atď.)

**Fix:**
```bash
# Check logs pre presný error
docker logs df55f994dc2d | tail -50

# Ak je DB migration error:
mysql -h sql14.hostcreators.sk -P 3319 -u u46895_montio -p d46895_montio
# Spusti migration z QUICK_DEPLOYMENT.md

# Restart container
docker restart df55f994dc2d
```

---

### Scenár C: Port 3001 už používa iný proces

**Problém:** Starý backend proces ešte beží

**Fix:**
```bash
# Zisti čo beží na 3001
lsof -i :3001

# Kill proces
kill -9 PID

# Restart Docker
docker restart df55f994dc2d
```

---

### Scenár D: Docker container nebeží vôbec

**Problém:** Container exited/stopped

**Fix:**
```bash
# Check status
docker ps -a | grep montio

# Ak je "Exited", pozri logs prečo:
docker logs df55f994dc2d

# Start container
docker start df55f994dc2d

# Alebo restart deployment:
# Trigger nový push na GitHub (prázdny commit)
```

---

## 📋 CHECKLIST NABUDÚCE

- [ ] `docker ps -a` → pošli output
- [ ] `docker logs CONTAINER_ID` → pošli logy
- [ ] `ls -la current/backend/.env` → existuje .env?
- [ ] `cat current/backend/.env` → má všetky premenné?
- [ ] `netstat -tlnp | grep 3001` → beží niečo na 3001?
- [ ] Podľa diagnostiky zvol scenár A/B/C/D
- [ ] Fix podľa scenára
- [ ] Test: `curl http://localhost:3001/health`
- [ ] Test: Login na https://montio.tsdigital.sk

---

## 🎯 CIEľ BUDÚCEJ SESSION

1. Zistiť prečo Docker container nefunguje (logy)
2. Opraviť problém (.env / DB / port)
3. Reštartovať backend
4. Otestovať login, dashboard, profile

---

## 📝 POZNÁMKY

- Deployment je **Docker-based**, nie PM2
- Hostcreator webhook automaticky deployment po git push
- Release directory: `release_YYYYMMDDHHMMSS`
- Symlink `current` ukazuje na najnovší release
- Backend by mal byť v `current/backend/`
- Frontend build v `current/frontend/dist/` (alebo podobne)

---

## ⚠️ DÔLEŽITÉ

**Pred testovaním v budúcej session:**
- Pripoj sa SSH: `ssh user@montio.tsdigital.sk` (alebo ako máš nastavené)
- Prejdi do: `cd /var/www16/p46894/tsdigital.sk/sub/montio/`
- Všetky príkazy spúšťaj odtiaľ

---

**Pokračovanie:** Ďalšia session začne diagnostikou Docker logov.
