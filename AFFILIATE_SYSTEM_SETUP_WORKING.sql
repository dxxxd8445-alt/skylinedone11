-- COMPLETE AFFILIATE SYSTEM DATABASE SETUP (WORKING VERSION)
-- Run this SQL in your Supabase SQL Editor - Copy and paste the entire script

-- Step 1: Add new columns to affiliates table
ALTER TABLE affiliates 
ADD COLUMN IF NOT EXISTS crypto_type TEXT,
ADD COLUMN IF NOT EXISTS cashapp_tag TEXT,
ADD COLUMN IF NOT EXISTS minimum_payout DECIMAL(10,2) DEFAULT 50.00;

-- Step 2: Create affiliate_referrals table
CREATE TABLE IF NOT EXISTS affiliate_referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
    referred_email TEXT NOT NULL,
    order_id UUID,
    order_amount DECIMAL(10,2) DEFAULT 0.00,
    commission_amount DECIMAL(10,2) DEFAULT 0.00,
    status TEXT DEFAULT 'pending',
    conversion_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create affiliate_clicks table
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

-- Step 4: Create categories table
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

-- Step 5: Insert game categories (one by one to avoid conflicts)
INSERT INTO categories (name, slug, description, display_order, is_active) 
VALUES ('Fortnite', 'fortnite', 'Fortnite cheats and hacks', 1, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, display_order, is_active) 
VALUES ('Apex Legends', 'apex-legends', 'Apex Legends cheats and hacks', 2, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, display_order, is_active) 
VALUES ('Call of Duty', 'call-of-duty', 'Call of Duty cheats and hacks', 3, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, display_order, is_active) 
VALUES ('Valorant', 'valorant', 'Valorant cheats and hacks', 4, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, display_order, is_active) 
VALUES ('PUBG', 'pubg', 'PUBG cheats and hacks', 5, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, display_order, is_active) 
VALUES ('CS2', 'cs2', 'Counter-Strike 2 cheats and hacks', 6, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, display_order, is_active) 
VALUES ('Warzone', 'warzone', 'Call of Duty Warzone cheats and hacks', 7, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, display_order, is_active) 
VALUES ('Overwatch', 'overwatch', 'Overwatch cheats and hacks', 8, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, display_order, is_active) 
VALUES ('Rainbow Six Siege', 'rainbow-six-siege', 'Rainbow Six Siege cheats and hacks', 9, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, display_order, is_active) 
VALUES ('Rust', 'rust', 'Rust cheats and hacks', 10, true)
ON CONFLICT (slug) DO NOTHING;

-- Step 6: Enable RLS on all tables
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies
DROP POLICY IF EXISTS "Enable all operations for affiliate_referrals" ON affiliate_referrals;
CREATE POLICY "Enable all operations for affiliate_referrals" ON affiliate_referrals FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for affiliate_clicks" ON affiliate_clicks;
CREATE POLICY "Enable all operations for affiliate_clicks" ON affiliate_clicks FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for categories" ON categories;
CREATE POLICY "Enable all operations for categories" ON categories FOR ALL USING (true);

-- Step 8: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliates_crypto_type ON affiliates(crypto_type);
CREATE INDEX IF NOT EXISTS idx_affiliates_payment_method ON affiliates(payment_method);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_status ON affiliate_referrals(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate_id ON affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

-- Step 9: Update commission rates to 10%
UPDATE affiliates SET commission_rate = 10.00 WHERE commission_rate != 10.00;

-- Step 10: Verify setup
SELECT 'Setup Complete!' as status;
SELECT COUNT(*) as affiliate_count FROM affiliates;
SELECT COUNT(*) as category_count FROM categories;
SELECT COUNT(*) as referral_count FROM affiliate_referrals;
SELECT COUNT(*) as click_count FROM affiliate_clicks;