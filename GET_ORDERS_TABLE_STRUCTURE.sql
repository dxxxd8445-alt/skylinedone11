-- Get the EXACT structure of your orders table
-- Run this in Supabase SQL Editor and send me the results

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;
