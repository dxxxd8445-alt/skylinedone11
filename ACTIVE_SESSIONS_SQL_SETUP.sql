-- ============================================
-- ADMIN AUDIT LOGS TABLE SETUP
-- Complete setup for Active Sessions feature
-- ============================================

-- Create admin_audit_logs table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('login', 'logout')),
  actor_role TEXT NOT NULL CHECK (actor_role IN ('admin', 'staff')),
  actor_identifier TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_actor_role ON admin_audit_logs(actor_role);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_event_type ON admin_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_actor_identifier ON admin_audit_logs(actor_identifier);

-- Enable RLS
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow all operations for service role" ON admin_audit_logs;

-- Create policy that allows service role to do everything
CREATE POLICY "Allow all operations for service role" ON admin_audit_logs FOR ALL USING (true);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Admin audit logs table created successfully!';
  RAISE NOTICE '✅ Indexes created for performance';
  RAISE NOTICE '✅ RLS policies configured';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Next steps:';
  RAISE NOTICE '1. Logout from admin panel';
  RAISE NOTICE '2. Login again';
  RAISE NOTICE '3. Go to /mgmt-x9k2m7/logs';
  RAISE NOTICE '4. See your active session with Force Logout button!';
END $$;
