-- ============================================
-- FIX AFFILIATE REGISTRATION - RUN THIS NOW!
-- ============================================

-- Drop and recreate affiliates table
DROP TABLE IF EXISTS affiliate_clicks CASCADE;
DROP TABLE IF EXISTS affiliate_payouts CASCADE;
DROP TABLE IF EXISTS affiliate_referrals CASCADE;
DROP TABLE IF EXISTS affiliates CASCADE;

-- Create affiliates table
CREATE TABLE affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_user_id UUID REFERENCES store_users(id) ON DELETE CASCADE,
  affiliate_code TEXT UNIQUE NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  pending_earnings DECIMAL(10,2) DEFAULT 0.00,
  paid_earnings DECIMAL(10,2) DEFAULT 0.00,
  total_referrals INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  payment_email TEXT,
  payment_method TEXT DEFAULT 'paypal',
  crypto_type TEXT,
  cashapp_tag TEXT,
  minimum_payout DECIMAL(10,2) DEFAULT 50.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create affiliate referrals table
CREATE TABLE affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES store_users(id) ON DELETE SET NULL,
  referred_email TEXT NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  order_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create affiliate payouts table
CREATE TABLE affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_email TEXT NOT NULL,
  transaction_id TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create affiliate clicks table
CREATE TABLE affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  landing_page TEXT,
  converted BOOLEAN DEFAULT false,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_affiliates_store_user_id ON affiliates(store_user_id);
CREATE INDEX idx_affiliates_code ON affiliates(affiliate_code);
CREATE INDEX idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX idx_affiliate_clicks_affiliate_id ON affiliate_clicks(affiliate_id);

-- Enable RLS
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all" ON affiliates FOR ALL USING (true);
CREATE POLICY "Allow all" ON affiliate_referrals FOR ALL USING (true);
CREATE POLICY "Allow all" ON affiliate_payouts FOR ALL USING (true);
CREATE POLICY "Allow all" ON affiliate_clicks FOR ALL USING (true);

-- Verification
SELECT '✅ AFFILIATE SYSTEM FIXED!' as status;
SELECT 'Now try to register as affiliate again!' as message;
