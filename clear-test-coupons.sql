-- Clear Test Coupons
-- Run this in Supabase SQL Editor to remove test coupons

-- Delete common test coupon codes
DELETE FROM coupons WHERE code IN (
  'MAGMA10',
  'TEST25',
  'SUMMER25',
  'WINTER20',
  'SPRING15',
  'FALL30',
  'DISCOUNT10',
  'SAVE20',
  'WELCOME25'
);

-- Show remaining coupons
SELECT 
  code,
  discount_value,
  max_uses,
  current_uses,
  is_active,
  expires_at,
  created_at
FROM coupons 
ORDER BY created_at DESC;