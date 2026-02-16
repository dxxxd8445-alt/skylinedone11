# 🧪 QUICK TEST GUIDE - Ring-0

## 🚀 STEP-BY-STEP TESTING

### 1️⃣ DATABASE SETUP (5 minutes)

1. **Open Supabase SQL Editor**
   - Go to your Supabase project
   - Click "SQL Editor" in sidebar

2. **Run Main Database Script**
   ```sql
   -- Copy and paste entire contents of:
   COMPLETE_DATABASE_WITH_AFFILIATE.sql
   ```
   - Click "Run"
   - Wait for completion (should see "Success")

3. **Run Discord Webhook Setup (Optional)**
   ```sql
   -- Copy and paste entire contents of:
   DISCORD_WEBHOOK_SETUP_FINAL.sql
   ```

4. **Add Test License Keys (Optional)**
   ```sql
   -- Copy and paste entire contents of:
   ADD_TEST_LICENSE_KEYS.sql
   ```

5. **Verify Tables Created**
   - Click "Table Editor" in sidebar
   - Should see 18 tables:
     - categories
     - products
     - product_variants
     - orders
     - licenses
     - coupons
     - reviews
     - team_members
     - webhooks
     - settings
     - admin_audit_logs
     - stripe_sessions
     - store_users
     - announcements
     - affiliates
     - affiliate_referrals
     - affiliate_payouts
     - affiliate_clicks

---

### 2️⃣ TEST PURCHASE FLOW (10 minutes)

#### A. Start Checkout
1. Go to `http://localhost:3000`
2. Click on any product
3. Select duration (1 Day, 7 Days, etc.)
4. Click "Buy Now"
5. Enter email address
6. Click "Proceed to Checkout"

**✅ Expected Results:**
- Redirects to Stripe checkout page
- Discord webhook appears: "Customer Started Checkout" (Light Blue)
- Discord webhook appears: "Order Pending Payment" (Light Blue)

#### B. Complete Payment
1. Use Stripe test card: `4242 4242 4242 4242`
2. Expiry: Any future date (e.g., 12/34)
3. CVC: Any 3 digits (e.g., 123)
4. ZIP: Any 5 digits (e.g., 12345)
5. Click "Pay"

**✅ Expected Results:**
- Redirects to success page
- Discord webhook appears: "Payment Completed" (Blue)
- Discord webhook appears: "New Order Completed!" (Blue)
- Email received with license key
- Order appears in admin dashboard
- License key assigned

#### C. Verify Customer Dashboard
1. Go to `http://localhost:3000/account`
2. Sign in with purchase email
3. Check "Orders" tab
4. Check "Delivered" tab

**✅ Expected Results:**
- Order shows in Orders tab with "Completed" status
- License key shows in Delivered tab
- Can copy license key with button

---

### 3️⃣ TEST ADMIN PANEL (5 minutes)

1. **Login to Admin**
   - Go to `http://localhost:3000/mgmt-x9k2m7/login`
   - Username: `admin`
   - Password: `Sk7yL!n3_Adm1n_2026_X9k2M7pQ`

2. **Check Dashboard**
   - Verify revenue shows correctly
   - Check order count
   - Check license count
   - View recent activity

3. **Test Date Filters**
   - Click date range dropdown
   - Try "Today", "Last 7 Days", "Last 30 Days"
   - Verify stats update

**✅ Expected Results:**
- Revenue matches order total
- Order count correct
- Recent activity shows latest order
- Date filters work

---

### 4️⃣ TEST AFFILIATE SYSTEM (10 minutes)

#### A. Create Customer Account
1. Go to `http://localhost:3000/account`
2. Click "Sign Up"
3. Enter email and password
4. Verify email (check inbox)

#### B. Register as Affiliate
1. Go to `http://localhost:3000/account`
2. Click "Affiliate" tab
3. Select payment method (PayPal/Cash App/Crypto)
4. Enter payment details
5. Click "Join Affiliate Program"

**✅ Expected Results:**
- Affiliate account created
- Unique affiliate code generated
- Affiliate link displayed
- Can copy affiliate link

#### C. Test Affiliate Referral
1. Copy affiliate link (e.g., `https://ring-0cheats.org?ref=ABC123`)
2. Open in incognito/private window
3. Complete a purchase using that link
4. Go back to affiliate dashboard
5. Click refresh icon

**✅ Expected Results:**
- Click tracked in affiliate_clicks table
- Referral tracked in affiliate_referrals table
- Commission calculated (5% of order)
- Stats updated in dashboard

---

### 5️⃣ TEST EMAIL DELIVERY (5 minutes)

#### A. License Delivery Email
1. Complete a purchase
2. Check email inbox
3. Open "Your Ring-0 License Key" email

