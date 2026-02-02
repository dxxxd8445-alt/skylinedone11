-- COMPLETE AFFILIATE SYSTEM DATABASE SETUP (FIXED)
-- Run this SQL in your Supabase SQL Editor

-- 1. Add new columns for enhanced payment methods to affiliates table
ALTER TABLE affiliates 
ADD COLUMN IF NOT EXISTS crypto_type TEXT,
ADD COLUMN IF NOT EXISTS cashapp_tag TEXT,
ADD COLUMN IF NOT EXISTS minimum_payout DECIMAL(10,2) DEFAULT 50.00;

-- 2. Create affiliate_referrals table
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

-- 3. Create affiliate_clicks table
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

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_affiliates_crypto_type ON affiliates(crypto_type);
CREATE INDEX IF NOT EXISTS idx_affiliates_payment_method ON affiliates(payment_method);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_status ON affiliate_referrals(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_created_at ON affiliate_referrals(created_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate_id ON affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_ip_address ON affiliate_clicks(ip_address);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created_at ON affiliate_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_converted ON affiliate_clicks(converted);

-- 5. Enable RLS on all tables
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
CREATE POLICY "Enable all operations for affiliate_referrals" ON affiliate_referrals
  FOR ALL USING (true);

CREATE POLICY "Enable all operations for affiliate_clicks" ON affiliate_clicks
  FOR ALL USING (true);

-- 7. Update commission rates to 10%
UPDATE affiliates 
SET commission_rate = 10.00 
WHERE commission_rate != 10.00;

-- 8. Ensure categories table exists with game categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Insert default game categories if they don't exist
INSERT INTO categories (name, slug, description, display_order, is_active) VALUES
('Fortnite', 'fortnite', 'Fortnite cheats and hacks', 1, true),
('Apex Legends', 'apex-legends', 'Apex Legends cheats and hacks', 2, true),
('Call of Duty', 'call-of-duty', 'Call of Duty cheats and hacks', 3, true),
('Valorant', 'valorant', 'Valorant cheats and hacks', 4, true),
('PUBG', 'pubg', 'PUBG cheats and hacks', 5, true),
('CS2', 'cs2', 'Counter-Strike 2 cheats and hacks', 6, true),
('Warzone', 'warzone', 'Call of Duty Warzone cheats and hacks', 7, true),
('Overwatch', 'overwatch', 'Overwatch cheats and hacks', 8, true),
('Rainbow Six Siege', 'rainbow-six-siege', 'Rainbow Six Siege cheats and hacks', 9, true),
('Rust', 'rust', 'Rust cheats and hacks', 10, true)
ON CONFLICT (slug) DO NOTHING;

-- 10. Enable RLS on categories table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 11. Create RLS policy for categories
CREATE POLICY "Enable all operations for categories" ON categories
  FOR ALL USING (true);

-- 12. Create indexes for categories
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

-- 13. Verify tables exist
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN ('affiliates', 'affiliate_referrals', 'affiliate_clicks', 'categories')
ORDER BY tablename;

-- 14. Show current data
SELECT 'Affiliates' as table_name, COUNT(*) as count FROM affiliates
UNION ALL
SELECT 'Categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Affiliate Referrals' as table_name, COUNT(*) as count FROM affiliate_referrals
UNION ALL
SELECT 'Affiliate Clicks' as table_name, COUNT(*) as count FROM affiliate_clicks;