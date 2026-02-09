-- ============================================
-- TEST DISCORD WEBHOOK CONFIGURATION
-- Run this to verify your webhook is set up correctly
-- ============================================

-- 1. Check if webhooks table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'webhooks'
    ) 
    THEN '✅ Webhooks table exists'
    ELSE '❌ Webhooks table NOT found - run COMPLETE_SUPABASE_SETUP.sql first'
  END as status;

-- 2. Check if webhook is configured
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM webhooks 
      WHERE is_active = true 
      AND url LIKE '%discord.com/api/webhooks/%'
    )
    THEN '✅ Discord webhook is configured and active'
    ELSE '❌ No active Discord webhook found - run SETUP_DISCORD_WEBHOOK_AUTO.sql'
  END as status;

-- 3. Show webhook details
SELECT 
  name,
  CASE 
    WHEN url LIKE '%discord.com/api/webhooks/%' THEN '✅ Valid Discord URL'
    ELSE '❌ Invalid webhook URL'
  END as url_status,
  array_length(events, 1) as event_count,
  is_active,
  created_at
FROM webhooks
WHERE is_active = true;

-- 4. List all webhook events
SELECT 
  name,
  unnest(events) as event_name
FROM webhooks
WHERE is_active = true
ORDER BY name, event_name;

-- 5. Check required events are configured
WITH required_events AS (
  SELECT unnest(ARRAY[
    'checkout.started',
    'order.pending',
    'payment.completed',
    'order.completed',
    'payment.failed',
    'order.refunded',
    'order.disputed'
  ]) as event_name
),
configured_events AS (
  SELECT unnest(events) as event_name
  FROM webhooks
  WHERE is_active = true
)
SELECT 
  re.event_name,
  CASE 
    WHEN ce.event_name IS NOT NULL THEN '✅ Configured'
    ELSE '❌ Missing'
  END as status
FROM required_events re
LEFT JOIN configured_events ce ON re.event_name = ce.event_name
ORDER BY re.event_name;

-- 6. Summary
SELECT 
  '🎉 WEBHOOK VERIFICATION COMPLETE' as message,
  COUNT(*) as total_active_webhooks,
  SUM(array_length(events, 1)) as total_events_configured
FROM webhooks
WHERE is_active = true;

-- 7. Next steps
SELECT 
  '📝 Next Steps:' as info,
  CASE 
    WHEN EXISTS (SELECT FROM webhooks WHERE is_active = true)
    THEN '1. Make a test purchase on your store
2. Check your Discord channel for webhook messages
3. Verify all 4 messages appear (checkout, pending, payment, completed)
4. Check admin panel for the order'
    ELSE '1. Run SETUP_DISCORD_WEBHOOK_AUTO.sql to configure webhook
2. Then run this test again'
  END as instructions;
