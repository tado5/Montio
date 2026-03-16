# MONTIO APP - Technické Poznámky

**Dátum:** 2026-03-16
**Verzia:** v1.2.0 Build #9

---

## 📁 File Upload & Storage Strategy

### Aktuálny stav (Development)

#### Implementácia:
```javascript
// Backend: backend/routes/onboarding.js

// Multer konfigurácia
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/svg+xml']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'))
    }
  }
})

// Step 2: Logo upload + processing
router.post('/onboarding/step2', upload.single('logo'), async (req, res) => {
  const filename = `${Date.now()}-${company.public_id}.jpg`
  const filepath = path.join(__dirname, '../uploads/logos', filename)

  // Resize & optimize s Sharp
  await sharp(logoFile.buffer)
    .resize(200, 200, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .jpeg({ quality: 90 })
    .toFile(filepath)

  const logoUrl = `/uploads/logos/${filename}`

  // Uloženie len URL do databázy
  await pool.query(
    'UPDATE companies SET logo_url = ? WHERE id = ?',
    [logoUrl, company.id]
  )
})

// Servovanie statických súborov
// backend/server.js
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
```

#### Štruktúra súborov:
```
backend/
  ├── uploads/
  │   └── logos/
  │       ├── 1710612345678-uuid-a1b2c3.jpg
  │       ├── 1710612345679-uuid-d4e5f6.jpg
  │       └── 1710612345680-uuid-g7h8i9.jpg
  └── routes/
      └── onboarding.js
```

#### Databázová schéma:
```sql
CREATE TABLE companies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  public_id VARCHAR(36) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,  -- Len cesta: /uploads/logos/filename.jpg
  ...
);
```

#### Výhody (Development):
- ✅ Jednoduché - žiadne externé služby
- ✅ Rýchle - lokálne súbory
- ✅ Zadarmo - žiadne náklady
- ✅ Kontrola - plná kontrola nad súbormi

#### Nevýhody (Production):
- ❌ Škálovanie - problémy pri viacerých serveroch
- ❌ Zálohy - nutné manuálne zálohovanie
- ❌ Deploy - môžu sa stratiť pri redeploy
- ❌ Priestor - obmedzený storage na serveri

---

### Produkčné riešenie (Pred spustením)

#### Odporúčaná migrácia: **DigitalOcean Spaces** alebo **AWS S3**

**DigitalOcean Spaces:**
- 💵 **Cena:** $5/mesiac (250GB storage + 1TB transfer)
- 🌐 **CDN:** Built-in CDN zadarmo
- 🔧 **API:** S3-compatible (rovnaký kód ako AWS)
- 🚀 **Jednoduchosť:** Jednoduchšia konfigurácia ako AWS

**AWS S3:**
- 💵 **Cena:** Pay-as-you-go (~$0.023/GB/mesiac)
- 🌐 **CDN:** CloudFront (extra náklady)
- 🔧 **API:** Industry standard
- 🚀 **Škálovanie:** Neobmedzené

#### Implementácia (S3/Spaces):

```bash
# Inštalácia SDK
npm install @aws-sdk/client-s3
```

```javascript
// backend/config/s3.js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'fra1', // DigitalOcean: fra1, nyc3...
  endpoint: process.env.S3_ENDPOINT, // DigitalOcean: https://fra1.digitaloceanspaces.com
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  }
})

export async function uploadToS3(buffer, filename, mimetype) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: `logos/${filename}`,
    Body: buffer,
    ContentType: mimetype,
    ACL: 'public-read'
  })

  await s3Client.send(command)

  // Vráti public URL
  return `https://${process.env.S3_BUCKET}.${process.env.S3_ENDPOINT}/logos/${filename}`
}

// Použitie v onboarding.js
import { uploadToS3 } from '../config/s3.js'

