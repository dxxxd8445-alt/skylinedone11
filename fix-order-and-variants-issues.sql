-- Fix Order Creation and Product Variants Issues
-- This script addresses both the "Failed to create order" and variant creation problems

-- 1. Ensure stripe_sessions table has all required columns
ALTER TABLE stripe_sessions 
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS items JSONB,
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS coupon_discount_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Add unique constraint on session_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'stripe_sessions_session_id_key'
    ) THEN
        ALTER TABLE stripe_sessions ADD CONSTRAINT stripe_sessions_session_id_key UNIQUE (session_id);
    END IF;
END $$;

-- 2. Ensure product_variants table has correct structure
ALTER TABLE product_variants 
ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS duration TEXT NOT NULL DEFAULT '1 Day',
ADD COLUMN IF NOT EXISTS price INTEGER NOT NULL DEFAULT 0, -- Price in cents
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);

-- 3. Ensure orders table has all required columns for Stripe integration
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'stripe',
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'usd',
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add indexes for Stripe fields
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id ON orders(stripe_payment_intent_id);

-- 4. Ensure licenses table has variant_id column
ALTER TABLE licenses 
ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL;

-- Add index for variant_id
CREATE INDEX IF NOT EXISTS idx_licenses_variant_id ON licenses(variant_id);

-- 5. Update RLS policies for stripe_sessions table
DROP POLICY IF EXISTS "Enable all operations for service role" ON stripe_sessions;
CREATE POLICY "Enable all operations for service role" ON stripe_sessions
    FOR ALL USING (auth.role() = 'service_role');

-- 6. Update RLS policies for product_variants table
DROP POLICY IF EXISTS "Enable read access for all users" ON product_variants;
DROP POLICY IF EXISTS "Enable all operations for service role" ON product_variants;

CREATE POLICY "Enable read access for all users" ON product_variants
    FOR SELECT USING (true);

CREATE POLICY "Enable all operations for service role" ON product_variants
    FOR ALL USING (auth.role() = 'service_role');

-- 7. Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create trigger for product_variants updated_at
DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
CREATE TRIGGER update_product_variants_updated_at
    BEFORE UPDATE ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Ensure proper data types and constraints
-- Fix any existing data type issues
UPDATE product_variants SET price = 0 WHERE price IS NULL;
UPDATE orders SET amount = 0 WHERE amount IS NULL;

-- 10. Add sample product variants for testing (if products exist)
DO $$
DECLARE
    product_record RECORD;
BEGIN
    -- Add variants for existing products that don't have any
    FOR product_record IN 
        SELECT p.id, p.name 
        FROM products p 
        LEFT JOIN product_variants pv ON p.id = pv.product_id 
        WHERE pv.id IS NULL 
        LIMIT 5
    LOOP
        INSERT INTO product_variants (product_id, duration, price) VALUES
        (product_record.id, '1 Day', 999),    -- $9.99
        (product_record.id, '7 Days', 1999),  -- $19.99
        (product_record.id, '30 Days', 4999); -- $49.99
    END LOOP;
END $$;

-- 11. Verify table structures
SELECT 'stripe_sessions columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'stripe_sessions' 
ORDER BY ordinal_position;

SELECT 'product_variants columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'product_variants' 
ORDER BY ordinal_position;

SELECT 'orders columns (Stripe-related):' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('stripe_session_id', 'stripe_payment_intent_id', 'payment_method', 'subtotal', 'discount_amount')
ORDER BY ordinal_position;

-- Success message
SELECT '✅ Database schema fixes applied successfully!' as result;