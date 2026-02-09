-- ============================================
-- AUTOMATIC DISCORD WEBHOOK SETUP
-- This uses your existing Discord webhook from .env.local
-- ============================================

-- Insert Discord webhook for all order events
INSERT INTO webhooks (name, url, events, is_active, secret) VALUES (
  'Discord Order Notifications',
  'https://discord.com/api/webhooks/1466894801541533707/6Z-YfKfQbE-UuakpsNLfULuf_3WefNpMbwLLiNJKMSf__Xv-7GL4e4b0M1F7409S5L54',
  ARRAY[
    'checkout.started',
    'order.pending',
    'payment.completed',
    'order.completed',
    'payment.failed',
    'order.refunded',
    'order.disputed'
  ],
  true,
  NULL
);

-- Verify webhook was added
SELECT 
  name,
  url,
  events,
  is_active,
  created_at
FROM webhooks
WHERE is_active = true;

-- Success message
SELECT '✅ Discord webhook configured successfully!' as status;
SELECT '🔔 Your Discord channel will now receive order notifications!' as info;