const logoUrl = await uploadToS3(
  logoFile.buffer,
  filename,
  'image/jpeg'
)
```

#### Environment variables:
```bash
# .env
AWS_REGION=fra1
S3_ENDPOINT=fra1.digitaloceanspaces.com
S3_BUCKET=montio-uploads
AWS_ACCESS_KEY=your_access_key
AWS_SECRET_KEY=your_secret_key
```

#### Migračný plán:
1. **Nastaviť bucket** na DigitalOcean/AWS
2. **Pridať environment variables**
3. **Upraviť upload funkciu** (nahradiť `toFile` za `uploadToS3`)
4. **Migrovať existujúce súbory** (upload z `backend/uploads/` na S3)
5. **Aktualizovať URL v databáze**
6. **Otestovať**
7. **Vymazať lokálne súbory**

---

### Zamietnuté alternatívy

#### ❌ BASE64 v databáze

**Prečo NIE:**
```javascript
// Originál: 100 KB súbor
// BASE64:   133 KB (+33% navíc!)

// Problém 1: Veľkosť
SELECT * FROM companies;
// 100 firiem × 133KB = 13.3 MB len na logá!

// Problém 2: Spomalenie
// DB musí načítať BASE64 string pri každom query

// Problém 3: Cache
<img src="data:image/jpeg;base64,/9j/4AAQ...">
// ❌ Browser nemôže cachovať
```

**Výhody:** Všetko na jednom mieste
**Nevýhody:** +33% veľkosť, spomalenie DB, žiadny cache, veľké backupy

#### ❌ BLOB v databáze

**Prečo NIE:**
```sql
CREATE TABLE companies (
  logo LONGBLOB  -- ❌ Zlé riešenie
);

-- Problém: Spomaľuje všetky queries
SELECT name, status FROM companies;
-- DB musí prečítať celé riadky vrátane BLOB!
```

**Výhody:** Jednoduchá integrácia
**Nevýhody:** Spomalenie DB, veľké backupy, zlý performance pri viacerých súboroch

---

## 📊 Porovnanie riešení

| Metóda | Veľkosť | Performance | Cache | Škálovanie | Cena | Odporúčanie |
|--------|---------|-------------|-------|------------|------|-------------|
| **Filesystem (dev)** | 100KB | ⭐⭐⭐ | ✅ | ❌ | Zadarmo | ✅ Development |
| **S3/Spaces (prod)** | 100KB | ⭐⭐⭐⭐⭐ | ✅ | ✅ | $5/mes | ✅ Production |
| **BASE64 v DB** | 133KB | ❌ | ❌ | ❌ | Zadarmo | ❌ Nikdy |
| **BLOB v DB** | 100KB | ❌❌ | ❌ | ❌ | Zadarmo | ❌ Nikdy |

---

## 🎯 Záver & Odporúčania

### Pre MONTIO projekt:

1. **Teraz (Development):**
   - ✅ Pokračovať s filesystémom
   - ✅ Jednoduché, funguje, rýchle

2. **Pred Produkciou:**
   - 🔜 Migrovať na DigitalOcean Spaces
   - 💰 $5/mesiac je prijateľné
   - 🚀 Škálovateľné riešenie

3. **Nikdy nepoužiť:**
   - ❌ BASE64 v databáze
   - ❌ BLOB v databáze

### Príklad reálneho dopadu:

**Filesystem/S3:**
```
// Dashboard so 100 firmami
SELECT id, name, logo_url FROM companies;
// → 100 × 200 bytes = 20 KB dát
// → 50ms načítanie
// → Obrázky cachované v browseri
```

**BASE64 v DB:**
```
// Dashboard so 100 firmami
SELECT * FROM companies;
// → 100 × 133 KB = 13.3 MB dát
// → 2-3 sekundy načítanie
// → Žiadny cache
```

---

**Poznámka:** Dokumentácia aktualizovaná 2026-03-16. Filesystem je akceptovateľné pre development. Migrácia na cloud storage je **povinná** pred spustením produkcie.

---

## 📚 Súvisiace dokumenty

- **PLAN.md** - Sekcia "Technické Riešenia & Budúce Migrácie"
- **STATUS.md** - Sekcia "Technické Poznámky"
- **SETUP.md** - Sekcia "File Upload & Storage"
- **MEMORY.md** - Auto memory pre Claude
