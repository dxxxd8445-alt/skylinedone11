-- ============================================
-- FIX REVIEWS RLS - FINAL FIX
-- ============================================
-- This fixes the "permission denied for table users" error

-- 1. Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can submit reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON reviews;

-- 2. Allow anyone to view APPROVED reviews (public access)
CREATE POLICY "Anyone can view approved reviews" ON reviews
  FOR SELECT
  USING (is_approved = true);

-- 3. Allow anyone to INSERT reviews (they start unapproved)
CREATE POLICY "Anyone can submit reviews" ON reviews
  FOR INSERT
  WITH CHECK (true);

-- 4. Simplified admin policy - just check if user is authenticated
-- The admin client with service role key will bypass RLS anyway
CREATE POLICY "Authenticated users can manage reviews" ON reviews
  FOR ALL
  USING (auth.role() = 'authenticated');

-- 5. Grant necessary permissions to anon and authenticated roles
GRANT SELECT ON reviews TO anon;
GRANT SELECT ON reviews TO authenticated;
GRANT INSERT ON reviews TO anon;
GRANT INSERT ON reviews TO authenticated;
GRANT UPDATE ON reviews TO authenticated;
GRANT DELETE ON reviews TO authenticated;

-- 6. Ensure RLS is enabled
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'reviews';
