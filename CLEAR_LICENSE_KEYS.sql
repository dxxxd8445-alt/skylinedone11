-- ============================================
-- CLEAR ALL LICENSE KEYS
-- This will delete all existing license keys
-- so you can add your own fresh keys
-- ============================================

-- Step 1: Show current license key count
SELECT 
    '📊 Current License Keys' as "Status",
    COUNT(*) as "Total Keys",
    COUNT(*) FILTER (WHERE status = 'available') as "Available",
    COUNT(*) FILTER (WHERE status = 'sold') as "Sold",
    COUNT(*) FILTER (WHERE status = 'used') as "Used"
FROM license_keys;

-- Step 2: Delete all license keys
DELETE FROM license_keys;

-- Step 3: Verify deletion
SELECT 
    '✅ LICENSE KEYS CLEARED!' as "Status",
    COUNT(*) as "Remaining Keys"
FROM license_keys;

-- Step 4: Show success message
SELECT 
    '🎉 ALL LICENSE KEYS DELETED' as "Result",
    'You can now add your own license keys in the admin dashboard' as "Next Step",
    '/mgmt-x9k2m7/licenses' as "Admin URL";
