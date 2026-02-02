-- ADVANCED STORE VIEWERS REAL-TIME ANALYTICS DATABASE SETUP
-- Run this SQL in your Supabase SQL Editor

-- 1. Enhanced visitor_sessions table with more detailed tracking
DROP TABLE IF EXISTS visitor_sessions CASCADE;
CREATE TABLE visitor_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  country TEXT,
  city TEXT,
  region TEXT,
  timezone TEXT,
  isp TEXT,
  current_page TEXT,
  current_product TEXT,
  activity TEXT CHECK (activity IN ('browsing', 'viewing-product', 'in-cart', 'checkout', 'completed')),
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  browser TEXT,
  browser_version TEXT,
  os TEXT,
  os_version TEXT,
  screen_resolution TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  page_views INTEGER DEFAULT 1,
  time_on_site INTEGER DEFAULT 0,
  bounce_rate BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_bot BOOLEAN DEFAULT false,
  entry_page TEXT,
  exit_page TEXT,
  conversion_value DECIMAL(10,2) DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enhanced page_views table with detailed metrics
DROP TABLE IF EXISTS page_views CASCADE;
CREATE TABLE page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT REFERENCES visitor_sessions(session_id) ON DELETE CASCADE,
  page_path TEXT NOT NULL,
  page_title TEXT,
  product_id TEXT,
  product_name TEXT,
  category TEXT,
  time_spent INTEGER DEFAULT 0,
  scroll_depth INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  form_interactions INTEGER DEFAULT 0,
  video_plays INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  exit_page BOOLEAN DEFAULT false,
  bounce BOOLEAN DEFAULT false,
  load_time INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enhanced conversion_events table
DROP TABLE IF EXISTS conversion_events CASCADE;
CREATE TABLE conversion_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT REFERENCES visitor_sessions(session_id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'product_view', 'add_to_cart', 'remove_from_cart', 'checkout_start', 'checkout_step', 'purchase', 'signup', 'login', 'search', 'video_play', 'download', 'form_submit', 'click', 'scroll')),
  event_category TEXT,
  event_action TEXT,
  event_label TEXT,
  event_data JSONB,
  value DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  product_id TEXT,
  product_name TEXT,
  product_category TEXT,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Real-time visitor tracking table
DROP TABLE IF EXISTS realtime_visitors CASCADE;
CREATE TABLE realtime_visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  ip_address INET,
  country TEXT,
  city TEXT,
  current_page TEXT,
  current_product TEXT,
  activity TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  time_on_site INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 1,
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Traffic sources table
DROP TABLE IF EXISTS traffic_sources CASCADE;
CREATE TABLE traffic_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT REFERENCES visitor_sessions(session_id) ON DELETE CASCADE,
  source_type TEXT CHECK (source_type IN ('direct', 'organic', 'social', 'email', 'paid', 'referral', 'affiliate')),
  source TEXT,
  medium TEXT,
  campaign TEXT,
  keyword TEXT,
  referrer_domain TEXT,
  landing_page TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Heatmap data table
