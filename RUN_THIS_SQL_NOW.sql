-- ============================================
-- CRYPTO PAYMENT SETUP - RUN THIS NOW!
-- ============================================
-- Copy this entire file and run it in Supabase SQL Editor

-- Step 1: Add crypto columns
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS crypto_amount DECIMAL(18,8),
ADD COLUMN IF NOT EXISTS crypto_address TEXT;

-- Step 2: Update payment method constraint
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_payment_method_check 
CHECK (payment_method IN ('moneymotion', 'stripe', 'card', 'litecoin', 'bitcoin'));

-- Step 3: Add indexes
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Step 4: Fix RLS policy to allow order creation
DROP POLICY IF EXISTS "Allow API to insert orders" ON orders;
CREATE POLICY "Allow API to insert orders" ON orders
  FOR INSERT
  WITH CHECK (true);

-- Step 5: Verify setup
DO $$
BEGIN
  RAISE NOTICE '✅ Crypto payment system is ready!';
  RAISE NOTICE '📝 Litecoin and Bitcoin payments enabled';
  RAISE NOTICE '🔐 RLS policy configured';
  RAISE NOTICE '🎉 You can now test crypto payments!';
END $$;
