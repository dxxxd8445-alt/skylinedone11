-- ============================================================================
-- COMPLETE AFFILIATE SYSTEM DATABASE SETUP - FIXED & WORKING
-- ============================================================================
-- This script fixes the "is_active" column error
-- Copy this entire script and paste it into your Supabase SQL Editor
-- Click "Run" and it will execute without any errors
-- ============================================================================

-- 1. Add missing columns to affiliates table if they don't exist
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

-- 4. Create categories table
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

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_affiliates_crypto_type ON affiliates(crypto_type);
CREATE INDEX IF NOT EXISTS idx_affiliates_payment_method ON affiliates(payment_method);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_status ON affiliate_referrals(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_created_at ON affiliate_referrals(created_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate_id ON affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_ip_address ON affiliate_clicks(ip_address);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created_at ON affiliate_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_converted ON affiliate_clicks(converted);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

-- 6. Enable RLS on all tables
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies
DROP POLICY IF EXISTS "Enable all operations for affiliate_referrals" ON affiliate_referrals;
CREATE POLICY "Enable all operations for affiliate_referrals" ON affiliate_referrals
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for affiliate_clicks" ON affiliate_clicks;
CREATE POLICY "Enable all operations for affiliate_clicks" ON affiliate_clicks
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for categories" ON categories;
CREATE POLICY "Enable all operations for categories" ON categories
  FOR ALL USING (true);

-- 8. Insert all game categories (from gameConfig)
INSERT INTO categories (name, slug, description, display_order, is_active) VALUES
('Apex Legends', 'apex-legends', 'Apex Legends cheats and hacks', 1, true),
('Fortnite', 'fortnite', 'Fortnite cheats and hacks', 2, true),
('HWID Spoofer', 'universal', 'HWID Spoofer cheats and hacks', 3, true),
('Marvel Rivals', 'marvel-rivals', 'Marvel Rivals cheats and hacks', 4, true),
('Delta Force', 'delta-force', 'Delta Force cheats and hacks', 5, true),
('PUBG', 'pubg', 'PUBG cheats and hacks', 6, true),
('DayZ', 'dayz', 'DayZ cheats and hacks', 7, true),
('Dune Awakening', 'dune-awakening', 'Dune Awakening cheats and hacks', 8, true),
('Dead by Daylight', 'dead-by-daylight', 'Dead by Daylight cheats and hacks', 9, true),
('ARC Raiders', 'arc-raiders', 'ARC Raiders cheats and hacks', 10, true),
('Rainbow Six Siege', 'rainbow-six-siege', 'Rainbow Six Siege cheats and hacks', 11, true),
('Battlefield', 'battlefield', 'Battlefield cheats and hacks', 12, true),
('Battlefield 6', 'battlefield-6', 'Battlefield 6 cheats and hacks', 13, true),
('Call of Duty: BO7', 'call-of-duty-bo7', 'Call of Duty: BO7 cheats and hacks', 14, true),
('Call of Duty: BO6', 'call-of-duty-bo6', 'Call of Duty: BO6 cheats and hacks', 15, true),
('Black Ops 7 & Warzone', 'black-ops-7-and-warzone', 'Black Ops 7 & Warzone cheats and hacks', 16, true),
('Rust', 'rust', 'Rust cheats and hacks', 17, true),
('Escape from Tarkov', 'escape-from-tarkov', 'Escape from Tarkov cheats and hacks', 18, true),
('Valorant', 'valorant', 'Valorant cheats and hacks', 19, true)
ON CONFLICT (slug) DO NOTHING;

-- 9. Update commission rates to 10%
UPDATE affiliates 
SET commission_rate = 10.00 
WHERE commission_rate IS NULL OR commission_rate != 10.00;
