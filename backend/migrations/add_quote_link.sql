-- Add quote_link to orders table
ALTER TABLE orders ADD COLUMN quote_link VARCHAR(255) UNIQUE AFTER unique_link;

-- Add client_signature_data to order_stages
ALTER TABLE order_stages ADD COLUMN client_signature_data LONGTEXT AFTER signature_data;
