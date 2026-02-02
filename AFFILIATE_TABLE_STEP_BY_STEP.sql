-- AFFILIATE TABLE MIGRATION - STEP BY STEP VERSION
-- Run each section separately if you encounter any issues

-- STEP 1: Add store_user_id column
ALTER TABLE affiliates 
ADD COLUMN IF NOT EXISTS store_user_id UUID REFERENCES store_users(id) ON DELETE CASCADE;

-- STEP 2: Add required columns
ALTER TABLE affiliates 
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 5.00;

ALTER TABLE affiliates 
ADD COLUMN IF NOT EXISTS payment_email TEXT;

ALTER TABLE affiliates 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'paypal';

ALTER TABLE affiliates 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

ALTER TABLE affiliates 
ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE affiliates 
ADD COLUMN IF NOT EXISTS pending_earnings DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE affiliates 
ADD COLUMN IF NOT EXISTS paid_earnings DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE affiliates 
ADD COLUMN IF NOT EXISTS total_clicks INTEGER DEFAULT 0;

ALTER TABLE affiliates 
ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0;

ALTER TABLE affiliates 
ADD COLUMN IF NOT EXISTS total_sales INTEGER DEFAULT 0;

ALTER TABLE affiliates 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE affiliates 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- STEP 3: Fix affiliate_code column
-- Make sure any null codes are filled
UPDATE affiliates 
SET affiliate_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))
WHERE affiliate_code IS NULL;

-- STEP 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_affiliates_store_user_id ON affiliates(store_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_affiliate_code ON affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);

-- STEP 5: Update RLS policies
DROP POLICY IF EXISTS "Users can view their own affiliate data" ON affiliates;
DROP POLICY IF EXISTS "Users can insert their own affiliate data" ON affiliates;
DROP POLICY IF EXISTS "Users can update their own affiliate data" ON affiliates;

CREATE POLICY "Enable all operations for affiliates" ON affiliates FOR ALL USING (true);

ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

-- STEP 6: Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'affiliates' 
ORDER BY ordinal_position;