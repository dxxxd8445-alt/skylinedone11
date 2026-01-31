-- Create webhooks table for Discord and other webhook integrations
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks(is_active);
CREATE INDEX IF NOT EXISTS idx_webhooks_events ON webhooks USING GIN(events);

-- Enable RLS
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (admin only access)
CREATE POLICY "Admin can manage webhooks" ON webhooks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email'
      AND is_active = true
    )
  );

-- Insert sample Discord webhook (replace with actual Discord webhook URL)
INSERT INTO webhooks (name, url, events, is_active) VALUES
  ('Discord Sales Notifications', 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN', 
   ARRAY['payment.completed', 'order.completed'], true)
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL ON webhooks TO authenticated;
GRANT ALL ON webhooks TO service_role;