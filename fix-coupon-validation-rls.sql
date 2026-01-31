-- Fix Coupon Validation RLS Policy
-- Run this in your Supabase SQL Editor

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Service role full access" ON coupons;
DROP POLICY IF EXISTS "Public coupon access" ON coupons;
DROP POLICY IF EXISTS "Public coupon management" ON coupons;
DROP POLICY IF EXISTS "Anonymous coupon validation" ON coupons;

-- Create simple and effective policies

-- 1. Service role has full access (for admin operations)
CREATE POLICY "Service role full access" ON coupons
FOR ALL 
USING (auth.role() = 'service_role');

-- 2. Allow public read access for coupon validation (cart usage)
-- This is needed for the validation API to work
CREATE POLICY "Public read coupons" ON coupons
FOR SELECT
USING (true); -- Allow all reads for now

-- 3. Only service role can modify coupons (admin operations)
CREATE POLICY "Service role modify coupons" ON coupons
FOR INSERT, UPDATE, DELETE
USING (auth.role() = 'service_role');

-- Ensure RLS is enabled
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Test the policies by selecting a coupon
SELECT code, discount_value, discount_type, is_active, expires_at 
FROM coupons 
WHERE code = 'TEST' AND is_active = true;

-- Verify policies are in place
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'coupons';