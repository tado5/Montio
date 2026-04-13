# 🚀 MONTIO - Production Deployment & Migration Guide

**Verzia:** 1.9.0  
**Dátum:** 2026-04-13  
**Build:** #17

---

## ⚠️ DÔLEŽITÉ - Database Migration Required!

Táto verzia **vyžaduje spustenie SQL migrácie** na production serveri pred deploymentom aplikácie.

---

## 📋 Deployment Checklist

- [ ] 1. Záloha databázy
- [ ] 2. Spustenie SQL migrácie
- [ ] 3. Overenie migrácie
- [ ] 4. Deploy backend kódu
- [ ] 5. Deploy frontend kódu
- [ ] 6. Testovanie na production

---

## 1️⃣ Záloha Databázy

**Pred akoukoľvek zmenou vždy zálohuj databázu!**

### Cez phpMyAdmin:
1. Prihlás sa na: https://sql14.hostcreators.sk/phpmyadmin/
2. Vyber databázu: `d46895_montio`
3. Klikni na tab **Export**
4. Vyber **Quick** method
5. Format: **SQL**
6. Klikni **Go**
7. Stiahni súbor: `d46895_montio_backup_2026-04-13.sql`

### Cez MySQL command line:
```bash
mysqldump -h sql14.hostcreators.sk -P 3319 -u u46895_montio -p d46895_montio > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## 2️⃣ Spustenie SQL Migrácie

### 📄 Migration SQL:

```sql
-- MONTIO v1.9.0 Migration
-- Pridanie 3 nových stĺpcov do companies tabuľky pre rozšírené nastavenia

-- ⚠️ BEZPEČNÁ MIGRÁCIA - používa IF NOT EXISTS
-- Môže sa spustiť viackrát bez poškodenia dát

ALTER TABLE companies
ADD COLUMN IF NOT EXISTS financial_data TEXT NULL COMMENT 'DPH, marže, režijné náklady (JSON)',
ADD COLUMN IF NOT EXISTS contact_data TEXT NULL COMMENT 'Kontaktné údaje, pracovné hodiny (JSON)',
ADD COLUMN IF NOT EXISTS invoice_settings TEXT NULL COMMENT 'Nastavenia faktúr (JSON)';

-- Overiť zmeny
DESCRIBE companies;
```

### Metóda A: Cez phpMyAdmin (Odporúčané)

1. **Prihlás sa:** https://sql14.hostcreators.sk/phpmyadmin/
2. **Vyber databázu:** `d46895_montio`
3. **Klikni na tab:** `SQL`
4. **Skopíruj a vlož** celý SQL kód z vyššie
5. **Klikni:** `Go`
6. **Overenie:** Mali by sa zobraziť správy o úspešnom pridaní stĺpcov

### Metóda B: Cez MySQL command line

```bash
# Pripoj sa na databázu
mysql -h sql14.hostcreators.sk -P 3319 -u u46895_montio -p d46895_montio

# Spusti migration (skopíruj SQL z vyššie)
```

### Metóda C: Cez lokálny SQL súbor

```bash
# 1. Skopíruj migration súbor na server
scp backend/migrations/add_company_settings_columns.sql user@server:/tmp/

# 2. Na serveri spusti migráciu
mysql -h sql14.hostcreators.sk -P 3319 -u u46895_montio -p d46895_montio < /tmp/add_company_settings_columns.sql
```

---

## 3️⃣ Overenie Migrácie

### Skontroluj štruktúru tabuľky:

```sql
DESCRIBE companies;
```

**Očakávaný výsledok:** Mali by sa zobraziť nové stĺpce:

```
+-------------------+--------------+------+-----+---------+----------------+
| Field             | Type         | Null | Key | Default | Extra          |
+-------------------+--------------+------+-----+---------+----------------+
| ...               | ...          | ...  | ... | ...     | ...            |
| financial_data    | text         | YES  |     | NULL    |                |
| contact_data      | text         | YES  |     | NULL    |                |
| invoice_settings  | text         | YES  |     | NULL    |                |
+-------------------+--------------+------+-----+---------+----------------+
```

### Test query:

```sql
-- Skontroluj že stĺpce existujú a sú NULL
SELECT id, name, financial_data, contact_data, invoice_settings 
FROM companies 
LIMIT 1;
```

**Ak dostaneš chybu "Unknown column"** → migrácia sa nespustila správne!

---

## 4️⃣ Deploy Backend

### Pull najnovší kód:

```bash
cd /path/to/montio/backend
git pull origin main
```

### Reštart backend servera:

```bash
# Ak používaš PM2:
pm2 restart montio-backend

# Ak používaš Docker:
docker-compose restart backend

