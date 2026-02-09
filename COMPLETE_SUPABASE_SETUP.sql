-- ============================================
-- COMPLETE Skyline Store DATABASE SETUP
-- Run this entire script in your new Supabase SQL Editor
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. PRODUCTS TABLE
-- ============================================
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

-- ============================================
-- 3. PRODUCT VARIANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  duration TEXT NOT NULL,
  price INTEGER NOT NULL, -- price in cents
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. ORDERS TABLE
-- ============================================
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
  payment_method TEXT DEFAULT 'moneymotion',
  payment_id TEXT,
  payment_intent_id TEXT,
  stripe_session_id TEXT,
  billing_address JSONB,
  coupon_code TEXT,
  coupon_discount_amount DECIMAL(10,2),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. LICENSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key TEXT UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  product_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  status TEXT DEFAULT 'unused' CHECK (status IN ('unused', 'active', 'expired', 'revoked', 'pending')),
  expires_at TIMESTAMP WITH TIME ZONE,
  hwid TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. COUPONS TABLE
-- ============================================
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

-- ============================================
-- 7. REVIEWS TABLE
-- ============================================
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

-- ============================================
-- 8. TEAM MEMBERS TABLE
-- ============================================
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

-- ============================================
-- 9. WEBHOOKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  secret TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 10. SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 11. ADMIN AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('login', 'logout')),
  actor_role TEXT NOT NULL CHECK (actor_role IN ('admin', 'staff')),
  actor_identifier TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 12. STRIPE SESSIONS TABLE
-- ============================================
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
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
CREATE INDEX IF NOT EXISTS idx_orders_coupon_code ON orders(coupon_code);

-- Licenses
CREATE INDEX IF NOT EXISTS idx_licenses_license_key ON licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_order_id ON licenses(order_id);
CREATE INDEX IF NOT EXISTS idx_licenses_customer_email ON licenses(customer_email);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status);
CREATE INDEX IF NOT EXISTS idx_licenses_product_id ON licenses(product_id);
CREATE INDEX IF NOT EXISTS idx_licenses_assigned_at ON licenses(assigned_at);

-- Coupons
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON reviews(is_approved);

-- Team Members
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_username ON team_members(username);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
CREATE INDEX IF NOT EXISTS idx_team_members_invite_token ON team_members(invite_token);

-- Audit Logs
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_actor ON admin_audit_logs(actor_role, actor_identifier);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_event_type ON admin_audit_logs(event_type);

-- Stripe Sessions
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_session_id ON stripe_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_customer_email ON stripe_sessions(customer_email);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_status ON stripe_sessions(status);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_created_at ON stripe_sessions(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
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

-- Create policies for service role access (admin operations)
CREATE POLICY IF NOT EXISTS "Service role can manage categories" ON categories FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "Service role can manage products" ON products FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "Service role can manage product_variants" ON product_variants FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "Service role can manage orders" ON orders FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "Service role can manage licenses" ON licenses FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "Service role can manage coupons" ON coupons FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "Service role can manage reviews" ON reviews FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "Service role can manage team_members" ON team_members FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "Service role can manage webhooks" ON webhooks FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "Service role can manage settings" ON settings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "Service role can manage audit_logs" ON admin_audit_logs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY IF NOT EXISTS "Service role can manage stripe_sessions" ON stripe_sessions FOR ALL USING (auth.role() = 'service_role');

-- Public read access for store front
CREATE POLICY IF NOT EXISTS "Public can read active products" ON products FOR SELECT USING (status = 'active');
CREATE POLICY IF NOT EXISTS "Public can read product variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public can read approved reviews" ON reviews FOR SELECT USING (is_approved = true);

-- ============================================
-- SAMPLE DATA
-- ============================================

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
 ARRAY['Windows 10/11', '8GB RAM'], 'active', 3),
('HWID Spoofer', 'hwid-spoofer', 'Universal', 'Hardware ID spoofing utility',
 ARRAY['HWID Spoofing', 'MAC Spoofing', 'Registry Cleaning'],
 ARRAY['Windows 10/11', 'Admin Rights'], 'active', 4)
ON CONFLICT (slug) DO NOTHING;

