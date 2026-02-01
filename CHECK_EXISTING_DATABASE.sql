-- ============================================
-- CHECK EXISTING DATABASE COMPONENTS
-- Run this in your Supabase SQL Editor to see what's already set up
-- ============================================

-- 1. Check which tables already exist
SELECT 
  'EXISTING TABLES' as section,
  table_name,
  '✅ EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Check for missing required tables
SELECT 
  'MISSING TABLES' as section,
  required_table as table_name,
  '❌ MISSING' as status
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
) AS required(required_table)
WHERE required_table NOT IN (
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public'
);

-- 3. Check table record counts
SELECT 
  'RECORD COUNTS' as section,
  'categories' as table_name,
  COUNT(*) as records
FROM categories
UNION ALL
SELECT 'RECORD COUNTS', 'products', COUNT(*) FROM products
UNION ALL
SELECT 'RECORD COUNTS', 'product_variants', COUNT(*) FROM product_variants
UNION ALL
SELECT 'RECORD COUNTS', 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'RECORD COUNTS', 'licenses', COUNT(*) FROM licenses
UNION ALL
SELECT 'RECORD COUNTS', 'coupons', COUNT(*) FROM coupons
UNION ALL
SELECT 'RECORD COUNTS', 'reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'RECORD COUNTS', 'team_members', COUNT(*) FROM team_members
UNION ALL
SELECT 'RECORD COUNTS', 'webhooks', COUNT(*) FROM webhooks
UNION ALL
SELECT 'RECORD COUNTS', 'settings', COUNT(*) FROM settings
UNION ALL
SELECT 'RECORD COUNTS', 'admin_audit_logs', COUNT(*) FROM admin_audit_logs;

-- 4. Check if announcements table exists and has data
DO $
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'announcements') THEN
    RAISE NOTICE '✅ Announcements table exists';
    PERFORM COUNT(*) FROM announcements;
  ELSE
    RAISE NOTICE '❌ Announcements table missing - needed for site messages';
  END IF;
END $;

-- 5. Check if stripe_sessions table exists
DO $
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stripe_sessions') THEN
    RAISE NOTICE '✅ Stripe sessions table exists';
  ELSE
    RAISE NOTICE '❌ Stripe sessions table missing - needed for Stripe payments';
  END IF;
END $;

-- 6. Check if store_users table exists
DO $
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'store_users') THEN
    RAISE NOTICE '✅ Store users table exists';
  ELSE
    RAISE NOTICE '❌ Store users table missing - needed for customer accounts';
  END IF;
END $;

-- 7. Check orders table columns
SELECT 
  'ORDERS TABLE COLUMNS' as section,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. Check products table columns
SELECT 
  'PRODUCTS TABLE COLUMNS' as section,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 9. Check RLS policies
SELECT 
  'RLS POLICIES' as section,
  tablename as table_name,
  policyname as policy_name,
  cmd as command,
  permissive
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 10. Check indexes
SELECT 
  'INDEXES' as section,
  tablename as table_name,
  indexname as index_name,
  indexdef as definition
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename IN (
    'categories', 'products', 'product_variants', 'orders', 'licenses',
    'coupons', 'reviews', 'team_members', 'webhooks', 'settings',
    'admin_audit_logs', 'announcements', 'stripe_sessions', 'store_users'
  )
ORDER BY tablename, indexname;

-- 11. Summary report
SELECT 
  'SUMMARY' as section,
  'Total tables in database' as description,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

-- 12. Check for email-related functionality
DO $
BEGIN
  -- Check if we have the necessary columns for email system
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'store_users' 
      AND column_name = 'password_reset_token'
  ) THEN
    RAISE NOTICE '✅ Email system columns exist in store_users';
  ELSE
    RAISE NOTICE '❌ Email system columns missing - needed for password reset emails';
  END IF;
END $;

-- Final status
SELECT 
  '🔍 DATABASE CHECK COMPLETE' as status,
  'Review the results above to see what needs to be added' as next_steps;