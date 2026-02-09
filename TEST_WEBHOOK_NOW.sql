-- Test if webhook exists and verify it's working
SELECT 
  id,
  name,
  url,
  events,
  is_active,
  created_at
FROM webhooks
WHERE is_active = true;

-- If no results, the webhook might not have been inserted
-- Run this to insert it again:

DELETE FROM webhooks WHERE name LIKE '%Skyline%';

INSERT INTO webhooks (name, url, events, is_active) VALUES (
  'Skyline Discord - Order Notifications',
  'https://discord.com/api/webhooks/1470214571913646246/QtYckEUaUFeG8ybiRMY1CVH1VnybbxS3-R4fdRECQZ7zGVVwgwSTn2EdI4rseTrFUaHr',
  ARRAY['checkout.started', 'order.pending', 'payment.completed', 'order.completed', 'payment.failed', 'order.refunded', 'order.disputed'],
  true
) RETURNING *;

-- Test the webhook manually with curl (copy this command):
/*
curl -X POST "https://discord.com/api/webhooks/1470214571913646246/QtYckEUaUFeG8ybiRMY1CVH1VnybbxS3-R4fdRECQZ7zGVVwgwSTn2EdI4rseTrFUaHr" \
-H "Content-Type: application/json" \
-d '{
  "embeds": [{
    "title": "🧪 Test - Skyline Cheats",
    "description": "Webhook is working!",
    "color": 2563235,
    "fields": [
      {"name": "Event", "value": "payment.completed", "inline": true},
      {"name": "Amount", "value": "$49.99", "inline": true}
    ]
  }]
}'
*/
