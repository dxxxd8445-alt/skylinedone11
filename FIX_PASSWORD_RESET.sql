-- ============================================
-- FIX PASSWORD RESET FUNCTIONALITY
-- Add missing columns to store_users table
-- ============================================

-- Add password reset columns if they don't exist
DO $$ 
BEGIN
    -- Add password_reset_token column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'store_users' 
        AND column_name = 'password_reset_token'
    ) THEN
        ALTER TABLE store_users ADD COLUMN password_reset_token TEXT;
        CREATE INDEX idx_store_users_reset_token ON store_users(password_reset_token);
    END IF;

    -- Add password_reset_expires_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'store_users' 
        AND column_name = 'password_reset_expires_at'
    ) THEN
        ALTER TABLE store_users ADD COLUMN password_reset_expires_at TIMESTAMPTZ;
    END IF;
END $$;

-- Verify the columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'store_users'
AND column_name IN ('password_reset_token', 'password_reset_expires_at')
ORDER BY column_name;

-- Show success message
SELECT '✅ Password reset columns added successfully!' as status;
