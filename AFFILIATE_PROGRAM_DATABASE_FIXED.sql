-- ============================================
-- AFFILIATE PROGRAM DATABASE SETUP - FIXED VERSION
-- Run this in your Supabase SQL Editor
-- ============================================

-- First, create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. AFFILIATES TABLE
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES store_users(id) ON DELETE CASCADE,
  affiliate_code TEXT UNIQUE NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 5.00,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  pending_earnings DECIMAL(10,2) DEFAULT 0.00,
  paid_earnings DECIMAL(10,2) DEFAULT 0.00,
  total_referrals INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  payment_email TEXT,
  payment_method TEXT DEFAULT 'paypal',
  minimum_payout DECIMAL(10,2) DEFAULT 50.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AFFILIATE REFERRALS TABLE
CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES store_users(id) ON DELETE SET NULL,
  referred_email TEXT NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  order_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AFFILIATE PAYOUTS TABLE
CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_email TEXT NOT NULL,
  transaction_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  notes TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AFFILIATE CLICKS TABLE
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  landing_page TEXT,
  converted BOOLEAN DEFAULT false,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own affiliate data" ON affiliates;
DROP POLICY IF EXISTS "Users can update own affiliate data" ON affiliates;
DROP POLICY IF EXISTS "Service role can manage affiliates" ON affiliates;
DROP POLICY IF EXISTS "Affiliates can view own referrals" ON affiliate_referrals;
DROP POLICY IF EXISTS "Service role can manage referrals" ON affiliate_referrals;
DROP POLICY IF EXISTS "Affiliates can view own payouts" ON affiliate_payouts;
DROP POLICY IF EXISTS "Service role can manage payouts" ON affiliate_payouts;
DROP POLICY IF EXISTS "Service role can manage clicks" ON affiliate_clicks;

-- Create RLS Policies
CREATE POLICY "Users can view own affiliate data" ON affiliates
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own affiliate data" ON affiliates
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own affiliate data" ON affiliates
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage affiliates" ON affiliates
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Affiliates can view own referrals" ON affiliate_referrals
FOR SELECT USING (
  affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
);

CREATE POLICY "Service role can manage referrals" ON affiliate_referrals
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Affiliates can view own payouts" ON affiliate_payouts
FOR SELECT USING (
  affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
);

CREATE POLICY "Service role can manage payouts" ON affiliate_payouts
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage clicks" ON affiliate_clicks
FOR ALL USING (auth.role() = 'service_role');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_order_id ON affiliate_referrals(order_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate_id ON affiliate_payouts(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate_id ON affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created_at ON affiliate_clicks(created_at);

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_affiliates_updated_at ON affiliates;
DROP TRIGGER IF EXISTS update_affiliate_referrals_updated_at ON affiliate_referrals;

-- Create triggers for updated_at
CREATE TRIGGER update_affiliates_updated_at 
BEFORE UPDATE ON affiliates FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_referrals_updated_at 
BEFORE UPDATE ON affiliate_referrals FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique affiliate codes
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM affiliates WHERE affiliate_code = code) INTO exists;
    IF NOT exists THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to update affiliate earnings automatically
CREATE OR REPLACE FUNCTION update_affiliate_earnings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update affiliate totals when referral status changes
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    UPDATE affiliates 
    SET 
      pending_earnings = (
        SELECT COALESCE(SUM(commission_amount), 0) 
        FROM affiliate_referrals 
        WHERE affiliate_id = NEW.affiliate_id AND status = 'pending'
      ),
      paid_earnings = (
        SELECT COALESCE(SUM(commission_amount), 0) 
        FROM affiliate_referrals 
        WHERE affiliate_id = NEW.affiliate_id AND status = 'paid'
      ),
      total_earnings = (
        SELECT COALESCE(SUM(commission_amount), 0) 
        FROM affiliate_referrals 
        WHERE affiliate_id = NEW.affiliate_id AND status IN ('approved', 'paid')
      ),
      total_sales = (
        SELECT COUNT(*) 
        FROM affiliate_referrals 
        WHERE affiliate_id = NEW.affiliate_id
      ),
      updated_at = NOW()
    WHERE id = NEW.affiliate_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_affiliate_earnings_trigger ON affiliate_referrals;

-- Create trigger for automatic earnings updates
CREATE TRIGGER update_affiliate_earnings_trigger
AFTER UPDATE ON affiliate_referrals
FOR EACH ROW EXECUTE FUNCTION update_affiliate_earnings();

-- Insert a test message to confirm setup
SELECT 'Affiliate program database setup completed successfully!' as message;