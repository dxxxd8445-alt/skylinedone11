-- Stripe Integration Database Setup
-- Copy and paste this entire script into your Supabase SQL Editor and click "Run"

-- Create stripe_sessions table
CREATE TABLE IF NOT EXISTS stripe_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  items JSONB NOT NULL,
  coupon_code TEXT,
  coupon_discount_amount DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'failed')),
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update orders table for Stripe
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'moneymotion';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_discount_amount DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Update licenses table for order tracking
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS order_id UUID;
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_session_id ON stripe_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_customer_email ON stripe_sessions(customer_email);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_status ON stripe_sessions(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_licenses_order_id ON licenses(order_id);

-- Enable RLS on stripe_sessions
ALTER TABLE stripe_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for stripe_sessions
DROP POLICY IF EXISTS "Service role access stripe_sessions" ON stripe_sessions;
CREATE POLICY "Service role access stripe_sessions" ON stripe_sessions
FOR ALL 
USING (auth.role() = 'service_role');

-- Verify setup
SELECT 'Stripe database setup complete!' as status;