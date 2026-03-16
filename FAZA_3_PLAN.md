# FÁZA 3: FIRMA ONBOARDING WIZARD - Detailný Plán

**Dátum začiatku:** 2026-03-16
**Status:** Pripravené na implementáciu
**Estimate:** 10-15 hodín práce

---

## 📋 Prehľad

### Cieľ
Umožniť majiteľom firiem dokončiť registráciu po prijatí invite linku od Super Admina.

### Workflow
1. Super Admin vytvorí pozvánku → email s `https://montio.sk/register/{inviteToken}`
2. Majiteľ klikne na link → wizard sa načíta
3. Prejde 6 krokov → vyplní všetky údaje
4. Po dokončení → firma sa aktivuje (`status: 'active'`)
5. Automatické prihlásenie ako `companyadmin`

---

## 🏗️ BACKEND - Implementácia

### Krok 1: Nové endpointy

#### 1.1 GET /api/invites/:token - Validácia tokenu

**Účel:** Overiť či je invite token platný a získať základné info.

**Request:**
```javascript
GET /api/invites/test-invite-token-12345
```

**Response (success):**
```json
{
  "valid": true,
  "email": "firma@example.com",
  "companyId": "uuid-here",
  "companyName": null,
  "status": "pending"
}
```

**Response (error):**
```json
{
  "valid": false,
  "error": "Token invalid, expired, or already used"
}
```

**Implementácia:**
```javascript
// backend/routes/onboarding.js
router.get('/invites/:token', async (req, res) => {
  const { token } = req.params

  const [companies] = await pool.query(
    'SELECT public_id, email, name, status FROM companies WHERE invite_token = ?',
    [token]
  )

  if (companies.length === 0) {
    return res.status(404).json({ valid: false, error: 'Token not found' })
  }

  const company = companies[0]

  if (company.status !== 'pending') {
    return res.status(400).json({ valid: false, error: 'Token already used' })
  }

  res.json({
    valid: true,
    email: company.email,
    companyId: company.public_id,
    companyName: company.name,
    status: company.status
  })
})
```

---

#### 1.2 POST /api/onboarding/step1 - Základné údaje

**Účel:** Uložiť názov, IČO, DIČ, adresu firmy.

**Request:**
```json
{
  "inviteToken": "test-invite-token-12345",
  "name": "Montáže SK s.r.o.",
  "ico": "12345678",
  "dic": "2023456789",
  "address": "Hlavná 123, 81101 Bratislava"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Základné údaje uložené"
}
```

**Validácia:**
- `name` - required, min 3 znaky
- `ico` - required, 8 číslic (slovenské IČO)
- `dic` - optional, 10 číslic
- `address` - required, min 10 znakov

**Implementácia:**
```javascript
router.post('/onboarding/step1', async (req, res) => {
  const { inviteToken, name, ico, dic, address } = req.body

  // Validácia
  if (!name || name.length < 3) {
    return res.status(400).json({ error: 'Názov musí mať min 3 znaky' })
  }

  if (!ico || !/^\d{8}$/.test(ico)) {
    return res.status(400).json({ error: 'IČO musí mať 8 číslic' })
  }

  if (dic && !/^\d{10}$/.test(dic)) {
    return res.status(400).json({ error: 'DIČ musí mať 10 číslic' })
  }

  // Find company by token
  const [companies] = await pool.query(
    'SELECT id FROM companies WHERE invite_token = ? AND status = ?',
    [inviteToken, 'pending']
  )

  if (companies.length === 0) {
    return res.status(404).json({ error: 'Invalid token' })
  }

  const companyId = companies[0].id

  // Update company
  await pool.query(
    'UPDATE companies SET name = ?, ico = ?, dic = ?, address = ? WHERE id = ?',
    [name, ico, dic, address, companyId]
  )

  res.json({ success: true, message: 'Základné údaje uložené' })
})
```

---

#### 1.3 POST /api/onboarding/step2 - Logo + Fakturačné údaje

**Účel:** Nahrať logo firmy a uložiť fakturačné údaje.

**Request (multipart/form-data):**
```
inviteToken: "test-invite-token-12345"
logo: [FILE]
billingData: {
  "iban": "SK1234567890",
  "swift": "SWIFT123",
  "variableSymbol": "VS-{YYYY}-{###}",
  "invoiceDueDays": 14,
  "invoiceNote": "Ďakujeme za Váš nákup"
}
```

**Response:**
```json
{
  "success": true,
  "logoUrl": "/uploads/logos/uuid-filename.jpg"
}
```

