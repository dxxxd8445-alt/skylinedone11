-- ============================================
-- CLEAR ALL LICENSE KEYS
-- This will delete all existing licenses
-- so you can add your own fresh keys
-- ============================================

-- Step 1: Show current license count
SELECT 
    '📊 Current Licenses' as "Status",
    COUNT(*) as "Total Licenses",
    COUNT(*) FILTER (WHERE status = 'available') as "Available",
    COUNT(*) FILTER (WHERE status = 'used') as "Used",
    COUNT(*) FILTER (WHERE status = 'expired') as "Expired"
FROM licenses;

-- Step 2: Delete all licenses
DELETE FROM licenses;

-- Step 3: Verify deletion
SELECT 
    '✅ ALL LICENSES CLEARED!' as "Status",
    COUNT(*) as "Remaining Licenses"
FROM licenses;

-- Step 4: Show success message
SELECT 
    '🎉 ALL LICENSE KEYS DELETED' as "Result",
    'You can now add your own license keys in the admin dashboard' as "Next Step",
    '/mgmt-x9k2m7/licenses' as "Admin URL";
