# Fix Vercel Deployment - Storrik Not Working

## Problem
Storrik checkout works on localhost but fails on Vercel production.

## Root Cause
Missing environment variables in Vercel dashboard.

## Solution - Add These Environment Variables to Vercel

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com
2. Select your project: `skylinecheats.org`
3. Go to **Settings** → **Environment Variables**

### Step 2: Add These Variables

Add each of these variables with the exact values:

#### Required Storrik Variables
```
Variable Name: STORRIK_SECRET_KEY
Value: sk_live_RBm0NGaY2WY_zzd_SHFvkH3hy1L7xT-CYcU9qneavXk
Environment: Production, Preview, Development (select all)
```

```
Variable Name: STORRIK_WEBHOOK_SECRET
Value: whsec_omph1TVrBz4AbxDVnNE80gGChA9JYgbQG7IIvyeNmLU3b599555
Environment: Production, Preview, Development (select all)
```

#### Verify These Existing Variables Are Set
```
NEXT_PUBLIC_SITE_URL=https://skylinecheats.org
NEXT_PUBLIC_SUPABASE_URL=https://dbshpcygbhnuekcsywel.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=(your anon key)
SUPABASE_SERVICE_ROLE_KEY=(your service role key)
RESEND_API_KEY=(your resend key)
RESEND_FROM_EMAIL=Skyline <noreply@skylinecheats.org>
ADMIN_PASSWORD=(your admin password)
STORE_SESSION_SECRET=(your session secret)
DISCORD_WEBHOOK_URL=(your discord webhook)
```

### Step 3: Redeploy
After adding the variables, Vercel will automatically trigger a new deployment.

If it doesn't auto-deploy:
1. Go to **Deployments** tab
2. Click the three dots on the latest deployment
3. Click **Redeploy**

### Step 4: Test Production
1. Go to https://skylinecheats.org
2. Add a product to cart
3. Go to checkout
4. Click "Complete Secure Payment"
5. Should redirect to Storrik hosted checkout page

## What Should Happen
- User clicks "Complete Secure Payment"
- API creates checkout session at `/api/storrik/create-checkout`
- Returns `checkoutUrl` like: `https://checkout.storrik.com/pay/{session_id}`
- Browser redirects to Storrik's hosted payment page
- User completes payment on Storrik's site
- Storrik sends webhook to: `https://skylinecheats.org/api/webhooks/storrik`
- Order is marked as complete
- License key is emailed to customer

## Troubleshooting

### If Still Not Working After Adding Variables

1. **Check Vercel Logs**
   - Go to Vercel Dashboard → Deployments
   - Click on latest deployment
   - Check Function Logs for errors

2. **Check Browser Console**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for error messages when clicking payment button

3. **Verify API Response**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Click payment button
   - Look for `/api/storrik/create-checkout` request
   - Check if it returns `checkoutUrl`

### Common Issues

**Issue**: "Storrik API key not configured"
**Fix**: STORRIK_SECRET_KEY not set in Vercel

**Issue**: "Failed to create checkout session"
**Fix**: Check Vercel function logs for detailed error

**Issue**: Button just spins forever
**Fix**: Check browser console for JavaScript errors

## Webhook Configuration

Make sure your Storrik webhook is configured:
- URL: `https://skylinecheats.org/api/webhooks/storrik`
- Secret: `whsec_omph1TVrBz4AbxDVnNE80gGChA9JYgbQG7IIvyeNmLU3b599555`
- Events: `payment.succeeded`, `payment.failed`

## Contact
If issues persist after following all steps, check:
1. Vercel deployment logs
2. Browser console errors
3. Network tab for API responses
