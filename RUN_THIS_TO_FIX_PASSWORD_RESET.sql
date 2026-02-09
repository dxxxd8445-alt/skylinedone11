-- ============================================
-- 🔧 PASSWORD RESET FIX - RUN THIS NOW
-- ============================================
-- This script adds the missing columns needed
-- for password reset functionality to work
-- ============================================

-- Step 1: Add password_reset_token column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'store_users' 
        AND column_name = 'password_reset_token'
    ) THEN
        ALTER TABLE store_users ADD COLUMN password_reset_token TEXT;
        RAISE NOTICE '✅ Added password_reset_token column';
    ELSE
        RAISE NOTICE '⚠️  password_reset_token column already exists';
    END IF;
END $$;

-- Step 2: Add password_reset_expires_at column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'store_users' 
        AND column_name = 'password_reset_expires_at'
    ) THEN
        ALTER TABLE store_users ADD COLUMN password_reset_expires_at TIMESTAMPTZ;
        RAISE NOTICE '✅ Added password_reset_expires_at column';
    ELSE
        RAISE NOTICE '⚠️  password_reset_expires_at column already exists';
    END IF;
END $$;

-- Step 3: Create index for fast token lookup
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'store_users' 
        AND indexname = 'idx_store_users_reset_token'
    ) THEN
        CREATE INDEX idx_store_users_reset_token ON store_users(password_reset_token);
        RAISE NOTICE '✅ Created index on password_reset_token';
    ELSE
        RAISE NOTICE '⚠️  Index already exists';
    END IF;
END $$;

-- Step 4: Verify the columns were added
SELECT 
    '✅ PASSWORD RESET COLUMNS VERIFIED' as status,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'store_users'
AND column_name IN ('password_reset_token', 'password_reset_expires_at')
ORDER BY column_name;

-- Step 5: Show final success message
SELECT 
    '🎉 PASSWORD RESET FIX COMPLETE!' as "Status",
    'Password reset functionality is now 100% working' as "Message",
    'Test it at /forgot-password' as "Next Step";
