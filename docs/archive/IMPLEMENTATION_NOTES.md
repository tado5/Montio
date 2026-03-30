# MONTIO - Implementation Notes

Tento súbor obsahuje detailné poznámky o implementácii jednotlivých features.

---

## 🏢 Invite System (FÁZA 2.5)

### Koncept
Super Admin **netvára firmu** priamo. Namiesto toho **posiela pozvánku** majiteľovi firmy, ktorý si všetky údaje vyplní sám cez onboarding wizard.

### Workflow

```
┌─────────────────┐
│  Super Admin    │
│  Zadá EMAIL     │
│  majiteľa       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  POST /api/companies    │
│  Body: { email }        │
└────────┬────────────────┘
         │
         ▼
┌────────────────────────────────┐
│  Backend:                      │
│  1. Validuje email             │
│  2. Skontroluje duplicity      │
│  3. Vytvorí PENDING company    │
│     - name: "Nová firma (email)"│
│     - status: "pending"        │
│     - invite_token: crypto hash│
│  4. Vygeneruje invite_link     │
│  5. (TODO) Odošle EMAIL        │
│  6. Loguje aktivitu            │
└────────┬───────────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Response:              │
│  {                      │
│    invite: {            │
│      email,             │
│      invite_token,      │
│      invite_link,       │
│      company_id         │
│    }                    │
│  }                      │
└────────┬────────────────┘
         │
         ▼
┌────────────────────────────┐
│  Frontend Modal:           │
│  ✅ "Pozvánka odoslaná"   │
│  📧 Email: majitel@...     │
│  🔗 Backup link (copy)     │
└────────┬───────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Majiteľ dostane EMAIL      │
│  (TODO: NodeMailer)         │
│  s registračným linkom:     │
│  /register?token=xxx        │
└────────┬────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  FÁZA 3:                     │
│  Onboarding Wizard (6 krokov)│
│  - Základné údaje            │
│  - Logo upload               │
│  - Fakturačné údaje          │
│  - Typy montáží + checklists │
│  - Dokončenie                │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────┐
│  Firma sa aktivuje   │
│  status: "active"    │
└──────────────────────┘
```

### Backend Implementation

#### Endpoint: POST /api/companies

**Location:** `backend/routes/companies.js`

**Request:**
```javascript
{
  "email": "majitel@firma.sk"
}
```

**Validations:**
1. Email je povinný
2. Email má validný formát (regex)
3. Email ešte neexistuje v `users` tabuľke

**Process:**
1. Generate unique token: `crypto.randomBytes(32).toString('hex')`
2. Create pending company:
   ```sql
   INSERT INTO companies (name, invite_token, status)
   VALUES ('Nová firma (email)', token, 'pending')
   ```
3. Generate invite link: `${protocol}://${host}/register?token=${token}`
4. Log activity: `company.invite`
5. (TODO) Send email via NodeMailer

**Response:**
```javascript
{
  "message": "Pozvánka odoslaná.",
  "invite": {
    "email": "majitel@firma.sk",
    "invite_token": "abc123...",
    "invite_link": "http://localhost:3000/register?token=abc123...",
    "company_id": 5
  }
}
```

**Error Responses:**
- `400` - Email je povinný
- `400` - Neplatný email formát
- `400` - Email už existuje v systéme
- `500` - Chyba servera

### Frontend Implementation

#### Component: CreateCompanyModal

**Location:** `frontend/src/components/CreateCompanyModal.jsx`

**States:**
```javascript
const [email, setEmail] = useState('')
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')
const [success, setSuccess] = useState(null)
const [copied, setCopied] = useState(false)
```

**Form:**
- Single email input field
- Submit button: "📧 Poslať pozvánku"
- Info box explaining the process

**Success Screen:**
- Confirmation message
- Email sent to: {email}
- Backup link with copy button
- "Hotovo" button to close

**Features:**
- Email validation (HTML5 + backend)
- Loading state
- Error handling
- Copy to clipboard
- Auto-refresh companies list on success

### Database Schema

#### Table: companies

```sql
CREATE TABLE `companies` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,           -- "Nová firma (email)" pri invite
  `logo_url` TEXT,                        -- NULL pri invite
  `ico` VARCHAR(20),                      -- NULL pri invite
  `dic` VARCHAR(20),                      -- NULL pri invite
  `address` TEXT,                         -- NULL pri invite
  `billing_data` JSON,                    -- NULL pri invite
  `invite_token` VARCHAR(255) UNIQUE,     -- crypto hash
  `status` ENUM('pending','active') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Pending Company Example:**
```javascript
{
  id: 5,
  name: "Nová firma (majitel@firma.sk)",
  logo_url: null,
  ico: null,
  dic: null,
  address: null,
  billing_data: null,
  invite_token: "a1b2c3d4e5f6...",
  status: "pending",
  created_at: "2026-03-15 22:30:00"
}
```

### Activity Logging

**Action:** `company.invite`

**Details:**
```javascript
{
  email: "majitel@firma.sk",
  invited_by: "admin@montio.sk"
}
```

**Query:**
```sql
INSERT INTO activity_logs
  (user_id, company_id, action, entity_type, entity_id, details, ip_address, user_agent)
VALUES
  (1, NULL, 'company.invite', 'company', 5, '{"email":"..."}', '192.168.1.1', 'Mozilla...')
```

---

## 📧 Email System (TODO - FÁZA 3)

### NodeMailer Setup

**Package:** `nodemailer`

**Install:**
```bash
cd backend
npm install nodemailer
```

**Configuration:**
```javascript
// backend/config/email.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

export default transporter;
```

**Environment Variables:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=noreply@montio.sk
SMTP_PASSWORD=...
```

