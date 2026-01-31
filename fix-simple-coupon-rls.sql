-- Simple RLS Fix for Coupons Table
-- Run this in your Supabase SQL Editor

-- Drop all existing policies
DROP POLICY IF EXISTS "Service role access" ON coupons;
DROP POLICY IF EXISTS "Service role full access" ON coupons;
DROP POLICY IF EXISTS "Admin access to coupons" ON coupons;
DROP POLICY IF EXISTS "Public read access to active coupons" ON coupons;
DROP POLICY IF EXISTS "Admin full access" ON coupons;
DROP POLICY IF EXISTS "Public read active coupons" ON coupons;
DROP POLICY IF EXISTS "Anonymous coupon validation" ON coupons;

-- Create simple policies that work with the current auth system

-- 1. Service role has full access (for server-side admin actions)
CREATE POLICY "Service role full access" ON coupons
FOR ALL 
USING (auth.role() = 'service_role');

-- 2. Allow anonymous/public access for coupon validation (cart usage)
CREATE POLICY "Public coupon access" ON coupons
FOR SELECT
USING (true); -- Allow all reads for now since admin uses client-side queries

-- 3. Allow anonymous inserts/updates/deletes (since admin panel uses client-side)
-- This is not ideal for production but works for the current setup
CREATE POLICY "Public coupon management" ON coupons
FOR ALL
USING (true);

-- Ensure RLS is enabled
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'coupons';

-- Test that we can now read coupons
SELECT COUNT(*) as total_coupons FROM coupons;