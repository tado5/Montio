# Komunikácia s Hostcreator Support - Kompletná História

## 📋 Prehľad

**Téma:** Node.js Backend Runtime Pre MONTIO APP
**Doména:** montio.tsdigital.sk
**Účel:** Spustiť Express.js backend na serveri

---

## 📅 Časová Os Komunikácie

### 🟡 FÁZA 1: Prvotná Otázka (Pred pokrokom)

**Status:** Nevedeli sme či Node.js podporujú

#### 📧 Naša otázka na support:

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
Ak Node.js nie je podporovaný, môžem prepísať backend na **PHP** (FastCGI/FPM).

**Doména:** montio.tsdigital.sk
**Databáza:** d46895_montio

Ďakujem za odpoveď a pomoc!

S pozdravom

---

#### 📨 Ich prvá odpoveď (zhrnutie):

- ✅ Experimentujú s Next.js a GIT Deploy
- ✅ Express.js "nebude problém"
- ✅ Chcú prediskutovať technické detaily
- ✅ Pýtali sa na:
  - Express.js len pod `/api` vs. celá aplikácia?
  - Port 3001 - je to nutné?

---

#### 📧 Naša odpoveď na ich prvé otázky:

**Odpovede:**

**1. Express.js pod `/api` vs. celá aplikácia cez express**

✅ **Áno, `/api` endpoint je bežný moderný prístup** - JAMstack:
- Frontend (React): Statický obsah z GIT
- Backend (Express.js): `/api/*` endpointy (REST API)

**Workflow:**
- Používateľ otvorí `https://montio.tsdigital.sk` → statický HTML (React)
- Frontend pošle request na `/api/auth/login` → Express.js ho spracuje
- Backend odpovie JSON → Frontend zobrazí výsledok

**2. Port 3001 vs. 3000**

✅ **Port 3001 sme použili len kvôli lokálnemu vývoju**

Pre produkciu/kontajner: **PORT 3000 je úplne OK!**
- Je to konfigurovateľné cez environment variable
- V Docker kontajneri (kde nič iné nebeží) je 3000 ideálny

---

### 🟢 FÁZA 2: Pokrok! (2026-03-17)

**Status:** ✅ Dokážu spúšťať Express.js!

#### 📧 EMAIL 1 - Prvé otázky (včera):

Dobrý deň,

Trošku som si už nejaké veci poskúšal a pochopil, zatiaľ mám tieto otázky:

1. písali ste, že express.js má bežať iba pod URI /api , to znamená, že všetko ostatné má byť statický obsah? Takto sa to bežne používa? Alebo to môže byť aj s tou statikou v GITe a express.js sa spustí z hlavného priečinka?

2. pri spúšťaní kontajnera robíme docker proxy portov ktorý bude proxovaný na port, ktorý máte nastavený v server.js, čo je 3001 Je nejaký dôvod na to, aby ste si tento port menili zo štandardného portu 3000? Nie je to problém, prirobíme tam možnosť dopísania aj portu, ktorý pobeží vo vnútri kontajnera, len chcem znova vedieť, či je to bežné takto meniť. Ten port nemusíte meniť, lebo v tom kontajnery nepobeží samozrejme nič iné.

Telefón priamo na mňa je: 0903 904 677 môžete volať kedykoľvek.

S pozdravom

---

#### 📧 EMAIL 2 - Veľký pokrok! (dnes):

Dobrý deň,

Tak ozývam sa znova, včera aj dnes sme na tom intenzívne pracovali. **Dokážeme už spúšťať aj express.js.** Ten proces postupného spúšťania nájdete v editácii GIT aplikácie: https://www.hostcreators.sk/admin/host/domain/46895/webhook/3193/edit

Nastavil som tam aj port 3001, ktorý ste spomínali, viete si to tam potom v tom deploy porte pozrieť/zmeniť.

Mám ale otázky:

1. teraz som niekoľkokrát spustil ten build, nerobí Vám to nejaké problémy? Môžem to robiť?
2. obyčajne sa spúšťa aj npm run build, ale vy tento script v package.json nemáte nadefinovaný
3. node_modules adresár sa Vám sťahuje z git-u, ale nemusí, na to je príkaz npm install
4. momentálne máte aplikáciu deploynutú do adresára /tsdigital.sk/sub/montio/current/current/ čiže zdvojený current - predpokladám pozostatok z predchádzajúcich pokusov. Môžem Vám to dať do poriadku? Ak niečo zmažem, tak sa to obnoví z GIT-u?