# Alebo manuálne:
npm install  # ak sú nové dependencies
npm start
```

### Overiť že backend beží:

```bash
curl http://localhost:3001/health
# Mali by ste dostať: {"status":"ok"}
```

---

## 5️⃣ Deploy Frontend

### Build production frontend:

```bash
cd /path/to/montio/frontend
git pull origin main
npm install  # ak sú nové dependencies
npm run build
```

### Upload `dist/` na server:

```bash
# Cez SCP:
scp -r dist/* user@server:/var/www/montio/

# Alebo cez FTP/SFTP client
```

### Alebo ak máš automatický build:

```bash
# Na serveri:
cd /path/to/montio/frontend
git pull origin main
npm install
npm run build
```

---

## 6️⃣ Testovanie na Production

### A) Test API Endpoints:

```bash
# 1. Login
curl -X POST https://montio.tsdigital.sk/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"company@montio.sk","password":"company123"}'

# Skopirovať token z response

# 2. Test nového endpointu - Financial Settings
curl -X GET https://montio.tsdigital.sk/api/company/settings \
  -H "Authorization: Bearer <TOKEN>"

# Mali by ste dostať response so všetkými settings vrátane:
# "financial": null (alebo dáta)
# "contact": null
# "invoice_settings": null
```

### B) Test Frontend UI:

1. **Prihlás sa:** https://montio.tsdigital.sk
   - Email: `company@montio.sk`
   - Heslo: `company123`

2. **Naviguj na:** Company Settings (`/company/settings`)

3. **Skontroluj 6 tabov:**
   - ✅ Basic Info
   - ✅ Logo
   - ✅ Billing
   - ✅ **Financial** (NEW)
   - ✅ **Contact** (NEW)
   - ✅ **Invoices** (NEW)

4. **Test Financial Tab:**
   - Vyplň IČ DPH (SK + 10 číslic)
   - Vyber VAT rate: 20%, 10%, 5%, 0%, alebo Vlastná
   - Zadaj marže
   - Klikni Save
   - ✅ Malo by sa uložiť a zobraziť success message

5. **Test Contact Tab:**
   - Vyplň telefón, email, web
   - Nastav pracovné hodiny
   - Klikni Save

6. **Test Invoices Tab:**
   - Nastav footer text
   - Vyber logo pozíciu
   - Vyber jazyk
   - Vyber farbu
   - Klikni Save

7. **Refresh stránku** a overiť že dáta sa načítajú správne

### C) Test UI Optimalizácií:

1. **Desktop:**
   - Sidebar by mal byť užší (256px namiesto 288px)
   - Header kompaktnejší
   - Footer kompaktnejší

2. **Mobile (responzívny režim v prehliadači):**
   - Header ~30-35px výšky
   - Footer ~18-20px výšky
   - Sidebar overlay funguje
   - Notification bell → redirect na `/notifications`

3. **Všetky stránky:**
   - Kompaktnejšie formuláre
   - Menšie buttons
   - Menšie spacing

---

## 🐛 Troubleshooting

### Problém: "Unknown column 'financial_data'"

**Riešenie:**
- Migrácia sa nespustila
- Skontroluj či si pripojený na správnu databázu
- Spusti migráciu znova

### Problém: Settings sa neukladajú

**Diagnostika:**
```bash
# Skontroluj backend logy
pm2 logs montio-backend

# Alebo
docker logs montio-backend
```

**Riešenie:**
- Skontroluj že backend beží
- Skontroluj DB connection
- Skontroluj že migrácia prebehla

### Problém: Frontend nezobrazuje nové taby

**Riešenie:**
```bash
# Hard refresh v prehliadači:
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)

# Alebo clear cache
```

### Problém: 0% VAT sa neukladá

**Riešenie:**
- Tento bug bol opravený v v1.9.0
- Skontroluj že máš najnovšiu verziu backend kódu
- Súbor: `backend/routes/settings.js` - riadok 405

---

## 📊 Rollback Plan

### Ak niečo zlyhá:

**1. Rollback Database:**
```bash
mysql -h sql14.hostcreators.sk -P 3319 -u u46895_montio -p d46895_montio < backup_YYYYMMDD_HHMMSS.sql
```

**2. Rollback Backend:**
```bash
cd /path/to/montio/backend
git checkout v1.8.0  # alebo predošlá verzia
pm2 restart montio-backend
```

**3. Rollback Frontend:**
```bash
cd /path/to/montio/frontend
git checkout v1.8.0
npm run build
# Upload dist/
```

---

## ✅ Post-Deployment Checklist

Po úspešnom deploymente:

- [ ] Všetky API endpointy fungujú
- [ ] Company Settings stránka sa načíta
- [ ] Všetkých 6 tabov sa zobrazuje správne
- [ ] Ukladanie settings funguje (všetky taby)
- [ ] UI je kompaktnejšie (sidebar, header, footer)
- [ ] Mobile verzia funguje správne
- [ ] Žiadne chyby v browser console
- [ ] Žiadne chyby v backend logs
- [ ] Existujúce funkcie stále fungujú (Orders, Employees, Calendar)

---

## 📞 Support

**Ak narazíš na problém:**

1. Skontroluj browser console (F12)
2. Skontroluj backend logy
3. Skontroluj database connection
4. Overiť že migrácia prebehla správne (`DESCRIBE companies`)

**Kontakt:**
- GitHub Issues: [Vytvor issue](https://github.com/your-repo/montio/issues)
- Email: support@tsdigital.sk

---

**Verzia guide:** 1.0  
**Last updated:** 2026-04-13  
**Next migration:** TBD
