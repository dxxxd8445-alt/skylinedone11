-- Add 'storrik' as a valid payment method
-- This fixes the orders_payment_method_check constraint error

-- First, let's see what the current constraint looks like
-- Usually it's something like: CHECK (payment_method IN ('stripe', 'paypal', 'moneymotion'))

-- Drop the existing constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;

-- Add the constraint back with storrik included
ALTER TABLE orders 
ADD CONSTRAINT orders_payment_method_check 
CHECK (payment_method IN ('stripe', 'paypal', 'moneymotion', 'storrik', 'crypto'));

-- Verify the change
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass 
  AND contype = 'c';
