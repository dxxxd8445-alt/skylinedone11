-- ============================================
-- MISSING DATABASE COMPONENTS FOR MAGMA STORE
-- Run this in your Supabase SQL Editor to add any missing tables/features
-- ============================================

-- Enable necessary extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. ANNOUNCEMENTS TABLE (for site messages)
-- ============================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on announcements table
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for announcements
DROP POLICY IF EXISTS "Public read access for active announcements" ON announcements;
CREATE POLICY "Public read access for active announcements" ON announcements
FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Service role full access announcements" ON announcements;
CREATE POLICY "Service role full access announcements" ON announcements
FOR ALL USING (auth.role() = 'service_role');

-- Create indexes for announcements
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at);
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type);

-- ============================================
-- 2. TERMS ACCEPTED TABLE (for terms popup tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS terms_accepted (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_identifier TEXT NOT NULL, -- IP address or session ID
  accepted_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on terms_accepted table
ALTER TABLE terms_accepted ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for terms_accepted
DROP POLICY IF EXISTS "Service role access terms_accepted" ON terms_accepted;
CREATE POLICY "Service role access terms_accepted" ON terms_accepted
FOR ALL USING (auth.role() = 'service_role');

-- Create indexes for terms_accepted
CREATE INDEX IF NOT EXISTS idx_terms_accepted_user_identifier ON terms_accepted(user_identifier);
CREATE INDEX IF NOT EXISTS idx_terms_accepted_ip_address ON terms_accepted(ip_address);
CREATE INDEX IF NOT EXISTS idx_terms_accepted_created_at ON terms_accepted(created_at);

-- ============================================
-- 3. STRIPE SESSIONS TABLE (if not already created)
-- ============================================
CREATE TABLE IF NOT EXISTS stripe_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  items JSONB NOT NULL,
  coupon_code TEXT,
  coupon_discount_amount DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'failed')),
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on stripe_sessions table
ALTER TABLE stripe_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for stripe_sessions
DROP POLICY IF EXISTS "Service role access stripe_sessions" ON stripe_sessions;
CREATE POLICY "Service role access stripe_sessions" ON stripe_sessions
FOR ALL USING (auth.role() = 'service_role');

-- Create indexes for stripe_sessions
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_session_id ON stripe_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_customer_email ON stripe_sessions(customer_email);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_status ON stripe_sessions(status);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_created_at ON stripe_sessions(created_at);

