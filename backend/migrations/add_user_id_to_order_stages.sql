-- Add user_id column to order_stages to track who created/updated the stage
ALTER TABLE order_stages ADD COLUMN user_id INT AFTER order_id;
ALTER TABLE order_stages ADD FOREIGN KEY (user_id) REFERENCES users(id);
