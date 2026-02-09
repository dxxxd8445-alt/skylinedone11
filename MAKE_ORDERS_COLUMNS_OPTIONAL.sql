-- Make orders table columns optional so checkout works
-- Run this in Supabase SQL Editor NOW

ALTER TABLE orders ALTER COLUMN duration DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN variant_id DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN product_id DROP NOT NULL;

-- Verify it worked
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('duration', 'variant_id', 'product_id');
