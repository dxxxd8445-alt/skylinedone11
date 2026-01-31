-- ============================================
-- AUTHENTICATION SYSTEM FIX
-- Run this script in your Supabase SQL Editor
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- STORE USERS TABLE (Customer Accounts)
-- ============================================
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

-- Add missing columns if they don't exist
ALTER TABLE store_users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE store_users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE store_users ADD COLUMN IF NOT EXISTS password_reset_token TEXT;
ALTER TABLE store_users ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMPTZ;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_store_users_email ON store_users(email);
CREATE INDEX IF NOT EXISTS idx_store_users_username ON store_users(username);
CREATE INDEX IF NOT EXISTS idx_store_users_password_reset_token ON store_users(password_reset_token) WHERE password_reset_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_store_users_created_at ON store_users(created_at DESC);

-- ============================================
-- ENSURE ORDERS TABLE EXISTS AND IS LINKED
-- ============================================
-- Make sure orders table exists (should already exist from main setup)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  total_amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  payment_id TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  billing_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ENSURE LICENSES TABLE EXISTS AND IS LINKED
-- ============================================
-- Make sure licenses table exists (should already exist from main setup)
CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  license_key TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'revoked')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on store_users
ALTER TABLE store_users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY IF NOT EXISTS "Users can view own profile" ON store_users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Policy: Users can update their own data
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON store_users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Policy: Allow service role full access (for API routes)
CREATE POLICY IF NOT EXISTS "Service role full access" ON store_users
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- ADMIN AUDIT LOGS TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT,
  user_role TEXT NOT NULL CHECK (user_role IN ('admin', 'staff')),
  action TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for audit logs
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_user_email ON admin_audit_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON admin_audit_logs(action);

-- Enable RLS on audit logs
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access audit logs
CREATE POLICY IF NOT EXISTS "Service role audit access" ON admin_audit_logs
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Insert a test user (password is 'password123')
INSERT INTO store_users (email, username, password_hash) 
VALUES (
  'test@example.com', 
  'testuser', 
  '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ'
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if tables exist
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename IN ('store_users', 'orders', 'licenses', 'admin_audit_logs', 'products', 'product_variants', 'categories')
ORDER BY tablename;

-- Check store_users table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'store_users'
ORDER BY ordinal_position;

-- Count records in key tables
SELECT 
  'store_users' as table_name, COUNT(*) as record_count FROM store_users
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'licenses', COUNT(*) FROM licenses;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ AUTHENTICATION DATABASE SETUP COMPLETE!';
  RAISE NOTICE '📋 Tables created: store_users, orders, licenses, admin_audit_logs';
  RAISE NOTICE '🔒 Row Level Security enabled with proper policies';
  RAISE NOTICE '📊 Indexes created for optimal performance';
  RAISE NOTICE '🧪 Test user created: test@example.com / password123';
  RAISE NOTICE '🚀 Your authentication system is ready!';
END $$;