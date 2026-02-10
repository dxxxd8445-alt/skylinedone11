# UPDATE VERCEL ENVIRONMENT VARIABLES NOW

## CRITICAL: You MUST update Vercel with the correct API key

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com
2. Click on your project: **skylinecheats**
3. Click **Settings** tab
4. Click **Environment Variables** in left sidebar

### Step 2: Update or Add This Variable

**Find `MONEYMOTION_API_KEY` and UPDATE it to:**
```
mk_live_SpGZkAfH8vEOnkBRUCAoNzLoFGktBgih
```

**If it doesn't exist, ADD it:**
- Key: `MONEYMOTION_API_KEY`
- Value: `mk_live_SpGZkAfH8vEOnkBRUCAoNzLoFGktBgih`
- Environment: Check ALL boxes (Production, Preview, Development)

### Step 3: Redeploy
After updating the variable:
1. Go to **Deployments** tab
2. Click the three dots (...) on the latest deployment
3. Click **Redeploy**
4. Wait 2-3 minutes for deployment to complete

### Step 4: Test
1. Go to https://skylinecheats.org
2. Add product to cart
3. Go to checkout
4. Click "Complete Secure Payment"
5. Should redirect to MoneyMotion payment page ✅

## Why This Will Work Now
- ✅ Code has correct headers (X-API-Key)
- ✅ Local .env.local has correct API key
- ⏳ Vercel needs the correct API key (you must add it)
- ✅ Store is activated

Once you update Vercel and redeploy, MoneyMotion will work perfectly!
