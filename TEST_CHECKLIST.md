# 🧪 COMPLETE TEST CHECKLIST

## Run these tests to verify everything works:

---

## ✅ TEST 1: Database Setup

### Steps:
1. Open Supabase SQL Editor
2. Run `FINAL_COMPLETE_DATABASE_SETUP.sql`
3. Run `DISCORD_WEBHOOK_SETUP_FINAL.sql`
4. Run `ADD_TEST_LICENSE_KEYS.sql` (optional)
5. Run `VERIFY_EVERYTHING.sql`

### Expected Results:
- ✅ 14 tables created
- ✅ Sample data loaded (4 products, 3 coupons, etc.)
- ✅ Discord webhook configured
- ✅ License keys added (if ran optional script)

---

## ✅ TEST 2: Store Front

### Steps:
1. Start dev server: `npm run dev`
2. Go to: `http://localhost:3000`
3. Browse products
4. Click "Add to Cart"
5. Go to cart
6. Click "Checkout"

### Expected Results:
- ✅ Products display correctly
- ✅ Prices show in dollars
- ✅ Cart updates
- ✅ Checkout button works
- ✅ Redirects to Stripe

---

## ✅ TEST 3: Complete Purchase

### Steps:
1. On Stripe checkout page
2. Enter test email: `test@skyline.com`
3. Enter test card: `4242 4242 4242 4242`
4. Expiry: Any future date (e.g., `12/25`)
5. CVC: Any 3 digits (e.g., `123`)
6. ZIP: Any 5 digits (e.g., `12345`)
7. Click "Pay"

### Expected Results:
- ✅ Payment processes successfully
- ✅ Redirected to success page
- ✅ Order created in database
- ✅ License key assigned
- ✅ Email sent (check inbox)
- ✅ 4 Discord webhooks sent

---

## ✅ TEST 4: Discord Webhooks

### Steps:
1. Open your Discord channel
2. Look for webhook messages

### Expected Results:
You should see 4 messages:
1. ✅ 🛒 **Customer Started Checkout** (blue)
2. ✅ ⏳ **Order Pending Payment** (light blue)
3. ✅ 💰 **Payment Completed** (blue)
4. ✅ 🎉 **New Order Completed** (blue)

Each message should show:
- Customer email
- Order number
- Product name
- Amount
- Timestamp

---

## ✅ TEST 5: Email Delivery

### Steps:
1. Check email inbox for `test@skyline.com`
2. Look for email from `Skyline <noreply@skylinecheats.org>`

### Expected Results:
- ✅ Email received
- ✅ Subject: "🔥 Your Skyline License Keys - Order #..."
- ✅ Blue gradient header
- ✅ Order details shown
- ✅ License key displayed
- ✅ Professional formatting

---

## ✅ TEST 6: Customer Dashboard

### Steps:
1. Go to: `http://localhost:3000/account`
2. Login with: `test@skyline.com`
3. Check "Orders" tab
4. Check "Delivered" tab

### Expected Results:
- ✅ Dashboard shows stats
- ✅ Order appears in Orders tab
- ✅ Order number matches
- ✅ Status shows "Completed"
- ✅ Amount is correct
- ✅ License key appears in Delivered tab
- ✅ Copy button works

---

## ✅ TEST 7: Admin Panel

### Steps:
1. Go to: `http://localhost:3000/mgmt-x9k2m7/login`
2. Enter password: `Sk7yL!n3_Adm1n_2026_X9k2M7pQ`
3. Click "Sign In"
4. Check Dashboard
5. Check Orders tab
6. Check License Keys tab

### Expected Results:
- ✅ Login successful
- ✅ Dashboard shows revenue
- ✅ Revenue matches order amount
- ✅ Order count is correct
- ✅ License count is correct
- ✅ Order appears in Orders tab
- ✅ License shows as "active" in License Keys tab
- ✅ License is linked to order

---

## ✅ TEST 8: Coupon System

### Steps:
1. Go to store
2. Add product to cart
3. Enter coupon code: `WELCOME10`
4. Click "Apply"
5. Proceed to checkout

### Expected Results:
- ✅ Coupon validates successfully
- ✅ 10% discount applied
- ✅ Total price reduced
- ✅ Discount shown in cart
- ✅ Discount tracked in order

---

## ✅ TEST 9: Product Management

### Steps:
1. Go to admin panel
2. Click "Products" tab
3. View products
4. Click "Add Product"
5. Fill in details
6. Save

### Expected Results:
- ✅ All products listed
- ✅ Can add new product
- ✅ Can edit product
- ✅ Can delete product
- ✅ Variants display correctly

---

## ✅ TEST 10: License Key Management

### Steps:
1. Go to admin panel
2. Click "License Keys" tab
3. Click "Add License Key"
4. Fill in details
5. Save

### Expected Results:
- ✅ All licenses listed
- ✅ Can add new license
- ✅ Can filter by status
- ✅ Can filter by product
- ✅ Can revoke license
- ✅ Assignment history visible

---

## 🎯 QUICK TEST SCRIPT

Run this complete test in 5 minutes:

```bash
# 1. Start server
npm run dev

# 2. Open browser
# Go to: http://localhost:3000

# 3. Make purchase
# - Add Fortnite Aimbot (1 Day) to cart
# - Use coupon: WELCOME10
# - Checkout with test card: 4242 4242 4242 4242
# - Email: test@skyline.com

# 4. Check Discord
# - Should see 4 webhook messages

# 5. Check Email
# - Should receive license key email

# 6. Check Customer Dashboard
# - Go to: http://localhost:3000/account
# - Login with test@skyline.com
# - Verify order and license appear

# 7. Check Admin Panel
# - Go to: http://localhost:3000/mgmt-x9k2m7/login
# - Password: Sk7yL!n3_Adm1n_2026_X9k2M7pQ
# - Verify revenue, order, and license
```

---

## ✅ ALL TESTS PASSED?

If all tests pass, your system is **100% operational**! 🎉

You're ready to:
- ✅ Stock real license keys
- ✅ Add more products
- ✅ Configure production environment
- ✅ Start selling!

---

## 🆘 If Something Doesn't Work

1. **Check server console** for error messages
2. **Check Supabase logs** for database errors
3. **Check Discord webhook URL** is correct
4. **Check Resend API key** is valid
5. **Check Stripe keys** are correct
6. **Verify environment variables** are set

---

## 📞 Quick Fixes

### Discord webhooks not appearing?
```sql
-- Verify webhook is active
SELECT * FROM webhooks WHERE is_active = true;
```

### License keys not assigning?
```sql
-- Check available licenses
SELECT COUNT(*) FROM licenses WHERE status = 'unused';

-- Add more licenses
-- Run: ADD_TEST_LICENSE_KEYS.sql
```

### Email not sending?
- Check Resend API key in `.env.local`
- Verify domain in Resend dashboard
- Check spam folder

### Revenue not showing?
```sql
-- Check orders
SELECT COUNT(*), SUM(amount_cents) FROM orders WHERE status = 'completed';
```

---

## 🎉 SYSTEM READY!

Everything is working perfectly! Start selling! 🚀
