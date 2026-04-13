import express from 'express';
import pool from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { logActivity } from '../middleware/logger.js';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer config - memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, SVG allowed.'));
    }
  }
});

// GET /api/company/settings - Get company settings (companyadmin only)
router.get('/settings', verifyToken, requireRole('companyadmin'), async (req, res) => {
  try {
    const companyId = req.user.company_id;

    // Get company data
    const [companies] = await pool.query(
      `SELECT id, public_id, name, logo_url, ico, dic, address, billing_data,
              financial_data, contact_data, invoice_settings, created_at
       FROM companies
       WHERE id = ?`,
      [companyId]
    );

    if (companies.length === 0) {
      return res.status(404).json({ message: 'Firma nenájdená.' });
    }

    const company = companies[0];

    // Parse JSON fields
    let billingData = null;
    let financialData = null;
    let contactData = null;
    let invoiceSettings = null;

    if (company.billing_data) {
      try {
        billingData = JSON.parse(company.billing_data);
      } catch (e) {
        console.error('Error parsing billing_data:', e);
      }
    }

    if (company.financial_data) {
      try {
        financialData = JSON.parse(company.financial_data);
      } catch (e) {
        console.error('Error parsing financial_data:', e);
      }
    }

    if (company.contact_data) {
      try {
        contactData = JSON.parse(company.contact_data);
      } catch (e) {
        console.error('Error parsing contact_data:', e);
      }
    }

    if (company.invoice_settings) {
      try {
        invoiceSettings = JSON.parse(company.invoice_settings);
      } catch (e) {
        console.error('Error parsing invoice_settings:', e);
      }
    }

    res.json({
      company: {
        id: company.public_id,
        name: company.name,
        ico: company.ico,
        dic: company.dic,
        address: company.address,
        logo_url: company.logo_url,
        billing: billingData,
        financial: financialData,
        contact: contactData,
        invoice_settings: invoiceSettings,
        created_at: company.created_at
      }
    });

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// PUT /api/company/settings/basic - Update basic company info (companyadmin only)
router.put('/settings/basic', verifyToken, requireRole('companyadmin'), async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const { name, ico, dic, address } = req.body;

    // Validation
    if (!name || name.length < 3) {
      return res.status(400).json({ message: 'Názov musí mať min 3 znaky.' });
    }

    if (!ico || !/^\d{8}$/.test(ico)) {
      return res.status(400).json({ message: 'IČO musí mať 8 číslic.' });
    }

    if (dic && !/^\d{10}$/.test(dic)) {
      return res.status(400).json({ message: 'DIČ musí mať 10 číslic.' });
    }

    if (!address || address.length < 10) {
      return res.status(400).json({ message: 'Adresa musí mať min 10 znakov.' });
    }

    // Get old data for logging
    const [oldData] = await pool.query(
      'SELECT name, ico, dic, address FROM companies WHERE id = ?',
      [companyId]
    );

    // Update company
    await pool.query(
      `UPDATE companies
       SET name = ?, ico = ?, dic = ?, address = ?
       WHERE id = ?`,
      [name, ico, dic, address, companyId]
    );

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      req.user.id,
      'company.settings_update',
      'company',
      companyId,
      {
        section: 'basic',
        changes: {
          old: oldData[0],
          new: { name, ico, dic, address }
        }
      },
      companyId,
      ipAddress,
      userAgent
    );

    res.json({
      message: 'Základné údaje boli aktualizované.',
      company: { name, ico, dic, address }
    });

  } catch (error) {
    console.error('Update basic settings error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// PUT /api/company/settings/logo - Update company logo (companyadmin only)
router.put('/settings/logo', verifyToken, requireRole('companyadmin'), upload.single('logo'), async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const logoFile = req.file;

    if (!logoFile) {
      return res.status(400).json({ message: 'Logo súbor je povinný.' });
    }

    // Get company public_id for filename
    const [companies] = await pool.query(
      'SELECT public_id, logo_url FROM companies WHERE id = ?',
      [companyId]
    );

    if (companies.length === 0) {
      return res.status(404).json({ message: 'Firma nenájdená.' });
    }

    const company = companies[0];
    const oldLogoUrl = company.logo_url;

    // Generate filename
    const filename = `${Date.now()}-${company.public_id}.jpg`;
    const uploadsDir = path.join(__dirname, '../uploads/logos');
    const filepath = path.join(uploadsDir, filename);

    // Create directory if not exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Process image with Sharp
    await sharp(logoFile.buffer)
      .resize(200, 200, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .jpeg({ quality: 90 })
      .toFile(filepath);

    const logoUrl = `/uploads/logos/${filename}`;

    // Update company logo
    await pool.query(
      'UPDATE companies SET logo_url = ? WHERE id = ?',
      [logoUrl, companyId]
    );

    // Delete old logo file if exists
    if (oldLogoUrl && oldLogoUrl.startsWith('/uploads/')) {
      const oldFilepath = path.join(__dirname, '..', oldLogoUrl);
      if (fs.existsSync(oldFilepath)) {
        fs.unlinkSync(oldFilepath);
      }
    }

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      req.user.id,
      'company.logo_update',
      'company',
      companyId,
      {
        old_logo: oldLogoUrl,
        new_logo: logoUrl
      },
      companyId,
      ipAddress,
      userAgent
    );

    res.json({
      message: 'Logo bolo aktualizované.',
      logo_url: logoUrl
    });

  } catch (error) {
    console.error('Update logo error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// PUT /api/company/settings/billing - Update billing info (companyadmin only)
router.put('/settings/billing', verifyToken, requireRole('companyadmin'), async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const { iban, swift, variable_symbol, due_days } = req.body;

    // Validation
    if (iban && !/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(iban.replace(/\s/g, ''))) {
      return res.status(400).json({ message: 'IBAN má neplatný formát.' });
    }

    if (swift && !/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(swift)) {
      return res.status(400).json({ message: 'SWIFT má neplatný formát.' });
    }

    if (variable_symbol && !/^\d{1,10}$/.test(variable_symbol)) {
      return res.status(400).json({ message: 'Variabilný symbol musí obsahovať 1-10 číslic.' });
    }

    if (due_days && (isNaN(due_days) || due_days < 1 || due_days > 365)) {
      return res.status(400).json({ message: 'Splatnosť musí byť 1-365 dní.' });
    }

    // Get old billing data
    const [oldData] = await pool.query(
      'SELECT billing_data FROM companies WHERE id = ?',
      [companyId]
    );

    let oldBillingData = null;
    if (oldData[0].billing_data) {
      try {
        oldBillingData = JSON.parse(oldData[0].billing_data);
      } catch (e) {
        console.error('Error parsing old billing_data:', e);
      }
    }

    // Create billing data object
    const billingData = {
      iban: iban || null,
      swift: swift || null,
      variable_symbol: variable_symbol || null,
      due_days: due_days ? parseInt(due_days) : 14
    };

    const billingDataJson = JSON.stringify(billingData);

    // Update company
    await pool.query(
      'UPDATE companies SET billing_data = ? WHERE id = ?',
      [billingDataJson, companyId]
    );

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      req.user.id,
      'company.billing_update',
      'company',
      companyId,
      {
        section: 'billing',
        changes: {
          old: oldBillingData,
          new: billingData
        }
      },
      companyId,
      ipAddress,
      userAgent
    );

    res.json({
      message: 'Fakturačné údaje boli aktualizované.',
      billing: billingData
    });

  } catch (error) {
    console.error('Update billing settings error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// PUT /api/company/settings/financial - Update financial settings (companyadmin only)
router.put('/settings/financial', verifyToken, requireRole('companyadmin'), async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const {
      vat_registered,
      vat_number,
      vat_rate,
      margin_material,
      margin_labor,
      overhead_cost
    } = req.body;

    // Validation
    if (vat_number && !/^SK\d{10}$/.test(vat_number.replace(/\s/g, ''))) {
      return res.status(400).json({ message: 'IČ DPH musí mať formát SK + 10 číslic.' });
    }

    if (vat_rate && (isNaN(vat_rate) || vat_rate < 0 || vat_rate > 100)) {
      return res.status(400).json({ message: 'DPH sadzba musí byť 0-100%.' });
    }

    if (margin_material && (isNaN(margin_material) || margin_material < 0 || margin_material > 100)) {
      return res.status(400).json({ message: 'Marža na materiál musí byť 0-100%.' });
    }

    if (margin_labor && (isNaN(margin_labor) || margin_labor < 0 || margin_labor > 100)) {
      return res.status(400).json({ message: 'Marža na prácu musí byť 0-100%.' });
    }

    if (overhead_cost && (isNaN(overhead_cost) || overhead_cost < 0 || overhead_cost > 100)) {
      return res.status(400).json({ message: 'Režijné náklady musia byť 0-100%.' });
    }

    // Get old data
    const [oldData] = await pool.query(
      'SELECT financial_data FROM companies WHERE id = ?',
      [companyId]
    );

    let oldFinancialData = null;
    if (oldData[0].financial_data) {
      try {
        oldFinancialData = JSON.parse(oldData[0].financial_data);
      } catch (e) {
        console.error('Error parsing old financial_data:', e);
      }
    }

    // Create financial data object
    const financialData = {
      vat_registered: vat_registered === true || vat_registered === 'true',
      vat_number: vat_number || null,
      vat_rate: vat_rate !== undefined && vat_rate !== null && vat_rate !== '' ? parseFloat(vat_rate) : 20,
      margin_material: margin_material !== undefined && margin_material !== null && margin_material !== '' ? parseFloat(margin_material) : 0,
      margin_labor: margin_labor !== undefined && margin_labor !== null && margin_labor !== '' ? parseFloat(margin_labor) : 0,
      overhead_cost: overhead_cost !== undefined && overhead_cost !== null && overhead_cost !== '' ? parseFloat(overhead_cost) : 0
    };

    const financialDataJson = JSON.stringify(financialData);

    // Update company
    await pool.query(
      'UPDATE companies SET financial_data = ? WHERE id = ?',
      [financialDataJson, companyId]
    );

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      req.user.id,
      'company.financial_update',
      'company',
      companyId,
      {
        section: 'financial',
        changes: {
          old: oldFinancialData,
          new: financialData
        }
      },
      companyId,
      ipAddress,
      userAgent
    );

    res.json({
      message: 'Finančné nastavenia boli aktualizované.',
      financial: financialData
    });

  } catch (error) {
    console.error('Update financial settings error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// PUT /api/company/settings/contact - Update contact info (companyadmin only)
router.put('/settings/contact', verifyToken, requireRole('companyadmin'), async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const {
      phone,
      email,
      website,
      work_hours_weekday,
      work_hours_weekend,
      weekend_work_enabled
    } = req.body;

    // Validation
    if (phone && !/^\+?[0-9\s\-\(\)]{9,20}$/.test(phone)) {
      return res.status(400).json({ message: 'Telefón má neplatný formát.' });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Email má neplatný formát.' });
    }

    if (website && !/^https?:\/\/.+/.test(website)) {
      return res.status(400).json({ message: 'Web stránka musí začínať http:// alebo https://' });
    }

    // Get old data
    const [oldData] = await pool.query(
      'SELECT contact_data FROM companies WHERE id = ?',
      [companyId]
    );

    let oldContactData = null;
    if (oldData[0].contact_data) {
      try {
        oldContactData = JSON.parse(oldData[0].contact_data);
      } catch (e) {
        console.error('Error parsing old contact_data:', e);
      }
    }

    // Create contact data object
    const contactData = {
      phone: phone || null,
      email: email || null,
      website: website || null,
      work_hours_weekday: work_hours_weekday || '8:00 - 17:00',
      work_hours_weekend: work_hours_weekend || null,
      weekend_work_enabled: weekend_work_enabled === true || weekend_work_enabled === 'true'
    };

    const contactDataJson = JSON.stringify(contactData);

    // Update company
    await pool.query(
      'UPDATE companies SET contact_data = ? WHERE id = ?',
      [contactDataJson, companyId]
    );

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      req.user.id,
      'company.contact_update',
      'company',
      companyId,
      {
        section: 'contact',
        changes: {
          old: oldContactData,
          new: contactData
        }
      },
      companyId,
      ipAddress,
      userAgent
    );

    res.json({
      message: 'Kontaktné údaje boli aktualizované.',
      contact: contactData
    });

  } catch (error) {
    console.error('Update contact settings error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// PUT /api/company/settings/invoice - Update invoice settings (companyadmin only)
router.put('/settings/invoice', verifyToken, requireRole('companyadmin'), async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const {
      footer_note,
      logo_position,
      language,
      theme_color,
      invoice_email
    } = req.body;

    // Validation
    if (logo_position && !['left', 'center', 'right'].includes(logo_position)) {
      return res.status(400).json({ message: 'Logo pozícia musí byť left, center alebo right.' });
    }

    if (language && !['sk', 'en'].includes(language)) {
      return res.status(400).json({ message: 'Jazyk musí byť sk alebo en.' });
    }

    if (invoice_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invoice_email)) {
      return res.status(400).json({ message: 'Email má neplatný formát.' });
    }

    if (theme_color && !/^#[0-9A-Fa-f]{6}$/.test(theme_color)) {
      return res.status(400).json({ message: 'Farba musí mať hex formát (#RRGGBB).' });
    }

    // Get old data
    const [oldData] = await pool.query(
      'SELECT invoice_settings FROM companies WHERE id = ?',
      [companyId]
    );

    let oldInvoiceSettings = null;
    if (oldData[0].invoice_settings) {
      try {
        oldInvoiceSettings = JSON.parse(oldData[0].invoice_settings);
      } catch (e) {
        console.error('Error parsing old invoice_settings:', e);
      }
    }

    // Create invoice settings object
    const invoiceSettings = {
      footer_note: footer_note || null,
      logo_position: logo_position || 'left',
      language: language || 'sk',
      theme_color: theme_color || '#3b82f6',
      invoice_email: invoice_email || null
    };

    const invoiceSettingsJson = JSON.stringify(invoiceSettings);

    // Update company
    await pool.query(
      'UPDATE companies SET invoice_settings = ? WHERE id = ?',
      [invoiceSettingsJson, companyId]
    );

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      req.user.id,
      'company.invoice_settings_update',
      'company',
      companyId,
      {
        section: 'invoice',
        changes: {
          old: oldInvoiceSettings,
          new: invoiceSettings
        }
      },
      companyId,
      ipAddress,
      userAgent
    );

    res.json({
      message: 'Nastavenia faktúr boli aktualizované.',
      invoice_settings: invoiceSettings
    });

  } catch (error) {
    console.error('Update invoice settings error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

export default router;
