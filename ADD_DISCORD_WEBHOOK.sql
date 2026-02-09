-- ============================================
-- ADD DISCORD WEBHOOK FOR ORDER NOTIFICATIONS
-- ============================================
-- 
-- INSTRUCTIONS:
-- 1. Create a webhook in your Discord server:
--    - Right-click channel → Edit Channel → Integrations → Webhooks
--    - Click "New Webhook"
--    - Copy the Webhook URL
-- 
-- 2. Replace YOUR_DISCORD_WEBHOOK_URL_HERE below with your actual webhook URL
-- 
-- 3. Run this script in Supabase SQL Editor
-- ============================================

-- Insert Discord webhook for all order events
INSERT INTO webhooks (name, url, events, is_active, secret) VALUES (
  'Discord Order Notifications',
  'YOUR_DISCORD_WEBHOOK_URL_HERE',
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
SELECT '✅ Discord webhook added successfully!' as status;
SELECT '📝 Make sure to replace YOUR_DISCORD_WEBHOOK_URL_HERE with your actual webhook URL!' as reminder;
