# 📧 Email Pre Hostcreator Support - 502 API Error

---

**Predmet:** Backend API routing - 502 Error pri volaniach z frontendu

---

Dobrý deň,

nasadili sme MONTIO aplikáciu na `montio.tsdigital.sk`, ale **frontend dostáva 502 Bad Gateway error** pri volaní backend API.

## ✅ Čo funguje:
- Frontend (React): https://montio.tsdigital.sk - **funguje**
- Backend kód: Deploynutý do `/api/` adresára cez GIT webhook - **funguje**
- Databáza: Pripojenie OK - **funguje**

## ❌ Čo nefunguje:
- API calls z frontendu: `https://montio.tsdigital.sk/api/auth/login` → **502 Bad Gateway**
- Browser Console error: `Failed to load resource: the server responded with a status of 502 ()`

## 🔍 Čo sme zistili:

Frontend volá API na URL: `https://montio.tsdigital.sk/api/...`

Ale **backend Express.js server beží v Docker containeri na inom porte** (3000 alebo 3001).

**Apache .htaccess sa snaží routovať API cez rewrite rule:**
```apache
RewriteRule ^api/(.*)$ /api/server.js/$1 [L,QSA]
```

...ale toto **nefunguje** pretože Apache nemôže spúšťať Node.js súbory priamo.

## ❓ Naše otázky:

1. **Na akom PORTE beží náš Docker backend container?**
   - Backend server.js má: `const PORT = process.env.PORT || 3001;`
   - Potrebujeme vedieť skutočný port v Docker containeri

2. **Má Apache modul `mod_proxy` enabled?**
   - Potrebovali by sme reverse proxy pre `/api/*` requesty

3. **Ako správne routovať `/api/*` requesty na Docker backend?**
   - **Option A:** Reverse proxy cez Apache (ProxyPass)
   - **Option B:** Subdoména `api.montio.tsdigital.sk` pointujúca na Docker port
   - **Option C:** Exposovať port priamo (napr. `:3001`)

## 🎯 Naše preferované riešenie: **Reverse Proxy (Option A)**

Ideálne by sme chceli:
```apache
# Apache .htaccess alebo httpd.conf
ProxyPass /api http://localhost:3000/api
ProxyPassReverse /api http://localhost:3000/api

# Alebo RewriteRule s [P] flag:
RewriteRule ^api/(.*)$ http://localhost:3000/$1 [P,L]
```

**Výhody:**
- ✅ Jedna doména pre frontend aj backend
- ✅ Žiadne CORS problémy
- ✅ Profesionálne API URL (`/api/...`)

## 📁 Štruktúra Production Branchu

```
production/
├── index.html          # Frontend (React build)
├── assets/             # JS/CSS
├── .htaccess           # Apache routing
└── api/                # Backend Node.js
    ├── server.js       # Express.js entry point
    ├── routes/
    ├── config/
    ├── middleware/
    ├── utils/
    ├── node_modules/
    └── package.json    # "start": "node server.js"
```

**GitHub repo:** https://github.com/tado5/Montio/tree/production

## 🚀 Ďalší krok

Môžete nám prosím potvrdiť:
1. **Port Dockeru** kde beží backend?
2. **Ako nastaviť reverse proxy** pre `/api/*` requesty?
3. Prípadne **poskytnúť dokumentáciu** alebo príklad konfigurácie?

Sme pripravení **upraviť deploy workflow** a **redeploy aplikáciu** hneď ako budeme vedieť správnu konfiguráciu.

Ďakujem za pomoc!

S pozdravom,
Tomáš Česnek
TSDigital

---

**Kontakt:** 0903 904 677  
**Doména:** montio.tsdigital.sk  
**Database:** d46895_montio  
**GIT Webhook:** https://www.hostcreators.sk/admin/host/domain/46895/webhook/3193/edit