S pozdravom

---

## 📧 NAŠA PRIPRAVENÁ ODPOVEĎ (na poslanie):

```
Dobrý deň,

Najprv veľká vďaka za intenzívnu prácu a trpezlivosť! Vidím, že sme sa posunuli
ďaleko - Express.js už funguje, to je skvelá správa! 🎉

K Vašim otázkam z prvého emailu:

PORT 3001 vs 3000:
Áno, môžete to pokojne dať na 3000. Ten 3001 som používal len preto, že som
lokálne mal frontend na porte 3000 a backend som si dal na 3001, aby sa to
neprekrývalo. V kontajneri je to úplne jedno, takže pokojne štandardný 3000.
Nie je to žiadna špeciálna požiadavka.

Architektúra /api:
Presne tak - Express.js beží len pod /api, všetko ostatné je statický React
frontend. Toto je celkom bežný prístup (volá sa to JAMstack), hlavne pri
React aplikáciách. Statika môže byť z GIT-u ako teraz, a Express.js sa
spúšťa z hlavného priečinka - presne ako to máte nastavené.

K dnešným otázkam:

Build testy:
Áno, môžete pokojne spúšťať build koľkokrát treba, nemá to žiadny dopad.
Neriskujem tím nič.

npm run build:
Ten script tam JE, len je v frontend/package.json (nie v root-e). Projekt
má totiž 2 časti:
  - frontend/ (React aplikácia)
  - backend/ (Express.js API)

Správny postup je:
  cd frontend
  npm install
  npm run build

Vytvorí to frontend/dist/ s buildnutou aplikáciou.

node_modules:
Máte pravdu, node_modules by tam nemali byť! Sú v .gitignore, ale možno sa
tam niečo dostalo omylom na začiatku. Správny postup je:
  cd frontend && npm install
  cd backend && npm install

Duplicitný current/current/:
Áno, môžete to pokojne dať do poriadku. Všetko sa obnoví z GIT-u, tam sú
vždy najnovšie súbory. Správna cesta by mala byť
/tsdigital.sk/sub/montio/current/

Keď to celé zhrniem, deploy proces je:
1. cd frontend && npm install && npm run build
2. Obsah frontend/dist/ → public_html (statické súbory)
3. cd backend && npm install
4. node backend/server.js (alebo npm start)

Ak by bolo treba niečo upresniť alebo vysvetliť naživo, pokojne volajte.
Som rád, že sa to posúva dopredu!

Ďakujem za ochotu :) ... a ešte raz kľudne sa hrajte s mojou aplikáciou
keď vám to pomôže rozbehnúť proces. Všetko mám zálohované.. všetko mám
na gite a pre mňa je to len aplikácia kde sa učím pracovať s Claude Code
a vybudovať nejakú appku :)

S pozdravom a ešte raz vďaka za prácu
```

---

## 📊 Aktuálny Status

### ✅ Čo funguje:
- Frontend (React) - deploynnutý na montio.tsdigital.sk
- Databáza (MariaDB) - funkčná lokálne aj na serveri
- GitHub Actions CI/CD - automatický build a deploy do `production` branch
- **Express.js DOKÁŽU SPUSTIŤ** ⭐️

### 🔧 Čo treba dorobiť:
- Vyčistiť duplicitný `current/current/` priečinok
- Nastaviť správny deploy workflow:
  - `cd frontend && npm install && npm run build`
  - `cd backend && npm install`
  - `node backend/server.js`
- Odstrániť `node_modules` z gitu (už v `.gitignore`)
- Finalizovať port (3000 alebo 3001)

### 🎯 Ďalšie kroky:
1. ✅ Poslať pripravenú odpoveď na support
2. ⏳ Počkať na ich finálne nastavenie
3. ⏳ Otestovať Express.js na serveri
4. ⏳ Aplikácia bude LIVE! 🚀

---

## 🔑 Technické Info

**Projekt štruktúra:**
```
/montio/
├── frontend/           (React app)
│   ├── package.json    (má "build" script)
│   ├── src/
│   └── dist/           (build output → public_html)
├── backend/            (Express.js API)
│   ├── package.json    (má "start" script)
│   ├── server.js       (port 3001, ale môže byť 3000)
│   ├── routes/
│   └── config/
└── .gitignore          (node_modules už tam je)
```

