import express from 'express'
import pool from '../config/db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { asyncHandler } from '../utils/errorHandler.js'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Multer config - memory storage
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/svg+xml']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, SVG allowed.'))
    }
  }
})

// 1. GET /api/invites/:token - Validate invite token
router.get('/invites/:token', asyncHandler(async (req, res) => {
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
}))

// 2. POST /api/onboarding/step1 - Basic company info
router.post('/onboarding/step1', asyncHandler(async (req, res) => {
  const { inviteToken, name, ico, dic, address } = req.body

  // Validation
  if (!name || name.length < 3) {
    return res.status(400).json({ error: 'Názov musí mať min 3 znaky' })
  }

  if (!ico || !/^\d{8}$/.test(ico)) {
    return res.status(400).json({ error: 'IČO musí mať 8 číslic' })
  }

  if (dic && !/^\d{10}$/.test(dic)) {
    return res.status(400).json({ error: 'DIČ musí mať 10 číslic' })
  }

  if (!address || address.length < 10) {
    return res.status(400).json({ error: 'Adresa musí mať min 10 znakov' })
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
}))

// 3. POST /api/onboarding/step2 - Logo + Billing data
router.post('/onboarding/step2', upload.single('logo'), asyncHandler(async (req, res) => {
  const { inviteToken, billingData } = req.body
  const logoFile = req.file

  // Find company
  const [companies] = await pool.query(
    'SELECT id, public_id FROM companies WHERE invite_token = ? AND status = ?',
    [inviteToken, 'pending']
  )

  if (companies.length === 0) {
    console.error('❌ [Step2] Invalid token:', inviteToken)
    return res.status(404).json({ error: 'Invalid token' })
  }

  const company = companies[0]
  let logoUrl = null

  // Process logo if uploaded
  if (logoFile) {
    try {
      const filename = `${Date.now()}-${company.public_id}.jpg`
      const uploadsDir = path.join(__dirname, '../uploads/logos')
      const filepath = path.join(uploadsDir, filename)

      // Create directory if not exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }

      // Resize and optimize image
      await sharp(logoFile.buffer)
        .resize(200, 200, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .jpeg({ quality: 90 })
        .toFile(filepath)

      logoUrl = `/uploads/logos/${filename}`
    } catch (sharpError) {
      console.error('❌ [Step2] Sharp error:', sharpError)
      // Continue without logo rather than failing
      logoUrl = null
    }
  }

  // Parse billing data if it's a string
  const parsedBillingData = typeof billingData === 'string'
    ? JSON.parse(billingData)
    : billingData

  // Update company
  await pool.query(
    'UPDATE companies SET logo_url = ?, billing_data = ? WHERE id = ?',
    [logoUrl, JSON.stringify(parsedBillingData), company.id]
  )

  res.json({ success: true, logoUrl })
}))

// 4. POST /api/onboarding/step3 - Order types
router.post('/onboarding/step3', asyncHandler(async (req, res) => {
  const { inviteToken, orderTypes } = req.body

  // Validation
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
    if (!orderType.name || orderType.name.length < 3) {
      continue // Skip invalid entries
    }

    await pool.query(
      'INSERT INTO order_types (company_id, name, description, default_checklist) VALUES (?, ?, ?, ?)',
      [
        companyId,
        orderType.name,
        orderType.description || '',
        JSON.stringify(orderType.checklist || [])
      ]
    )
  }

  res.json({ success: true, orderTypesCount: orderTypes.length })
}))

// 5. POST /api/onboarding/complete - Activate company & create admin user
router.post('/onboarding/complete', asyncHandler(async (req, res) => {
  const { inviteToken, password, firstName, lastName } = req.body

  // Validate password
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

  // Check if company data is complete
  if (!company.name) {
    return res.status(400).json({ error: 'Complete all steps first' })
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create company admin user with full name and automatic position
  const fullName = `${firstName} ${lastName}`.trim()
  const [result] = await pool.query(
    'INSERT INTO users (email, password_hash, name, position, role, company_id, theme) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [company.email, hashedPassword, fullName, 'Správca firmy', 'companyadmin', company.id, 'light']
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
    [
      userId,
      company.id,
      'company.activated',
      'company',
      company.id,
      JSON.stringify({ name: company.name, firstName, lastName })
    ]
  )

  // Generate JWT token with BOTH company_id (internal) and companyId (public_id)
  const token = jwt.sign(
    {
      id: userId,
      userId,
      email: company.email,
      role: 'companyadmin',
      company_id: company.id,  // Internal ID for DB queries
      companyId: company.public_id  // Public ID for frontend
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )

  res.json({
    success: true,
    user: {
      id: userId,
      email: company.email,
      name: `${firstName} ${lastName}`.trim(),
      role: 'companyadmin',
      company_id: company.id,  // Internal ID for middleware
      companyId: company.public_id,  // Public ID for frontend
      companyName: company.name,
      firstName,
      lastName,
      theme: 'light'
    },
    token
  })
}))

export default router
