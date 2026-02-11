# Fix Production Storrik Payment - DO THIS NOW

## The Problem
Storrik works on localhost but not on Vercel production because environment variables are missing.

## The Fix (5 minutes)

### Step 1: Open Vercel Dashboard
Go to: https://vercel.com/dashboard

### Step 2: Select Your Project
Click on your `skylinecheats.org` project

### Step 3: Go to Settings → Environment Variables
Click **Settings** in the top menu, then **Environment Variables** in the left sidebar

### Step 4: Add These Two Variables

**Variable 1:**
```
Name: STORRIK_SECRET_KEY
Value: sk_live_RBm0NGaY2WY_zzd_SHFvkH3hy1L7xT-CYcU9qneavXk
Environments: ✓ Production ✓ Preview ✓ Development
```

**Variable 2:**
```
Name: STORRIK_WEBHOOK_SECRET
Value: whsec_omph1TVrBz4AbxDVnNE80gGChA9JYgbQG7IIvyeNmLU3b599555
Environments: ✓ Production ✓ Preview ✓ Development
```

### Step 5: Redeploy
Vercel will automatically redeploy after you add the variables. Wait 1-2 minutes for deployment to complete.

### Step 6: Test
1. Go to https://skylinecheats.org
2. Add a product to cart
3. Go to checkout
4. Enter your email
5. Click "Complete Secure Payment"
6. Should redirect to Storrik payment page

## That's It!
Once you add those two environment variables, everything will work exactly like it does on localhost.

## If You Need More Details
See `VERCEL_DEPLOYMENT_FIX.md` for detailed troubleshooting steps.

## What I Changed
1. Added better error logging to help debug issues
2. Added detailed error messages if something fails
3. Updated `.env.example` to include Storrik variables
4. Created deployment documentation

The code is already pushed to GitHub and will auto-deploy once you add the environment variables.
