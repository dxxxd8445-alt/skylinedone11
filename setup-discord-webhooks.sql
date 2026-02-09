-- Setup Discord Webhooks for Skyline Cheats
-- This script configures Discord webhooks for order notifications

-- First, clear any existing webhooks to avoid duplicates
DELETE FROM webhooks WHERE url LIKE '%discord.com%';

-- Insert Discord webhook for all order events
INSERT INTO webhooks (name, url, events, is_active) VALUES
  (
    'Skyline Discord - All Order Events', 
    'https://discord.com/api/webhooks/1466894801541533707/6Z-YfKfQbE-UuakpsNLfULuf_3WefNpMbwLLiNJKMSf__Xv-7GL4e4b0M1F7409S5L54',
    ARRAY[
      'checkout.started',
      'order.pending', 
      'order.completed',
      'payment.completed',
      'payment.failed',
      'order.refunded',
      'order.disputed'
    ],
    true
  );

-- Verify the webhook was created
SELECT 
  id,
  name,
  url,
  events,
  is_active,
  created_at
FROM webhooks
WHERE is_active = true;
