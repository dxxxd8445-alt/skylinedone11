-- ============================================
-- REVIEWS RLS - COMPLETE FIX
-- ============================================
-- Run this to fix all review permissions issues

-- 1. Disable RLS temporarily to clean up
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies (force drop)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'reviews') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON reviews';
    END LOOP;
END $$;

-- 3. Re-enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 4. Create simple, working policies

-- Public can view approved reviews
CREATE POLICY "public_view_approved" ON reviews
  FOR SELECT
  TO anon, authenticated
  USING (is_approved = true);

-- Anyone can insert reviews (starts unapproved)
CREATE POLICY "public_insert_reviews" ON reviews
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Service role can do everything (for admin client)
CREATE POLICY "service_role_all" ON reviews
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 5. Grant permissions
GRANT SELECT ON reviews TO anon;
GRANT SELECT ON reviews TO authenticated;
GRANT INSERT ON reviews TO anon;
GRANT INSERT ON reviews TO authenticated;
GRANT ALL ON reviews TO service_role;

-- 6. Verify setup
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'reviews'
ORDER BY policyname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Reviews RLS policies configured successfully!';
  RAISE NOTICE 'Public can: view approved reviews, submit new reviews';
  RAISE NOTICE 'Admin (service role) can: manage all reviews';
END $$;
