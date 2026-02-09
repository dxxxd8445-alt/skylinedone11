-- Fix Orders Table for Custom Checkout
-- Run this in Supabase SQL Editor

-- First, check if metadata column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE orders ADD COLUMN metadata JSONB;
    END IF;
END $$;

-- Make sure id column can accept custom values (not auto-generated)
-- If your orders table has id as UUID with default gen_random_uuid(), we need to allow custom values

-- Check current orders table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- If you see any issues, uncomment and run these:

-- Option 1: If id is auto-generated UUID, allow custom values
-- ALTER TABLE orders ALTER COLUMN id DROP DEFAULT;

-- Option 2: If id doesn't exist as text, add it
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS id TEXT PRIMARY KEY;

-- Make sure these columns exist:
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount_cents INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;
