-- ============================================
-- FIX REVIEWS RLS - Allow Anonymous Submissions
-- ============================================
-- Run this SQL in your Supabase SQL Editor

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Anyone can submit reviews" ON reviews;

-- Create new policy that allows anonymous submissions
CREATE POLICY "Anyone can submit reviews" ON reviews
  FOR INSERT
  WITH CHECK (true);

-- Also ensure the SELECT policy is correct
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;

CREATE POLICY "Anyone can view approved reviews" ON reviews
  FOR SELECT
  USING (is_approved = true);

-- Verify admin policy exists
DROP POLICY IF EXISTS "Admins can manage all reviews" ON reviews;

CREATE POLICY "Admins can manage all reviews" ON reviews
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.email = (SELECT email FROM auth.users WHERE auth.users.id = auth.uid())
      AND team_members.is_active = true
    )
  );

-- Grant necessary permissions
GRANT INSERT ON reviews TO anon;
GRANT INSERT ON reviews TO authenticated;
GRANT SELECT ON reviews TO anon;
GRANT SELECT ON reviews TO authenticated;
