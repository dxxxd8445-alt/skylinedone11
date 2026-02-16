-- ============================================
-- COMPLETE RING-0 STORE DATABASE + AFFILIATE SYSTEM
-- RUN THIS SINGLE SCRIPT FOR EVERYTHING
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- PART 1: CORE STORE TABLES
-- ============================================

-- 1. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  game TEXT NOT NULL,
  description TEXT,
  image TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  provider TEXT DEFAULT 'Ring-0',
  features TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  feature_cards JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  duration TEXT NOT NULL,
  price INTEGER NOT NULL,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STORE USERS (must be before orders for foreign key)
CREATE TABLE IF NOT EXISTS store_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT,
  avatar TEXT,
  email_verified BOOLEAN DEFAULT false,
  email_verification_token TEXT UNIQUE,
  password_reset_token TEXT UNIQUE,
  password_reset_expires TIMESTAMPTZ,
  last_login TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  product_name TEXT NOT NULL,
  duration TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'paid', 'disputed')),
  payment_method TEXT DEFAULT 'stripe',
  payment_id TEXT,
  payment_intent_id TEXT,
  stripe_session_id TEXT,
  billing_address JSONB,
  coupon_code TEXT,
  coupon_discount_amount DECIMAL(10,2),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LICENSES
CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key TEXT UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  product_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  status TEXT DEFAULT 'unused' CHECK (status IN ('unused', 'active', 'expired', 'revoked', 'pending')),
  expires_at TIMESTAMPTZ,
  hwid TEXT,
  assigned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. COUPONS
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  image TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TEAM MEMBERS
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  role TEXT DEFAULT 'Staff',
  avatar TEXT,
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive')),
  invite_token TEXT UNIQUE,
  invite_expires_at TIMESTAMPTZ,
  password_hash TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. WEBHOOKS
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  secret TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. SETTINGS
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. ADMIN AUDIT LOGS
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('login', 'logout')),
  actor_role TEXT NOT NULL CHECK (actor_role IN ('admin', 'staff')),
  actor_identifier TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. STRIPE SESSIONS
CREATE TABLE IF NOT EXISTS stripe_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  items JSONB NOT NULL,
  coupon_code TEXT,
  coupon_discount_amount DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'failed')),
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PART 2: AFFILIATE SYSTEM TABLES
-- ============================================

-- 15. AFFILIATES
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_user_id UUID REFERENCES store_users(id) ON DELETE CASCADE,
  affiliate_code TEXT UNIQUE NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  pending_earnings DECIMAL(10,2) DEFAULT 0.00,
  paid_earnings DECIMAL(10,2) DEFAULT 0.00,
  total_referrals INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  payment_email TEXT,
  payment_method TEXT DEFAULT 'paypal',
  crypto_type TEXT,
  cashapp_tag TEXT,
  minimum_payout DECIMAL(10,2) DEFAULT 50.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. AFFILIATE REFERRALS
CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 17. AFFILIATE PAYOUTS
CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 18. AFFILIATE CLICKS
CREATE TABLE IF NOT EXISTS affiliate_clicks (
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

-- ============================================
-- PART 3: CREATE INDEXES
-- ============================================

-- Core tables
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_licenses_license_key ON licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_order_id ON licenses(order_id);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_store_users_email ON store_users(email);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_session_id ON stripe_sessions(session_id);

-- Affiliate indexes
CREATE INDEX IF NOT EXISTS idx_affiliates_store_user_id ON affiliates(store_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_order_id ON affiliate_referrals(order_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate_id ON affiliate_clicks(affiliate_id);

-- ============================================
-- PART 4: ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 5: CREATE RLS POLICIES
-- ============================================

-- Service role policies (admin access)
DROP POLICY IF EXISTS "Service role can manage categories" ON categories;
CREATE POLICY "Service role can manage categories" ON categories FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage products" ON products;
CREATE POLICY "Service role can manage products" ON products FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage product_variants" ON product_variants;
CREATE POLICY "Service role can manage product_variants" ON product_variants FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage orders" ON orders;
CREATE POLICY "Service role can manage orders" ON orders FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage licenses" ON licenses;
CREATE POLICY "Service role can manage licenses" ON licenses FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage coupons" ON coupons;
CREATE POLICY "Service role can manage coupons" ON coupons FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage reviews" ON reviews;
CREATE POLICY "Service role can manage reviews" ON reviews FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage team_members" ON team_members;
CREATE POLICY "Service role can manage team_members" ON team_members FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage webhooks" ON webhooks;
CREATE POLICY "Service role can manage webhooks" ON webhooks FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage settings" ON settings;
CREATE POLICY "Service role can manage settings" ON settings FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage audit_logs" ON admin_audit_logs;
CREATE POLICY "Service role can manage audit_logs" ON admin_audit_logs FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage stripe_sessions" ON stripe_sessions;
CREATE POLICY "Service role can manage stripe_sessions" ON stripe_sessions FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage store_users" ON store_users;
CREATE POLICY "Service role can manage store_users" ON store_users FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage announcements" ON announcements;
CREATE POLICY "Service role can manage announcements" ON announcements FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage affiliates" ON affiliates;
CREATE POLICY "Service role can manage affiliates" ON affiliates FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage referrals" ON affiliate_referrals;
CREATE POLICY "Service role can manage referrals" ON affiliate_referrals FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage payouts" ON affiliate_payouts;
CREATE POLICY "Service role can manage payouts" ON affiliate_payouts FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage clicks" ON affiliate_clicks;
CREATE POLICY "Service role can manage clicks" ON affiliate_clicks FOR ALL USING (auth.role() = 'service_role');

-- Public read policies
DROP POLICY IF EXISTS "Public can read active products" ON products;
CREATE POLICY "Public can read active products" ON products FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Public can read product variants" ON product_variants;
CREATE POLICY "Public can read product variants" ON product_variants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read categories" ON categories;
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read approved reviews" ON reviews;
CREATE POLICY "Public can read approved reviews" ON reviews FOR SELECT USING (is_approved = true);

DROP POLICY IF EXISTS "Public can read active announcements" ON announcements;
CREATE POLICY "Public can read active announcements" ON announcements FOR SELECT USING (is_active = true);

-- ============================================
-- PART 6: CREATE TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_licenses_updated_at ON licenses;
CREATE TRIGGER update_licenses_updated_at BEFORE UPDATE ON licenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_affiliates_updated_at ON affiliates;
CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON affiliates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 7: INSERT SAMPLE DATA
-- ============================================

INSERT INTO categories (name, slug, description, display_order) VALUES
('Battle Royale', 'battle-royale', 'Cheats for battle royale games', 1),
('FPS Shooters', 'fps-shooters', 'First-person shooter game cheats', 2),
('Survival Games', 'survival-games', 'Survival and crafting game cheats', 3),
('Utilities', 'utilities', 'Gaming utilities and tools', 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, game, description, features, requirements, status, display_order) VALUES
('Fortnite Aimbot', 'fortnite-aimbot', 'Fortnite', 'Advanced aimbot with customizable settings', 
 ARRAY['Aimbot', 'ESP', 'No Recoil', 'Triggerbot'], 
 ARRAY['Windows 10/11', '8GB RAM', 'DirectX 11'], 'active', 1),
('Apex Legends Hack', 'apex-legends-hack', 'Apex Legends', 'Complete hack suite for Apex Legends',
 ARRAY['Aimbot', 'Wallhack', 'Radar', 'Item ESP'],
 ARRAY['Windows 10/11', '16GB RAM', 'NVIDIA GPU'], 'active', 2),
('Rust Cheat', 'rust-cheat', 'Rust', 'Survival advantage tools for Rust',
 ARRAY['Player ESP', 'Item ESP', 'Animal ESP', 'No Recoil'],
 ARRAY['Windows 10/11', '8GB RAM'], 'active', 3),
('HWID Spoofer', 'hwid-spoofer', 'Universal', 'Hardware ID spoofing utility',
 ARRAY['HWID Spoofing', 'MAC Spoofing', 'Registry Cleaning'],
 ARRAY['Windows 10/11', 'Admin Rights'], 'active', 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_variants (product_id, duration, price, stock)
SELECT p.id, '1 Day', 999, 0 FROM products p WHERE p.slug = 'fortnite-aimbot'
UNION ALL
SELECT p.id, '7 Days', 2999, 0 FROM products p WHERE p.slug = 'fortnite-aimbot'
UNION ALL
SELECT p.id, '30 Days', 9999, 0 FROM products p WHERE p.slug = 'fortnite-aimbot'
UNION ALL
SELECT p.id, '1 Day', 1499, 0 FROM products p WHERE p.slug = 'apex-legends-hack'
UNION ALL
SELECT p.id, '7 Days', 3999, 0 FROM products p WHERE p.slug = 'apex-legends-hack'
UNION ALL
SELECT p.id, '30 Days', 12999, 0 FROM products p WHERE p.slug = 'apex-legends-hack'
UNION ALL
SELECT p.id, '1 Day', 799, 0 FROM products p WHERE p.slug = 'rust-cheat'
UNION ALL
SELECT p.id, '7 Days', 2499, 0 FROM products p WHERE p.slug = 'rust-cheat'
UNION ALL
SELECT p.id, '30 Days', 7999, 0 FROM products p WHERE p.slug = 'rust-cheat'
UNION ALL
SELECT p.id, 'Lifetime', 4999, 0 FROM products p WHERE p.slug = 'hwid-spoofer'
ON CONFLICT DO NOTHING;

INSERT INTO coupons (code, discount_percent, max_uses, valid_until) VALUES
('WELCOME10', 10, 100, NOW() + INTERVAL '30 days'),
('SAVE20', 20, 50, NOW() + INTERVAL '7 days'),
('NEWUSER', 15, NULL, NOW() + INTERVAL '90 days')
ON CONFLICT (code) DO NOTHING;

INSERT INTO settings (key, value, description) VALUES
('site_name', '"Ring-0 Store"', 'Website name'),
('site_description', '"Premium gaming software and cheats"', 'Website description'),
('maintenance_mode', 'false', 'Enable/disable maintenance mode')
ON CONFLICT (key) DO NOTHING;

INSERT INTO announcements (title, message, type, priority, is_active) VALUES
('Welcome to Ring-0!', 'Check out our latest products and exclusive deals. Join our Discord for updates and support!', 'info', 5, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- PART 8: VERIFICATION
-- ============================================

SELECT '✅ COMPLETE DATABASE SETUP WITH AFFILIATE SYSTEM!' as status;

SELECT 
  'Tables Created' as info,
  COUNT(*) as total
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'categories', 'products', 'product_variants', 'orders', 'licenses', 
    'coupons', 'reviews', 'team_members', 'webhooks', 'settings', 
    'admin_audit_logs', 'stripe_sessions', 'store_users', 'announcements',
    'affiliates', 'affiliate_referrals', 'affiliate_payouts', 'affiliate_clicks'
  );
