# ⚠️ IMPORTANT: Run This SQL Script to Fix Coupons

## The Problem
Your coupons are showing as "Invalid or expired" because the database columns don't match what the code expects.

## The Solution
You MUST run the SQL script `FIX_COUPONS_COMPLETE.sql` in your Supabase database.

## How to Run It

### Step 1: Open Supabase
1. Go to https://supabase.com
2. Open your project
3. Click "SQL Editor" in the left sidebar

### Step 2: Run the Script
1. Click "New Query"
2. Open the file `FIX_COUPONS_COMPLETE.sql` from your project
3. Copy ALL the contents
4. Paste into the SQL Editor
5. Click the "Run" button (or press Ctrl+Enter)

### Step 3: Verify
The script will show you the table structure at the end. You should see:
- `status` column (not `is_active`)
- `discount_type` column
- `discount_value` column
- `starts_at` column
- `expires_at` column
- `coupon_products` table created

## What the Script Does

✅ Adds missing columns to `coupons` table
✅ Renames old columns if they exist
✅ Creates `coupon_products` table for product-specific coupons
✅ Sets up proper indexes for performance
✅ Configures RLS policies for security
✅ Updates existing records with default values

## After Running the Script

Your coupons will work! Test by:
1. Going to `/mgmt-x9k2m7/coupons`
2. Creating a test coupon (e.g., "TEST10" for 10% off)
3. Going to a product page
4. Clicking "Buy Now"
5. Entering the coupon code
6. Clicking "Apply"
7. ✅ Should show "Coupon applied! 10% off"

## What Was Fixed in the Code

✅ Changed `is_active` to `status` in validation
✅ Changed `'percent'` to `'percentage'` for discount type
✅ Added `starts_at` date validation
✅ Added support for product-specific coupons
✅ Fixed coupon creation API to handle dates and products

## Troubleshooting

### Still showing "Invalid or expired"?
1. Make sure you ran the SQL script
2. Check that the coupon exists in the database
3. Verify the coupon `status` is 'active' (not 'inactive')
4. Check that `expires_at` is in the future (or NULL)
5. Check that `starts_at` is in the past (or NULL)

### Can't create coupons?
1. Run the SQL script first
2. Make sure all required columns exist
3. Check browser console for errors

## Need Help?
If coupons still don't work after running the script, check:
- Supabase logs for errors
- Browser console for API errors
- Make sure the coupon code is UPPERCASE in the database
