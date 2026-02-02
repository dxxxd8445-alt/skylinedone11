-- ENHANCED AFFILIATE PAYMENT METHODS
-- Run this SQL in your Supabase SQL Editor to add new payment method columns

-- 1. Add new columns for enhanced payment methods
ALTER TABLE affiliates 
ADD COLUMN IF NOT EXISTS crypto_type TEXT,
ADD COLUMN IF NOT EXISTS cashapp_tag TEXT;

-- 2. Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_affiliates_crypto_type ON affiliates(crypto_type);
CREATE INDEX IF NOT EXISTS idx_affiliates_payment_method ON affiliates(payment_method);

-- 3. Update existing affiliates to ensure they have proper payment method values
UPDATE affiliates 
SET payment_method = 'paypal' 
WHERE payment_method IS NULL OR payment_method = '';

-- 4. Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'affiliates' 
AND column_name IN ('payment_method', 'payment_email', 'crypto_type', 'cashapp_tag')
ORDER BY ordinal_position;

-- 5. Show current affiliate data with new columns
SELECT 
    id,
    affiliate_code,
    payment_method,
    payment_email,
    crypto_type,
    cashapp_tag,
    commission_rate,
    status,
    created_at
FROM affiliates
ORDER BY created_at DESC;