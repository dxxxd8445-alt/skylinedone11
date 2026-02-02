-- STORE VIEWERS DATABASE SETUP
-- Copy and paste this entire code into your Supabase SQL Editor and run it

-- 1. Create visitor_sessions table
CREATE TABLE IF NOT EXISTS visitor_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  country TEXT,
  city TEXT,
  current_page TEXT,
  current_product TEXT,
  activity TEXT CHECK (activity IN ('browsing', 'viewing-product', 'in-cart', 'checkout', 'completed')),
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  browser TEXT,
  os TEXT,
  referrer TEXT,
  page_views INTEGER DEFAULT 1,
  time_on_site INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create page_views table
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT,
  page_path TEXT NOT NULL,
  product_name TEXT,
  time_spent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create conversion_events table
CREATE TABLE IF NOT EXISTS conversion_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT,
  event_type TEXT NOT NULL,
  event_data JSONB,
  value DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_active ON visitor_sessions(is_active, last_activity);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_session_id ON visitor_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_conversion_events_created_at ON conversion_events(created_at);

-- 5. Function to update last_activity automatically
CREATE OR REPLACE FUNCTION update_visitor_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_activity = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for automatic updates
DROP TRIGGER IF EXISTS trigger_update_visitor_activity ON visitor_sessions;
CREATE TRIGGER trigger_update_visitor_activity
  BEFORE UPDATE ON visitor_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_visitor_activity();

-- 7. Function to clean up old sessions
CREATE OR REPLACE FUNCTION cleanup_inactive_sessions()
RETURNS INTEGER AS $$
DECLARE
  cleaned_count INTEGER;
BEGIN
  UPDATE visitor_sessions 
  SET is_active = false 
  WHERE is_active = true 
    AND last_activity < NOW() - INTERVAL '30 minutes';
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql;

-- 8. Enable RLS (Row Level Security)
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;

-- 9. Create policies for admin access
DROP POLICY IF EXISTS "Admin can manage all visitor data" ON visitor_sessions;
CREATE POLICY "Admin can manage all visitor data" ON visitor_sessions FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin can manage all page views" ON page_views;
CREATE POLICY "Admin can manage all page views" ON page_views FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin can manage all conversion events" ON conversion_events;
CREATE POLICY "Admin can manage all conversion events" ON conversion_events FOR ALL USING (true);

-- Success message
SELECT 'Store Viewers database setup completed successfully!' as status;