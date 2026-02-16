-- Fix RLS policies for webhooks table so admin can see them

-- Drop existing policies
DROP POLICY IF EXISTS "Allow admin full access to webhooks" ON webhooks;
DROP POLICY IF EXISTS "Allow service role full access to webhooks" ON webhooks;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON webhooks;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON webhooks;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON webhooks;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON webhooks;

-- Enable RLS
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Create new policy that allows ALL operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users"
ON webhooks
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Also allow service role full access
CREATE POLICY "Allow service role full access"
ON webhooks
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Verify the webhook exists
SELECT 
  id,
  name,
  url,
  events,
  is_active,
  created_at
FROM webhooks
ORDER BY created_at DESC;

-- If no webhooks show up, insert the Discord webhook again
INSERT INTO webhooks (name, url, events, is_active) 
VALUES (
  'Ring-0 Discord - Order Notifications',
  'https://discord.com/api/webhooks/1470214571913646246/QtYckEUaUFeG8ybiRMY1CVH1VnybbxS3-R4fdRECQZ7zGVVwgwSTn2EdI4rseTrFUaHr',
  ARRAY['checkout.started', 'order.pending', 'payment.completed', 'order.completed', 'payment.failed', 'order.refunded', 'order.disputed'],
  true
)
ON CONFLICT DO NOTHING
RETURNING *;
