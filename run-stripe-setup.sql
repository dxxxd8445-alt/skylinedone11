-- Stripe Integration Database Setup
-- Run this in your Supabase SQL Editor

-- Create stripe_sessions table to track checkout sessions
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_session_id ON stripe_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_customer_email ON stripe_sessions(customer_email);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_status ON stripe_sessions(status);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_created_at ON stripe_sessions(created_at);

-- Update orders table to support Stripe
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'moneymotion';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_discount_amount DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add indexes for orders table
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent_id ON orders(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_coupon_code ON orders(coupon_code);

-- Update licenses table to support order tracking
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id);
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

-- Add index for license order tracking
CREATE INDEX IF NOT EXISTS idx_licenses_order_id ON licenses(order_id);
CREATE INDEX IF NOT EXISTS idx_licenses_assigned_at ON licenses(assigned_at);

-- Enable RLS on stripe_sessions table
ALTER TABLE stripe_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for stripe_sessions (service role only)
DROP POLICY IF EXISTS "Service role access stripe_sessions" ON stripe_sessions;
CREATE POLICY "Service role access stripe_sessions" ON stripe_sessions
FOR ALL 
USING (auth.role() = 'service_role');

-- Create a function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_stripe_sessions_updated_at ON stripe_sessions;
CREATE TRIGGER update_stripe_sessions_updated_at
    BEFORE UPDATE ON stripe_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the setup
SELECT 'Stripe database setup complete!' as status;
SELECT 'stripe_sessions table created' as status;
SELECT 'orders table updated for Stripe' as status;
SELECT 'licenses table updated for order tracking' as status;
SELECT 'RLS policies created' as status;
SELECT 'Indexes created for performance' as status;