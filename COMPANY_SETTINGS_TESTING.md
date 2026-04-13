# Company Settings - Testing Guide

**Verzia:** v1.8.0
**Dátum:** 2026-04-13
**Fáza:** 4.5

---

## 🎯 Čo sme implementovali

### Backend Endpoints (4)
```
GET  /api/company/settings          - Načítanie nastavení
PUT  /api/company/settings/basic    - Update základných údajov
PUT  /api/company/settings/logo     - Upload loga
PUT  /api/company/settings/billing  - Update fakturačných údajov
```

### Frontend
- **Stránka:** `/company/settings`
- **Komponent:** `CompanySettingsManager` s 3 tabmi
- **Dizajn:** Industrial Command Center (modrá/cyan)

---

## 🧪 Testing Checklist

### 1. Setup
```bash
# Backend (terminál 1)
cd backend
npm run dev

# Frontend (terminál 2)
cd frontend
npm run dev
```

### 2. Login
- Prihlásiť sa ako **Company Admin**:
  - Email: (tvoj company admin email)
  - Heslo: (tvoje heslo)

### 3. Navigation
- ✅ Klikni na **"⚙️ Nastavenia"** v sidebari
- ✅ URL by mal byť: `http://localhost:3000/company/settings`
- ✅ Mala by sa načítať stránka s 3 tabmi

---

## 📋 Test Cases

### TEST 1: Load Settings (GET)
**Kroky:**
1. Otvor stránku `/company/settings`
2. Počkaj na načítanie

**Očakávaný výsledok:**
- ✅ Zobrazí sa tab "BASIC INFO"
- ✅ Formulár je vyplnený aktuálnymi dátami
- ✅ Logo sa zobrazí (ak existuje)
- ✅ Žiadne error hlášky

---

### TEST 2: Update Basic Info
**Kroky:**
1. Klikni na tab "BASIC INFO"
2. Zmeň názov firmy (napr. pridaj "TEST")
3. Klikni "SAVE CHANGES"

**Očakávaný výsledok:**
- ✅ Button sa zmení na "SAVING..."
- ✅ Po chvíli: zelená success hláška "Základné údaje boli aktualizované."
- ✅ Hláška zmizne po 3 sekundách
- ✅ Refresh stránky → zmeny sú uložené

**Validácia:**
- IČO: musí mať **8 číslic**
- DIČ: musí mať **10 číslic** (voliteľné)
- Adresa: min **10 znakov**

---

### TEST 3: Upload Logo
**Kroky:**
1. Klikni na tab "LOGO"
2. Klikni na upload zónu (alebo drag & drop súbor)
3. Vyber obrázok (JPG, PNG alebo SVG)
4. Zobrazí sa live preview
5. Klikni "UPLOAD LOGO"

**Očakávaný výsledok:**
- ✅ Preview sa zobrazí správne
- ✅ Button sa zmení na "UPLOADING..."
- ✅ Po chvíli: zelená success hláška "Logo bolo aktualizované."
- ✅ Aktuálne logo sa aktualizuje
- ✅ Refresh stránky → nové logo je uložené

**Error cases:**
- Súbor > 2MB → error "File too large"
- Nesprávny typ → error "Invalid file type"

---

### TEST 4: Update Billing Info
**Kroky:**
1. Klikni na tab "BILLING"
2. Vyplň IBAN (napr. `SK3112000000198742637541`)
3. Vyplň SWIFT (napr. `TATRSKBX`)
4. Vyplň variabilný symbol (napr. `1234567890`)
5. Nastav splatnosť (napr. `14` dní)
6. Klikni "SAVE CHANGES"

**Očakávaný výsledok:**
- ✅ Button sa zmení na "SAVING..."
- ✅ Po chvíli: zelená success hláška "Fakturačné údaje boli aktualizované."
- ✅ Hláška zmizne po 3 sekundách
- ✅ Refresh stránky → zmeny sú uložené

**Validácia:**
- IBAN: formát `SK + 22 číslic`
- SWIFT: 8-11 znakov
- Variabilný symbol: 1-10 číslic
- Splatnosť: 1-365 dní

---

### TEST 5: Activity Logging
**Kroky:**
1. Urob update basic info
2. Upload logo
3. Update billing info
4. Idi na `/superadmin/company/{companyId}` (ako super admin)
5. Pozri Activity logs

**Očakávaný výsledok:**
- ✅ 3 nové logy:
  - `company.settings_update`
  - `company.logo_update`
  - `company.billing_update`
- ✅ Každý log má details (old → new)

---

### TEST 6: Permissions
**Kroky:**
1. Logout
2. Prihlásiť sa ako **Employee**
3. Skús ísť na `/company/settings`

**Očakávaný výsledok:**
- ✅ Access denied (len companyadmin má prístup)
- ✅ Redirect na dashboard alebo 403 error

---

### TEST 7: Error Handling
**Test neplatných dát:**
1. IČO: zadaj 7 číslic → error "IČO musí mať 8 číslic"
2. DIČ: zadaj 9 číslic → error "DIČ musí mať 10 číslic"
3. IBAN: zadaj zlý formát → error "IBAN má neplatný formát"
4. Splatnosť: zadaj 500 → error "Splatnosť musí byť 1-365 dní"

**Očakávaný výsledok:**
- ✅ Frontend validation (HTML5 pattern)
- ✅ Backend validation (API error response)
- ✅ Červená error hláška

---

### TEST 8: Responsive Design
**Kroky:**
1. Otvor stránku na mobile (DevTools → Toggle device toolbar)
2. Otvor na tablete
3. Otvor na desktope

**Očakávaný výsledok:**
- ✅ Taby sú viditeľné na všetkých zariadeniach
- ✅ Formulár sa správne zalamuje
- ✅ Logo upload zóna je použiteľná
- ✅ Buttons sú klikateľné
- ✅ Žiadne overflowy

---

## 🐛 Known Issues

- [ ] Logo preview sa môže načítať pomaly pri veľkých súboroch
- [ ] IBAN validation neoveruje checksum (len formát)
- [ ] Billing data nemajú preview pred save

---

## ✅ Success Criteria

**FÁZA 4.5 je hotová ak:**
- ✅ Všetky 4 API endpointy fungujú
- ✅ Frontend načíta a zobrazí nastavenia
- ✅ Update basic info funguje
- ✅ Logo upload funguje (JPG, PNG, SVG)
- ✅ Update billing funguje
- ✅ Validácia funguje (frontend + backend)
- ✅ Activity logging funguje
- ✅ Permissions (len companyadmin)
- ✅ Responsive design
- ✅ Industrial Command Center dizajn

---

## 📞 Help

**Backend API test (curl):**
```bash
# Get settings
curl -X GET http://localhost:3001/api/company/settings \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update basic
curl -X PUT http://localhost:3001/api/company/settings/basic \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Firma","ico":"12345678","dic":"1234567890","address":"Hlavná 123, Bratislava"}'

# Update billing
curl -X PUT http://localhost:3001/api/company/settings/billing \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"iban":"SK3112000000198742637541","swift":"TATRSKBX","variable_symbol":"1234567890","due_days":"14"}'
```

**Get JWT token:**
```javascript
// V browser console
localStorage.getItem('token')
```

---

**Happy Testing! 🚀**
