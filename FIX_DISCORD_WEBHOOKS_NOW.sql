-- ============================================================================
-- FIX DISCORD WEBHOOKS - RUN THIS IN SUPABASE NOW!
-- ============================================================================

-- Step 1: Clean up any old webhooks
DELETE FROM webhooks WHERE name LIKE '%Discord%' OR name LIKE '%Ring-0%';

-- Step 2: Insert your Discord webhook
-- REPLACE THE URL BELOW WITH YOUR ACTUAL DISCORD WEBHOOK URL
INSERT INTO webhooks (name, url, events, is_active) VALUES (
  'Ring-0 Discord - Order Notifications',
  'YOUR_DISCORD_WEBHOOK_URL_HERE',
  ARRAY['checkout.started', 'order.pending', 'order.completed', 'payment.completed', 'payment.failed', 'order.refunded'],
  true
);

-- Step 3: Verify it was created
SELECT 
  id,
  name,
  url,
  events,
  is_active,
  created_at
FROM webhooks
WHERE is_active = true;

-- ============================================================================
-- IMPORTANT: Get your Discord webhook URL from:
-- 1. Go to your Discord server
-- 2. Server Settings → Integrations → Webhooks
-- 3. Create New Webhook or copy existing one
-- 4. The URL looks like: https://discord.com/api/webhooks/[ID]/[TOKEN]
-- ============================================================================
