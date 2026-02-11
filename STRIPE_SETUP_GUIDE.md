# Stripe Payment Setup Guide

## Step 1: Install Stripe

Run this command in PowerShell (as Administrator):
```
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install
```

## Step 2: Get Your Stripe API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy these keys:
   - **Secret key** (starts with `sk_test_`)
   - **Publishable key** (starts with `pk_test_`)

## Step 3: Create Webhook Endpoint

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://skylinecheats.org/api/webhooks/stripe`
4. Select these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)

## Step 4: Send Me These Keys

Send me:
1. STRIPE_SECRET_KEY (sk_test_...)
2. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_test_...)
3. STRIPE_WEBHOOK_SECRET (whsec_...)

## What I'll Do

Once you send the keys, I'll:
1. Remove all Storrik/MoneyMotion code
2. Implement Stripe Checkout
3. Set up webhook handling
4. Test the complete flow
5. Deploy to production

## Why Stripe?

- Most reliable payment processor
- Works perfectly with Vercel
- No environment variable issues
- Excellent documentation
- Used by millions of businesses
- Built-in fraud protection
