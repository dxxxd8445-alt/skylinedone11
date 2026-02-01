-- CRITICAL: Run this SQL in Supabase SQL Editor to fix order system
-- This will add missing columns and fix data issues

-- 1. Add missing columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- 2. Update existing orders with default values
UPDATE orders 
SET customer_name = 'Unknown Customer'
WHERE customer_name IS NULL;

UPDATE orders 
SET currency = 'USD'
WHERE currency IS NULL;

-- 3. Verify the fix worked
SELECT 
  'Orders with customer_name' as check_type,
  COUNT(*) as count
FROM orders 
WHERE customer_name IS NOT NULL
UNION ALL
SELECT 
  'Orders with currency' as check_type,
  COUNT(*) as count
FROM orders 
WHERE currency IS NOT NULL
UNION ALL
SELECT 
  'Total completed orders' as check_type,
  COUNT(*) as count
FROM orders 
WHERE status = 'completed'
UNION ALL
SELECT 
  'Total revenue (USD)' as check_type,
  ROUND(SUM(amount_cents::decimal / 100), 2) as count
FROM orders 
WHERE status = 'completed' AND amount_cents IS NOT NULL;

-- 4. Show sample of fixed orders
SELECT 
  order_number,
  customer_email,
  customer_name,
  amount_cents,
  currency,
  status,
  created_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;