-- Fix affiliates table to work with store_users instead of auth.users

-- First, check if the table exists and what columns it has
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'affiliates' 
ORDER BY ordinal_position;

-- Add store_user_id column if it doesn't exist
ALTER TABLE affiliates 
ADD COLUMN IF NOT EXISTS store_user_id UUID REFERENCES store_users(id) ON DELETE CASCADE;

-- Update existing records if any exist (this is safe since we're just adding a new column)
-- Note: This will need manual data migration if there are existing records

-- Drop the old user_id column constraint if it exists
ALTER TABLE affiliates 
DROP CONSTRAINT IF EXISTS affiliates_user_id_fkey;

-- Drop the old user_id column if it exists and store_user_id is populated
-- ALTER TABLE affiliates DROP COLUMN IF EXISTS user_id;

-- Update RLS policies to use store_user_id
DROP POLICY IF EXISTS "Users can view their own affiliate data" ON affiliates;
DROP POLICY IF EXISTS "Users can insert their own affiliate data" ON affiliates;
DROP POLICY IF EXISTS "Users can update their own affiliate data" ON affiliates;

-- Create new policies for store users
CREATE POLICY "Store users can view their own affiliate data" ON affiliates
  FOR SELECT USING (
    store_user_id IN (
      SELECT id FROM store_users WHERE id = store_user_id
    )
  );

CREATE POLICY "Store users can insert their own affiliate data" ON affiliates
  FOR INSERT WITH CHECK (
    store_user_id IN (
      SELECT id FROM store_users WHERE id = store_user_id
    )
  );

CREATE POLICY "Store users can update their own affiliate data" ON affiliates
  FOR UPDATE USING (
    store_user_id IN (
      SELECT id FROM store_users WHERE id = store_user_id
    )
  );

-- Ensure the table has all required columns
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

-- Ensure affiliate_code is unique and not null
ALTER TABLE affiliates 
ALTER COLUMN affiliate_code SET NOT NULL;

-- Add unique constraint if it doesn't exist
ALTER TABLE affiliates 
ADD CONSTRAINT IF NOT EXISTS affiliates_affiliate_code_unique UNIQUE (affiliate_code);

-- Add unique constraint for store_user_id to prevent duplicate affiliate accounts
ALTER TABLE affiliates 
ADD CONSTRAINT IF NOT EXISTS affiliates_store_user_id_unique UNIQUE (store_user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_affiliates_store_user_id ON affiliates(store_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_affiliate_code ON affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);

-- Show final table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'affiliates' 
ORDER BY ordinal_position;