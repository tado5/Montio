import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { logActivity } from '../middleware/logger.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';
import upload from '../middleware/upload.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  isValidEmail,
  isStrongPassword,
  validateEmail,
  validateRequired
} from '../utils/validation.js';
import {
  ERROR_MESSAGES,
  THEME,
  FILE_UPLOAD,
  JWT_CONFIG
} from '../config/constants.js';
import { asyncHandler, handleError, safeFileOperation } from '../utils/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, invite_token } = req.body;

    if (!email || !password || !invite_token) {
      return res.status(400).json({ message: 'Všetky polia sú povinné.' });
    }

    // Kontrola invite tokenu
    const [companies] = await pool.query(
      'SELECT id, status FROM companies WHERE invite_token = ?',
      [invite_token]
    );

    if (companies.length === 0) {
      return res.status(400).json({ message: 'Neplatný registračný token.' });
    }

    const company = companies[0];

    if (company.status !== 'pending') {
      return res.status(400).json({ message: 'Tento token už bol použitý.' });
    }

    // Hash hesla
    const password_hash = await bcrypt.hash(password, 10);

    // Vytvorenie používateľa
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, role, company_id) VALUES (?, ?, ?, ?)',
      [email, password_hash, 'companyadmin', company.id]
    );

    // Aktualizácia company status
    await pool.query(
      'UPDATE companies SET status = ? WHERE id = ?',
      ['active', company.id]
    );

    res.status(201).json({
      message: 'Registrácia úspešná.',
      user_id: result.insertId
    });

  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email už existuje.' });
    }
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// POST /api/auth/login (with rate limiting)
router.post('/login', loginRateLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate inputs
  if (!email || !password) {
    return res.status(400).json({ message: 'Email a heslo sú povinné.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: ERROR_MESSAGES.INVALID_EMAIL });
  }

    // Nájdenie používateľa s employee info
    const [users] = await pool.query(
      `SELECT u.id, u.email, u.password_hash, u.role, u.company_id, u.theme, u.name, u.position, u.avatar_url,
              e.id as employee_id, e.status as employee_status, e.must_change_password
       FROM users u
       LEFT JOIN employees e ON u.id = e.user_id
       WHERE u.email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Nesprávny email alebo heslo.' });
    }

    const user = users[0];

    // Overenie hesla
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ message: 'Nesprávny email alebo heslo.' });
    }

    // Check if employee needs to change password
    if (user.role === 'employee' && user.must_change_password === 1) {
      // Generate limited token (can only change password)
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          company_id: user.company_id
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Short expiration for password change
      );

      return res.json({
        token,
        requirePasswordChange: true,
        employee_id: user.employee_id,
        message: 'Musíte zmeniť predvolené heslo.'
      });
    }

    // Check if employee is in non-allowed status (created or pending_approval)
    // Note: inactive is allowed (read-only mode), deleted should not exist in DB
    if (user.role === 'employee' &&
        (user.employee_status === 'created' || user.employee_status === 'pending_approval')) {
      return res.status(403).json({
        message: `Váš účet nie je schválený. Status: ${user.employee_status === 'created' ? 'čaká na zmenu hesla' : 'čaká na schválenie'}`
      });
    }

    // Determine if user is in read-only mode (inactive employees)
    const isReadOnly = user.role === 'employee' && user.employee_status === 'inactive';

    // Generovanie JWT tokenu
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
        isReadOnly: isReadOnly
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Log successful login
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    logActivity(
      user.id,
      'user.login',
      'user',
      user.id,
      { email: user.email, role: user.role, status: user.employee_status },
      user.company_id,
      ipAddress,
      userAgent
    ).catch(err => console.error('Login logging failed:', err));

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
        theme: user.theme || THEME.DEFAULT,
        name: user.name || null,
        position: user.position || null,
        avatar_url: user.avatar_url || null,
        employee_id: user.employee_id || null,
        employee_status: user.employee_status || null,
        isReadOnly: isReadOnly
      }
    });
}));

// GET /api/auth/companies (superadmin only)
router.get('/companies', verifyToken, requireRole('superadmin'), async (req, res) => {
  try {
    const [companies] = await pool.query(
      'SELECT id, public_id, name, logo_url, ico, dic, address, status, created_at FROM companies ORDER BY created_at DESC'
    );

    res.json(companies);

  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// PUT /api/auth/theme - Update user theme preference
router.put('/theme', verifyToken, async (req, res) => {
  try {
    const { theme } = req.body;

    if (!theme || !['light', 'dark'].includes(theme)) {
      return res.status(400).json({ message: 'Neplatná hodnota témy.' });
    }

    await pool.query(
      'UPDATE users SET theme = ? WHERE id = ?',
      [theme, req.user.id]
    );

    // Log theme change
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    logActivity(
      req.user.id,
      'user.theme_change',
      'user',
      req.user.id,
      { theme },
      req.user.company_id,
      ipAddress,
      userAgent
    ).catch(err => console.error('Theme change logging failed:', err));

    res.json({ message: 'Téma bola zmenená.', theme });

  } catch (error) {
    console.error('Update theme error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// GET /api/auth/profile - Get current user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user profile with company info if applicable
    const [users] = await pool.query(
      `SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.position,
        u.theme,
        u.created_at,
        c.name as company_name,
        c.public_id as company_public_id,
        e.phone
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      LEFT JOIN employees e ON u.id = e.user_id
      WHERE u.id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Používateľ nenájdený.' });
    }

    const profile = users[0];

    res.json({ profile });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// PUT /api/auth/profile - Update current user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Meno a email sú povinné.' });
    }

    // Check if email already exists (excluding current user)
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, userId]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email už existuje.' });
    }

    // Update user (name and email only - position is set automatically by role)
    await pool.query(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, userId]
    );

    // Update employee phone if exists
    if (phone !== undefined) {
      await pool.query(
        'UPDATE employees SET phone = ? WHERE user_id = ?',
        [phone || null, userId]
      );
    }

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      userId,
      'user.profile_update',
      'user',
      userId,
      { name, email, phone },
      req.user.company_id,
      ipAddress,
      userAgent
    );

    res.json({
      message: 'Profil aktualizovaný.',
      profile: { name, email, phone }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// PUT /api/auth/profile/password - Change password
router.put('/profile/password', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Aktuálne a nové heslo sú povinné.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Nové heslo musí mať aspoň 6 znakov.' });
    }

    // Get current password hash
    const [users] = await pool.query(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Používateľ nenájdený.' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, users[0].password_hash);

    if (!isValid) {
      return res.status(401).json({ message: 'Nesprávne aktuálne heslo.' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, userId]
    );

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      userId,
      'user.password_change',
      'user',
      userId,
      { success: true },
      req.user.company_id,
      ipAddress,
      userAgent
    );

    res.json({ message: 'Heslo bolo zmenené.' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// PUT /api/auth/avatar - Upload user avatar
router.put('/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'Súbor s avatárom je povinný.' });
    }

    const uploadsDir = path.join(__dirname, '../uploads/avatars');

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Resize and optimize with sharp
    const filename = `avatar-${userId}-${Date.now()}.webp`;
    const outputPath = path.join(uploadsDir, filename);

    await sharp(req.file.path)
      .resize(256, 256, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 85 })
      .toFile(outputPath);

    // Delete original uploaded file
    fs.unlinkSync(req.file.path);

    // Get old avatar to delete
    const [users] = await pool.query(
      'SELECT avatar_url FROM users WHERE id = ?',
      [userId]
    );

    if (users.length > 0 && users[0].avatar_url) {
      const oldAvatarPath = path.join(__dirname, '..', users[0].avatar_url);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Update user avatar_url
    const avatarUrl = `/uploads/avatars/${filename}`;
    await pool.query(
      'UPDATE users SET avatar_url = ? WHERE id = ?',
      [avatarUrl, userId]
    );

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      userId,
      'user.avatar_update',
      'user',
      userId,
      { avatarUrl },
      req.user.company_id,
      ipAddress,
      userAgent
    );

    res.json({
      message: 'Avatar aktualizovaný.',
      avatarUrl
    });

  } catch (error) {
    console.error('Avatar upload error:', error);

    // Clean up file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ message: 'Chyba pri nahrávaní avatara.' });
  }
});

// DELETE /api/auth/avatar - Delete user avatar
router.delete('/avatar', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current avatar
    const [users] = await pool.query(
      'SELECT avatar_url FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Používateľ nenájdený.' });
    }

    if (users[0].avatar_url) {
      const avatarPath = path.join(__dirname, '..', users[0].avatar_url);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    // Remove avatar_url from database
    await pool.query(
      'UPDATE users SET avatar_url = NULL WHERE id = ?',
      [userId]
    );

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      userId,
      'user.avatar_delete',
      'user',
      userId,
      {},
      req.user.company_id,
      ipAddress,
      userAgent
    );

    res.json({ message: 'Avatar vymazaný.' });

  } catch (error) {
    console.error('Avatar delete error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

export default router;
