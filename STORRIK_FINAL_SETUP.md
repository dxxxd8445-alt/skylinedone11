# ✅ Storrik Hosted Checkout - Final Setup

## What's Already Done

✅ Storrik library implemented (`lib/storrik.ts`)
✅ API route created (`/api/storrik/create-checkout`)
✅ Webhook handler created (`/api/webhooks/storrik`)
✅ Checkout page configured to use Storrik
✅ Using HOSTED checkout (not embeds) - redirects to Storrik's payment page
✅ Local environment configured with new API key

## Your New API Key

```
sk_live_RBm0NGaY2WY_zzd_SHFvkH3hy1L7xT-CYcU9qneavXk
```

## Add to Vercel (REQUIRED for production)

1. Go to https://vercel.com → Your Project → Settings → Environment Variables

2. Add or UPDATE:
   - Key: `STORRIK_SECRET_KEY`
   - Value: `sk_live_RBm0NGaY2WY_zzd_SHFvkH3hy1L7xT-CYcU9qneavXk`
   - Environments: Check ALL boxes

3. Add or UPDATE:
   - Key: `STORRIK_WEBHOOK_SECRET`
   - Value: `whsec_omph1TVrBz4AbxDVnNE80gGChA9JYgbQG7IIvyeNmLU3b599555`
   - Environments: Check ALL boxes

4. Go to Deployments → Redeploy latest

## How It Works

1. Customer clicks "Complete Secure Payment"
2. Your site calls `/api/storrik/create-checkout`
3. API creates Storrik payment intent
4. Customer is redirected to: `https://checkout.storrik.com/pay/{session_id}`
5. Customer enters card details on Storrik's hosted page
6. After payment, Storrik sends webhook to your site
7. Your site generates license key and sends email

## Webhook URL

Add this in your Storrik dashboard:
```
https://skylinecheats.org/api/webhooks/storrik
```

Subscribe to events:
- Transaction Succeeded
- Transaction Failed

## Test Locally

1. Double-click `START_DEV.bat`
2. Wait for "Ready" message
3. Open http://localhost:3000
4. Add product to cart
5. Go to checkout
6. Click "Complete Secure Payment"
7. Should redirect to Storrik checkout page

## Test Production

After adding environment variables to Vercel and redeploying:
1. Go to https://skylinecheats.org
2. Add product to cart
3. Go to checkout
4. Click "Complete Secure Payment"
5. Should redirect to Storrik checkout page
6. Complete payment with real card
7. Check order in admin dashboard

## Current Status

✅ Code is ready
✅ Local environment configured
⏳ Vercel environment variables needed
⏳ Webhook needs to be configured in Storrik dashboard

Once you add the environment variables to Vercel and redeploy, everything will work!
