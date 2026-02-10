-- Fix payment method constraint issue
-- Step 1: Find problematic rows
SELECT DISTINCT payment_method, COUNT(*) 
FROM orders 
GROUP BY payment_method 
ORDER BY payment_method;

-- Step 2: Show the problematic rows (those not in allowed list)
SELECT id, order_number, payment_method, status, created_at
FROM orders 
WHERE payment_method NOT IN ('stripe', 'paypal', 'moneymotion', 'storrik', 'crypto')
  AND payment_method IS NOT NULL;

-- Step 3: Update problematic rows to 'moneymotion' (or delete if test data)
-- First, let's see what we're dealing with:
-- Uncomment the UPDATE statement below after reviewing the rows above

-- UPDATE orders 
-- SET payment_method = 'moneymotion' 
-- WHERE payment_method NOT IN ('stripe', 'paypal', 'moneymotion', 'storrik', 'crypto')
--   AND payment_method IS NOT NULL;

-- OR if you want to delete test/problematic rows:
-- DELETE FROM orders 
-- WHERE payment_method NOT IN ('stripe', 'paypal', 'moneymotion', 'storrik', 'crypto')
--   AND payment_method IS NOT NULL;

-- Step 4: After fixing/deleting problematic rows, then update the constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_payment_method_check 
CHECK (payment_method IN ('stripe', 'paypal', 'moneymotion', 'storrik', 'crypto'));

-- Step 5: Verify the constraint was added
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass 
  AND contype = 'c';
