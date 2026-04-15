# 📧 SMTP Email Configuration Guide

**Pre MONTIO aplikáciu - Odosielanie invitation emailov**

---

## 🎯 Čo potrebuješ

Pre odosielanie invitation emailov na produkcii potrebuješ:
1. **Gmail účet** (alebo iný SMTP server)
2. **App Password** (nie tvoje klasické heslo)
3. **ENV_FILE konfiguráciu** na Hostcreatore

---

## 📝 Krok 1: Vytvorenie Gmail účtu

**Odporúčaný email:** `noreply@montio.sk` alebo `montio.system@gmail.com`

1. Choď na https://accounts.google.com
2. Vytvor nový Gmail účet
3. **Dôležité:** Zapni 2-Factor Authentication (2FA)

---

## 🔐 Krok 2: Vygenerovanie App Password

### Pre Gmail účty:

1. **Choď do Google Account Settings:**
   - https://myaccount.google.com/security

2. **Zapni 2-Step Verification** (ak ešte nie je zapnuté):
   - Security → 2-Step Verification → Get Started
   - Potvrď cez telefón

3. **Vytvor App Password:**
   - Security → 2-Step Verification → App passwords
   - Vyber "Mail" a "Other (Custom name)"
   - Pomenuj: "MONTIO System"
   - Klikni "Generate"

4. **Skopíruj 16-znakový kód** (bez medzier):
   ```
   Príklad: abcd efgh ijkl mnop
   Použij: abcdefghijklmnop
   ```

---

## ⚙️ Krok 3: Konfigurácia ENV_FILE na Hostcreatore

### Aktuálny ENV_FILE obsah:

```env
PORT=3001
DB_HOST=sql14.hostcreators.sk
DB_PORT=3319
DB_USER=u46895_montio
DB_PASSWORD=x52D_Z-lb!UX6n5
DB_NAME=d46895_montio
JWT_SECRET=montio-super-secret-jwt-key-2026
JWT_EXPIRES_IN=7d
NODE_ENV=production
ALLOWED_ORIGINS=https://montio.tsdigital.sk,https://www.montio.tsdigital.sk
```

### Pridaj tieto 4 riadky na koniec:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=tvoj-email@gmail.com
SMTP_PASSWORD=tvoj-app-password-bez-medzier
```

### Kompletný ENV_FILE s SMTP:

```env
PORT=3001
DB_HOST=sql14.hostcreators.sk
DB_PORT=3319
DB_USER=u46895_montio
DB_PASSWORD=x52D_Z-lb!UX6n5
DB_NAME=d46895_montio
JWT_SECRET=montio-super-secret-jwt-key-2026
JWT_EXPIRES_IN=7d
NODE_ENV=production
ALLOWED_ORIGINS=https://montio.tsdigital.sk,https://www.montio.tsdigital.sk
SMTP_HOST=smtp.hostcreators.sk
SMTP_PORT=465
SMTP_USER=montio@tsdigital.sk
SMTP_PASSWORD=JY-E7I0!_8!uo9qi
```

**✅ MONTIO Production - Configured with Hostcreator SMTP**

---

## 🔧 Krok 4: Aplikovanie zmien na Hostcreatore

1. **Prihlás sa do Hostcreator WebAdmin**
2. **Choď do Node.js Manageru** (alebo kde máš ENV_FILE)
3. **Otvor ENV_FILE premennú**
4. **Pridaj 4 SMTP riadky** (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD)
5. **Ulož zmeny**
6. **Reštartuj backend** (ak je potrebné)

---

## ✅ Krok 5: Testovanie

### Test v aplikácii:

1. **Prihlás sa ako Super Admin** (admin@montio.sk)
2. **Klikni "Pozvať firmu"**
3. **Zadaj testovací email** (napr. tvoj osobný email)
4. **Klikni "Poslať pozvánku"**
5. **Skontroluj email inbox** - mal by prísť invitation email

### Čo očakávať:

✅ **Email príde s:**
- Subject: "Pozvánka do MONTIO - Registrácia firmy"
- Od: "MONTIO System <noreply@montio.sk>"
- Pekný HTML dizajn s oranžovým gradientom
- Tlačidlo "Dokončiť registráciu"
- Backup link na registráciu

❌ **Ak email nepríde:**
1. Skontroluj SPAM folder
2. Skontroluj App Password (bez medzier!)
3. Skontroluj backend logy (možno SMTP error)

---

## 🐛 Troubleshooting

### Error: "Invalid login: 535 Authentication failed"
- ✅ Použil si App Password namiesto klasického hesla?
- ✅ App Password je bez medzier?
- ✅ 2FA je zapnuté na Gmail účte?

### Error: "Connection timeout"
- ✅ Port 465 je správny?
- ✅ SMTP_HOST je `smtp.gmail.com`?

### Email sa neodošle ale aplikácia funguje:
- ✅ Skontroluj backend logy
- ✅ V developmente email sa neodosiela (len loguje)
- ✅ `NODE_ENV=production` musí byť nastavené!

---

## 📚 Alternatívne SMTP servery

### SendGrid:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=465
SMTP_USER=apikey
SMTP_PASSWORD=tvoj-sendgrid-api-key
```

### Mailgun:
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=465
SMTP_USER=postmaster@tvoja-domena.mailgun.org
SMTP_PASSWORD=tvoj-mailgun-password
```

### Hostcreator SMTP (používané v MONTIO):
```env
SMTP_HOST=smtp.hostcreators.sk
SMTP_PORT=465
SMTP_USER=montio@tsdigital.sk
SMTP_PASSWORD=tvoje-heslo
```

### Vlastný SMTP server:
```env
SMTP_HOST=mail.tvoja-domena.sk
SMTP_PORT=465
SMTP_USER=noreply@tvoja-domena.sk
SMTP_PASSWORD=tvoje-heslo
```

---

## 🎨 Email Template Preview

Email ktorý dostane majiteľ firmy:

```
┌────────────────────────────────────┐
│  🔧 MONTIO                         │  ← Orange gradient
├────────────────────────────────────┤
│  Vitajte v MONTIO!                 │
│                                    │
│  Boli ste pozvaní do systému       │
│  MONTIO pre správu montážnych      │
│  firiem.                           │
│                                    │
│  [Dokončiť registráciu]            │  ← Big orange button
│                                    │
│  Alternatívny link:                │
│  https://montio.tsdigital.sk/...   │
├────────────────────────────────────┤
│  Vytvorené s ❤️ tímom TSDigital   │
└────────────────────────────────────┘
```

---

## ✨ Development vs Production

### Development (localhost):
- ❌ Email sa **NEODOSIELA**
- ✅ Len sa **loguje do konzoly**
- ✅ Modal zobrazí link na manuálne kopírovanie

### Production (montio.tsdigital.sk):
- ✅ Email sa **ODOSIELA** cez SMTP
- ✅ Modal zobrazí link ako backup
- ✅ Majiteľ dostane email do inboxu

---

**Pripravené!** Keď budeš mať SMTP údaje, daj mi vedieť a ukážem ti presný ENV_FILE format. 🚀