**Implementácia (multer + sharp):**
```javascript
const multer = require('multer')
const sharp = require('sharp')
const path = require('path')

// Multer config
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/svg+xml']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'))
    }
  }
})

router.post('/onboarding/step2', upload.single('logo'), async (req, res) => {
  const { inviteToken, billingData } = req.body
  const logoFile = req.file

  // Find company
  const [companies] = await pool.query(
    'SELECT id FROM companies WHERE invite_token = ? AND status = ?',
    [inviteToken, 'pending']
  )

  if (companies.length === 0) {
    return res.status(404).json({ error: 'Invalid token' })
  }

  const companyId = companies[0].id
  let logoUrl = null

  // Process logo if uploaded
  if (logoFile) {
    const filename = `${Date.now()}-${companyId}.jpg`
    const filepath = path.join(__dirname, '../../uploads/logos', filename)

    // Resize and optimize image
    await sharp(logoFile.buffer)
      .resize(200, 200, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .jpeg({ quality: 90 })
      .toFile(filepath)

    logoUrl = `/uploads/logos/${filename}`
  }

  // Update company
  await pool.query(
    'UPDATE companies SET logo_url = ?, billing_data = ? WHERE id = ?',
    [logoUrl, JSON.stringify(billingData), companyId]
  )

  res.json({ success: true, logoUrl })
})
```

---

#### 1.4 POST /api/onboarding/step3 - Typy montáží

**Účel:** Uložiť typy montáží a ich checklists.

**Request:**
```json
{
  "inviteToken": "test-invite-token-12345",
  "orderTypes": [
    {
      "name": "Klimatizácia - inštalácia",
      "description": "Inštalácia klimatizačnej jednotky",
      "checklist": [
        { "item": "Obhliadka miesta", "required": true },
        { "item": "Montáž vnútornej jednotky", "required": true },
        { "item": "Montáž vonkajšej jednotky", "required": true },
        { "item": "Pripojenie medených potrubí", "required": true },
        { "item": "Testovanie funkčnosti", "required": true }
      ]
    },
    {
      "name": "Klimatizácia - servis",
      "description": "Pravidelný servis klimatizácie",
      "checklist": [
        { "item": "Kontrola filtrov", "required": true },
        { "item": "Čistenie vnútornej jednotky", "required": true },
        { "item": "Doplnenie chladiva", "required": false },
        { "item": "Test výkonu", "required": true }
      ]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "orderTypesCount": 2
}
```

**Implementácia:**
```javascript
router.post('/onboarding/step3', async (req, res) => {
  const { inviteToken, orderTypes } = req.body

  // Validácia
  if (!orderTypes || orderTypes.length === 0) {
    return res.status(400).json({ error: 'Musíte pridať aspoň 1 typ montáže' })
  }

  if (orderTypes.length > 10) {
    return res.status(400).json({ error: 'Maximálne 10 typov montáží' })
  }

  // Find company
  const [companies] = await pool.query(
    'SELECT id FROM companies WHERE invite_token = ? AND status = ?',
    [inviteToken, 'pending']
  )

  if (companies.length === 0) {
    return res.status(404).json({ error: 'Invalid token' })
  }

  const companyId = companies[0].id

  // Insert order types
  for (const orderType of orderTypes) {
    await pool.query(
      'INSERT INTO order_types (company_id, name, description, default_checklist) VALUES (?, ?, ?, ?)',
      [companyId, orderType.name, orderType.description || '', JSON.stringify(orderType.checklist)]
    )
  }

  res.json({ success: true, orderTypesCount: orderTypes.length })
})
```

---

#### 1.5 POST /api/onboarding/complete - Dokončenie

**Účel:** Aktivovať firmu a vytvoriť company admin účet.

**Request:**
```json
{
  "inviteToken": "test-invite-token-12345",
  "password": "securePassword123",
  "firstName": "Ján",
  "lastName": "Novák"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 123,
    "email": "firma@example.com",
    "role": "companyadmin",
    "companyId": "uuid-here"
  },
  "token": "jwt-token-here"
}
```

