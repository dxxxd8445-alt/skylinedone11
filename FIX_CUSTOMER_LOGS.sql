-- ============================================
-- FIX CUSTOMER LOGS - STORE USERS TABLE
-- ============================================
-- This script ensures the store_users table exists with the correct structure
-- Run this in your Supabase SQL Editor

-- 1. Create store_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS store_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_store_users_email ON store_users(email);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE store_users ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policy to allow service role full access
DROP POLICY IF EXISTS "Service role can manage store_users" ON store_users;
CREATE POLICY "Service role can manage store_users" ON store_users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_store_users_updated_at ON store_users;
CREATE TRIGGER update_store_users_updated_at
  BEFORE UPDATE ON store_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if table exists and has data
SELECT 
  COUNT(*) as total_customers,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as new_this_week,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_this_month
FROM store_users;

-- Show sample customers (if any)
SELECT 
  id,
  email,
  username,
  created_at,
  updated_at
FROM store_users
ORDER BY created_at DESC
LIMIT 5;

-- Check orders linked to customers
SELECT 
  su.email,
  su.username,
  COUNT(DISTINCT o.id) as order_count,
  COUNT(DISTINCT l.id) as license_count
FROM store_users su
LEFT JOIN orders o ON LOWER(o.customer_email) = LOWER(su.email)
LEFT JOIN licenses l ON LOWER(l.customer_email) = LOWER(su.email)
GROUP BY su.id, su.email, su.username
ORDER BY order_count DESC
LIMIT 10;

-- ============================================
-- NOTES
-- ============================================
-- 
-- After running this script:
-- 1. Customers will appear when they sign up at /account
-- 2. Existing orders will be linked to customers by email
-- 3. Admin panel will show customer count and details
-- 
-- If you have existing orders but no customers:
-- - Customers are created when users sign up
-- - Orders can exist without customer accounts (guest checkout)
-- - The admin panel links orders to customers by email matching
-- 
-- ============================================
