-- ============================================
-- COMPLETE SKYLINE STORE DATABASE SETUP
-- COPY AND PASTE THIS ENTIRE SCRIPT INTO SUPABASE SQL EDITOR
-- THIS IS THE ONLY SCRIPT YOU NEED TO RUN
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- PART 1: CREATE ALL TABLES
-- ============================================

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  game TEXT NOT NULL,
  description TEXT,
  image TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  provider TEXT DEFAULT 'Skyline',
  features TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  feature_cards JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCT VARIANTS TABLE
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  duration TEXT NOT NULL,
  price INTEGER NOT NULL,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDERS TABLE
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

-- 5. LICENSES TABLE
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

-- 6. COUPONS TABLE
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

-- 7. REVIEWS TABLE
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

-- 8. TEAM MEMBERS TABLE
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

-- 9. WEBHOOKS TABLE
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  secret TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ADMIN AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('login', 'logout')),
  actor_role TEXT NOT NULL CHECK (actor_role IN ('admin', 'staff')),
  actor_identifier TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. STRIPE SESSIONS TABLE
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

-- 13. STORE USERS TABLE
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

-- 14. ANNOUNCEMENTS TABLE
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
-- PART 2: CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Categories
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);

-- Products
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_game ON products(game);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_display_order ON products(display_order);

-- Product Variants
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent_id ON orders(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);

-- Licenses
CREATE INDEX IF NOT EXISTS idx_licenses_license_key ON licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_order_id ON licenses(order_id);
CREATE INDEX IF NOT EXISTS idx_licenses_customer_email ON licenses(customer_email);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status);
CREATE INDEX IF NOT EXISTS idx_licenses_product_id ON licenses(product_id);

-- Coupons
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON reviews(is_approved);

-- Team Members
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);

-- Stripe Sessions
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_session_id ON stripe_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_customer_email ON stripe_sessions(customer_email);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_status ON stripe_sessions(status);

-- Store Users
CREATE INDEX IF NOT EXISTS idx_store_users_email ON store_users(email);
CREATE INDEX IF NOT EXISTS idx_store_users_status ON store_users(status);

-- Announcements
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);

-- ============================================
-- PART 3: ENABLE ROW LEVEL SECURITY
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

-- ============================================
-- PART 4: CREATE RLS POLICIES
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
-- PART 5: CREATE TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_licenses_updated_at ON licenses;
CREATE TRIGGER update_licenses_updated_at BEFORE UPDATE ON licenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_team_members_updated_at ON team_members;
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stripe_sessions_updated_at ON stripe_sessions;
CREATE TRIGGER update_stripe_sessions_updated_at BEFORE UPDATE ON stripe_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_store_users_updated_at ON store_users;
CREATE TRIGGER update_store_users_updated_at BEFORE UPDATE ON store_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 6: INSERT SAMPLE DATA
-- ============================================

-- Categories
INSERT INTO categories (name, slug, description, display_order) VALUES
('Battle Royale', 'battle-royale', 'Cheats for battle royale games', 1),
('FPS Shooters', 'fps-shooters', 'First-person shooter game cheats', 2),
('Survival Games', 'survival-games', 'Survival and crafting game cheats', 3),
('Utilities', 'utilities', 'Gaming utilities and tools', 4)
ON CONFLICT (slug) DO NOTHING;

-- Products
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

-- Product Variants
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

-- Coupons
INSERT INTO coupons (code, discount_percent, max_uses, valid_until) VALUES
('WELCOME10', 10, 100, NOW() + INTERVAL '30 days'),
('SAVE20', 20, 50, NOW() + INTERVAL '7 days'),
('NEWUSER', 15, NULL, NOW() + INTERVAL '90 days')
ON CONFLICT (code) DO NOTHING;

-- Settings
INSERT INTO settings (key, value, description) VALUES
('site_name', '"Skyline Store"', 'Website name'),
('site_description', '"Premium gaming software and cheats"', 'Website description'),
('maintenance_mode', 'false', 'Enable/disable maintenance mode')
ON CONFLICT (key) DO NOTHING;

-- Announcements
INSERT INTO announcements (title, message, type, priority, is_active) VALUES
('Welcome to Skyline Cheats!', 'Check out our latest products and exclusive deals. Join our Discord for updates and support!', 'info', 5, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- PART 7: VERIFICATION
-- ============================================

SELECT '✅ DATABASE SETUP COMPLETE!' as status;

SELECT 
  'Tables Created' as info,
  COUNT(*) as total
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'categories', 'products', 'product_variants', 'orders', 'licenses', 
    'coupons', 'reviews', 'team_members', 'webhooks', 'settings', 
    'admin_audit_logs', 'stripe_sessions', 'store_users', 'announcements'
  );

SELECT 
  'categories' as table_name, COUNT(*) as records FROM categories
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'product_variants', COUNT(*) FROM product_variants
UNION ALL
SELECT 'coupons', COUNT(*) FROM coupons
UNION ALL
SELECT 'settings', COUNT(*) FROM settings
UNION ALL
SELECT 'announcements', COUNT(*) FROM announcements
ORDER BY table_name;
