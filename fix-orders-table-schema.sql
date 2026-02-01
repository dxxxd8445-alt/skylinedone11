-- Fix Orders Table Schema for Stripe Integration
-- Add missing columns that Stripe webhook expects

-- Add missing columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS amount_cents INTEGER,
ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS billing_address JSONB,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Update existing orders to have proper amount_cents if they only have amount
UPDATE orders 
SET amount_cents = ROUND(amount * 100)
WHERE amount_cents IS NULL AND amount IS NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent_id ON orders(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Add missing columns to licenses table if needed
ALTER TABLE licenses 
ADD COLUMN IF NOT EXISTS variant_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for licenses table
CREATE INDEX IF NOT EXISTS idx_licenses_order_id ON licenses(order_id);
CREATE INDEX IF NOT EXISTS idx_licenses_customer_email ON licenses(customer_email);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status);
CREATE INDEX IF NOT EXISTS idx_licenses_product_id ON licenses(product_id);

-- Update admin actions to handle both amount and amount_cents
-- This ensures backward compatibility

COMMENT ON COLUMN orders.amount IS 'Amount in dollars (legacy, use amount_cents for new records)';
COMMENT ON COLUMN orders.amount_cents IS 'Amount in cents (preferred for Stripe integration)';
COMMENT ON COLUMN orders.currency IS 'Currency code (USD, EUR, etc.)';
COMMENT ON COLUMN orders.stripe_session_id IS 'Stripe checkout session ID';
COMMENT ON COLUMN orders.payment_intent_id IS 'Stripe payment intent ID';

-- Show the updated schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;