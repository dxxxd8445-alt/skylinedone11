# Coupon Creation Fix - Instructions

## Problem
Coupon creation was failing because the database schema didn't match what the API expected.

## What Was Fixed

### 1. Database Schema
- Added missing columns: `discount_type`, `discount_value`, `status`, `starts_at`, `expires_at`
- Created `coupon_products` junction table for product-specific coupons
- Added proper indexes and RLS policies

### 2. API Updates
- Updated `/api/admin/coupons` to handle:
  - Product selection (stores in `coupon_products` table)
  - Start date (`starts_at` column)
  - End date (`expires_at` column)
  - Both percentage and fixed amount discounts

### 3. UI Features
- Select All / Clear All buttons for products
- Checkbox interface for product selection
- Start and end date pickers
- Counter showing selected products

## How to Fix Your Database

**IMPORTANT: Run this SQL script in Supabase SQL Editor**

1. Go to your Supabase dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `FIX_COUPONS_COMPLETE.sql`
5. Paste it into the SQL Editor
6. Click "Run" button

The script will:
- ✅ Add all missing columns to the `coupons` table
- ✅ Create the `coupon_products` junction table
- ✅ Set up proper indexes for performance
- ✅ Configure RLS policies for security
- ✅ Show you the final table structure

## After Running the Script

Your coupon creation will work perfectly! You can:
- Create coupons with percentage or fixed discounts
- Limit coupons to specific products (or leave empty for all products)
- Set start and end dates for time-limited coupons
- Set maximum usage limits

## Testing

1. Go to `/mgmt-x9k2m7/coupons`
2. Click "Create Coupon"
3. Fill in:
   - Coupon Code: `RING-010`
   - Select some products (or use Select All)
   - Set dates (optional)
   - Discount: 10%
   - Max uses: 5000
4. Click "Create Coupon"
5. Should see success message and coupon in the table!

## Database Schema

### Coupons Table
```
- id (UUID)
- code (TEXT) - unique coupon code
- discount_type (TEXT) - 'percentage' or 'fixed'
- discount_value (DECIMAL) - discount amount
- max_uses (INTEGER) - maximum number of uses
- current_uses (INTEGER) - current usage count
- status (TEXT) - 'active' or 'inactive'
- starts_at (TIMESTAMPTZ) - when coupon becomes valid
- expires_at (TIMESTAMPTZ) - when coupon expires
- created_at (TIMESTAMPTZ)
```

### Coupon Products Table (Junction)
```
- id (UUID)
- coupon_id (UUID) - references coupons(id)
- product_id (UUID) - references products(id)
- created_at (TIMESTAMPTZ)
```

## Notes

- If you don't select any products, the coupon applies to ALL products
- If you select specific products, the coupon only works for those products
- Dates are optional - leave empty for coupons that never expire
- The system automatically tracks usage and prevents over-use
