# URGENT: Fix Stripe Webhook - Orders Stuck on Pending

## THE PROBLEM
- Orders stay "pending" after payment
- No Discord notifications
- No emails sent to customers
- Stripe webhook is NOT being triggered

## ROOT CAUSE
The Stripe webhook endpoint is not configured in your Stripe dashboard, OR the webhook secret is missing/incorrect in Vercel.

---

## IMMEDIATE FIX - DO THIS NOW

### Step 1: Check Stripe Dashboard Webhook Configuration

1. Go to: https://dashboard.stripe.com/webhooks
2. Look for a webhook with endpoint: `https://skylinecheats.org/api/webhooks/stripe`

**If webhook DOES NOT EXIST:**
- Click "Add endpoint"
- Endpoint URL: `https://skylinecheats.org/api/webhooks/stripe`
- Description: "Order completion webhook"
- Events to send:
  - ✅ `checkout.session.completed`
  - ✅ `payment_intent.payment_failed`
- Click "Add endpoint"
- Copy the "Signing secret" (starts with `whsec_`)

**If webhook EXISTS:**
- Click on the webhook
- Check if it's enabled
- Check if events are being sent
- Copy the "Signing secret" (starts with `whsec_`)

### Step 2: Add Webhook Secret to Vercel

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Look for `STRIPE_WEBHOOK_SECRET`

**If it DOES NOT EXIST or is wrong:**
- Add new variable:
  - Name: `STRIPE_WEBHOOK_SECRET`
  - Value: `whsec_xxxxxxxxxxxxx` (the signing secret from Stripe)
  - Environment: Production, Preview, Development (check all)
- Click "Save"

### Step 3: Redeploy

After adding the webhook secret:
1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete

---

## VERIFY IT'S WORKING

### Test 1: Check Webhook in Stripe
1. Go to: https://dashboard.stripe.com/webhooks
2. Click on your webhook
3. Click "Send test webhook"
4. Select event: `checkout.session.completed`
5. Click "Send test webhook"
6. Check if it shows "Success" (200 response)

### Test 2: Make a Test Purchase
1. Use Stripe test card: `4242 4242 4242 4242`
2. Any future expiry date
3. Any CVC
4. Complete purchase
5. Check admin dashboard - order should change to "completed"
6. Check Discord - should get notification
7. Check email - customer should receive email

---

## MANUAL FIX FOR STUCK ORDERS

If you have orders stuck on "pending" right now, you can manually complete them:

### Option A: Use Stripe Dashboard
1. Go to: https://dashboard.stripe.com/payments
2. Find the successful payment
3. Copy the Payment Intent ID (starts with `pi_`)
4. Copy the Checkout Session ID (starts with `cs_`)
5. Go to your Supabase dashboard
6. Run this SQL (replace the IDs):

```sql
-- Find the order by email or order number
SELECT * FROM orders WHERE customer_email = 'customer@email.com' AND status = 'pending';

-- Update the order to completed (replace ORDER_ID with the actual ID)
UPDATE orders 
SET 
  status = 'completed',
  stripe_session_id = 'cs_test_xxxxx',
  stripe_payment_intent = 'pi_xxxxx',
  updated_at = NOW()
WHERE id = 'ORDER_ID';
```

### Option B: Use the Manual Completion Script

I'll create a script for you to manually complete stuck orders.

---

## WHY THIS HAPPENED

Stripe webhooks require:
1. ✅ Webhook endpoint configured in Stripe dashboard
2. ✅ Correct webhook URL: `https://skylinecheats.org/api/webhooks/stripe`
3. ✅ Webhook secret in environment variables
4. ✅ Events selected: `checkout.session.completed`

If ANY of these are missing, webhooks won't fire and orders stay pending.

---

## AFTER FIXING

Once the webhook is properly configured:
- New orders will automatically complete
- Customers will receive emails
- Discord notifications will work
- License keys will be assigned
- Affiliate tracking will work

---

## NEED HELP?

Check Vercel logs:
1. Go to Vercel dashboard
2. Click on your project
3. Go to "Logs" tab
4. Filter by "/api/webhooks/stripe"
5. Look for errors

Check Stripe webhook logs:
1. Go to Stripe dashboard
2. Click on Webhooks
3. Click on your webhook
4. Check "Recent events" section
5. Look for failed attempts

---

**DO THESE STEPS NOW TO FIX THE ISSUE!**
