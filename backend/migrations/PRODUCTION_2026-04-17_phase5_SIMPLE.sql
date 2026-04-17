-- ============================================================
-- MONTIO PRODUCTION MIGRATION - SIMPLIFIED VERSION
-- Date: 2026-04-17
-- Phase: FÁZA 5 - Orders & Quote System
-- Description: Dnešné zmeny pre public quote page a client signatures
-- ============================================================
--
-- INŠTRUKCIE:
-- 1. Otvor phpMyAdmin
-- 2. Vyber databázu (d46895_montio)
-- 3. Prejdi na "SQL" tab
-- 4. Skopíruj a vlož celý tento skript
-- 5. Klikni "Vykonať"
--
-- POZNÁMKA:
-- Ak niektorý stĺpec už existuje, zobrazí sa chyba "Duplicate column name"
-- To je OK - znamená to že stĺpec už máš v DB.
-- Ostatné príkazy sa vykonajú normálne.
--
-- ============================================================

-- ============================================================
-- ORDERS TABLE - 5 nových stĺpcov
-- ============================================================

-- 1. Quote link (unique link pre klientov)
ALTER TABLE orders
ADD COLUMN quote_link VARCHAR(255) UNIQUE AFTER unique_link;

-- 2. Client is company flag
ALTER TABLE orders
ADD COLUMN client_is_company BOOLEAN DEFAULT FALSE AFTER client_address;

-- 3. Client company name
ALTER TABLE orders
ADD COLUMN client_company_name VARCHAR(255) AFTER client_is_company;

-- 4. Client IČO
ALTER TABLE orders
ADD COLUMN client_ico VARCHAR(20) AFTER client_company_name;

-- 5. Client DIČ
ALTER TABLE orders
ADD COLUMN client_dic VARCHAR(20) AFTER client_ico;

-- ============================================================
-- ORDER_STAGES TABLE - 3 nové stĺpce
-- ============================================================

-- 6. User ID (kto vytvoril stage)
ALTER TABLE order_stages
ADD COLUMN user_id INT AFTER order_id;

-- 6b. Foreign key pre user_id
ALTER TABLE order_stages
ADD FOREIGN KEY (user_id) REFERENCES users(id);

-- 7. Client signature data (base64)
ALTER TABLE order_stages
ADD COLUMN client_signature_data LONGTEXT AFTER signature_data;

-- 8. Client signed at (timestamp)
ALTER TABLE order_stages
ADD COLUMN client_signed_at TIMESTAMP NULL AFTER client_signature_data;

-- ============================================================
-- VERIFICATION QUERY
-- ============================================================
-- Tento query ti ukáže všetky nové stĺpce

-- Skontroluj ORDERS table
DESCRIBE orders;

-- Skontroluj ORDER_STAGES table
DESCRIBE order_stages;

-- ============================================================
-- HOTOVO! 🎉
-- ============================================================
--
-- Ak vidíš zoznam stĺpcov s novými položkami, všetko je OK!
--
-- Očakávané CHYBY (ignoruj ich):
-- - "Duplicate column name 'quote_link'" - stĺpec už existuje ✅
-- - "Duplicate column name 'client_is_company'" - stĺpec už existuje ✅
-- - atď...
--
-- Kritické CHYBY (kontaktuj ma):
-- - "Table 'orders' doesn't exist" - databáza problém ❌
-- - "Unknown column 'signature_data'" - chýba parent stĺpec ❌
--
-- ============================================================
