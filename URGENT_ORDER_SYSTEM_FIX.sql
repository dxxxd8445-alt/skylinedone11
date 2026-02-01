-- URGENT: Fix Order System Database Schema
-- Run this immediately in Supabase SQL Editor

-- 1. Add missing fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS variant_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS duration TEXT;

-- 2. Ensure amount_cents field exists and is correct type
ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount_cents INTEGER;

-- 3. Update existing orders to have proper amount_cents if they have amount
UPDATE orders 
SET amount_cents = CASE 
  WHEN amount IS NOT NULL AND amount_cents IS NULL THEN (amount * 100)::INTEGER
  ELSE amount_cents 
END
WHERE amount IS NOT NULL AND amount_cents IS NULL;

-- 4. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_amount_cents ON orders(amount_cents);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);

-- 5. Add foreign key constraints if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'orders_product_id_fkey'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id);
  END IF;
END $$;

-- 6. Ensure licenses table has order_id reference
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS order_id UUID;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'licenses_order_id_fkey'
  ) THEN
    ALTER TABLE licenses ADD CONSTRAINT licenses_order_id_fkey 
    FOREIGN KEY (order_id) REFERENCES orders(id);
  END IF;
END $$;

-- 7. Create or update stripe_sessions table
CREATE TABLE IF NOT EXISTS stripe_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  items JSONB NOT NULL,
  coupon_code TEXT,
  coupon_discount_amount DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'failed')),
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Add missing indexes for stripe_sessions
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_session_id ON stripe_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_customer_email ON stripe_sessions(customer_email);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_status ON stripe_sessions(status);

-- 9. Enable RLS on stripe_sessions if not already enabled
ALTER TABLE stripe_sessions ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policy for stripe_sessions
DROP POLICY IF EXISTS "Service role access stripe_sessions" ON stripe_sessions;
CREATE POLICY "Service role access stripe_sessions" ON stripe_sessions
FOR ALL USING (auth.role() = 'service_role');

-- 11. Update any orders that are missing order_number
UPDATE orders 
SET order_number = 'ORD-' || UPPER(SUBSTRING(id::text, 1, 8))
WHERE order_number IS NULL OR order_number = '';

-- 12. Verify data integrity
SELECT 
  'Orders with missing customer_email' as issue,
  COUNT(*) as count
FROM orders 
WHERE customer_email IS NULL OR customer_email = ''
UNION ALL
SELECT 
  'Orders with missing amount_cents' as issue,
  COUNT(*) as count
FROM orders 
WHERE amount_cents IS NULL
UNION ALL
SELECT 
  'Orders with status completed' as issue,
  COUNT(*) as count
FROM orders 
WHERE status = 'completed'
UNION ALL
SELECT 
  'Total revenue (cents)' as issue,
  COALESCE(SUM(amount_cents), 0) as count
FROM orders 
WHERE status = 'completed';

-- 13. Show recent orders for verification
SELECT 
  id,
  order_number,
  customer_email,
  customer_name,
  amount_cents,
  currency,
  status,
  payment_method,
  created_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;