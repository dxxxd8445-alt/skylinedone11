-- ============================================
-- FIX REVIEWS COLUMNS - WORKS WITH EXISTING TABLE
-- ============================================

-- Add the new columns we need
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS text TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- Make old columns nullable so we can use new ones
ALTER TABLE reviews ALTER COLUMN customer_name DROP NOT NULL;
ALTER TABLE reviews ALTER COLUMN customer_email DROP NOT NULL;

-- Copy data from old columns to new ones (if any data exists)
UPDATE reviews 
SET 
  username = COALESCE(username, customer_name, 'Anonymous'),
  text = COALESCE(text, comment, ''),
  image_url = COALESCE(image_url, image),
  avatar = COALESCE(avatar, SUBSTRING(customer_name, 1, 1), 'A'),
  verified = COALESCE(verified, is_verified, false)
WHERE username IS NULL OR text IS NULL;

-- Verify the structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'reviews'
ORDER BY ordinal_position;
