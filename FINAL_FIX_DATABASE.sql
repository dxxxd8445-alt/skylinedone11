-- ============================================
-- FINAL DATABASE FIX - Ring-0
-- ============================================
-- This script fixes all remaining database issues:
-- 1. Ensures affiliates table uses store_user_id (not user_id)
-- 2. Adds missing indexes for performance
-- 3. Ensures all audit logging works correctly
-- ============================================

-- First, check if affiliates table exists and has wrong column name
DO $$
BEGIN
  -- If user_id column exists, rename it to store_user_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'affiliates' AND column_name = 'user_id'
  ) THEN
    -- Drop the old foreign key constraint if it exists
    ALTER TABLE affiliates DROP CONSTRAINT IF EXISTS affiliates_user_id_fkey;
    
    -- Rename the column
    ALTER TABLE affiliates RENAME COLUMN user_id TO store_user_id;
    
    -- Add the new foreign key constraint
    ALTER TABLE affiliates ADD CONSTRAINT affiliates_store_user_id_fkey 
      FOREIGN KEY (store_user_id) REFERENCES store_users(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Renamed user_id to store_user_id in affiliates table';
  END IF;
  
  -- Ensure store_user_id column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'affiliates' AND column_name = 'store_user_id'
  ) THEN
    ALTER TABLE affiliates ADD COLUMN store_user_id UUID REFERENCES store_users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added store_user_id column to affiliates table';
  END IF;
END $$;

-- Ensure admin_audit_logs table exists with correct structure
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('login', 'logout')),
  actor_role TEXT NOT NULL CHECK (actor_role IN ('admin', 'staff')),
  actor_identifier TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on admin_audit_logs for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_actor_role ON admin_audit_logs(actor_role);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_event_type ON admin_audit_logs(event_type);

-- Ensure affiliates table has all required columns
DO $$
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliates' AND column_name = 'affiliate_code') THEN
    ALTER TABLE affiliates ADD COLUMN affiliate_code TEXT UNIQUE NOT NULL DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliates' AND column_name = 'commission_rate') THEN
    ALTER TABLE affiliates ADD COLUMN commission_rate NUMERIC DEFAULT 10;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliates' AND column_name = 'total_earnings') THEN
    ALTER TABLE affiliates ADD COLUMN total_earnings NUMERIC DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliates' AND column_name = 'pending_earnings') THEN
    ALTER TABLE affiliates ADD COLUMN pending_earnings NUMERIC DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliates' AND column_name = 'paid_earnings') THEN
    ALTER TABLE affiliates ADD COLUMN paid_earnings NUMERIC DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliates' AND column_name = 'total_referrals') THEN
    ALTER TABLE affiliates ADD COLUMN total_referrals INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliates' AND column_name = 'total_sales') THEN
    ALTER TABLE affiliates ADD COLUMN total_sales INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliates' AND column_name = 'status') THEN
    ALTER TABLE affiliates ADD COLUMN status TEXT DEFAULT 'active';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliates' AND column_name = 'payment_email') THEN
    ALTER TABLE affiliates ADD COLUMN payment_email TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliates' AND column_name = 'payment_method') THEN
    ALTER TABLE affiliates ADD COLUMN payment_method TEXT DEFAULT 'paypal';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliates' AND column_name = 'crypto_type') THEN
    ALTER TABLE affiliates ADD COLUMN crypto_type TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliates' AND column_name = 'cashapp_tag') THEN
    ALTER TABLE affiliates ADD COLUMN cashapp_tag TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliates' AND column_name = 'minimum_payout') THEN
    ALTER TABLE affiliates ADD COLUMN minimum_payout NUMERIC DEFAULT 50;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliates' AND column_name = 'created_at') THEN
    ALTER TABLE affiliates ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliates' AND column_name = 'updated_at') THEN
    ALTER TABLE affiliates ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Create indexes on affiliates table for better performance
CREATE INDEX IF NOT EXISTS idx_affiliates_store_user_id ON affiliates(store_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_affiliate_code ON affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);
CREATE INDEX IF NOT EXISTS idx_affiliates_created_at ON affiliates(created_at DESC);

-- Ensure affiliate_referrals table exists
CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  referred_email TEXT NOT NULL,
  commission_amount NUMERIC NOT NULL DEFAULT 0,
  order_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_order_id ON affiliate_referrals(order_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_status ON affiliate_referrals(status);

-- Ensure affiliate_clicks table exists
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  landing_page TEXT,
  converted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate_id ON affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created_at ON affiliate_clicks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_converted ON affiliate_clicks(converted);

-- Ensure affiliate_payouts table exists
CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  payment_details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  transaction_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate_id ON affiliate_payouts(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_status ON affiliate_payouts(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_created_at ON affiliate_payouts(created_at DESC);

-- Enable RLS on all affiliate tables
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations for service role" ON affiliates;
DROP POLICY IF EXISTS "Allow all operations for service role" ON affiliate_referrals;
DROP POLICY IF EXISTS "Allow all operations for service role" ON affiliate_clicks;
DROP POLICY IF EXISTS "Allow all operations for service role" ON affiliate_payouts;
DROP POLICY IF EXISTS "Allow all operations for service role" ON admin_audit_logs;

-- Create policies that allow service role to do everything
CREATE POLICY "Allow all operations for service role" ON affiliates FOR ALL USING (true);
CREATE POLICY "Allow all operations for service role" ON affiliate_referrals FOR ALL USING (true);
CREATE POLICY "Allow all operations for service role" ON affiliate_clicks FOR ALL USING (true);
CREATE POLICY "Allow all operations for service role" ON affiliate_payouts FOR ALL USING (true);
CREATE POLICY "Allow all operations for service role" ON admin_audit_logs FOR ALL USING (true);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Database fix completed successfully!';
  RAISE NOTICE '✅ Affiliates table now uses store_user_id column';
  RAISE NOTICE '✅ Admin audit logs table is ready';
  RAISE NOTICE '✅ All indexes created for performance';
  RAISE NOTICE '✅ RLS policies configured';
END $$;
