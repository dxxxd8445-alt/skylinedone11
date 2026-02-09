-- ============================================================================
-- COMPLETE COUPONS FIX - Run this in Supabase SQL Editor
-- ============================================================================
-- This script fixes the coupons table structure and adds product-specific coupon support

-- Step 1: Fix coupons table columns
-- ============================================================================

DO $$
BEGIN
    -- Add discount_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'coupons' AND column_name = 'discount_type'
    ) THEN
        ALTER TABLE coupons ADD COLUMN discount_type TEXT DEFAULT 'percentage';
    END IF;

    -- Add discount_value column if it doesn't exist (rename from discount_percent if needed)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'coupons' AND column_name = 'discount_value'
    ) THEN
        -- Check if discount_percent exists and rename it
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'coupons' AND column_name = 'discount_percent'
        ) THEN
            ALTER TABLE coupons RENAME COLUMN discount_percent TO discount_value;
        ELSE
            ALTER TABLE coupons ADD COLUMN discount_value DECIMAL(10,2) NOT NULL DEFAULT 0;
        END IF;
    END IF;

    -- Add status column if it doesn't exist (rename from is_active if needed)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'coupons' AND column_name = 'status'
    ) THEN
        ALTER TABLE coupons ADD COLUMN status TEXT DEFAULT 'active';
    END IF;

    -- Add max_uses column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'coupons' AND column_name = 'max_uses'
    ) THEN
        ALTER TABLE coupons ADD COLUMN max_uses INTEGER;
    END IF;

    -- Add current_uses column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'coupons' AND column_name = 'current_uses'
    ) THEN
        ALTER TABLE coupons ADD COLUMN current_uses INTEGER DEFAULT 0;
    END IF;

    -- Add starts_at column if it doesn't exist (rename from valid_from if needed)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'coupons' AND column_name = 'starts_at'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'coupons' AND column_name = 'valid_from'
        ) THEN
            ALTER TABLE coupons RENAME COLUMN valid_from TO starts_at;
        ELSE
            ALTER TABLE coupons ADD COLUMN starts_at TIMESTAMPTZ;
        END IF;
    END IF;

    -- Add expires_at column if it doesn't exist (rename from valid_until if needed)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'coupons' AND column_name = 'expires_at'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'coupons' AND column_name = 'valid_until'
        ) THEN
            ALTER TABLE coupons RENAME COLUMN valid_until TO expires_at;
        ELSE
            ALTER TABLE coupons ADD COLUMN expires_at TIMESTAMPTZ;
        END IF;
    END IF;

    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'coupons' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE coupons ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Step 2: Create coupon_products junction table for product-specific coupons
-- ============================================================================

CREATE TABLE IF NOT EXISTS coupon_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(coupon_id, product_id)
);

-- Step 3: Create indexes for better performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons(status);
CREATE INDEX IF NOT EXISTS idx_coupons_expires_at ON coupons(expires_at);
CREATE INDEX IF NOT EXISTS idx_coupon_products_coupon_id ON coupon_products(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_products_product_id ON coupon_products(product_id);

-- Step 4: Enable RLS (Row Level Security)
-- ============================================================================

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role access" ON coupons;
DROP POLICY IF EXISTS "Service role access" ON coupon_products;
DROP POLICY IF EXISTS "Public read active coupons" ON coupons;

-- Create RLS policies
CREATE POLICY "Service role access" ON coupons 
    FOR ALL 
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role access" ON coupon_products 
    FOR ALL 
    USING (auth.role() = 'service_role');

CREATE POLICY "Public read active coupons" ON coupons 
    FOR SELECT 
    USING (status = 'active' AND (expires_at IS NULL OR expires_at > NOW()));

-- Step 5: Update existing records
-- ============================================================================

-- Set default discount_type for existing records
UPDATE coupons SET discount_type = 'percentage' WHERE discount_type IS NULL;

-- Set default status for existing records
UPDATE coupons SET status = 'active' WHERE status IS NULL;

-- Step 6: Verify the table structure
-- ============================================================================

SELECT 
    'coupons' as table_name,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'coupons' 
ORDER BY ordinal_position;

SELECT 
    'coupon_products' as table_name,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'coupon_products' 
ORDER BY ordinal_position;

-- ============================================================================
-- DONE! Your coupons system is now ready
-- ============================================================================
