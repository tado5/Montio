# Otázka pre Hostcreator Support

## 📧 Email/Ticket na Support:

---

**Predmet:** Podpora Node.js runtime pre webovú aplikáciu

**Text:**

Dobrý deň,

mám u vás webhostingový balík a potrebujem spustiť **Node.js backend aplikáciu** (Express.js server) pre moju webovú aplikáciu.

**Moja situácia:**
- Frontend (React) už funguje a je nasadený cez GIT webhook
- Databáza (MariaDB) je vytvorená a funguje
- Backend (Node.js/Express) potrebujem spustiť ako **trvale bežiacu aplikáciu**

**Technické požiadavky:**
- Node.js verzia: 18.x alebo vyššia
- Backend musí bežať **nepretržite** (nie len ako jednorazový skript)
- Počúvať na porte (napr. 3001)
- Spracovávať API requesty z frontendu
- Prístup k environment variables (.env súbor)

**Moje otázky:**
1. **Podporujete Node.js runtime** pre bežiaci server (nie len Bash skripty)?
2. Ak áno, **ako ho mám nastaviť**? (cesta k dokumentácii alebo návodu)
3. Je k dispozícii **Node.js Manager** alebo **Application Manager**?
4. Kde v administrácii nájdem tieto nastavenia?
5. Aké **porty** môžem použiť pre backend server?
6. Ako nastavím **proxy/reverse proxy** z frontendu na backend? (napr. `/api` requesty)

**Alternatíva:**
Ak Node.js nie je podporovaný, môžem prepísať backend na **PHP** (FastCGI/FPM). Podporujete:
- PHP 8.x
- Composer
- MySQL/MariaDB pripojenie
- JWT autentifikáciu

**Doména:** montio.tsdigital.sk
**Databáza:** d46895_montio

Ďakujem za odpoveď a pomoc!

S pozdravom,
[Tvoje meno]

---

## 🇬🇧 English Version (ak support preferuje angličtinu):

**Subject:** Node.js runtime support for web application

**Text:**

Hello,

I have a web hosting plan with you and need to run a **Node.js backend application** (Express.js server) for my web application.

**My situation:**
- Frontend (React) is already deployed via GIT webhook
- Database (MariaDB) is created and working
- Backend (Node.js/Express) needs to run as a **persistent application**

**Technical requirements:**
- Node.js version: 18.x or higher
- Backend must run **continuously** (not just one-time script)
- Listen on a port (e.g., 3001)
- Process API requests from frontend
- Access to environment variables (.env file)

**My questions:**
1. Do you **support Node.js runtime** for running servers (not just Bash scripts)?
2. If yes, **how do I set it up**? (link to documentation or guide)
3. Is there a **Node.js Manager** or **Application Manager** available?
4. Where in the admin panel can I find these settings?
5. What **ports** can I use for the backend server?
6. How do I set up **proxy/reverse proxy** from frontend to backend? (e.g., `/api` requests)

**Alternative:**
If Node.js is not supported, I can rewrite the backend in **PHP** (FastCGI/FPM). Do you support:
- PHP 8.x
- Composer
- MySQL/MariaDB connection
- JWT authentication

**Domain:** montio.tsdigital.sk
**Database:** d46895_montio

Thank you for your help!

Best regards,
[Your name]

---

## 💡 Prečo to potrebuješ (pre tvoje pochopenie):

### Node.js je potrebný lebo:

1. **Backend je server aplikácia:**
   - Musí bežať nepretržite (24/7)
   - Počúva na HTTP requesty
   - Spracováva prihlásenia, registrácie, API calls
   - Komunikuje s databázou

2. **Nie je to statický súbor:**
   - Frontend (HTML/JS) = stačí webhostingový priestor ✅
   - Backend (Node.js server) = potrebuje runtime environment ❌

3. **Express.js framework:**
   - Náš backend používa Express.js
   - Express = Node.js framework pre API servery
   - Musí bežať v Node.js prostredí

4. **Bez backendu:**
   - Frontend vidíš ✅
   - Login nebude fungovať ❌
   - API calls zlyhajú ❌
   - Žiadna funkcionalita aplikácie ❌

### Prečo sa pýtaš na PHP ako alternatívu:

- PHP je **všade** (každý webhostingový provider má PHP)
- Dokáže **rovnaké veci** ako Node.js backend
- Ak Hostcreator nemá Node.js → prepíšeme na PHP
- Aplikácia bude fungovať identicky (user neuvidí rozdiel)

---

## 📌 Čo očakávať od odpovede:

### ✅ Dobrá odpoveď (Node.js je podporovaný):
- Link na dokumentáciu
- Návod ako nastaviť
- Možno majú "Application Manager" alebo "Node.js Manager"

### ⚠️ Zlá odpoveď (Node.js NIE JE podporovaný):
- "Nepodporujeme Node.js"
- "Len PHP, Python, ..."
- → Prepíšeme backend na PHP (nie je problém!)

---

## 🎯 Čo urobiť s odpoveďou:

**Ak povedia ÁNO (Node.js je podporovaný):**
1. Pošli mi ich návod/dokumentáciu
2. Nastavíme backend podľa ich inštrukcií
3. Aplikácia bude fungovať!

**Ak povedia NIE (Node.js NIE JE podporovaný):**
1. Daj mi vedieť
2. Prepíšem backend na PHP (1-2 hodiny práce)
3. Aplikácia bude fungovať!

**V oboch prípadoch - problém vyriešime!** 💪