DROP TABLE IF EXISTS heatmap_data CASCADE;
CREATE TABLE heatmap_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT REFERENCES visitor_sessions(session_id) ON DELETE CASCADE,
  page_path TEXT NOT NULL,
  element_selector TEXT,
  click_x INTEGER,
  click_y INTEGER,
  viewport_width INTEGER,
  viewport_height INTEGER,
  event_type TEXT CHECK (event_type IN ('click', 'move', 'scroll', 'hover')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. A/B test tracking
DROP TABLE IF EXISTS ab_test_data CASCADE;
CREATE TABLE ab_test_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT REFERENCES visitor_sessions(session_id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  variant TEXT NOT NULL,
  converted BOOLEAN DEFAULT false,
  conversion_value DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Performance indexes
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_active ON visitor_sessions(is_active, last_activity);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_session_id ON visitor_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_ip ON visitor_sessions(ip_address);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_activity ON visitor_sessions(activity);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_created_at ON visitor_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_country ON visitor_sessions(country);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_device ON visitor_sessions(device_type);

CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_product_name ON page_views(product_name);

CREATE INDEX IF NOT EXISTS idx_conversion_events_session_id ON conversion_events(session_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_type ON conversion_events(event_type);
CREATE INDEX IF NOT EXISTS idx_conversion_events_created_at ON conversion_events(created_at);
CREATE INDEX IF NOT EXISTS idx_conversion_events_product_id ON conversion_events(product_id);

CREATE INDEX IF NOT EXISTS idx_realtime_visitors_session_id ON realtime_visitors(session_id);
CREATE INDEX IF NOT EXISTS idx_realtime_visitors_heartbeat ON realtime_visitors(last_heartbeat);
CREATE INDEX IF NOT EXISTS idx_realtime_visitors_activity ON realtime_visitors(activity);

CREATE INDEX IF NOT EXISTS idx_traffic_sources_session_id ON traffic_sources(session_id);
CREATE INDEX IF NOT EXISTS idx_traffic_sources_type ON traffic_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_traffic_sources_created_at ON traffic_sources(created_at);

CREATE INDEX IF NOT EXISTS idx_heatmap_data_page_path ON heatmap_data(page_path);
CREATE INDEX IF NOT EXISTS idx_heatmap_data_created_at ON heatmap_data(created_at);

-- 9. Functions for real-time updates
CREATE OR REPLACE FUNCTION update_visitor_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_activity = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Trigger for automatic updates
DROP TRIGGER IF EXISTS trigger_update_visitor_activity ON visitor_sessions;
CREATE TRIGGER trigger_update_visitor_activity
  BEFORE UPDATE ON visitor_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_visitor_activity();

-- 11. Function to update realtime visitors
CREATE OR REPLACE FUNCTION upsert_realtime_visitor(
  p_session_id TEXT,
  p_ip_address INET,
  p_country TEXT,
  p_city TEXT,
  p_current_page TEXT,
  p_current_product TEXT,
  p_activity TEXT,
  p_device_type TEXT,
  p_browser TEXT,
  p_os TEXT,
  p_time_on_site INTEGER,
  p_page_views INTEGER
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO realtime_visitors (
    session_id, ip_address, country, city, current_page, current_product,
    activity, device_type, browser, os, time_on_site, page_views, last_heartbeat
  ) VALUES (
    p_session_id, p_ip_address, p_country, p_city, p_current_page, p_current_product,
    p_activity, p_device_type, p_browser, p_os, p_time_on_site, p_page_views, NOW()
  )
  ON CONFLICT (session_id) DO UPDATE SET
    ip_address = EXCLUDED.ip_address,
    country = EXCLUDED.country,
    city = EXCLUDED.city,
    current_page = EXCLUDED.current_page,
    current_product = EXCLUDED.current_product,
    activity = EXCLUDED.activity,
    device_type = EXCLUDED.device_type,
    browser = EXCLUDED.browser,
    os = EXCLUDED.os,
    time_on_site = EXCLUDED.time_on_site,
    page_views = EXCLUDED.page_views,
    last_heartbeat = NOW();
END;
$$ LANGUAGE plpgsql;

-- 12. Function to cleanup inactive sessions
CREATE OR REPLACE FUNCTION cleanup_inactive_sessions()
RETURNS INTEGER AS $$
DECLARE
  cleaned_count INTEGER;
BEGIN
  -- Mark sessions as inactive after 30 minutes
  UPDATE visitor_sessions 
  SET is_active = false, session_end = NOW()
  WHERE is_active = true 
    AND last_activity < NOW() - INTERVAL '30 minutes';
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  
  -- Remove from realtime_visitors after 5 minutes
  DELETE FROM realtime_visitors 
  WHERE last_heartbeat < NOW() - INTERVAL '5 minutes';
  
  RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql;

-- 13. Function to get analytics data for date range
CREATE OR REPLACE FUNCTION get_analytics_data(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  total_visitors BIGINT,
  unique_visitors BIGINT,
  page_views BIGINT,
  bounce_rate NUMERIC,
  avg_session_duration NUMERIC,
  conversion_rate NUMERIC,
  top_pages JSONB,
  top_products JSONB,
  traffic_sources JSONB,
  device_breakdown JSONB,
  country_breakdown JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH analytics AS (
    SELECT 
      COUNT(*) as total_sessions,
      COUNT(DISTINCT ip_address) as unique_ips,
      SUM(page_views) as total_page_views,
      AVG(CASE WHEN page_views = 1 THEN 1 ELSE 0 END) * 100 as bounce_pct,
      AVG(time_on_site) as avg_duration,
      AVG(CASE WHEN conversion_value > 0 THEN 1 ELSE 0 END) * 100 as conversion_pct
    FROM visitor_sessions 
    WHERE created_at BETWEEN start_date AND end_date
  ),
  top_pages_data AS (
    SELECT jsonb_agg(
      jsonb_build_object('page', page_path, 'views', view_count)
      ORDER BY view_count DESC
    ) as pages
    FROM (
      SELECT page_path, COUNT(*) as view_count
      FROM page_views pv
      JOIN visitor_sessions vs ON pv.session_id = vs.session_id
      WHERE vs.created_at BETWEEN start_date AND end_date
      GROUP BY page_path
      ORDER BY view_count DESC
      LIMIT 10
    ) t
  ),
  top_products_data AS (
    SELECT jsonb_agg(
      jsonb_build_object('product', product_name, 'views', view_count)
      ORDER BY view_count DESC
    ) as products
    FROM (
      SELECT product_name, COUNT(*) as view_count
      FROM page_views pv
      JOIN visitor_sessions vs ON pv.session_id = vs.session_id
      WHERE vs.created_at BETWEEN start_date AND end_date
        AND product_name IS NOT NULL
      GROUP BY product_name
      ORDER BY view_count DESC
      LIMIT 10
    ) t
  ),
  traffic_data AS (
    SELECT jsonb_agg(
      jsonb_build_object('source', source_type, 'count', source_count)
      ORDER BY source_count DESC
    ) as sources
    FROM (
      SELECT 
        COALESCE(ts.source_type, 'direct') as source_type,
        COUNT(*) as source_count
      FROM visitor_sessions vs
      LEFT JOIN traffic_sources ts ON vs.session_id = ts.session_id
      WHERE vs.created_at BETWEEN start_date AND end_date
      GROUP BY ts.source_type
      ORDER BY source_count DESC
    ) t
  ),
  device_data AS (
    SELECT jsonb_agg(
      jsonb_build_object('device', device_type, 'count', device_count)
      ORDER BY device_count DESC
    ) as devices
    FROM (
      SELECT device_type, COUNT(*) as device_count
      FROM visitor_sessions
      WHERE created_at BETWEEN start_date AND end_date
      GROUP BY device_type
      ORDER BY device_count DESC
    ) t
  ),
  country_data AS (
    SELECT jsonb_agg(
      jsonb_build_object('country', country, 'count', country_count)
      ORDER BY country_count DESC
    ) as countries
    FROM (
      SELECT country, COUNT(*) as country_count
      FROM visitor_sessions
      WHERE created_at BETWEEN start_date AND end_date
        AND country IS NOT NULL
      GROUP BY country
      ORDER BY country_count DESC
      LIMIT 10
    ) t
  )
  SELECT 
    a.total_sessions::BIGINT,
    a.unique_ips::BIGINT,
    a.total_page_views::BIGINT,
    ROUND(a.bounce_pct, 2),
    ROUND(a.avg_duration, 2),
    ROUND(a.conversion_pct, 2),
    COALESCE(tp.pages, '[]'::jsonb),
    COALESCE(tpr.products, '[]'::jsonb),
    COALESCE(td.sources, '[]'::jsonb),
    COALESCE(dd.devices, '[]'::jsonb),
    COALESCE(cd.countries, '[]'::jsonb)
  FROM analytics a
  CROSS JOIN top_pages_data tp
  CROSS JOIN top_products_data tpr
  CROSS JOIN traffic_data td
  CROSS JOIN device_data dd
  CROSS JOIN country_data cd;
END;
$$ LANGUAGE plpgsql;

-- 14. Enable RLS (Row Level Security)
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE heatmap_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_data ENABLE ROW LEVEL SECURITY;

-- 15. Create policies for admin access
CREATE POLICY "Admin can manage all visitor data" ON visitor_sessions FOR ALL USING (true);
CREATE POLICY "Admin can manage all page views" ON page_views FOR ALL USING (true);
CREATE POLICY "Admin can manage all conversion events" ON conversion_events FOR ALL USING (true);
CREATE POLICY "Admin can manage all realtime visitors" ON realtime_visitors FOR ALL USING (true);
CREATE POLICY "Admin can manage all traffic sources" ON traffic_sources FOR ALL USING (true);
CREATE POLICY "Admin can manage all heatmap data" ON heatmap_data FOR ALL USING (true);
CREATE POLICY "Admin can manage all ab test data" ON ab_test_data FOR ALL USING (true);

-- 16. Create materialized view for performance
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_analytics AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as sessions,
  COUNT(DISTINCT ip_address) as unique_visitors,
  SUM(page_views) as page_views,
  AVG(time_on_site) as avg_session_duration,
  COUNT(CASE WHEN conversion_value > 0 THEN 1 END) as conversions,
  SUM(conversion_value) as revenue
FROM visitor_sessions
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Create unique index for materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_analytics_date ON daily_analytics(date);

-- 17. Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_daily_analytics()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_analytics;
END;
$$ LANGUAGE plpgsql;

-- 18. Verify tables were created
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name IN ('visitor_sessions', 'page_views', 'conversion_events', 'realtime_visitors', 'traffic_sources', 'heatmap_data', 'ab_test_data')
ORDER BY table_name, ordinal_position;

-- 19. Create sample data for testing (optional)
-- INSERT INTO visitor_sessions (session_id, ip_address, country, city, current_page, activity, device_type, browser, os, page_views, time_on_site)
-- VALUES 
--   ('test_session_1', '192.168.1.1', 'United States', 'New York', '/store/apex-legends', 'viewing-product', 'desktop', 'Chrome', 'Windows', 5, 300),
--   ('test_session_2', '192.168.1.2', 'Canada', 'Toronto', '/store', 'browsing', 'mobile', 'Safari', 'iOS', 3, 150);

-- Success message
SELECT 'Advanced Store Viewers database setup completed successfully!' as status;