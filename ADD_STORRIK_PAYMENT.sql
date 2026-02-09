-- ============================================
-- ADD STORRIK PAYMENT PROCESSOR
-- ============================================
-- This script adds Storrik as the payment processor
-- replacing MoneyMotion
-- ============================================

-- Add Storrik API key setting (will be configured in admin dashboard)
INSERT INTO settings (key, value, description, created_at, updated_at)
VALUES (
  'storrik_api_key',
  '""',
  'Storrik Public API Key (PK_xxx) for payment processing',
  NOW(),
  NOW()
)
ON CONFLICT (key) DO UPDATE
SET 
  description = EXCLUDED.description,
  updated_at = NOW();

-- Update existing orders to support Storrik
ALTER TABLE orders 
  ALTER COLUMN payment_method SET DEFAULT 'storrik';

-- Add comment to payment_method column
COMMENT ON COLUMN orders.payment_method IS 'Payment processor used: storrik, crypto, stripe, etc.';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Storrik payment processor added successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Next Steps:';
  RAISE NOTICE '1. Go to Admin Dashboard → Settings';
  RAISE NOTICE '2. Enter your Storrik Public API Key (PK_xxx)';
  RAISE NOTICE '3. Save settings';
  RAISE NOTICE '4. Configure webhook URL in Storrik dashboard:';
  RAISE NOTICE '   https://your-domain.com/api/webhooks/storrik';
  RAISE NOTICE '';
  RAISE NOTICE '🔗 Get your Storrik API key from: https://storrik.com/dashboard';
END $$;
