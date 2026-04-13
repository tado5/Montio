// Backend Constants Configuration

export const DATABASE_CONFIG = {
  CONNECTION_LIMIT: 10,
  QUERY_TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
};

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  AVATAR_SIZE: {
    WIDTH: 256,
    HEIGHT: 256
  },
  LOGO_SIZE: {
    WIDTH: 200,
    HEIGHT: 200
  },
  IMAGE_QUALITY: {
    HIGH: 85,
    MEDIUM: 75,
    LOW: 60
  }
};

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  NOTIFICATIONS_LIMIT: 50,
  ACTIVITY_LOGS_LIMIT: 50
};

export const THEME = {
  DEFAULT: 'dark',
  OPTIONS: ['light', 'dark']
};

export const JWT_CONFIG = {
  DEFAULT_EXPIRES_IN: '7d',
  PASSWORD_CHANGE_EXPIRES_IN: '1h',
  ALGORITHM: 'HS256'
};

export const RATE_LIMITING = {
  LOGIN: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5,
    MESSAGE: 'Príliš veľa pokusov o prihlásenie. Skúste znova o 15 minút.'
  },
  API: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 100
  }
};

export const CORS_CONFIG = {
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  CREDENTIALS: true,
  METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  ALLOWED_HEADERS: ['Content-Type', 'Authorization']
};

export const ERROR_MESSAGES = {
  SERVER_ERROR: 'Chyba servera.',
  UNAUTHORIZED: 'Neautorizovaný prístup.',
  FORBIDDEN: 'Nemáte oprávnenie na túto operáciu.',
  NOT_FOUND: 'Zdroj nenájdený.',
  VALIDATION_ERROR: 'Neplatné údaje.',
  COMPANY_NOT_FOUND: 'Používateľ nemá priradenú firmu.',
  INVALID_EMAIL: 'Neplatný email formát.',
  INVALID_TOKEN: 'Neplatný alebo expirovaný token.',
  TOKEN_MISSING: 'Token chýba.'
};

export const EMPLOYEE_STATUS = {
  CREATED: 'created',
  PENDING_APPROVAL: 'pending_approval',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DELETED: 'deleted'
};

export const ORDER_STATUS = {
  SURVEY: 'survey',
  QUOTE: 'quote',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const COMPANY_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active'
};

export const USER_ROLES = {
  SUPER_ADMIN: 'superadmin',
  COMPANY_ADMIN: 'companyadmin',
  EMPLOYEE: 'employee'
};
