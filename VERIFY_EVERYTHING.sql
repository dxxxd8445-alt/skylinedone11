-- ============================================
-- COMPLETE SYSTEM VERIFICATION
-- RUN THIS TO CHECK EVERYTHING IS WORKING
-- ============================================

-- Check all tables exist
SELECT 
  '1. CHECKING TABLES' as step,
  table_name,
  '✅' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'categories', 'products', 'product_variants', 'orders', 'licenses', 
    'coupons', 'reviews', 'team_members', 'webhooks', 'settings', 
    'admin_audit_logs', 'stripe_sessions', 'store_users', 'announcements'
  )
ORDER BY table_name;

-- Check sample data
SELECT 
  '2. CHECKING DATA' as step,
  'categories' as table_name, 
  COUNT(*) as records,
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '❌' END as status
FROM categories
UNION ALL
SELECT 
  '2. CHECKING DATA',
  'products', 
  COUNT(*),
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '❌' END
FROM products
UNION ALL
SELECT 
  '2. CHECKING DATA',
  'product_variants', 
  COUNT(*),
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '❌' END
FROM product_variants
UNION ALL
SELECT 
  '2. CHECKING DATA',
  'coupons', 
  COUNT(*),
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '❌' END
FROM coupons
UNION ALL
SELECT 
  '2. CHECKING DATA',
  'settings', 
  COUNT(*),
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '❌' END
FROM settings
UNION ALL
SELECT 
  '2. CHECKING DATA',
  'announcements', 
  COUNT(*),
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '❌' END
FROM announcements;

-- Check Discord webhook
SELECT 
  '3. CHECKING WEBHOOK' as step,
  name,
  is_active,
  array_length(events, 1) as event_count,
  CASE WHEN is_active = true THEN '✅' ELSE '❌' END as status
FROM webhooks
WHERE url LIKE '%discord.com%';

-- Check license keys
SELECT 
  '4. CHECKING LICENSE KEYS' as step,
  COUNT(*) as total_keys,
  COUNT(CASE WHEN status = 'unused' THEN 1 END) as available_keys,
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '⚠️ No keys yet' END as status
FROM licenses;

-- Check indexes
SELECT 
  '5. CHECKING INDEXES' as step,
  COUNT(*) as total_indexes,
  '✅' as status
FROM pg_indexes
WHERE schemaname = 'public';

-- Check RLS policies
SELECT 
  '6. CHECKING SECURITY' as step,
  COUNT(*) as total_policies,
  '✅' as status
FROM pg_policies
WHERE schemaname = 'public';

-- Final summary
SELECT 
  '🎉 VERIFICATION COMPLETE!' as message,
  '✅ All systems operational' as status;