**Implementácia:**
```javascript
router.post('/onboarding/complete', async (req, res) => {
  const { inviteToken, password, firstName, lastName } = req.body

  // Validácia hesla
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Heslo musí mať min 8 znakov' })
  }

  // Find company
  const [companies] = await pool.query(
    'SELECT id, public_id, email, name FROM companies WHERE invite_token = ? AND status = ?',
    [inviteToken, 'pending']
  )

  if (companies.length === 0) {
    return res.status(404).json({ error: 'Invalid token' })
  }

  const company = companies[0]

  // Check if company is complete (has name, ico, etc.)
  if (!company.name) {
    return res.status(400).json({ error: 'Complete all steps first' })
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create user
  const [result] = await pool.query(
    'INSERT INTO users (email, password_hash, role, company_id, theme) VALUES (?, ?, ?, ?, ?)',
    [company.email, hashedPassword, 'companyadmin', company.id, 'light']
  )

  const userId = result.insertId

  // Activate company
  await pool.query(
    'UPDATE companies SET status = ? WHERE id = ?',
    ['active', company.id]
  )

  // Activity log
  await pool.query(
    'INSERT INTO activity_logs (user_id, company_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, company.id, 'company.activated', 'company', company.id, JSON.stringify({ name: company.name })]
  )

  // Generate JWT token
  const token = jwt.sign(
    { userId, email: company.email, role: 'companyadmin', companyId: company.public_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )

  res.json({
    success: true,
    user: {
      id: userId,
      email: company.email,
      role: 'companyadmin',
      companyId: company.public_id,
      firstName,
      lastName
    },
    token
  })
})
```

---

### Krok 2: Vytvorenie routes súboru

**Vytvorte:** `backend/routes/onboarding.js`

```javascript
const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// ... všetky endpointy vyššie ...

module.exports = router
```

**Pridajte do:** `backend/server.js`

```javascript
const onboardingRoutes = require('./routes/onboarding')
app.use('/api', onboardingRoutes)
```

---

### Krok 3: Uploads priečinok

```bash
# Vytvorte uploads priečinok
mkdir -p backend/uploads/logos

# Pridajte do .gitignore
echo "uploads/" >> backend/.gitignore
```

**Serve statické súbory v server.js:**

```javascript
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
```

---

## 🎨 FRONTEND - Implementácia

### Krok 1: Nové route

**Pridajte do:** `frontend/src/App.jsx`

```javascript
import OnboardingWizard from './pages/OnboardingWizard'

// V routes
<Route path="/register/:inviteToken" element={<OnboardingWizard />} />
```

---

### Krok 2: Wizard komponenty

#### 2.1 Main Wizard Page

**Vytvorte:** `frontend/src/pages/OnboardingWizard.jsx`

```javascript
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import StepProgress from '../components/onboarding/StepProgress'
import Step1BasicInfo from '../components/onboarding/Step1BasicInfo'
import Step2LogoBilling from '../components/onboarding/Step2LogoBilling'
import Step3OrderTypes from '../components/onboarding/Step3OrderTypes'
import Step4Preview from '../components/onboarding/Step4Preview'
import Step5Complete from '../components/onboarding/Step5Complete'

export default function OnboardingWizard() {
  const { inviteToken } = useParams()
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [inviteData, setInviteData] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    ico: '',
    dic: '',
    address: '',
    logo: null,
    billingData: {
      iban: '',
      swift: '',
      variableSymbol: 'VS-{YYYY}-{###}',
      invoiceDueDays: 14,
      invoiceNote: ''
    },
    orderTypes: [],
    password: '',
    firstName: '',
    lastName: ''
  })

  // Validate token on mount
  useEffect(() => {
    validateToken()
  }, [inviteToken])

  const validateToken = async () => {
    try {
      const response = await axios.get(`/api/invites/${inviteToken}`)

      if (!response.data.valid) {
        setError('Invite token is invalid or expired')
        return
      }

      setInviteData(response.data)
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to validate token')
      setLoading(false)
    }
  }

  const nextStep = () => setCurrentStep(prev => prev + 1)
  const prevStep = () => setCurrentStep(prev => prev - 1)

  const updateFormData = (data) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítavam...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Neplatný link</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700"
          >
            Späť na prihlásenie
          </button>
        </div>
      </div>
    )
  }

  const steps = [
    <Step1BasicInfo
      data={formData}
      updateData={updateFormData}
      nextStep={nextStep}
      inviteToken={inviteToken}
    />,
    <Step2LogoBilling
      data={formData}
      updateData={updateFormData}
      nextStep={nextStep}
      prevStep={prevStep}
      inviteToken={inviteToken}
    />,
    <Step3OrderTypes
      data={formData}
      updateData={updateFormData}
      nextStep={nextStep}
      prevStep={prevStep}
      inviteToken={inviteToken}
    />,
    <Step4Preview
      data={formData}
      updateData={updateFormData}
      nextStep={nextStep}
      prevStep={prevStep}
      goToStep={setCurrentStep}
    />,
    <Step5Complete
      data={formData}
      inviteToken={inviteToken}
    />
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-red-600 bg-clip-text text-transparent mb-2">
            Vitajte v MONTIO
          </h1>
          <p className="text-gray-600">Dokončite registráciu Vašej firmy</p>
        </div>

        <StepProgress currentStep={currentStep} totalSteps={5} />

        <div className="bg-white rounded-xl shadow-xl p-8 mt-8">
          {steps[currentStep]}
        </div>
      </div>
    </div>
  )
}
```

