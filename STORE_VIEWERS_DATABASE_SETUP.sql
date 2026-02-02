-- STORE VIEWERS REAL-TIME ANALYTICS DATABASE SETUP
-- Run this SQL in your Supabase SQL Editor

-- 1. Create visitor_sessions table for real-time tracking
CREATE TABLE IF NOT EXISTS visitor_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  country TEXT,
  city TEXT,
  region TEXT,
  current_page TEXT,
  current_product TEXT,
  activity TEXT CHECK (activity IN ('browsing', 'viewing-product', 'in-cart', 'checkout', 'completed')),
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  browser TEXT,
  os TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  page_views INTEGER DEFAULT 1,
  time_on_site INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create page_views table for detailed tracking
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT REFERENCES visitor_sessions(session_id) ON DELETE CASCADE,
  page_path TEXT NOT NULL,
  page_title TEXT,
  product_id TEXT,
  product_name TEXT,
  time_spent INTEGER DEFAULT 0,
  scroll_depth INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create conversion_events table for tracking user actions
CREATE TABLE IF NOT EXISTS conversion_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT REFERENCES visitor_sessions(session_id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'product_view', 'add_to_cart', 'checkout_start', 'purchase')),
  event_data JSONB,
  value DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_active ON visitor_sessions(is_active, last_activity);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_session_id ON visitor_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_ip ON visitor_sessions(ip_address);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_activity ON visitor_sessions(activity);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_conversion_events_session_id ON conversion_events(session_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_type ON conversion_events(event_type);

-- 5. Create function to update last_activity automatically
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

-- 7. Create function to clean up old sessions (older than 30 minutes)
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
CREATE POLICY "Admin can view all visitor data" ON visitor_sessions FOR ALL USING (true);
CREATE POLICY "Admin can view all page views" ON page_views FOR ALL USING (true);
CREATE POLICY "Admin can view all conversion events" ON conversion_events FOR ALL USING (true);

-- 10. Create a view for real-time analytics
CREATE OR REPLACE VIEW real_time_analytics AS
SELECT 
  vs.session_id,
  vs.ip_address,
  vs.user_agent,
  vs.country,
  vs.city,
  vs.current_page,
  vs.current_product,
  vs.activity,
  vs.device_type,
  vs.browser,
  vs.os,
  vs.referrer,
  vs.page_views,
  vs.time_on_site,
  vs.last_activity,
  vs.created_at,
  EXTRACT(EPOCH FROM (NOW() - vs.last_activity)) as seconds_since_last_activity
FROM visitor_sessions vs
WHERE vs.is_active = true
  AND vs.last_activity > NOW() - INTERVAL '30 minutes'
ORDER BY vs.last_activity DESC;

-- 11. Verify tables were created
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name IN ('visitor_sessions', 'page_views', 'conversion_events')
ORDER BY table_name, ordinal_position;