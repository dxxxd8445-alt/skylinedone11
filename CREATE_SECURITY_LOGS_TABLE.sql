-- Create security logs table for tracking admin access attempts
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('login_attempt', 'login_success', 'login_failed', 'password_change', 'suspicious_activity', 'lockout')),
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  details TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip_address ON security_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON security_logs(severity);

-- Enable RLS (Row Level Security)
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can access security logs (admin only)
CREATE POLICY "Service role can access security logs"
  ON security_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE security_logs IS 'Security event logging for admin access monitoring';
