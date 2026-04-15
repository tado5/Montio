# ⚡ QUICK FIX GUIDE - 5 Minút Do Fungovania

**ROOT CAUSE:** Backend potrebuje `.env` súbor s `ALLOWED_ORIGINS` nastavením

---

## 🚀 3 Kroky k Fungovaniu

### Krok 1: Pripoj sa na server

**SSH** alebo **File Manager** na Hostcreatoru

### Krok 2: Vytvor súbor

**Cesta:** `/tsdigital.sk/sub/montio/api/.env`

**Obsah:**
```env
# CRITICAL SETTINGS
ALLOWED_ORIGINS=https://montio.tsdigital.sk,https://www.montio.tsdigital.sk
NODE_ENV=production
PORT=3000

# Database
DB_HOST=sql14.hostcreators.sk
DB_PORT=3319
DB_USER=u46895_montio
DB_PASSWORD=x52D_Z-lb!UX6n5
DB_NAME=d46895_montio

# JWT (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=use_existing_or_generate_new_one_here_64chars
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=https://montio.tsdigital.sk
```

### Krok 3: Reštartuj backend

**Hostcreator Admin Panel:**
- GIT Webhook Admin → Restart Application

**Alebo SSH:**
```bash
docker restart montio-backend
```

---

## ✅ Test

Otvor: **https://montio.tsdigital.sk**

Login: **admin@montio.sk** / **admin123**

**Funguje?** 🎉 **DONE!**

**Nefunguje?** Check `CORS_FIX_CRITICAL.md` pre detaily

---

**Čas:** ~5 minút  
**Náročnosť:** Ľahké (len config)
