-- ============================================
-- CREATE CUSTOMERS FROM EXISTING ORDERS
-- ============================================
-- This script creates customer accounts for all existing orders
-- Run this AFTER running FIX_CUSTOMER_LOGS.sql

-- ============================================
-- STEP 1: Create customers from orders
-- ============================================

-- Insert unique customers from orders table
-- Password will be a random hash - customers need to use "Forgot Password" to set their password
INSERT INTO store_users (email, username, password_hash, created_at, updated_at)
SELECT DISTINCT
  LOWER(customer_email) as email,
  COALESCE(
    customer_name,
    SPLIT_PART(customer_email, '@', 1)
  ) as username,
  -- Generate a random password hash (customers will need to reset)
  encode(digest(gen_random_uuid()::text || customer_email, 'sha256'), 'hex') as password_hash,
  MIN(created_at) as created_at,
  NOW() as updated_at
FROM orders
WHERE customer_email IS NOT NULL 
  AND customer_email != ''
  AND customer_email LIKE '%@%'
  AND NOT EXISTS (
    SELECT 1 FROM store_users 
    WHERE LOWER(store_users.email) = LOWER(orders.customer_email)
  )
GROUP BY LOWER(customer_email), customer_name, customer_email
ORDER BY MIN(created_at) DESC;

-- ============================================
-- STEP 2: Verify customers were created
-- ============================================

-- Show newly created customers
SELECT 
  su.id,
  su.email,
  su.username,
  su.created_at,
  COUNT(DISTINCT o.id) as order_count,
  COUNT(DISTINCT l.id) as license_count,
  SUM(CASE WHEN o.amount_cents IS NOT NULL THEN o.amount_cents ELSE o.amount * 100 END) / 100.0 as total_spent
FROM store_users su
LEFT JOIN orders o ON LOWER(o.customer_email) = LOWER(su.email)
LEFT JOIN licenses l ON LOWER(l.customer_email) = LOWER(su.email)
GROUP BY su.id, su.email, su.username, su.created_at
ORDER BY total_spent DESC NULLS LAST;

-- ============================================
-- STEP 3: Summary statistics
-- ============================================

SELECT 
  'Total Customers' as metric,
  COUNT(*) as value
FROM store_users

UNION ALL

SELECT 
  'Customers with Orders' as metric,
  COUNT(DISTINCT su.id) as value
FROM store_users su
INNER JOIN orders o ON LOWER(o.customer_email) = LOWER(su.email)

UNION ALL

SELECT 
  'Customers with Licenses' as metric,
  COUNT(DISTINCT su.id) as value
FROM store_users su
INNER JOIN licenses l ON LOWER(l.customer_email) = LOWER(su.email)

UNION ALL

SELECT 
  'Total Orders' as metric,
  COUNT(*) as value
FROM orders

UNION ALL

SELECT 
  'Total Licenses' as metric,
  COUNT(*) as value
FROM licenses;

-- ============================================
-- IMPORTANT NOTES
-- ============================================
-- 
-- After running this script:
-- 
-- 1. ✅ All customers from orders are now in store_users table
-- 2. ✅ Customer Logs page will show all customers
-- 3. ✅ Orders and licenses are linked by email
-- 4. ⚠️ Customers need to use "Forgot Password" to set their password
-- 
-- Customer Login Process:
-- 1. Customer goes to /account
-- 2. Clicks "Forgot Password?"
-- 3. Enters their email (from order)
-- 4. Receives password reset email
-- 5. Sets new password
-- 6. Can now login and see their orders/licenses
-- 
-- ============================================
