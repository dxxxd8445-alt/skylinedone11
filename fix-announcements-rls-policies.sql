-- FIX ANNOUNCEMENTS RLS POLICIES
-- Run this in Supabase SQL Editor to fix the RLS policies

-- 1. Drop existing policies
DROP POLICY IF EXISTS "Public read access for active announcements" ON announcements;
DROP POLICY IF EXISTS "Service role full access announcements" ON announcements;

-- 2. Create new policies that allow admin panel access
-- Allow public to read active announcements
CREATE POLICY "Public read active announcements" ON announcements
FOR SELECT USING (is_active = true);

-- Allow authenticated users to read all announcements (for admin panel)
CREATE POLICY "Authenticated read all announcements" ON announcements
FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Allow service role full access (for admin operations)
CREATE POLICY "Service role full access" ON announcements
FOR ALL USING (auth.role() = 'service_role');

-- Allow anon users to insert/update/delete (for admin panel without auth)
CREATE POLICY "Anon full access for admin" ON announcements
FOR ALL USING (auth.role() = 'anon');

-- 3. Verify policies are working
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'announcements';

-- 4. Test query that the page uses
SELECT id, title, message, type, is_active, priority, created_at, updated_at
FROM announcements 
ORDER BY priority DESC, created_at DESC
LIMIT 5;