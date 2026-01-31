-- PRODUCTION DATABASE SETUP FOR VERCEL DEPLOYMENT
-- Run this script in your Supabase SQL Editor to ensure all tables exist

-- 1. Create webhooks table for Discord integration
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for webhooks
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks(is_active);
CREATE INDEX IF NOT EXISTS idx_webhooks_events ON webhooks USING GIN(events);

-- Enable RLS on webhooks
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for webhooks (service role only for now)
DROP POLICY IF EXISTS "Admin can manage webhooks" ON webhooks;
CREATE POLICY "Service role can manage webhooks" ON webhooks
  FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions on webhooks
GRANT ALL ON webhooks TO authenticated;
GRANT ALL ON webhooks TO service_role;

-- 2. Ensure orders table has correct structure for Stripe
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'moneymotion';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_discount_amount DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent_id ON orders(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- 3. Ensure stripe_sessions table exists
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

-- Create indexes for stripe_sessions
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_session_id ON stripe_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_customer_email ON stripe_sessions(customer_email);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_status ON stripe_sessions(status);

-- Enable RLS on stripe_sessions
ALTER TABLE stripe_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for stripe_sessions
DROP POLICY IF EXISTS "Service role access stripe_sessions" ON stripe_sessions;
CREATE POLICY "Service role access stripe_sessions" ON stripe_sessions
FOR ALL 
USING (auth.role() = 'service_role');

-- Grant permissions on stripe_sessions
GRANT ALL ON stripe_sessions TO authenticated;
GRANT ALL ON stripe_sessions TO service_role;

-- 4. Update licenses table for order tracking
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS order_id UUID;
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

-- Add index for license order tracking
CREATE INDEX IF NOT EXISTS idx_licenses_order_id ON licenses(order_id);
CREATE INDEX IF NOT EXISTS idx_licenses_assigned_at ON licenses(assigned_at);

-- 5. Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_webhooks_updated_at ON webhooks;
CREATE TRIGGER update_webhooks_updated_at
    BEFORE UPDATE ON webhooks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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

-- 6. Verify all critical tables exist
DO $$
BEGIN
    -- Check if all required tables exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'webhooks') THEN
        RAISE EXCEPTION 'webhooks table was not created properly';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') THEN
        RAISE EXCEPTION 'orders table does not exist';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'stripe_sessions') THEN
        RAISE EXCEPTION 'stripe_sessions table was not created properly';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') THEN
        RAISE EXCEPTION 'products table does not exist';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'licenses') THEN
        RAISE EXCEPTION 'licenses table does not exist';
    END IF;
    
    RAISE NOTICE 'All required tables exist and are properly configured!';
END $$;

-- 7. Show table counts for verification
SELECT 
    'webhooks' as table_name, 
    COUNT(*) as row_count 
FROM webhooks
UNION ALL
SELECT 
    'orders' as table_name, 
    COUNT(*) as row_count 
FROM orders
UNION ALL
SELECT 
    'stripe_sessions' as table_name, 
    COUNT(*) as row_count 
FROM stripe_sessions
UNION ALL
SELECT 
    'products' as table_name, 
    COUNT(*) as row_count 
FROM products
UNION ALL
SELECT 
    'licenses' as table_name, 
    COUNT(*) as row_count 
FROM licenses;

-- Success message
SELECT 'Production database setup complete! All tables are ready for Discord webhooks and Stripe integration.' as status;