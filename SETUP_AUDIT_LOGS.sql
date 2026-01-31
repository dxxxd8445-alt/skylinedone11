-- ============================================
-- AUDIT LOGS TABLE SETUP
-- Copy and paste this entire script into your Supabase SQL Editor
-- ============================================

-- Create admin_audit_logs table for tracking login/logout events
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('login', 'logout')),
  actor_role TEXT NOT NULL CHECK (actor_role IN ('admin', 'staff')),
  actor_identifier TEXT NOT NULL, -- email for staff, 'admin' for admin
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_actor ON admin_audit_logs(actor_role, actor_identifier);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_event_type ON admin_audit_logs(event_type);

-- Add RLS (Row Level Security) policies
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role to read/write (for admin operations)
CREATE POLICY IF NOT EXISTS "Service role can manage audit logs" ON admin_audit_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Insert a test record to verify everything works
INSERT INTO admin_audit_logs (event_type, actor_role, actor_identifier, ip_address, user_agent) 
VALUES ('login', 'admin', 'setup-test', '127.0.0.1', 'Manual Setup');

-- Verify the table was created successfully
SELECT 
  'Table created successfully!' as status,
  COUNT(*) as test_records
FROM admin_audit_logs 
WHERE actor_identifier = 'setup-test';

-- Add some comments for documentation
COMMENT ON TABLE admin_audit_logs IS 'Tracks admin and staff login/logout events for security auditing';
COMMENT ON COLUMN admin_audit_logs.event_type IS 'Type of event: login or logout';
COMMENT ON COLUMN admin_audit_logs.actor_role IS 'Role of the user: admin or staff';
COMMENT ON COLUMN admin_audit_logs.actor_identifier IS 'Email for staff users, "admin" for admin user';
COMMENT ON COLUMN admin_audit_logs.ip_address IS 'IP address of the user when the event occurred';
COMMENT ON COLUMN admin_audit_logs.user_agent IS 'Browser user agent string';