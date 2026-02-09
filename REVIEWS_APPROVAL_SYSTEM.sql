-- ============================================
-- REVIEWS APPROVAL SYSTEM SETUP
-- ============================================
-- Run this SQL in your Supabase SQL Editor

-- 1. Ensure reviews table has all required columns
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS text TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- 3. Update RLS policies for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can submit reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON reviews;

-- Allow anyone to view APPROVED reviews only
CREATE POLICY "Anyone can view approved reviews" ON reviews
  FOR SELECT
  USING (is_approved = true);

-- Allow anyone to submit reviews (they start as unapproved)
CREATE POLICY "Anyone can submit reviews" ON reviews
  FOR INSERT
  WITH CHECK (true);

-- Allow admins to view, update, and delete all reviews
CREATE POLICY "Admins can manage all reviews" ON reviews
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM store_users
      WHERE store_users.id = auth.uid()
      AND store_users.role = 'admin'
    )
  );

-- 4. Create function to get pending reviews count
CREATE OR REPLACE FUNCTION get_pending_reviews_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM reviews WHERE is_approved = false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE reviews IS 'Customer reviews with approval workflow';
COMMENT ON COLUMN reviews.is_approved IS 'Reviews must be approved by admin before showing publicly';
