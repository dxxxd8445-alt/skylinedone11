-- Add columns to affiliates table
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS store_user_id UUID REFERENCES store_users(id) ON DELETE CASCADE;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS crypto_type TEXT;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS cashapp_tag TEXT;

-- Copy data
UPDATE affiliates SET store_user_id = user_id WHERE store_user_id IS NULL AND user_id IS NOT NULL;

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own affiliate data" ON affiliates;
DROP POLICY IF EXISTS "Users can update own affiliate data" ON affiliates;
DROP POLICY IF EXISTS "Users can insert own affiliate data" ON affiliates;
DROP POLICY IF EXISTS "Service role can manage affiliates" ON affiliates;
DROP POLICY IF EXISTS "Enable all operations for affiliates" ON affiliates;

-- Enable RLS
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations for affiliates" ON affiliates FOR ALL USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_affiliates_store_user_id ON affiliates(store_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_crypto_type ON affiliates(crypto_type);
CREATE INDEX IF NOT EXISTS idx_affiliates_payment_method ON affiliates(payment_method);

-- Create affiliate_referrals table
CREATE TABLE IF NOT EXISTS affiliate_referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    referred_email TEXT NOT NULL,
    order_id UUID,
    order_amount DECIMAL(10,2) DEFAULT 0.00,
    commission_amount DECIMAL(10,2) DEFAULT 0.00,
    status TEXT DEFAULT 'pending',
    conversion_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create affiliate_clicks table
CREATE TABLE IF NOT EXISTS affiliate_clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    landing_page TEXT,
    referrer TEXT,
    converted BOOLEAN DEFAULT FALSE,
    conversion_order_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_status ON affiliate_referrals(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_created_at ON affiliate_referrals(created_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate_id ON affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_ip_address ON affiliate_clicks(ip_address);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created_at ON affiliate_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_converted ON affiliate_clicks(converted);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);

-- Enable RLS on all tables
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Enable all operations for affiliate_referrals" ON affiliate_referrals;
CREATE POLICY "Enable all operations for affiliate_referrals" ON affiliate_referrals FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for affiliate_clicks" ON affiliate_clicks;
CREATE POLICY "Enable all operations for affiliate_clicks" ON affiliate_clicks FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for categories" ON categories;
CREATE POLICY "Enable all operations for categories" ON categories FOR ALL USING (true);

-- Insert categories (NO is_active column)
INSERT INTO categories (name, slug, description, display_order) VALUES
('Apex Legends', 'apex-legends', 'Apex Legends cheats and hacks', 1),
('Fortnite', 'fortnite', 'Fortnite cheats and hacks', 2),
('HWID Spoofer', 'universal', 'HWID Spoofer cheats and hacks', 3),
('Marvel Rivals', 'marvel-rivals', 'Marvel Rivals cheats and hacks', 4),
('Delta Force', 'delta-force', 'Delta Force cheats and hacks', 5),
('PUBG', 'pubg', 'PUBG cheats and hacks', 6),
('DayZ', 'dayz', 'DayZ cheats and hacks', 7),
('Dune Awakening', 'dune-awakening', 'Dune Awakening cheats and hacks', 8),
('Dead by Daylight', 'dead-by-daylight', 'Dead by Daylight cheats and hacks', 9),
('ARC Raiders', 'arc-raiders', 'ARC Raiders cheats and hacks', 10),
('Rainbow Six Siege', 'rainbow-six-siege', 'Rainbow Six Siege cheats and hacks', 11),
('Battlefield', 'battlefield', 'Battlefield cheats and hacks', 12),
('Battlefield 6', 'battlefield-6', 'Battlefield 6 cheats and hacks', 13),
('Call of Duty: BO7', 'call-of-duty-bo7', 'Call of Duty: BO7 cheats and hacks', 14),
('Call of Duty: BO6', 'call-of-duty-bo6', 'Call of Duty: BO6 cheats and hacks', 15),
('Black Ops 7 & Warzone', 'black-ops-7-and-warzone', 'Black Ops 7 & Warzone cheats and hacks', 16),
('Rust', 'rust', 'Rust cheats and hacks', 17),
('Escape from Tarkov', 'escape-from-tarkov', 'Escape from Tarkov cheats and hacks', 18),
('Valorant', 'valorant', 'Valorant cheats and hacks', 19)
ON CONFLICT (slug) DO NOTHING;
