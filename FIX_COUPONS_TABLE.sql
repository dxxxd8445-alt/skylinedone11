-- Fix Coupons Table Structure
-- Copy and paste this entire script into your Supabase SQL Editor

-- First, let's check if the coupons table exists and add missing columns
DO $$
BEGIN
    -- Add discount_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'coupons' AND column_name = 'discount_type'
    ) THEN
        ALTER TABLE coupons ADD COLUMN discount_type TEXT DEFAULT 'percent';
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
            ALTER TABLE coupons ADD COLUMN discount_value INTEGER NOT NULL DEFAULT 0;
        END IF;
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

    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'coupons' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE coupons ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;

    -- Add expires_at column if it doesn't exist (rename from valid_until if needed)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'coupons' AND column_name = 'expires_at'
    ) THEN
        -- Check if valid_until exists and rename it
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

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'coupons' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE coupons ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Update existing records to have proper discount_type
UPDATE coupons SET discount_type = 'percent' WHERE discount_type IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_expires_at ON coupons(expires_at);

-- Enable RLS (Row Level Security)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for service role access
DROP POLICY IF EXISTS "Service role access" ON coupons;
CREATE POLICY "Service role access" ON coupons FOR ALL USING (auth.role() = 'service_role');

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'coupons' 
ORDER BY ordinal_position;