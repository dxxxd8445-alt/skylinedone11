-- ============================================
-- FIX TEAM MEMBER INVITATIONS
-- Ensures team_members table has all required columns
-- ============================================

-- Step 1: Verify team_members table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'team_members') THEN
        RAISE EXCEPTION 'team_members table does not exist! Run COMPLETE_SUPABASE_SETUP.sql first.';
    END IF;
END $$;

-- Step 2: Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add invite_token column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'team_members' 
        AND column_name = 'invite_token'
    ) THEN
        ALTER TABLE team_members ADD COLUMN invite_token TEXT UNIQUE;
        CREATE INDEX idx_team_members_invite_token ON team_members(invite_token);
        RAISE NOTICE '✅ Added invite_token column';
    END IF;

    -- Add invite_expires_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'team_members' 
        AND column_name = 'invite_expires_at'
    ) THEN
        ALTER TABLE team_members ADD COLUMN invite_expires_at TIMESTAMPTZ;
        RAISE NOTICE '✅ Added invite_expires_at column';
    END IF;

    -- Add status column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'team_members' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE team_members ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive'));
        RAISE NOTICE '✅ Added status column';
    END IF;

    -- Add password_hash column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'team_members' 
        AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE team_members ADD COLUMN password_hash TEXT;
        RAISE NOTICE '✅ Added password_hash column';
    END IF;

    -- Add permissions column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'team_members' 
        AND column_name = 'permissions'
    ) THEN
        ALTER TABLE team_members ADD COLUMN permissions JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE '✅ Added permissions column';
    END IF;

    -- Add username column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'team_members' 
        AND column_name = 'username'
    ) THEN
        ALTER TABLE team_members ADD COLUMN username TEXT UNIQUE;
        RAISE NOTICE '✅ Added username column';
    END IF;

    -- Add role column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'team_members' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE team_members ADD COLUMN role TEXT DEFAULT 'Staff';
        RAISE NOTICE '✅ Added role column';
    END IF;
END $$;

-- Step 3: Verify all columns exist
SELECT 
    '✅ TEAM MEMBERS TABLE VERIFIED' as status,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'team_members'
AND column_name IN (
    'invite_token', 
    'invite_expires_at', 
    'status', 
    'password_hash', 
    'permissions',
    'username',
    'role'
)
ORDER BY column_name;

-- Step 4: Show current team members
SELECT 
    '📊 Current Team Members' as "Status",
    COUNT(*) as "Total Members",
    COUNT(*) FILTER (WHERE status = 'active') as "Active",
    COUNT(*) FILTER (WHERE status = 'pending') as "Pending",
    COUNT(*) FILTER (WHERE status = 'inactive') as "Inactive"
FROM team_members;

-- Step 5: Show success message
SELECT 
    '🎉 TEAM INVITATIONS FIXED!' as "Result",
    'You can now send team member invitations' as "Message",
    '/mgmt-x9k2m7/team' as "Admin URL";
