-- RESET ALL ORDERS - USE WITH CAUTION!
-- This script will delete all orders and reset your database to 0 orders

-- Delete all orders (this will cascade to related records)
DELETE FROM orders;

-- Reset any related license assignments
UPDATE licenses 
SET 
  status = 'unused',
  customer_email = NULL,
  order_id = NULL,
  assigned_at = NULL
WHERE status IN ('active', 'pending');

-- Delete all Stripe sessions
DELETE FROM stripe_sessions;

-- Reset coupon usage counts
UPDATE coupons SET current_uses = 0;

-- Verify everything is reset
SELECT 
  'Orders' as table_name, 
  COUNT(*) as count 
FROM orders
UNION ALL
SELECT 
  'Active Licenses' as table_name, 
  COUNT(*) as count 
FROM licenses 
WHERE status = 'active'
UNION ALL
SELECT 
  'Stripe Sessions' as table_name, 
  COUNT(*) as count 
FROM stripe_sessions;

-- You should see 0 for all counts above
