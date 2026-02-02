-- ============================================================================
-- FIX COUPONS TABLE - ADD MISSING STATUS COLUMN
-- ============================================================================
-- Copy and paste this entire script into Supabase SQL Editor and click "Run"
-- ============================================================================

-- Add status column if it doesn't exist
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Update existing coupons to have status
UPDATE coupons SET status = 'active' WHERE status IS NULL;

-- Verify the column exists
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'coupons' AND column_name = 'status';

-- ============================================================================
-- DONE! The coupons table is now fixed and ready to use.
-- ============================================================================
