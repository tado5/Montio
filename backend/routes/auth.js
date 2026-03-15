import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { logActivity } from '../middleware/logger.js';

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

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email a heslo sú povinné.' });
    }

    // Nájdenie používateľa
    const [users] = await pool.query(
      'SELECT id, email, password_hash, role, company_id, theme FROM users WHERE email = ?',
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

    // Generovanie JWT tokenu
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        company_id: user.company_id
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
      { email: user.email, role: user.role },
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
        theme: user.theme || 'light'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// GET /api/auth/companies (superadmin only)
router.get('/companies', verifyToken, requireRole('superadmin'), async (req, res) => {
  try {
    const [companies] = await pool.query(
      'SELECT id, name, logo_url, ico, dic, address, status FROM companies ORDER BY created_at DESC'
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

export default router;