-- ============================================
-- 4. TEAM INVITES TABLE (for team management)
-- ============================================
CREATE TABLE IF NOT EXISTS team_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Staff',
  permissions JSONB DEFAULT '[]'::jsonb,
  invite_token TEXT UNIQUE NOT NULL,
  invited_by UUID REFERENCES team_members(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on team_invites table
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for team_invites
DROP POLICY IF EXISTS "Service role access team_invites" ON team_invites;
CREATE POLICY "Service role access team_invites" ON team_invites
FOR ALL USING (auth.role() = 'service_role');

-- Create indexes for team_invites
CREATE INDEX IF NOT EXISTS idx_team_invites_email ON team_invites(email);
CREATE INDEX IF NOT EXISTS idx_team_invites_token ON team_invites(invite_token);
CREATE INDEX IF NOT EXISTS idx_team_invites_status ON team_invites(status);
CREATE INDEX IF NOT EXISTS idx_team_invites_expires_at ON team_invites(expires_at);

-- ============================================
-- 5. STORE USERS TABLE (for customer accounts)
-- ============================================
CREATE TABLE IF NOT EXISTS store_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT,
  avatar TEXT,
  email_verified BOOLEAN DEFAULT false,
  email_verification_token TEXT UNIQUE,
  password_reset_token TEXT UNIQUE,
  password_reset_expires TIMESTAMPTZ,
  last_login TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on store_users table
ALTER TABLE store_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for store_users
DROP POLICY IF EXISTS "Users can view own profile" ON store_users;
CREATE POLICY "Users can view own profile" ON store_users
FOR SELECT USING (email = current_setting('app.current_user_email', true));

DROP POLICY IF EXISTS "Users can update own profile" ON store_users;
CREATE POLICY "Users can update own profile" ON store_users
FOR UPDATE USING (email = current_setting('app.current_user_email', true));

DROP POLICY IF EXISTS "Service role access store_users" ON store_users;
CREATE POLICY "Service role access store_users" ON store_users
FOR ALL USING (auth.role() = 'service_role');

-- Create indexes for store_users
CREATE INDEX IF NOT EXISTS idx_store_users_email ON store_users(email);
CREATE INDEX IF NOT EXISTS idx_store_users_email_verification_token ON store_users(email_verification_token);
CREATE INDEX IF NOT EXISTS idx_store_users_password_reset_token ON store_users(password_reset_token);
CREATE INDEX IF NOT EXISTS idx_store_users_status ON store_users(status);

-- ============================================
-- 6. ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================

-- Add missing columns to orders table (if not already present)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'moneymotion';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_discount_amount DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add missing columns to licenses table (if not already present)
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

-- Add missing columns to products table (if not already present)
ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS feature_cards JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'Magma';

-- Add missing columns to reviews table (if not already present)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS image TEXT;

-- ============================================
-- 7. CREATE MISSING INDEXES
-- ============================================

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent_id ON orders(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_coupon_code ON orders(coupon_code);

-- Licenses table indexes
CREATE INDEX IF NOT EXISTS idx_licenses_assigned_at ON licenses(assigned_at);

-- ============================================
-- 8. UPDATE TRIGGERS FOR UPDATED_AT COLUMNS
-- ============================================

-- Create or replace the update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
CREATE TRIGGER update_announcements_updated_at
    BEFORE UPDATE ON announcements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stripe_sessions_updated_at ON stripe_sessions;
CREATE TRIGGER update_stripe_sessions_updated_at
    BEFORE UPDATE ON stripe_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_team_invites_updated_at ON team_invites;
CREATE TRIGGER update_team_invites_updated_at
    BEFORE UPDATE ON team_invites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_store_users_updated_at ON store_users;
CREATE TRIGGER update_store_users_updated_at
    BEFORE UPDATE ON store_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. INSERT SAMPLE DATA (if tables are empty)
-- ============================================

-- Insert sample announcement
INSERT INTO announcements (title, message, type, priority, is_active) 
VALUES (
  'Welcome to Magma Cheats!', 
  'Check out our latest products and exclusive deals. Join our Discord for updates and support!',
  'info',
  5,
  true
) ON CONFLICT DO NOTHING;

-- Insert additional sample announcements
INSERT INTO announcements (title, message, type, priority, is_active) 
VALUES 
  ('New Products Available!', 'We have added new cheats for popular games. Check them out now!', 'success', 3, true),
  ('Maintenance Notice', 'Scheduled maintenance will occur tonight from 2-4 AM EST.', 'warning', 4, false),
  ('Discord Community', 'Join our Discord server for real-time support and community updates.', 'info', 2, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 10. VERIFICATION QUERIES
-- ============================================

-- Check if all tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM (VALUES 
  ('announcements'),
  ('terms_accepted'),
  ('stripe_sessions'),
  ('team_invites'),
  ('store_users'),
  ('categories'),
  ('products'),
  ('product_variants'),
  ('orders'),
  ('licenses'),
  ('coupons'),
  ('reviews'),
  ('team_members'),
  ('webhooks'),
  ('settings'),
  ('admin_audit_logs')
) AS required_tables(table_name)
ORDER BY table_name;

-- Check announcements data
SELECT 
  'announcements' as table_name,
  COUNT(*) as record_count,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_count
FROM announcements;

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('announcements', 'terms_accepted', 'stripe_sessions', 'team_invites', 'store_users')
ORDER BY tablename, policyname;

-- Success message
SELECT '🎉 MISSING DATABASE COMPONENTS SETUP COMPLETE!' as message;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE announcements IS 'Site-wide announcements and messages displayed to users';
COMMENT ON TABLE terms_accepted IS 'Tracks user acceptance of terms and conditions';
COMMENT ON TABLE stripe_sessions IS 'Tracks Stripe checkout sessions for payment processing';
COMMENT ON TABLE team_invites IS 'Manages team member invitations';
COMMENT ON TABLE store_users IS 'Customer accounts for the store';

COMMENT ON COLUMN announcements.type IS 'Message type: info, warning, success, error';
COMMENT ON COLUMN announcements.priority IS 'Display priority (higher numbers shown first)';
COMMENT ON COLUMN terms_accepted.user_identifier IS 'IP address or session ID for anonymous users';
COMMENT ON COLUMN stripe_sessions.items IS 'JSON array of cart items for the session';
COMMENT ON COLUMN team_invites.permissions IS 'JSON array of permission strings';
COMMENT ON COLUMN store_users.password_hash IS 'Bcrypt hashed password';

-- Final verification
SELECT 
  'Database setup verification:' as info,
  COUNT(DISTINCT table_name) as tables_created
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'announcements', 'terms_accepted', 'stripe_sessions', 'team_invites', 'store_users',
    'categories', 'products', 'product_variants', 'orders', 'licenses', 
    'coupons', 'reviews', 'team_members', 'webhooks', 'settings', 'admin_audit_logs'
  );