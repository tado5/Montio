import { ERROR_MESSAGES } from '../config/constants.js';

/**
 * Email validation regex
 * RFC 5322 simplified
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  return EMAIL_REGEX.test(email.trim());
};

/**
 * Validate password strength
 */
export const isStrongPassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Heslo je povinné.' };
  }

  if (password.length < 6) {
    return { valid: false, message: 'Heslo musí mať aspoň 6 znakov.' };
  }

  // Optional: Add more strength requirements
  // if (!/[A-Z]/.test(password)) {
  //   return { valid: false, message: 'Heslo musí obsahovať veľké písmeno.' };
  // }

  return { valid: true };
};

/**
 * Sanitize string input (prevent XSS)
 */
export const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str
    .trim()
    .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
    .slice(0, 1000); // Limit length
};

/**
 * Validate phone number (Slovak format)
 */
export const isValidPhone = (phone) => {
  if (!phone) return true; // Phone is optional

  // Slovak phone: +421 XXX XXX XXX or 0XXX XXX XXX
  const phoneRegex = /^(\+421|0)[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate IČO (Slovak company ID)
 */
export const isValidICO = (ico) => {
  if (!ico) return true; // IČO is optional

  // IČO: 8 digits
  const icoRegex = /^[0-9]{8}$/;
  return icoRegex.test(ico);
};

/**
 * Validate DIČ (Slovak tax ID)
 */
export const isValidDIC = (dic) => {
  if (!dic) return true; // DIČ is optional

  // DIČ: 10 digits (SK + 10 digits) or just 10 digits
  const dicRegex = /^(SK)?[0-9]{10}$/;
  return dicRegex.test(dic.replace(/\s/g, ''));
};

/**
 * Validate IBAN
 */
export const isValidIBAN = (iban) => {
  if (!iban) return true; // IBAN is optional

  // Basic IBAN format: SK + 22 digits
  const ibanRegex = /^SK[0-9]{22}$/;
  return ibanRegex.test(iban.replace(/\s/g, ''));
};

/**
 * Parse and validate JSON string
 */
export const parseJSON = (jsonString, fieldName = 'JSON field') => {
  if (!jsonString) return null;

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error(`Error parsing ${fieldName}:`, error);
    return null;
  }
};

/**
 * Middleware to validate email in request body
 */
export const validateEmail = (req, res, next) => {
  const { email } = req.body;

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: ERROR_MESSAGES.INVALID_EMAIL });
  }

  next();
};

/**
 * Middleware to validate required fields
 */
export const validateRequired = (fields) => {
  return (req, res, next) => {
    const missing = fields.filter(field => !req.body[field]);

    if (missing.length > 0) {
      return res.status(400).json({
        message: `${ERROR_MESSAGES.VALIDATION_ERROR} Chýbajú polia: ${missing.join(', ')}`
      });
    }

    next();
  };
};
