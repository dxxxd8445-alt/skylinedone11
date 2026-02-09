-- ============================================
-- QUICK Skyline Store DATABASE SETUP
-- Copy and paste this into your Supabase SQL Editor and click "Run"
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- CORE TABLES
-- ============================================

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  game TEXT NOT NULL,
  description TEXT,
  image TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  provider TEXT DEFAULT 'Magma',
  features TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  feature_cards JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  duration TEXT NOT NULL,
  price INTEGER NOT NULL,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  product_name TEXT NOT NULL,
  duration TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'paid')),
  payment_method TEXT DEFAULT 'moneymotion',
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Licenses
CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key TEXT UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  product_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  status TEXT DEFAULT 'unused' CHECK (status IN ('unused', 'active', 'expired', 'revoked')),
  expires_at TIMESTAMP WITH TIME ZONE,
  hwid TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Members (for admin/staff)
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
  invite_expires_at TIMESTAMP WITH TIME ZONE,
  password_hash TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Audit Logs (for login tracking)
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('login', 'logout')),
  actor_role TEXT NOT NULL CHECK (actor_role IN ('admin', 'staff')),
  actor_identifier TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_game ON products(game);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_licenses_license_key ON licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_customer_email ON licenses(customer_email);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Service role policies (for admin operations)
CREATE POLICY IF NOT EXISTS "Service role can manage all" ON categories FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "Service role can manage all" ON products FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "Service role can manage all" ON product_variants FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "Service role can manage all" ON orders FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "Service role can manage all" ON licenses FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "Service role can manage all" ON team_members FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "Service role can manage all" ON admin_audit_logs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "Service role can manage all" ON coupons FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "Service role can manage all" ON reviews FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "Service role can manage all" ON settings FOR ALL USING (auth.role() = 'service_role');

-- Public read policies (for store front)
CREATE POLICY IF NOT EXISTS "Public can read active products" ON products FOR SELECT USING (status = 'active');
CREATE POLICY IF NOT EXISTS "Public can read product variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public can read approved reviews" ON reviews FOR SELECT USING (is_approved = true);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert admin user
INSERT INTO team_members (name, email, username, role, status, permissions) VALUES
('Admin User', 'admin@skyline.local', 'admin', 'Owner', 'active', 
 '["dashboard", "manage_products", "manage_categories", "manage_orders", "stock_keys", "manage_coupons", "manage_webhooks", "manage_team", "manage_settings", "manage_logins"]'::jsonb)
ON CONFLICT (email) DO NOTHING;

-- Insert sample categories
INSERT INTO categories (name, slug, description, display_order) VALUES
('Battle Royale', 'battle-royale', 'Cheats for battle royale games', 1),
('FPS Shooters', 'fps-shooters', 'First-person shooter game cheats', 2),
('Survival Games', 'survival-games', 'Survival and crafting game cheats', 3),
('Utilities', 'utilities', 'Gaming utilities and tools', 4)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, slug, game, description, features, requirements, status, display_order) VALUES
('Fortnite Aimbot', 'fortnite-aimbot', 'Fortnite', 'Advanced aimbot with customizable settings', 
 ARRAY['Aimbot', 'ESP', 'No Recoil', 'Triggerbot'], 
 ARRAY['Windows 10/11', '8GB RAM', 'DirectX 11'], 'active', 1),
('Apex Legends Hack', 'apex-legends-hack', 'Apex Legends', 'Complete hack suite for Apex Legends',
 ARRAY['Aimbot', 'Wallhack', 'Radar', 'Item ESP'],
 ARRAY['Windows 10/11', '16GB RAM', 'NVIDIA GPU'], 'active', 2),
('Rust Cheat', 'rust-cheat', 'Rust', 'Survival advantage tools for Rust',
 ARRAY['Player ESP', 'Item ESP', 'Animal ESP', 'No Recoil'],
 ARRAY['Windows 10/11', '8GB RAM'], 'active', 3)
ON CONFLICT (slug) DO NOTHING;

-- Insert product variants
INSERT INTO product_variants (product_id, duration, price, stock)
SELECT p.id, '1 Day', 999, 50 FROM products p WHERE p.slug = 'fortnite-aimbot'
UNION ALL
SELECT p.id, '7 Days', 2999, 30 FROM products p WHERE p.slug = 'fortnite-aimbot'
UNION ALL
SELECT p.id, '30 Days', 9999, 20 FROM products p WHERE p.slug = 'fortnite-aimbot'
ON CONFLICT DO NOTHING;

-- Insert sample settings
INSERT INTO settings (key, value, description) VALUES
('site_name', '"Skyline Store"', 'Website name'),
('maintenance_mode', 'false', 'Enable/disable maintenance mode')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 
  '🎉 DATABASE SETUP COMPLETE!' as message,
  COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'categories', 'products', 'product_variants', 'orders', 'licenses', 
    'coupons', 'reviews', 'team_members', 'settings', 'admin_audit_logs'
  );