---

#### 2.2 Progress Bar Component

**Vytvorte:** `frontend/src/components/onboarding/StepProgress.jsx`

```javascript
export default function StepProgress({ currentStep, totalSteps }) {
  const percentage = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Krok {currentStep + 1} z {totalSteps}
        </span>
        <span className="text-sm font-medium text-orange-600">
          {Math.round(percentage)}%
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-red-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between mt-4">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
              ${i <= currentStep
                ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white'
                : 'bg-gray-200 text-gray-500'}`}
            >
              {i + 1}
            </div>
            <span className={`text-xs mt-1 ${i <= currentStep ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>
              {['Údaje', 'Logo', 'Typy', 'Preview', 'Hotovo'][i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

### Krok 3: Step komponenty

**TODO:** Vytvorte nasledujúce komponenty:
- `frontend/src/components/onboarding/Step1BasicInfo.jsx`
- `frontend/src/components/onboarding/Step2LogoBilling.jsx`
- `frontend/src/components/onboarding/Step3OrderTypes.jsx`
- `frontend/src/components/onboarding/Step4Preview.jsx`
- `frontend/src/components/onboarding/Step5Complete.jsx`

*(Detailná implementácia každého stepu je v samostatných sekciách nižšie)*

---

## ✅ Checklist - Implementácia

### Backend
- [ ] Vytvoriť `backend/routes/onboarding.js`
- [ ] Implementovať `GET /api/invites/:token`
- [ ] Implementovať `POST /api/onboarding/step1`
- [ ] Implementovať `POST /api/onboarding/step2` (multer + sharp)
- [ ] Implementovať `POST /api/onboarding/step3`
- [ ] Implementovať `POST /api/onboarding/complete`
- [ ] Pridať routes do `server.js`
- [ ] Vytvoriť `uploads/logos/` priečinok
- [ ] Nainštalovať `multer` a `sharp`
- [ ] Otestovať všetky endpointy (Postman)

### Frontend
- [ ] Vytvoriť `pages/OnboardingWizard.jsx`
- [ ] Vytvoriť `components/onboarding/StepProgress.jsx`
- [ ] Vytvoriť `components/onboarding/Step1BasicInfo.jsx`
- [ ] Vytvoriť `components/onboarding/Step2LogoBilling.jsx`
- [ ] Vytvoriť `components/onboarding/Step3OrderTypes.jsx`
- [ ] Vytvoriť `components/onboarding/Step4Preview.jsx`
- [ ] Vytvoriť `components/onboarding/Step5Complete.jsx`
- [ ] Vytvoriť `components/checklist/ChecklistBuilder.jsx`
- [ ] Nainštalovať `react-dropzone`, `react-dnd`
- [ ] Pridať `/register/:inviteToken` route do App.jsx
- [ ] Otestovať celý flow end-to-end

### Testing
- [ ] Test: Validácia tokenu (platný/neplatný)
- [ ] Test: Step 1 - uloženie základných údajov
- [ ] Test: Step 2 - upload loga
- [ ] Test: Step 3 - vytvorenie typov montáží
- [ ] Test: Step 4 - preview všetkých údajov
- [ ] Test: Complete - aktivácia firmy + auto-login
- [ ] Test: Kompletný flow od začiatku do konca
- [ ] Test: Error handling (chýbajúce polia, invalid data)
- [ ] Test: Back/Forward navigácia medzi krokmi

### Documentation
- [ ] Aktualizovať PLAN.md
- [ ] Aktualizovať STATUS.md
- [ ] Aktualizovať CHANGELOG.md
- [ ] Vytvoriť screenshots wizardu
- [ ] Aktualizovať README.md

---

## 🎯 Ďalšie kroky po FÁZE 3

Po dokončení onboardingu pokračujeme:

**FÁZA 4:** Dashboard + Kalendár
- KPI cards pre company admina
- FullCalendar integrácia
- Order Types Manager (CRUD)

**FÁZA 5:** Zákazky Wizard (CORE funkcia)
- 5-krokový workflow (obhliadka → ponuka → montáž → faktúra)
- PDF generovanie
- Email notifikácie

---

**Estimate času:** 10-15 hodín práce
**Priority:** High (ĎALŠÍ KROK v projekte)
**Dependencies:** FÁZA 2.7 dokončená ✅