**Backend server.js:**
```javascript
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 MONTIO Backend running on http://localhost:${PORT}`);
});
```

**Frontend package.json:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**Backend package.json:**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  }
}
```

---

## 💭 Poznámky

### Výhody:
- ✅ Hostcreator je proaktívny a spolupracuje
- ✅ Pracujú na Next.js/Node.js support (sme medzi prvými)
- ✅ Express.js nie je problém
- ✅ Docker kontajnery už majú pripravené
- ✅ Komunikácia je rýchla a technická

### Čo sa naučili:
- JAMstack architektúra (statický frontend + API backend)
- Dual package.json setup (frontend + backend)
- Express.js deployment v Docker kontajneri
- GIT webhook auto-deploy proces

---

## 📞 Kontakt

**Hostcreator Support:** 0903 904 677
**GIT Webhook Admin:** https://www.hostcreators.sk/admin/host/domain/46895/webhook/3193/edit

---

---

### 🟢 FÁZA 3: Vysvetlenie Production Branch Štruktúry (2026-03-24)

**Status:** ✅ Odpoveď odoslaná

#### 📧 EMAIL 3 - Otázka ohľadom adresárov:

Dobrý deň,

Dnes sme ešte dorábali nejaké automatizácie, takže som sa konkrétne k Vášmu buildu dostal len teraz. Urobil som teda poriadok v tých current adresároch.

Čo sa týka tých portov 3000 alebo 3001, kľudne môžete používať akýkoľvek, viete si to u nás vo WebAdmine pri node.js aplikácii nastaviť. Nechávam teda ten 3001. Keďže to ide cez docker, tak je nám to jedno aký je ten vnútorný port.

Písali ste postup, kde spomínate cd frontend a cd backend. Tieto adresáre ale v GITe nemáte. Robíme s tými istými kódmi?

---

#### 📧 NAŠA ODPOVEĎ - Vysvetlenie štruktúry:

Dobrý deň,

Aha, rozumiem problému! Máte pravdu - v **production branchi** je iná štruktúra ako som spomínal v predošlom emaile.

**Rozdiel medzi main a production branch:**

**main branch** (zdrojový kód pre vývoj):
- `frontend/` - React zdrojové súbory (src/, package.json, vite.config.js)
- `backend/` - Express.js zdrojové súbory (server.js, routes/, config/)

**production branch** (buildnutá aplikácia - pripravená na deploy):
- `/` (root) - Frontend build súbory (index.html, assets/, atď.)
- `/api/` - Backend aplikácia (server.js, routes/, config/, node_modules/)

**Správny Deploy Proces Pre Production Branch:**

GitHub Actions automaticky zbuilduje aplikáciu a pushne ju do production branchu v správnej štruktúre. Pre deploy stačí:

```bash
# 1. Backend je v /api/ adresári (NIE /backend/)
cd api
npm install  # (ak by node_modules chýbali)
node server.js  # alebo npm start

# Backend počúva na porte 3001 (nakonfigurovateľné cez PORT env variable)
```

Frontend je už buildnutý v root-e (`index.html`, `assets/`), takže nepotrebuje žiadny build proces.

**Environment Variables Pre Backend:**

Backend potrebuje `.env` súbor v `/api/` adresári:

```env
PORT=3001
DB_HOST=localhost
DB_USER=u46895_montio
DB_PASSWORD=x52D_Z-lb!UX6n5
DB_NAME=d46895_montio
JWT_SECRET=montio-super-secret-jwt-key-2026
```

**Čo Je V Production Branchi:**

```
/
├── index.html          (frontend build)
├── assets/             (CSS, JS, images)
├── .htaccess          (routing config)
├── api/               (backend aplikácia)
│   ├── server.js      (main backend file)
│   ├── package.json   (dependencies list)
│   ├── node_modules/  (dependencies)
│   ├── routes/        (API endpoints)
│   ├── config/        (DB config)
│   └── middleware/    (auth middleware)
└── README.md
```

**Zhrnutie:**

Prepáčte za zmätok - v predošlom emaile som opisoval vývojovú štruktúru (main branch).
Pre produkčný deploy používajte štruktúru z **production branch-u**, kde je backend v `/api/` adresári.

Ak potrebujete ešte niečo upresnené alebo naživo prediskutovať, pokojne volajte!

Ďakujem za trpezlivosť a prácu :)

S pozdravom

---

**Posledná aktualizácia:** 2026-03-24 07:45
**Status:** ✅ Odpoveď odoslaná, čakáme na ďalšiu reakciu
