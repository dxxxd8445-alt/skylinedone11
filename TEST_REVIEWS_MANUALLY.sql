-- ============================================
-- MANUALLY TEST REVIEWS SYSTEM
-- ============================================
-- Run these queries one by one in Supabase SQL Editor

-- 1. Check if reviews table exists and see its structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'reviews'
ORDER BY ordinal_position;

-- 2. Count existing reviews
SELECT COUNT(*) as total_reviews FROM reviews;

-- 3. See all reviews (if any)
SELECT 
  id,
  username,
  rating,
  text,
  is_approved,
  created_at
FROM reviews
ORDER BY created_at DESC;

-- 4. Insert a test review
INSERT INTO reviews (
  username,
  rating,
  text,
  avatar,
  verified,
  is_approved,
  created_at
) VALUES (
  'ManualTestUser',
  5,
  'This is a manually inserted test review to verify the system works!',
  'M',
  true,
  false,
  NOW()
) RETURNING *;

-- 5. Check if the test review was inserted
SELECT * FROM reviews WHERE username = 'ManualTestUser';

-- 6. Try to approve the test review
UPDATE reviews 
SET is_approved = true 
WHERE username = 'ManualTestUser'
RETURNING *;

-- 7. Check RLS policies on reviews table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'reviews';

-- 8. Check table permissions
SELECT 
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'reviews';

-- 9. Clean up test review (optional)
-- DELETE FROM reviews WHERE username = 'ManualTestUser';
