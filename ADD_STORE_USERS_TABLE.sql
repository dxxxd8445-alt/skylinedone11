-- ============================================
-- ADD STORE USERS TABLE FOR AUTHENTICATION
-- Run this script in your Supabase SQL Editor
-- ============================================

-- Create the store_users table for customer authentication
CREATE TABLE IF NOT EXISTS store_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  password_reset_token TEXT,
  password_reset_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_store_users_email ON store_users(email);
CREATE INDEX IF NOT EXISTS idx_store_users_username ON store_users(username);
CREATE INDEX IF NOT EXISTS idx_store_users_password_reset_token ON store_users(password_reset_token) WHERE password_reset_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_store_users_created_at ON store_users(created_at DESC);

-- Enable Row Level Security
ALTER TABLE store_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY IF NOT EXISTS "Service role full access" ON store_users
  FOR ALL USING (auth.role() = 'service_role');

-- Add comment
COMMENT ON TABLE store_users IS 'Customer/storefront user accounts for authentication';

-- Verify the table was created
SELECT 
  'store_users' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'store_users';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ STORE USERS TABLE CREATED SUCCESSFULLY!';
  RAISE NOTICE '🔐 Authentication system is now ready';
  RAISE NOTICE '📊 Table: store_users with proper indexes and RLS';
  RAISE NOTICE '🚀 You can now test sign up and sign in functionality';
END $$;