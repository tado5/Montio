-- Add client_signed_at timestamp to order_stages
ALTER TABLE order_stages ADD COLUMN client_signed_at TIMESTAMP NULL AFTER client_signature_data;
