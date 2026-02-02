-- STEP 1: Add columns to affiliates table
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS store_user_id UUID REFERENCES store_users(id) ON DELETE CASCADE;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS crypto_type TEXT;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS cashapp_tag TEXT;

-- STEP 2: Copy data
UPDATE affiliates SET store_user_id = user_id WHERE store_user_id IS NULL AND user_id IS NOT NULL;

-- STEP 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_affiliates_store_user_id ON affiliates(store_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_crypto_type ON affiliates(crypto_type);
CREATE INDEX IF NOT EXISTS idx_affiliates_payment_method ON affiliates(payment_method);

-- STEP 4: Fix RLS policies
DROP POLICY IF EXISTS "Users can view own affiliate data" ON affiliates;
DROP POLICY IF EXISTS "Users can update own affiliate data" ON affiliates;
DROP POLICY IF EXISTS "Users can insert own affiliate data" ON affiliates;
DROP POLICY IF EXISTS "Service role can manage affiliates" ON affiliates;
DROP POLICY IF EXISTS "Enable all operations for affiliates" ON affiliates;

ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations for affiliates" ON affiliates FOR ALL USING (true);

-- STEP 5: Create affiliate_referrals table
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

-- STEP 6: Create affiliate_clicks table
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

-- STEP 7: Create categories table
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

-- STEP 8: Create indexes
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

-- STEP 9: Enable RLS
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- STEP 10: Create RLS policies
DROP POLICY IF EXISTS "Enable all operations for affiliate_referrals" ON affiliate_referrals;
CREATE POLICY "Enable all operations for affiliate_referrals" ON affiliate_referrals FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for affiliate_clicks" ON affiliate_clicks;
CREATE POLICY "Enable all operations for affiliate_clicks" ON affiliate_clicks FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for categories" ON categories;
CREATE POLICY "Enable all operations for categories" ON categories FOR ALL USING (true);

-- STEP 11: Insert categories (ONLY for categories table which HAS is_active column)
INSERT INTO categories (name, slug, description, display_order, is_active) VALUES
('Apex Legends', 'apex-legends', 'Apex Legends', 1, true),
('Fortnite', 'fortnite', 'Fortnite', 2, true),
('HWID Spoofer', 'universal', 'HWID Spoofer', 3, true),
('Marvel Rivals', 'marvel-rivals', 'Marvel Rivals', 4, true),
('Delta Force', 'delta-force', 'Delta Force', 5, true),
('PUBG', 'pubg', 'PUBG', 6, true),
('DayZ', 'dayz', 'DayZ', 7, true),
('Dune Awakening', 'dune-awakening', 'Dune Awakening', 8, true),
('Dead by Daylight', 'dead-by-daylight', 'Dead by Daylight', 9, true),
('ARC Raiders', 'arc-raiders', 'ARC Raiders', 10, true),
('Rainbow Six Siege', 'rainbow-six-siege', 'Rainbow Six Siege', 11, true),
('Battlefield', 'battlefield', 'Battlefield', 12, true),
('Battlefield 6', 'battlefield-6', 'Battlefield 6', 13, true),
('Call of Duty: BO7', 'call-of-duty-bo7', 'Call of Duty: BO7', 14, true),
('Call of Duty: BO6', 'call-of-duty-bo6', 'Call of Duty: BO6', 15, true),
('Black Ops 7 & Warzone', 'black-ops-7-and-warzone', 'Black Ops 7 & Warzone', 16, true),
('Rust', 'rust', 'Rust', 17, true),
('Escape from Tarkov', 'escape-from-tarkov', 'Escape from Tarkov', 18, true),
('Valorant', 'valorant', 'Valorant', 19, true)
ON CONFLICT (slug) DO NOTHING;
