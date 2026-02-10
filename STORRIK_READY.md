# ✅ Storrik Payment Integration Complete!

## What's Done

✅ Storrik API integration implemented
✅ Checkout page updated to use Storrik
✅ Webhook handler created for payment notifications
✅ Code pushed to GitHub
✅ Vercel is deploying now

## Your Webhook URL

```
https://skylinecheats.org/api/webhooks/storrik
```

## What You Need To Do RIGHT NOW

### 1. Create Webhook in Storrik Dashboard

Go to your Storrik dashboard and create a webhook with this URL:
```
https://skylinecheats.org/api/webhooks/storrik
```

Subscribe to these events:
- `payment.succeeded` (or `checkout.completed`)
- `payment.failed`

After creating it, Storrik will give you a **Webhook Secret** (starts with `whsec_`)

### 2. Add Environment Variables to Vercel

Go to: https://vercel.com → Your Project → Settings → Environment Variables

Add these TWO variables:

**Variable 1:**
- Key: `STORRIK_SECRET_KEY`
- Value: `sk_live_cvOn7sNpgwSCoE2J7akuPx-7akVBDS-FiYGL8L-eon4`
- Environments: Check ALL boxes

**Variable 2:**
- Key: `STORRIK_WEBHOOK_SECRET`
- Value: `whsec_YOUR_SECRET_FROM_STEP_1`
- Environments: Check ALL boxes

### 3. Redeploy

After adding the variables:
1. Go to Deployments tab
2. Click Redeploy on latest deployment
3. Wait 2-3 minutes

### 4. Test

1. Go to https://skylinecheats.org
2. Add product to cart
3. Go to checkout
4. Click "Complete Secure Payment"
5. Should redirect to Storrik checkout page (looks like your screenshots)
6. Complete payment
7. Order should be fulfilled automatically

## How It Works

1. Customer clicks "Complete Secure Payment"
2. Your site creates order in database (status: pending)
3. Your site calls Storrik API to create checkout session
4. Customer is redirected to Storrik's hosted checkout page
5. Customer enters card details and pays
6. Storrik processes payment
7. Storrik sends webhook to your site
8. Your site:
   - Generates license key
   - Updates order to "completed"
   - Sends email with license key
   - Sends Discord notification
9. Customer gets redirected to success page

## The Checkout Page

When customers click pay, they'll see Storrik's checkout page with:
- Order summary on left side
- Payment form on right side
- Card number, expiry, CVC fields
- Country selector
- "Pay $X.XX" button
- Clean dark theme

Exactly like the screenshots you showed me!

## Need Help?

If something doesn't work:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Make sure webhook URL is correct in Storrik dashboard
4. Make sure environment variables are set in Vercel
5. Make sure you redeployed after adding variables

## Summary

You're 2 steps away from accepting payments:
1. Create webhook in Storrik dashboard → Get webhook secret
2. Add both secrets to Vercel → Redeploy

That's it! Then test and you're live! 🚀
