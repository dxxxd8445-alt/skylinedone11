-- Fix Coupon RLS Policies for Admin Panel Access
-- Run this in your Supabase SQL Editor

-- First, check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'coupons';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role access" ON coupons;
DROP POLICY IF EXISTS "Admin access to coupons" ON coupons;
DROP POLICY IF EXISTS "Public read access to active coupons" ON coupons;

-- Create comprehensive RLS policies for coupons table

-- 1. Service role has full access (for server-side operations)
CREATE POLICY "Service role full access" ON coupons
FOR ALL 
USING (auth.role() = 'service_role');

-- 2. Admin users have full access (for admin panel)
-- This allows admin panel to work with client-side queries
CREATE POLICY "Admin full access" ON coupons
FOR ALL 
USING (
  auth.role() = 'authenticated' AND 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.id = auth.uid()
  )
);

-- 3. Public can read active coupons for validation (cart usage)
CREATE POLICY "Public read active coupons" ON coupons
FOR SELECT
USING (is_active = true);

-- 4. Allow anonymous access for coupon validation API
CREATE POLICY "Anonymous coupon validation" ON coupons
FOR SELECT
USING (is_active = true AND auth.role() = 'anon');

-- Verify RLS is enabled
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Show the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'coupons';

-- Test query (should return results for service role)
SELECT COUNT(*) as coupon_count FROM coupons;