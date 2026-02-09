-- ============================================
-- DISCORD WEBHOOK SETUP
-- RUN THIS AFTER THE MAIN DATABASE SETUP
-- ============================================

-- Delete old webhooks first
DELETE FROM webhooks;

-- Insert NEW Discord webhook for order notifications
INSERT INTO webhooks (name, url, events, is_active) VALUES (
  'Skyline Discord - Order Notifications',
  'https://discord.com/api/webhooks/1470214571913646246/QtYckEUaUFeG8ybiRMY1CVH1VnybbxS3-R4fdRECQZ7zGVVwgwSTn2EdI4rseTrFUaHr',
  ARRAY[
    'checkout.started',
    'order.pending',
    'payment.completed',
    'order.completed',
    'payment.failed',
    'order.refunded',
    'order.disputed'
  ],
  true
);

-- Verify webhook was added
SELECT 
  '✅ Discord Webhook Configured!' as status,
  name,
  url,
  is_active,
  array_length(events, 1) as event_count
FROM webhooks
WHERE is_active = true;
