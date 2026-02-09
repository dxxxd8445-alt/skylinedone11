-- Disable RLS on orders table so checkout can read orders
-- Run this in Supabase SQL Editor

ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'orders';
