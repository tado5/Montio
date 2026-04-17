/**
 * Business Logic Constants
 * Centralizované business pravidlá a limity
 */

// VAT (DPH)
export const VAT_RATE = 20 // Slovakia standard VAT rate (%)

// File Upload Limits
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const MAX_PHOTOS_PER_STAGE = 10

// Allowed Image Types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]
