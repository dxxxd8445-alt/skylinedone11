-- ============================================
-- SETTINGS TABLE SETUP - Skyline Cheats
-- ============================================
-- This script ensures the settings table exists
-- and has the correct structure
-- ============================================

-- Create settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on key for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow all operations for service role" ON settings;

-- Create policy that allows service role to do everything
CREATE POLICY "Allow all operations for service role" ON settings FOR ALL USING (true);

-- Insert default settings if they don't exist
INSERT INTO settings (key, value) VALUES
  ('site_name', '"Skyline Cheats"'),
  ('site_description', '"Premium undetected cheats for all games"'),
  ('support_email', '"support@skylinecheats.org"'),
  ('maintenance_mode', 'false')
ON CONFLICT (key) DO NOTHING;

-- Create announcements table if it doesn't exist
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on announcements for faster queries
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_expires_at ON announcements(expires_at);

-- Enable RLS on announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow all operations for service role" ON announcements;

-- Create policy that allows service role to do everything
CREATE POLICY "Allow all operations for service role" ON announcements FOR ALL USING (true);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Settings table setup complete!';
  RAISE NOTICE '✅ Default settings inserted';
  RAISE NOTICE '✅ Maintenance mode is OFF by default';
  RAISE NOTICE '✅ Announcements table created';
END $$;
