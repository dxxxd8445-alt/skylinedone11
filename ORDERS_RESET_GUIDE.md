# Orders Reset & Management Guide

## ✅ What's Been Added

### 1. **Mark All as Completed Button**
A new blue button at the top of the Orders page that allows you to:
- Mark ALL pending/failed orders as completed in one click
- Automatically creates license keys for orders that don't have them
- Shows confirmation dialog before executing
- Displays count of orders updated

**Location**: Orders page (`/mgmt-x9k2m7/orders`) - Top left, next to filters

### 2. **Reset Orders SQL Script**
A SQL script to completely reset your orders database to 0.

**File**: `reset-orders.sql`

---

## 🔄 How to Reset Orders to 0

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project: `dbshpcygbhnuekcsywel`
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"

### Step 2: Run the Reset Script
Copy and paste this SQL:

```sql
-- RESET ALL ORDERS - USE WITH CAUTION!
DELETE FROM orders;

-- Reset license assignments
UPDATE licenses 
SET 
  status = 'unused',
  customer_email = NULL,
  order_id = NULL,
  assigned_at = NULL
WHERE status IN ('active', 'pending');

-- Delete all Stripe sessions
DELETE FROM stripe_sessions;

-- Reset coupon usage counts
UPDATE coupons SET current_uses = 0;

-- Verify everything is reset
SELECT 
  'Orders' as table_name, 
  COUNT(*) as count 
FROM orders
UNION ALL
SELECT 
  'Active Licenses' as table_name, 
  COUNT(*) as count 
FROM licenses 
WHERE status = 'active'
UNION ALL
SELECT 
  'Stripe Sessions' as table_name, 
  COUNT(*) as count 
FROM stripe_sessions;
```

### Step 3: Verify Reset
After running the script, you should see:
- Orders: 0
- Active Licenses: 0
- Stripe Sessions: 0

### Step 4: Refresh Admin Dashboard
1. Go to your admin panel: http://localhost:3000/mgmt-x9k2m7
2. Click "Refresh" or reload the page
3. You should see:
   - Total Orders: 0
   - Revenue: $0.00
   - Avg Order: $0.00
   - Completed: 0

---

## 🎯 How to Use "Mark All as Completed"

### When to Use
- You have pending orders that need to be marked as completed
- You want to bulk process failed orders
- Testing order completion flow

### How to Use
1. Go to Orders page: `/mgmt-x9k2m7/orders`
2. Click the blue **"Mark All Completed"** button at the top
3. Confirm the action in the dialog
4. Wait for success message showing how many orders were updated
5. Orders will automatically refresh

### What It Does
- Changes status of ALL pending/failed orders to "completed"
- Creates license keys for orders that don't have them
- Does NOT affect already completed or refunded orders
- Triggers Discord webhooks for each completed order (if configured)

---

## 📊 Order Status Flow

### Status Types
1. **Pending** - Order created, awaiting payment
2. **Completed** - Payment successful, license issued
3. **Failed** - Payment failed or expired
4. **Refunded** - Order refunded, license revoked

### How Orders Get Created
1. **Customer Checkout**: Customer clicks checkout → Creates pending order
2. **Payment Success**: Stripe webhook → Updates to completed + assigns license
3. **Payment Failure**: Stripe webhook → Updates to failed

### Where Orders Show Up
- **Admin Dashboard** (`/mgmt-x9k2m7`): Shows total count and revenue
- **Orders Page** (`/mgmt-x9k2m7/orders`): Full list with filters
- **Customer Dashboard** (`/account`): Customer sees their orders and licenses

---

## 🧪 Testing Order Flow

### Test a Complete Order Flow
1. **Reset orders** (run SQL script above)
2. **Verify 0 orders** in admin dashboard
3. **Place test order**:
   - Go to store: http://localhost:3000
   - Add product to cart
   - Checkout with test card: `4242 4242 4242 4242`
   - Any future expiry date, any CVC
4. **Check Discord** for 3 notifications:
   - 🛒 Checkout Started
   - ⏳ Order Pending
   - 🎉 Order Completed
5. **Verify in admin**:
   - Orders page shows 1 completed order
   - Dashboard shows revenue
   - License key is assigned
6. **Check customer dashboard**:
   - Go to `/account`
   - Login with customer email
   - Should see order and license key

---

## 🔍 Troubleshooting

### Orders Not Showing as Completed
**Problem**: Orders stuck in "pending" status

**Solutions**:
1. Check Stripe webhook is configured correctly
2. Manually mark as completed using the button in order details
3. Use "Mark All as Completed" button to bulk update

### Revenue Shows Wrong Amount
**Problem**: Dashboard revenue doesn't match orders

**Solution**: Revenue only counts "completed" orders. Check order statuses.

### License Keys Not Generated
**Problem**: Completed order has no license key

**Solutions**:
1. Check if licenses are stocked in License Keys page
2. Use "Mark All as Completed" to regenerate licenses
3. Manually update order status to trigger license creation

### Discord Webhooks Not Sending
**Problem**: No Discord notifications for orders

**Solution**: 
1. Run the webhook setup SQL (see `DISCORD_WEBHOOKS_SETUP.md`)
2. Verify webhook URL in database
3. Check server console for webhook errors

---

## ⚠️ Important Notes

### Before Going Live
- [ ] Reset all test orders using the SQL script
- [ ] Verify dashboard shows 0 orders
- [ ] Test one complete order flow
- [ ] Verify Discord webhooks work
- [ ] Check customer can see order in their dashboard
- [ ] Verify license keys are being assigned

### Data Safety
- The reset script **permanently deletes** all orders
- Make sure you're in the correct database
- Consider backing up data before resetting
- Test orders cannot be recovered after deletion

### Production Use
- Only reset orders in development/testing
- Never reset orders in production with real customer data
- Use "Mark All as Completed" carefully - it affects ALL pending orders
- Always confirm before bulk operations

---

## 📝 Quick Reference

### Admin Pages
- **Dashboard**: `/mgmt-x9k2m7` - Overview stats
- **Orders**: `/mgmt-x9k2m7/orders` - Full order management
- **License Keys**: `/mgmt-x9k2m7/license-keys` - Manage license pool

### Order Filters
- **Completed**: Shows only completed orders (default)
- **All**: Shows all orders regardless of status
- **Pending**: Shows orders awaiting payment
- **Failed**: Shows failed payment orders
- **Refunded**: Shows refunded orders

### Date Filters
- **Today**: Orders from today only
- **Yesterday**: Orders from yesterday
- **Last 7 Days**: Orders from past week
- **Last 30 Days**: Orders from past month
- **This Month**: Orders from current month
- **Last Month**: Orders from previous month
- **All Time**: All orders (default)

---

## ✅ You're Ready!

Your order management system is fully set up with:
- ✅ Reset functionality to start fresh
- ✅ Bulk "Mark All Completed" button
- ✅ Order status tracking
- ✅ License key assignment
- ✅ Discord webhook notifications
- ✅ Customer order dashboard
- ✅ Revenue tracking

Reset your orders, test the flow, and you're ready to launch! 🚀
