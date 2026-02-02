-- AFFILIATE TABLE MIGRATION FOR STORE USERS (FIXED VERSION)
-- Run this SQL in your Supabase SQL Editor

-- 1. Add store_user_id column to affiliates table
ALTER TABLE affiliates 
ADD COLUMN IF NOT EXISTS store_user_id UUID REFERENCES store_users(id) ON DELETE CASCADE;

-- 2. Add unique constraint to prevent duplicate affiliate accounts per store user
-- Use DO block to check if constraint exists before adding
DO $$ 
BEGIN
    -- Check if the constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'affiliates_store_user_id_unique'
    ) THEN
        ALTER TABLE affiliates 
        ADD CONSTRAINT affiliates_store_user_id_unique UNIQUE (store_user_id);
    END IF;
END $$;

-- 3. Ensure all required columns exist
ALTER TABLE affiliates 
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 5.00,
ADD COLUMN IF NOT EXISTS payment_email TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'paypal',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS pending_earnings DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS paid_earnings DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_sales INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Ensure affiliate_code is unique and not null
-- First make sure the column allows nulls temporarily
ALTER TABLE affiliates 
ALTER COLUMN affiliate_code DROP NOT NULL;

-- Update any null affiliate codes with generated ones
UPDATE affiliates 
SET affiliate_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))
WHERE affiliate_code IS NULL;

-- Now make it NOT NULL
ALTER TABLE affiliates 
ALTER COLUMN affiliate_code SET NOT NULL;

-- 5. Add unique constraint for affiliate_code if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'affiliates_affiliate_code_unique'
    ) THEN
        ALTER TABLE affiliates 
        ADD CONSTRAINT affiliates_affiliate_code_unique UNIQUE (affiliate_code);
    END IF;
END $$;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_affiliates_store_user_id ON affiliates(store_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_affiliate_code ON affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);

-- 7. Drop old RLS policies if they exist
DROP POLICY IF EXISTS "Users can view their own affiliate data" ON affiliates;
DROP POLICY IF EXISTS "Users can insert their own affiliate data" ON affiliates;
DROP POLICY IF EXISTS "Users can update their own affiliate data" ON affiliates;

-- 8. Create new simplified RLS policy
CREATE POLICY "Enable all operations for affiliates" ON affiliates
  FOR ALL USING (true);

-- 9. Ensure RLS is enabled
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

-- 10. Verify table structure (this will show in results)
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'affiliates' 
ORDER BY ordinal_position;