-- Migration: Add company settings columns
-- Date: 2026-04-13
-- Description: Add financial_data, contact_data, invoice_settings columns to companies table

-- Add new JSON columns to companies table
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS financial_data TEXT NULL COMMENT 'Financial settings (DPH, marže, cenník) - JSON',
ADD COLUMN IF NOT EXISTS contact_data TEXT NULL COMMENT 'Contact information (telefón, email, web, hodiny) - JSON',
ADD COLUMN IF NOT EXISTS invoice_settings TEXT NULL COMMENT 'Invoice settings (footer, logo position, language, theme) - JSON';

-- Example data structure for reference:
-- financial_data: {"vat_registered": true, "vat_number": "SK1234567890", "vat_rate": 20, "margin_material": 30, "margin_labor": 40, "overhead_cost": 15}
-- contact_data: {"phone": "+421901234567", "email": "info@firma.sk", "website": "https://firma.sk", "work_hours_weekday": "8:00 - 17:00", "work_hours_weekend": null, "weekend_work_enabled": false}
-- invoice_settings: {"footer_note": "Ďakujeme za váš nákup", "logo_position": "left", "language": "sk", "theme_color": "#3b82f6", "invoice_email": "faktury@firma.sk"}
