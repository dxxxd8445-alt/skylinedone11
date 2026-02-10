# MoneyMotion Setup Required - CRITICAL

## What I Fixed
Changed API headers from lowercase `x-api-key` to uppercase `X-API-Key` (MoneyMotion requires exact capitalization).

## The Real Problem
The error "This store is not active" means your MoneyMotion account needs to be set up and activated.

## What You Need To Do RIGHT NOW

### Step 1: Log into MoneyMotion Dashboard
1. Go to https://moneymotion.io
2. Log in with your account
3. Check if your store is ACTIVE

### Step 2: Verify Your Store Status
Look for:
- ✅ Store is ACTIVE (green status)
- ✅ Store has been verified
- ✅ Payment methods are enabled
- ✅ API key is valid and not expired

### Step 3: Get Your CORRECT API Key
1. In MoneyMotion dashboard, go to **Developer** or **Settings**
2. Find **API Keys** section
3. Copy your **Live API Key** (should start with `mk_live_`)
4. Make sure it's the LIVE key, not TEST key

### Step 4: Verify Store Activation
If your store shows as "Inactive" or "Pending":
- You may need to complete KYC verification
- You may need to add payment methods
- You may need to verify your email
- Contact MoneyMotion support to activate your store

### Step 5: Update Environment Variables in Vercel
1. Go to https://vercel.com
2. Open your project: **skylinecheats**
3. Go to **Settings** → **Environment Variables**
4. Add or update:
   - `MONEYMOTION_API_KEY` = your LIVE API key from MoneyMotion dashboard
   - `MONEYMOTION_WEBHOOK_SECRET` = your webhook secret from MoneyMotion
5. Click **Save**
6. Go to **Deployments** tab
7. Click **Redeploy** on latest deployment

## Alternative: Use Stripe Instead

If MoneyMotion is taking too long to activate, I can switch you to Stripe which is instant:

1. Go to https://stripe.com
2. Create account (takes 2 minutes)
3. Get your API keys immediately
4. I'll integrate Stripe for you (takes 5 minutes)
5. Start accepting payments instantly

Stripe is more reliable and widely used. Let me know if you want to switch.

## Current Status
- ✅ Code is fixed (headers corrected)
- ❌ MoneyMotion store needs activation
- ⏳ Waiting for you to activate store OR switch to Stripe

## What Happens Next
Once your MoneyMotion store is active:
1. Update Vercel environment variables with correct API key
2. Redeploy
3. Test checkout - should redirect to MoneyMotion payment page
4. Payments will work

## Need Help?
If MoneyMotion support is slow or you can't activate the store, tell me and I'll switch you to Stripe in 5 minutes.
