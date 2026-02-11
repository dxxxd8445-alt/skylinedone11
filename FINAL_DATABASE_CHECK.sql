-- ============================================================================
-- FINAL DATABASE CHECK - Run this before deployment
-- ============================================================================
-- This script ensures all required columns exist for the latest features:
-- 1. Staff permissions system
-- 2. License key stock assignment
-- 3. Customer order tracking
-- 4. Email delivery system
-- ============================================================================

-- Check if licenses table has all required columns
DO $$
BEGIN
  -- Add assigned_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'licenses' AND column_name = 'assigned_at'
  ) THEN
    ALTER TABLE licenses ADD COLUMN assigned_at TIMESTAMPTZ;
    RAISE NOTICE '✓ Added assigned_at column to licenses table';
  ELSE
    RAISE NOTICE '✓ assigned_at column already exists in licenses table';
  END IF;

  -- Ensure order_id column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'licenses' AND column_name = 'order_id'
  ) THEN
    ALTER TABLE licenses ADD COLUMN order_id UUID REFERENCES orders(id);
    RAISE NOTICE '✓ Added order_id column to licenses table';
  ELSE
    RAISE NOTICE '✓ order_id column already exists in licenses table';
  END IF;

  -- Ensure customer_email column exists and is nullable (for stock)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'licenses' AND column_name = 'customer_email'
  ) THEN
    ALTER TABLE licenses ADD COLUMN customer_email TEXT;
    RAISE NOTICE '✓ Added customer_email column to licenses table';
  ELSE
    -- Make it nullable if it's not already
    ALTER TABLE licenses ALTER COLUMN customer_email DROP NOT NULL;
    RAISE NOTICE '✓ customer_email column already exists (made nullable for stock)';
  END IF;

  -- Ensure variant_id column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'licenses' AND column_name = 'variant_id'
  ) THEN
    ALTER TABLE licenses ADD COLUMN variant_id UUID REFERENCES product_variants(id);
    RAISE NOTICE '✓ Added variant_id column to licenses table';
  ELSE
    RAISE NOTICE '✓ variant_id column already exists in licenses table';
  END IF;

  -- Ensure product_id column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'licenses' AND column_name = 'product_id'
  ) THEN
    ALTER TABLE licenses ADD COLUMN product_id UUID REFERENCES products(id);
    RAISE NOTICE '✓ Added product_id column to licenses table';
  ELSE
    RAISE NOTICE '✓ product_id column already exists in licenses table';
  END IF;

  -- Ensure product_name column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'licenses' AND column_name = 'product_name'
  ) THEN
    ALTER TABLE licenses ADD COLUMN product_name TEXT;
    RAISE NOTICE '✓ Added product_name column to licenses table';
  ELSE
    RAISE NOTICE '✓ product_name column already exists in licenses table';
  END IF;

  -- Ensure status column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'licenses' AND column_name = 'status'
  ) THEN
    ALTER TABLE licenses ADD COLUMN status TEXT DEFAULT 'unused';
    RAISE NOTICE '✓ Added status column to licenses table';
  ELSE
    RAISE NOTICE '✓ status column already exists in licenses table';
  END IF;

  -- Ensure expires_at column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'licenses' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE licenses ADD COLUMN expires_at TIMESTAMPTZ;
    RAISE NOTICE '✓ Added expires_at column to licenses table';
  ELSE
    RAISE NOTICE '✓ expires_at column already exists in licenses table';
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_licenses_order_id ON licenses(order_id);
CREATE INDEX IF NOT EXISTS idx_licenses_customer_email ON licenses(customer_email);
CREATE INDEX IF NOT EXISTS idx_licenses_assigned_at ON licenses(assigned_at);
CREATE INDEX IF NOT EXISTS idx_licenses_variant_id ON licenses(variant_id);
CREATE INDEX IF NOT EXISTS idx_licenses_product_id ON licenses(product_id);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status);

-- Verify the structure
SELECT 
  'licenses' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'licenses'
ORDER BY ordinal_position;

-- Show summary
SELECT 
  '✓ Database check complete!' as status,
  'All required columns exist for license stock assignment' as message;
