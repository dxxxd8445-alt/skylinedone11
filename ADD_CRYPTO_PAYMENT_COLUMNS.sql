-- ============================================
-- ADD CRYPTO PAYMENT COLUMNS TO ORDERS TABLE
-- ============================================
-- This adds support for crypto payments (Litecoin and Bitcoin)
-- Crypto orders will be created with "pending" status and require manual verification

-- Add crypto-specific columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS crypto_amount DECIMAL(18,8),
ADD COLUMN IF NOT EXISTS crypto_address TEXT;

-- Update payment_method check constraint to include crypto options
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_payment_method_check 
CHECK (payment_method IN ('moneymotion', 'stripe', 'card', 'litecoin', 'bitcoin'));

-- Add index for faster crypto order lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Add comment explaining crypto columns
COMMENT ON COLUMN orders.crypto_amount IS 'Amount of cryptocurrency sent (LTC or BTC)';
COMMENT ON COLUMN orders.crypto_address IS 'Crypto address where payment was sent';

-- Fix RLS policy to allow API to insert orders
DROP POLICY IF EXISTS "Allow API to insert orders" ON orders;
CREATE POLICY "Allow API to insert orders" ON orders
  FOR INSERT
  WITH CHECK (true);

-- Show success message
DO $$
BEGIN
  RAISE NOTICE '✅ Crypto payment columns added successfully!';
  RAISE NOTICE '📝 Crypto orders will be created with "pending" status';
  RAISE NOTICE '🔍 Admin must manually verify and mark as "completed"';
  RAISE NOTICE '🔐 RLS policy updated to allow order creation';
END $$;
