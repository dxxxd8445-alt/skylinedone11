-- ============================================================================
-- FIX COUPONS TABLE - ADD MISSING STATUS COLUMN
-- ============================================================================

-- Add status column if it doesn't exist
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Update existing coupons to have status
UPDATE coupons SET status = 'active' WHERE status IS NULL;

-- Verify the column exists
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'coupons' AND column_name = 'status';