**✅ Expected Results:**
- Email has blue Ring-0 branding
- Shows order number
- Shows product name
- Shows license key
- Has download button

#### B. Password Reset Email
1. Go to `http://localhost:3000/account`
2. Click "Forgot Password?"
3. Enter email
4. Check inbox

**✅ Expected Results:**
- Email has blue Ring-0 branding
- Has "Reset Your Ring-0 Password" title
- Reset link works

---

### 6️⃣ TEST DISCORD WEBHOOKS (5 minutes)

1. **Check Discord Channel**
   - Open Discord server
   - Go to webhook channel

2. **Verify Webhook Messages**
   - Should see embeds for:
     - ✅ Checkout Started (Light Blue)
     - ✅ Order Pending (Light Blue)
     - ✅ Payment Completed (Blue)
     - ✅ Order Completed (Blue)

3. **Check Embed Details**
   - Customer email shown
   - Order amount shown
   - Product details shown
   - Timestamps correct

**✅ Expected Results:**
- All webhooks appear
- Color-coded correctly
- All details accurate
- Professional formatting

---

## 🐛 TROUBLESHOOTING

### Issue: No Discord Webhooks
**Solution:**
1. Check webhook URL in database:
   ```sql
   SELECT * FROM webhooks;
   ```
2. Verify webhook is active (`is_active = true`)
3. Check Discord webhook URL is correct
4. Run `DISCORD_WEBHOOK_SETUP_FINAL.sql` again

### Issue: No Email Received
**Solution:**
1. Check Resend API key in `.env.local`
2. Verify domain in Resend dashboard
3. Check spam folder
4. Check Resend logs for errors

### Issue: License Not Assigned
**Solution:**
1. Check licenses table has unused keys:
   ```sql
   SELECT * FROM licenses WHERE status = 'unused';
   ```
2. Run `ADD_TEST_LICENSE_KEYS.sql` to add test keys
3. Check order has correct product_id

### Issue: Revenue Not Showing
**Solution:**
1. Check orders table:
   ```sql
   SELECT * FROM orders WHERE status = 'completed';
   ```
2. Verify `amount_cents` field has value
3. Check date range filter in admin panel

### Issue: Affiliate Not Working
**Solution:**
1. Check store_users table has user:
   ```sql
   SELECT * FROM store_users WHERE email = 'your@email.com';
   ```
2. Verify affiliates table:
   ```sql
   SELECT * FROM affiliates;
   ```
3. Check affiliate_clicks table for tracking

---

## ✅ VERIFICATION CHECKLIST

### Database
- [ ] All 18 tables created
- [ ] Sample data loaded
- [ ] Indexes created
- [ ] RLS policies enabled

### Purchase Flow
- [ ] Checkout creates pending order
- [ ] Payment completes order
- [ ] License key assigned
- [ ] Email sent
- [ ] Discord webhooks sent

### Customer Dashboard
- [ ] Can create account
- [ ] Orders show correctly
- [ ] License keys show correctly
- [ ] Can copy license keys

### Affiliate System
- [ ] Can register as affiliate
- [ ] Affiliate code generated
- [ ] Clicks tracked
- [ ] Referrals tracked
- [ ] Commission calculated

### Admin Panel
- [ ] Can login
- [ ] Revenue shows correctly
- [ ] Orders counted correctly
- [ ] Date filters work
- [ ] Recent activity shows

### Emails
- [ ] License delivery email sent
- [ ] Blue Ring-0 branding
- [ ] License keys included
- [ ] Password reset works

### Discord
- [ ] Checkout webhooks sent
- [ ] Payment webhooks sent
- [ ] Order webhooks sent
- [ ] Embeds formatted correctly

---

## 🎯 QUICK STATUS CHECK

Run this SQL to check system status:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check orders
SELECT COUNT(*) as total_orders, 
       SUM(amount_cents)/100 as total_revenue 
FROM orders 
WHERE status = 'completed';

-- Check licenses
SELECT COUNT(*) as total_licenses,
       COUNT(CASE WHEN status = 'unused' THEN 1 END) as available,
       COUNT(CASE WHEN status = 'active' THEN 1 END) as assigned
FROM licenses;

-- Check affiliates
SELECT COUNT(*) as total_affiliates,
       SUM(total_earnings) as total_earnings
FROM affiliates;

-- Check webhooks
SELECT name, is_active, events 
FROM webhooks;
```

---

## 🚀 READY FOR PRODUCTION?

Before deploying to production:

1. ✅ All tests passed
2. ✅ Verify domain in Resend
3. ✅ Configure Stripe webhook
4. ✅ Add real license keys
5. ✅ Update environment variables
6. ✅ Test on staging environment
7. ✅ Monitor error logs

---

**Testing Time:** ~40 minutes total
**Difficulty:** Easy
**Status:** Ready to test!