### Email Template

**Subject:** `Pozvánka do MONTIO - Registrácia firmy`

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(to right, #3B82F6, #8B5CF6); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; }
    .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
    .button { background: linear-gradient(to right, #3B82F6, #8B5CF6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; display: inline-block; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏢 MONTIO</h1>
    </div>
    <div class="content">
      <h2>Vitajte v MONTIO!</h2>
      <p>Boli ste pozvaní do systému MONTIO pre správu montážnych firiem.</p>
      <p>Kliknutím na tlačidlo nižšie dokončíte registráciu svojej firmy:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="{{invite_link}}" class="button">Dokončiť registráciu</a>
      </p>
      <p style="color: #6b7280; font-size: 14px;">
        Ak tlačidlo nefunguje, skopírujte tento link do prehliadača:<br>
        {{invite_link}}
      </p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px;">
        Tento email bol odoslaný na základe pozvánky od administrátora systému MONTIO.
      </p>
    </div>
  </div>
</body>
</html>
```

### Send Email Function

**Location:** `backend/utils/sendEmail.js`

```javascript
import transporter from '../config/email.js';

export const sendInviteEmail = async (email, inviteLink) => {
  const mailOptions = {
    from: '"MONTIO" <noreply@montio.sk>',
    to: email,
    subject: 'Pozvánka do MONTIO - Registrácia firmy',
    html: `
      <!-- Email template here -->
      <a href="${inviteLink}">Dokončiť registráciu</a>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Invite email sent to:', email);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};
```

**Usage in routes/companies.js:**
```javascript
import { sendInviteEmail } from '../utils/sendEmail.js';

// After creating company
await sendInviteEmail(email, inviteLink);
```

---

## 🎨 UI Components

### Sidebar Navigation

**Location:** `frontend/src/components/Sidebar.jsx`

**Features:**
- Role-based menu items
- Active state highlighting
- Disabled items with "Soon" badge
- MONTIO logo + role label
- Fixed position, full height
- Tip box at bottom

**Menu Items by Role:**

**Super Admin:**
- 🏠 Dashboard → `/superadmin`
- 🏢 Firmy → `/superadmin`
- 📊 Analytika → `/superadmin/analytics` (disabled)
- ⚙️ Nastavenia → `/superadmin/settings` (disabled)

**Company Admin:**
- 🏠 Dashboard → `/company`
- 📅 Kalendár → `/company/calendar` (disabled)
- 📝 Zákazky → `/company/orders` (disabled)
- 👥 Zamestnanci → `/company/employees` (disabled)
- 💰 Faktúry → `/company/invoices` (disabled)
- 🔧 Typy montáží → `/company/order-types` (disabled)
- ⚙️ Nastavenia → `/company/settings` (disabled)

**Employee:**
- 🏠 Dashboard → `/employee`
- 📅 Môj kalendár → `/employee/calendar` (disabled)
- ✅ Moje úlohy → `/employee/tasks` (disabled)
- 📸 Fotky → `/employee/photos` (disabled)
- 🏖️ Voľno → `/employee/time-off` (disabled)

### User Menu

**Location:** `frontend/src/components/UserMenu.jsx`

**Features:**
- Avatar with user initials
- Role-specific gradient colors
- Dropdown on click
- Click outside to close
- Menu items: Dashboard, Profil, Nastavenia, Odhlásiť sa

**Gradient Colors:**
- Super Admin: `from-purple-500 to-pink-500`
- Company Admin: `from-green-500 to-emerald-500`
- Employee: `from-orange-500 to-amber-500`

---

## 🎯 Next Steps (FÁZA 3)

### 1. Registration Page (`/register?token=xxx`)

**Features:**
- Token validation
- Redirect if invalid/used token
- Show company email
- Link to onboarding wizard

### 2. Onboarding Wizard (6 krokov)

**Krok 1: Základné údaje**
- Názov firmy *
- IČO
- DIČ
- Adresa

**Krok 2: Logo Upload**
- File upload (drag & drop)
- Image preview
- Max size: 2MB
- Formats: JPG, PNG

**Krok 3: Fakturačné údaje**
- Fakturačný názov
- IBAN
- SWIFT/BIC
- Variabilný symbol prefix

**Krok 4: Vytvorenie účtu**
- Email (pre-filled)
- Heslo
- Potvrdenie hesla

**Krok 5: Typy montáží**
- Pridať typ montáže (názov)
- Drag & drop checklist builder
- Uložiť ako šablónu

**Krok 6: Dokončenie**
- Prehľad všetkých údajov
- Súhlas s podmienkami
- Aktivovať firmu

**After completion:**
- Company status: `pending` → `active`
- Create `companyadmin` user
- Link user to company
- Log activity: `company.activated`
- Redirect to company dashboard

---

## 📝 Testing

### Manual Testing Checklist

**Invite System:**
- [ ] Super Admin môže otvoriť modal "Pozvať firmu"
- [ ] Email validation funguje
- [ ] Duplicate email detection funguje
- [ ] Invite token sa generuje unique
- [ ] Pending company sa vytvorí v DB
- [ ] Success screen zobrazuje správne údaje
- [ ] Copy to clipboard funguje
- [ ] Companies list sa refresh-ne po success
- [ ] Activity log sa vytvorí

**UI Components:**
- [ ] Sidebar zobrazuje správne menu pre každú rolu
- [ ] Active state sa highlightuje
- [ ] User menu sa otvára/zatvára správne
- [ ] Avatar zobrazuje správne iniciály
- [ ] Gradient farby sú role-specific

---

**Last Updated:** 2026-03-15
**Version:** 2.6.1