-- Insert product variants
INSERT INTO product_variants (product_id, duration, price, stock)
SELECT p.id, '1 Day', 999, 50 FROM products p WHERE p.slug = 'fortnite-aimbot'
UNION ALL
SELECT p.id, '7 Days', 2999, 30 FROM products p WHERE p.slug = 'fortnite-aimbot'
UNION ALL
SELECT p.id, '30 Days', 9999, 20 FROM products p WHERE p.slug = 'fortnite-aimbot'
UNION ALL
SELECT p.id, '1 Day', 1499, 40 FROM products p WHERE p.slug = 'apex-legends-hack'
UNION ALL
SELECT p.id, '7 Days', 3999, 25 FROM products p WHERE p.slug = 'apex-legends-hack'
UNION ALL
SELECT p.id, '30 Days', 12999, 15 FROM products p WHERE p.slug = 'apex-legends-hack'
UNION ALL
SELECT p.id, '1 Day', 799, 60 FROM products p WHERE p.slug = 'rust-cheat'
UNION ALL
SELECT p.id, '7 Days', 2499, 35 FROM products p WHERE p.slug = 'rust-cheat'
UNION ALL
SELECT p.id, '30 Days', 7999, 25 FROM products p WHERE p.slug = 'rust-cheat'
UNION ALL
SELECT p.id, 'Lifetime', 4999, 100 FROM products p WHERE p.slug = 'hwid-spoofer'
ON CONFLICT DO NOTHING;

-- Insert sample team member (admin user)
INSERT INTO team_members (name, email, username, role, status, permissions) VALUES
('Admin User', 'admin@skyline.local', 'admin', 'Owner', 'active', 
 '["dashboard", "manage_products", "manage_categories", "manage_orders", "stock_keys", "manage_coupons", "manage_webhooks", "manage_team", "manage_settings", "manage_logins"]'::jsonb)
ON CONFLICT (email) DO NOTHING;

-- Insert sample settings
INSERT INTO settings (key, value, description) VALUES
('site_name', '"Skyline Store"', 'Website name'),
('site_description', '"Premium gaming software and cheats"', 'Website description'),
('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
('max_licenses_per_order', '5', 'Maximum licenses per order'),
('default_license_duration', '"30 Days"', 'Default license duration')
ON CONFLICT (key) DO NOTHING;

-- Insert sample coupons
INSERT INTO coupons (code, discount_percent, max_uses, valid_until) VALUES
('WELCOME10', 10, 100, NOW() + INTERVAL '30 days'),
('SAVE20', 20, 50, NOW() + INTERVAL '7 days'),
('NEWUSER', 15, NULL, NOW() + INTERVAL '90 days')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_licenses_updated_at BEFORE UPDATE ON licenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stripe_sessions_updated_at BEFORE UPDATE ON stripe_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify all tables were created
SELECT 
  'Database setup completed successfully!' as status,
  COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'categories', 'products', 'product_variants', 'orders', 'licenses', 
    'coupons', 'reviews', 'team_members', 'webhooks', 'settings', 'admin_audit_logs', 'stripe_sessions'
  );

-- Show sample data counts
SELECT 
  'categories' as table_name, COUNT(*) as records FROM categories
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'product_variants', COUNT(*) FROM product_variants
UNION ALL
SELECT 'team_members', COUNT(*) FROM team_members
UNION ALL
SELECT 'settings', COUNT(*) FROM settings
UNION ALL
SELECT 'coupons', COUNT(*) FROM coupons
ORDER BY table_name;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE categories IS 'Product categories for organization';
COMMENT ON TABLE products IS 'Main products/cheats available for purchase';
COMMENT ON TABLE product_variants IS 'Different duration/price options for products';
COMMENT ON TABLE orders IS 'Customer purchase orders';
COMMENT ON TABLE licenses IS 'License keys for purchased products';
COMMENT ON TABLE coupons IS 'Discount coupons for orders';
COMMENT ON TABLE reviews IS 'Customer reviews and ratings';
COMMENT ON TABLE team_members IS 'Admin and staff users';
COMMENT ON TABLE webhooks IS 'Webhook configurations';
COMMENT ON TABLE settings IS 'Application configuration settings';
COMMENT ON TABLE admin_audit_logs IS 'Admin and staff login/logout tracking';
COMMENT ON TABLE stripe_sessions IS 'Stripe checkout session tracking';

-- Success message
SELECT '🎉 SETUP COMPLETE! Your Skyline Store database is ready!' as message;