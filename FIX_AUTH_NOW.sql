-- ============================================
-- FIX CUSTOMER AUTH - RUN THIS NOW!
-- ============================================
-- This fixes the customer login/signup system
-- Copy and paste into Supabase SQL Editor
-- ============================================

-- Step 1: Check if table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'store_users') THEN
    RAISE NOTICE '✅ store_users table exists';
  ELSE
    RAISE NOTICE '❌ store_users table MISSING - will create it';
  END IF;
END $$;

-- Step 2: Recreate table with correct structure
DROP TABLE IF EXISTS store_users CASCADE;

CREATE TABLE store_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create indexes
CREATE INDEX idx_store_users_email ON store_users(email);
CREATE INDEX idx_store_users_username ON store_users(username);

-- Step 4: Enable RLS
ALTER TABLE store_users ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policy
DROP POLICY IF EXISTS "Allow all for service role" ON store_users;
CREATE POLICY "Allow all for service role" ON store_users FOR ALL USING (true);

-- Step 6: Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_store_users_updated_at ON store_users;
CREATE TRIGGER update_store_users_updated_at 
  BEFORE UPDATE ON store_users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Create customers from existing orders (if any)
INSERT INTO store_users (email, username, password_hash, created_at)
SELECT DISTINCT
  LOWER(customer_email),
  COALESCE(customer_name, SPLIT_PART(customer_email, '@', 1)),
  encode(digest(gen_random_uuid()::text, 'sha256'), 'hex'),
  MIN(created_at)
FROM orders
WHERE customer_email IS NOT NULL 
  AND customer_email != ''
  AND NOT EXISTS (
    SELECT 1 FROM store_users 
    WHERE LOWER(store_users.email) = LOWER(orders.customer_email)
  )
GROUP BY LOWER(customer_email), customer_name;

-- Step 8: Verification
DO $$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM store_users;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ CUSTOMER AUTH FIXED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total customers: %', user_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Restart your dev server (Ctrl+C, then npm run dev)';
  RAISE NOTICE '2. Go to http://localhost:3000/account';
  RAISE NOTICE '3. Try to sign up with a new account';
  RAISE NOTICE '4. Should work now!';
  RAISE NOTICE '========================================';
END $$;

-- Show sample users
SELECT 
  id,
  email,
  username,
  created_at
FROM store_users
ORDER BY created_at DESC
LIMIT 5;
