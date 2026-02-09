-- ============================================
-- RECREATE REVIEWS TABLE - COMPLETE FIX
-- ============================================
-- This will fix everything once and for all

-- 1. Backup existing reviews (if any)
CREATE TABLE IF NOT EXISTS reviews_backup AS SELECT * FROM reviews;

-- 2. Drop the problematic table
DROP TABLE IF EXISTS reviews CASCADE;

-- 3. Create reviews table with correct structure
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  image_url TEXT,
  avatar TEXT,
  verified BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes
CREATE INDEX idx_reviews_approved ON reviews(is_approved);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- 5. Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 6. Create simple, working RLS policies
CREATE POLICY "public_view_approved" ON reviews
  FOR SELECT
  TO anon, authenticated
  USING (is_approved = true);

CREATE POLICY "public_insert_reviews" ON reviews
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "service_role_all" ON reviews
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 7. Grant permissions
GRANT SELECT ON reviews TO anon;
GRANT SELECT ON reviews TO authenticated;
GRANT INSERT ON reviews TO anon;
GRANT INSERT ON reviews TO authenticated;
GRANT ALL ON reviews TO service_role;

-- 8. Restore backed up reviews (if any existed)
INSERT INTO reviews (username, rating, text, image_url, avatar, verified, is_approved, created_at)
SELECT 
  COALESCE(customer_name, 'Anonymous') as username,
  rating,
  COALESCE(comment, '') as text,
  image as image_url,
  SUBSTRING(COALESCE(customer_name, 'A'), 1, 1) as avatar,
  COALESCE(is_verified, false) as verified,
  COALESCE(is_approved, false) as is_approved,
  COALESCE(created_at, NOW()) as created_at
FROM reviews_backup
WHERE EXISTS (SELECT 1 FROM reviews_backup);

-- 9. Verify setup
SELECT 
  'Table created successfully' as status,
  COUNT(*) as review_count
FROM reviews;

SELECT 
  'Policies created' as status,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'reviews';

-- Success!
DO $$
BEGIN
  RAISE NOTICE '✅ Reviews table recreated successfully!';
  RAISE NOTICE '✅ RLS policies configured!';
  RAISE NOTICE '✅ Ready to use!';
END $$;
