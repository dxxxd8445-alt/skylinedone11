# Fix MoneyMotion 401 Error - URGENT

## Problem
Getting "Invalid x-api-key header, no api key found" error when trying to checkout.

## Root Cause
Environment variables in `.env.local` are only for local development. Vercel production doesn't have access to them.

## Solution - Add Environment Variables to Vercel

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com
2. Click on your project: **ring-0cheats**
3. Click **Settings** tab
4. Click **Environment Variables** in the left sidebar

### Step 2: Add These Environment Variables

Add each of these variables:

**Variable 1:**
- Key: `MONEYMOTION_API_KEY`
- Value: `mk_live_DU5DYpjWqwjf96CY1mG7haGMi1Ut8x6`
- Environment: Check all boxes (Production, Preview, Development)

**Variable 2:**
- Key: `MONEYMOTION_WEBHOOK_SECRET`
- Value: `c3fc9f14f955645798929d83deab4823c97b0e7ed1d1a1466e9fd3aea4d908ce`
- Environment: Check all boxes (Production, Preview, Development)

### Step 3: Redeploy
After adding the variables, you MUST redeploy:

**Option A - Trigger New Deployment:**
1. Go to **Deployments** tab
2. Click the three dots (...) on the latest deployment
3. Click **Redeploy**
4. Click **Redeploy** again to confirm

**Option B - Push a Small Change:**
Run the `PUSH_ALL_CHANGES.bat` file to trigger a new deployment automatically.

### Step 4: Test
1. Wait for deployment to complete (2-3 minutes)
2. Go to https://ring-0cheats.org
3. Add a product to cart
4. Try to checkout
5. Should redirect to MoneyMotion payment page successfully

## Why This Happened
- `.env.local` files are NOT uploaded to GitHub (they're in .gitignore for security)
- Vercel doesn't have access to your local `.env.local` file
- You must manually add environment variables in Vercel dashboard
- After adding variables, you must redeploy for them to take effect

## Verification
After redeployment, the checkout should work and you'll see:
- No more 401 errors
- Successful redirect to MoneyMotion checkout page
- Payment processing works correctly

## If Still Not Working
Check the Vercel deployment logs:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Functions** tab
4. Look for any errors in the logs
