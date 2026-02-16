# 🚨 URGENT: Complete Webhook Fix Checklist

## Current Situation
- ❌ Orders stuck on "pending" after successful payment
- ❌ No Discord notifications
- ❌ No customer emails
- ❌ Stripe webhook not firing

---

## ROOT CAUSE
The Stripe webhook is not configured or the webhook secret is missing from Vercel environment variables.

---

## FIX IT NOW - STEP BY STEP

### ✅ STEP 1: Configure Stripe Webhook (5 minutes)

1. **Go to Stripe Dashboard**
   - URL: https://dashboard.stripe.com/webhooks
   - Login to your Stripe account

2. **Check if webhook exists**
   - Look for endpoint: `https://ring-0cheats.org/api/webhooks/stripe`
   
3. **If webhook DOES NOT exist:**
   - Click "Add endpoint" button
   - Enter endpoint URL: `https://ring-0cheats.org/api/webhooks/stripe`
   - Description: "Order completion and payment tracking"
   - Click "Select events"
   - Search and select these events:
     - ✅ `checkout.session.completed`
     - ✅ `payment_intent.payment_failed`
   - Click "Add events"
   - Click "Add endpoint"

4. **Copy the Signing Secret**
   - After creating (or clicking on existing webhook)
   - Find "Signing secret" section
   - Click "Reveal" or "Copy"
   - It starts with `whsec_`
   - **SAVE THIS - YOU NEED IT FOR STEP 2**

---

### ✅ STEP 2: Add Webhook Secret to Vercel (3 minutes)

1. **Go to Vercel Dashboard**
   - URL: https://vercel.com/dashboard
   - Select your Ring-0 project

2. **Go to Environment Variables**
   - Click "Settings" tab
   - Click "Environment Variables" in sidebar

3. **Check for STRIPE_WEBHOOK_SECRET**
   - Search for `STRIPE_WEBHOOK_SECRET`
   
4. **If it doesn't exist OR is wrong:**
   - Click "Add New" button
   - Name: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_xxxxxxxxxxxxx` (paste the signing secret from Step 1)
   - Environments: Check ALL boxes (Production, Preview, Development)
   - Click "Save"

5. **Also verify these exist:**
   - `STRIPE_SECRET_KEY` (starts with `sk_live_` or `sk_test_`)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (starts with `pk_live_` or `pk_test_`)
   - `RESEND_API_KEY` (starts with `re_`)
   - `RESEND_FROM_EMAIL` (your email address)

---

### ✅ STEP 3: Redeploy (2 minutes)

1. **In Vercel Dashboard**
   - Go to "Deployments" tab
   - Find the latest deployment
   - Click the "..." menu (three dots)
   - Click "Redeploy"
   - Wait for deployment to complete (usually 1-2 minutes)

---

### ✅ STEP 4: Test the Webhook (2 minutes)

1. **Go back to Stripe Dashboard**
   - URL: https://dashboard.stripe.com/webhooks
   - Click on your webhook

2. **Send test webhook**
   - Click "Send test webhook" button
   - Select event type: `checkout.session.completed`
   - Click "Send test webhook"
   - Should show "200 OK" response

3. **If you see error:**
   - Check Vercel logs (Vercel Dashboard → Logs)
   - Check if `STRIPE_WEBHOOK_SECRET` is set correctly
   - Make sure you redeployed after adding the secret

---

### ✅ STEP 5: Complete Stuck Orders (5 minutes)

**For the order that's currently stuck:**

1. **Find the order in Stripe**
   - Go to: https://dashboard.stripe.com/payments
   - Search by customer email
   - Find the successful payment
   - Note: Payment Intent ID (starts with `pi_`)
   - Note: Checkout Session ID (starts with `cs_`)

2. **Go to Supabase**
   - URL: https://supabase.com/dashboard
   - Select your project
   - Go to SQL Editor

3. **Run this query to find the order:**
   ```sql
   SELECT id, order_number, customer_email, product_name, status, amount_cents
   FROM orders 
   WHERE status = 'pending'
   ORDER BY created_at DESC;
   ```

4. **Copy the order ID from the result**

5. **Open the file: `COMPLETE_STUCK_ORDER.sql`**
   - Replace `'ORDER_ID_HERE'` with the actual order ID
   - Run the script in Supabase SQL Editor
   - This will:
     - Assign a license key
     - Mark order as completed
     - Show you the license key to send to customer

6. **Manually email the customer:**
   - Email: (from the query result)
   - Subject: "Your Ring-0 License Key - Order [ORDER_NUMBER]"
   - Body: Include the license key from the SQL output
   - Include Discord link: https://discord.gg/ring-0

---

### ✅ STEP 6: Verify Everything Works (3 minutes)

**Test with a new purchase:**

1. **Make a test purchase**
   - Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)

2. **Check these things:**
   - ✅ Order in admin dashboard shows "completed" (not "pending")
   - ✅ Discord notification received
   - ✅ Customer receives email with license key
   - ✅ License key appears in customer account

3. **If any fail:**
   - Check Vercel logs for errors
   - Check Stripe webhook logs for delivery issues
   - Verify all environment variables are set

---

## VERIFICATION CHECKLIST

After completing all steps, verify:

- [ ] Stripe webhook exists at `https://ring-0cheats.org/api/webhooks/stripe`
- [ ] Webhook has events: `checkout.session.completed`, `payment_intent.payment_failed`
- [ ] Webhook signing secret copied
- [ ] `STRIPE_WEBHOOK_SECRET` added to Vercel
- [ ] `RESEND_API_KEY` exists in Vercel
- [ ] `RESEND_FROM_EMAIL` exists in Vercel
- [ ] Vercel redeployed after adding secrets
- [ ] Test webhook shows 200 OK in Stripe
- [ ] Stuck orders manually completed
- [ ] Customers emailed their license keys
- [ ] New test purchase completes automatically
- [ ] Discord notification works
- [ ] Email delivery works

---

## COMMON ISSUES & SOLUTIONS

### Issue: Webhook shows 401 Unauthorized
**Solution:** Webhook secret is wrong. Copy the correct secret from Stripe and update in Vercel.

### Issue: Webhook shows 500 Error
**Solution:** Check Vercel logs for the actual error. Usually database connection or missing environment variable.

### Issue: Webhook delivers but order stays pending
**Solution:** Check Vercel logs. Likely a database error or the order ID is not in metadata.

### Issue: Email not sending
**Solution:** 
- Verify `RESEND_API_KEY` is set in Vercel
- Verify `RESEND_FROM_EMAIL` is set in Vercel
- Check Resend dashboard for delivery logs

### Issue: Discord notification not sending
**Solution:**
- Check if Discord webhook URL is configured in database
- Go to admin dashboard → Webhooks
- Add Discord webhook URL

---

## MONITORING

**After fixing, monitor these:**

1. **Stripe Webhook Logs**
   - https://dashboard.stripe.com/webhooks
   - Check "Recent events" section
   - Should show successful deliveries

2. **Vercel Logs**
   - https://vercel.com/dashboard → Logs
   - Filter by `/api/webhooks/stripe`
   - Should show successful processing

3. **Supabase Logs**
   - Check for any database errors
   - Verify orders are being updated

---

## NEED HELP?

If you're still having issues after following all steps:

1. Check Vercel logs for specific error messages
2. Check Stripe webhook logs for delivery failures
3. Verify all environment variables are spelled correctly
4. Make sure you redeployed after adding variables
5. Try deleting and recreating the webhook in Stripe

---

**STATUS: Follow these steps NOW to fix the issue!**

**Time Required: ~20 minutes total**
