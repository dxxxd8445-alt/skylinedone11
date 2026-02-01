-- ANNOUNCEMENTS SYSTEM SETUP
-- Run this in Supabase SQL Editor to create the announcements system

-- 1. Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS on announcements table
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for announcements
DROP POLICY IF EXISTS "Public read access for active announcements" ON announcements;
CREATE POLICY "Public read access for active announcements" ON announcements
FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Service role full access announcements" ON announcements;
CREATE POLICY "Service role full access announcements" ON announcements
FOR ALL USING (auth.role() = 'service_role');

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at);

-- 5. Create terms_accepted table for tracking user agreement
CREATE TABLE IF NOT EXISTS terms_accepted (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_identifier TEXT NOT NULL, -- IP address or user ID
  accepted_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable RLS on terms_accepted table
ALTER TABLE terms_accepted ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policy for terms_accepted
DROP POLICY IF EXISTS "Service role access terms_accepted" ON terms_accepted;
CREATE POLICY "Service role access terms_accepted" ON terms_accepted
FOR ALL USING (auth.role() = 'service_role');

-- 8. Create index for terms_accepted
CREATE INDEX IF NOT EXISTS idx_terms_accepted_user_identifier ON terms_accepted(user_identifier);
CREATE INDEX IF NOT EXISTS idx_terms_accepted_ip_address ON terms_accepted(ip_address);

-- 9. Insert sample announcement (optional)
INSERT INTO announcements (title, message, type, priority, is_active) 
VALUES (
  'Welcome to Magma Cheats!', 
  'Check out our latest products and exclusive deals. Join our Discord for updates and support!',
  'info',
  5,
  true
) ON CONFLICT DO NOTHING;

-- 10. Verify setup
SELECT 
  'Announcements table' as component,
  COUNT(*) as count,
  'Created successfully' as status
FROM announcements
UNION ALL
SELECT 
  'Terms accepted table' as component,
  COUNT(*) as count,
  'Created successfully' as status
FROM terms_accepted;

-- Show table structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('announcements', 'terms_accepted')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;