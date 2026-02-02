-- AFFILIATE REFERRALS AND CLICKS TABLES
-- Run this SQL in your Supabase SQL Editor to create missing affiliate tracking tables

-- 1. Create affiliate_referrals table
CREATE TABLE IF NOT EXISTS affiliate_referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
    referred_email TEXT NOT NULL,
    order_id UUID,
    order_amount DECIMAL(10,2) DEFAULT 0.00,
    commission_amount DECIMAL(10,2) DEFAULT 0.00,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
    conversion_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create affiliate_clicks table
CREATE TABLE IF NOT EXISTS affiliate_clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    landing_page TEXT,
    referrer TEXT,
    converted BOOLEAN DEFAULT FALSE,
    conversion_order_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_status ON affiliate_referrals(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_created_at ON affiliate_referrals(created_at);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate_id ON affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_ip_address ON affiliate_clicks(ip_address);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created_at ON affiliate_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_converted ON affiliate_clicks(converted);

-- 4. Enable RLS on both tables
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for affiliate_referrals
CREATE POLICY "Enable all operations for affiliate_referrals" ON affiliate_referrals
  FOR ALL USING (true);

-- 6. Create RLS policies for affiliate_clicks  
CREATE POLICY "Enable all operations for affiliate_clicks" ON affiliate_clicks
  FOR ALL USING (true);

-- 7. Add minimum_payout column to affiliates if missing
ALTER TABLE affiliates 
ADD COLUMN IF NOT EXISTS minimum_payout DECIMAL(10,2) DEFAULT 50.00;

-- 8. Update affiliate commission rates to 10% (as per registration API)
UPDATE affiliates 
SET commission_rate = 10.00 
WHERE commission_rate = 5.00;

-- 9. Verify tables exist
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN ('affiliates', 'affiliate_referrals', 'affiliate_clicks')
ORDER BY tablename;

-- 10. Show current affiliate data
SELECT 
    id,
    affiliate_code,
    store_user_id,
    payment_email,
    status,
    commission_rate,
    total_earnings,
    pending_earnings,
    total_referrals,
    minimum_payout,
    created_at
FROM affiliates
ORDER BY created_at DESC;