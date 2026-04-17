-- Add company fields for client (IČO, DIČ, company name)
ALTER TABLE orders ADD COLUMN client_is_company BOOLEAN DEFAULT FALSE AFTER client_address;
ALTER TABLE orders ADD COLUMN client_company_name VARCHAR(255) AFTER client_is_company;
ALTER TABLE orders ADD COLUMN client_ico VARCHAR(20) AFTER client_company_name;
ALTER TABLE orders ADD COLUMN client_dic VARCHAR(20) AFTER client_ico;

-- Add client signature tracking for quote stage
ALTER TABLE order_stages ADD COLUMN client_signed_at TIMESTAMP NULL AFTER client_signature_data;
