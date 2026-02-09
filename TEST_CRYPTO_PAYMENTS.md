# 🧪 Crypto Payment System Test Guide

## Prerequisites
1. ✅ Run the SQL script: `ADD_CRYPTO_PAYMENT_COLUMNS.sql` in Supabase
2. ✅ Make sure Discord webhook is configured
3. ✅ Site is running on localhost or production

## Test 1: Checkout Webhook (Cart Page)
**What it tests:** Discord webhook fires when user clicks checkout

### Steps:
1. Add any product to cart
2. Go to `/cart`
3. Click "Proceed to Purchase" or "Continue as Guest"
4. **Expected:** Discord webhook sent with "Checkout Started" message
5. **Check:** Discord channel for webhook notification

### What to look for in Discord:
- 🛒 **Checkout Started** embed
- Customer email
- Cart items listed
- Total amount

---

## Test 2: Crypto Order Creation (Litecoin)
**What it tests:** Litecoin orders are created with pending status

### Steps:
1. Complete Test 1 to get to checkout/confirm page
2. Enter email and click "Apply" (if guest)
3. Click "Complete Secure Payment"
4. Select **Litecoin**
5. Slide to confirm (slide to 85%)
6. **Expected:** "Order Pending" screen appears
7. Note the Order ID (format: PRI-XXXXXXX)

### Verify in Admin:
1. Go to `/mgmt-x9k2m7/orders`
2. **Expected:** Order appears with:
   - Status: **pending** (yellow badge)
   - Payment Method: **litecoin**
   - Customer email
   - Correct amount
3. Click "All" filter - order should be visible
4. Click "Pending" filter - order should be visible

---

## Test 3: Crypto Order Creation (Bitcoin)
**What it tests:** Bitcoin orders are created with pending status

### Steps:
1. Add product to cart again
2. Go through checkout
3. Select **Bitcoin** instead of Litecoin
4. Slide to confirm
5. **Expected:** "Order Pending" screen appears

### Verify in Admin:
1. Go to `/mgmt-x9k2m7/orders`
2. **Expected:** Order appears with:
   - Status: **pending**
   - Payment Method: **bitcoin**

---

## Test 4: Manual Order Completion
**What it tests:** Admin can manually mark crypto orders as completed

### Steps:
1. Go to `/mgmt-x9k2m7/orders`
2. Click "Pending" filter
3. Find your test crypto order
4. Click the green checkmark button (Complete)
5. **Expected:** 
   - Status changes to **completed** (green badge)
   - License key is generated
   - Discord webhook sent with "Order Completed" message

### Verify:
1. Click on the order to view details
2. **Expected:** License key is displayed
3. Check Discord for "Order Completed" webhook

---

## Test 5: Order Filtering
**What it tests:** All filter options work correctly

### Steps:
1. Go to `/mgmt-x9k2m7/orders`
2. Try each filter:
   - **All** - shows all orders
   - **Pending** - shows only pending orders
   - **Completed** - shows only completed orders
   - **Paid** - shows paid orders
   - **Failed** - shows failed orders
   - **Refunded** - shows refunded orders

### Expected:
- Each filter shows correct orders
- Pending crypto orders visible in "All" and "Pending"
- Completed crypto orders visible in "All" and "Completed"

---

## Common Issues & Solutions

### Issue: Orders not showing in admin
**Solution:**
1. Check if SQL script was run successfully
2. Verify columns exist: `crypto_amount`, `crypto_address`
3. Check browser console for errors
4. Refresh the orders page

### Issue: Checkout webhook not firing
**Solution:**
1. Check Discord webhook URL in database
2. Verify webhook is enabled
3. Check browser console for API errors
4. Test webhook manually with test script

### Issue: Order created but status is not "pending"
**Solution:**
1. Check API route: `/api/crypto-order/route.ts`
2. Verify status is set to "pending" in insert query
3. Check Supabase logs for errors

### Issue: License not generated when marking complete
**Solution:**
1. Check admin-orders.ts `updateOrderStatus` function
2. Verify license generation logic
3. Check Supabase logs

---

## Database Verification

### Check if columns exist:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('crypto_amount', 'crypto_address');
```

### Check pending crypto orders:
```sql
SELECT order_number, customer_email, payment_method, status, crypto_amount, crypto_address, created_at
FROM orders
WHERE payment_method IN ('litecoin', 'bitcoin')
ORDER BY created_at DESC
LIMIT 10;
```

### Check payment method constraint:
```sql
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'orders_payment_method_check';
```

---

## Success Criteria

✅ **All tests pass if:**
1. Checkout webhook fires when clicking checkout
2. Crypto orders are created with "pending" status
3. Orders appear in admin dashboard
4. "Pending" filter shows crypto orders
5. Admin can manually mark orders as completed
6. License keys are generated on completion
7. Discord webhooks fire for all events

---

## Support

If any test fails:
1. Check browser console for errors
2. Check Supabase logs
3. Verify SQL script ran successfully
4. Check Discord webhook configuration
5. Review API route logs
