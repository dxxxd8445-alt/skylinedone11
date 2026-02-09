-- ============================================
-- FIX REVIEWS TABLE STRUCTURE
-- ============================================
-- The table has customer_name but code uses username

-- Option 1: Add username column and make customer_name nullable
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS username TEXT;

ALTER TABLE reviews 
ALTER COLUMN customer_name DROP NOT NULL;

-- Option 2: Or just rename customer_name to username
-- ALTER TABLE reviews RENAME COLUMN customer_name TO username;

-- Let's go with Option 1 to be safe
-- Now update existing data if any
UPDATE reviews 
SET username = customer_name 
WHERE username IS NULL AND customer_name IS NOT NULL;

-- Verify the structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'reviews'
ORDER BY ordinal_position;
