# 🔍 STORRIK "LOADING PAYMENT SYSTEM" DEBUG GUIDE

## Why It's Stuck

The page shows "Loading Payment System..." which means one of these issues:

1. ❌ Storrik CDN script (`https://cdn.storrik.com/embed.js`) is not loading
2. ❌ `NEXT_PUBLIC_STORRIK_PUBLIC_KEY` environment variable is not set correctly in Vercel
3. ❌ Storrik script loaded but `window.storrik` object is not available
4. ❌ Network/firewall blocking the Storrik CDN

---

## 🔧 DEBUGGING STEPS

### Step 1: Check Browser Console

1. **Open the payment page** where it's stuck
2. **Press F12** to open Developer Tools
3. **Click "Console" tab**
4. **Look for these messages:**

**✅ Good messages (should see):**
```
[Storrik Payment] Fetching order: d0bc0362-2657-470d-9ece-fb9210bd1350
[Storrik Payment] Order data: {...}
[Storrik Payment] Storrik script loaded
[Storrik Payment] Configuring with key: pk_live_UcQGVDA...
[Storrik Payment] ✅ Configuration successful
```

**❌ Bad messages (problems):**
```
Failed to load resource: https://cdn.storrik.com/embed.js
[Storrik Payment] Script failed to load
[Storrik Payment] window.storrik not available
[Storrik Payment] Timeout - Storrik script failed to load
```

**Take a screenshot of the console and send it to me.**

---

### Step 2: Check Network Tab

1. In Developer Tools, click **"Network" tab**
2. **Refresh the page** (F5)
3. **Look for:** `embed.js` in the list
4. **Check the status:**
   - ✅ **200 OK** = Script loaded successfully
   - ❌ **Failed** or **404** = Script didn't load
   - ❌ **CORS error** = Blocked by browser/firewall

**Take a screenshot of the Network tab.**

---

### Step 3: Verify Environment Variable in Vercel

1. Go to **Vercel Dashboard**
2. Click your project
3. Go to **Settings** → **Environment Variables**
4. **Find:** `NEXT_PUBLIC_STORRIK_PUBLIC_KEY`
5. **Verify the value is EXACTLY:**
   ```
   pk_live_UcQGVDAT8aH-M-NTV4UaVrY4IlNLKVXVUPEJ-4ya3D4
   ```
6. **Check it's enabled for:** Production, Preview, Development (all 3)

**If it's wrong or missing:**
- Delete it
- Add it again with the correct value
- **Redeploy** your site (Deployments → Click three dots → Redeploy)

---

### Step 4: Check if Storrik CDN is Accessible

**Test if the Storrik CDN is working:**

1. Open a new browser tab
2. Go to: `https://cdn.storrik.com/embed.js`
3. **You should see JavaScript code**
4. If you see an error or blank page, Storrik's CDN might be down

---

### Step 5: Check Vercel Deployment Logs

1. Go to **Vercel Dashboard**
2. Click **Deployments**
3. Click your latest deployment
4. Check **Build Logs** for errors
5. Check **Function Logs** for runtime errors

---

## 🎯 MOST LIKELY CAUSES

### Cause 1: Environment Variable Not Set (90% chance)

**Problem:** `NEXT_PUBLIC_STORRIK_PUBLIC_KEY` is not in Vercel or has wrong value

**Solution:**
1. Go to Vercel → Settings → Environment Variables
2. Add/update: `NEXT_PUBLIC_STORRIK_PUBLIC_KEY` = `pk_live_UcQGVDAT8aH-M-NTV4UaVrY4IlNLKVXVUPEJ-4ya3D4`
3. Enable for all environments
4. **Redeploy** the site

---

### Cause 2: Storrik CDN Script Not Loading (5% chance)

**Problem:** Browser can't reach `https://cdn.storrik.com/embed.js`

**Possible reasons:**
- Storrik's CDN is down
- Your firewall/antivirus is blocking it
- Browser extension blocking scripts
- Network issue

**Solution:**
- Try different browser
- Disable browser extensions
- Check if `https://cdn.storrik.com/embed.js` loads in a new tab
- Contact Storrik support if their CDN is down

---

### Cause 3: Storrik API Key Invalid (3% chance)

**Problem:** The public key is wrong or expired

**Solution:**
- Log into your Storrik dashboard
- Go to API Keys section
- Verify the public key matches: `pk_live_UcQGVDAT8aH-M-NTV4UaVrY4IlNLKVXVUPEJ-4ya3D4`
- If different, update it in Vercel

---

### Cause 4: Deployment Not Updated (2% chance)

**Problem:** Vercel hasn't deployed the latest code with the new environment variable

**Solution:**
1. Go to Vercel → Deployments
2. Click the three dots on latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete
5. Try again

---

## 🚨 QUICK FIX TO TRY NOW

**Do this in order:**

1. **Verify environment variable:**
   - Vercel → Settings → Environment Variables
   - Check `NEXT_PUBLIC_STORRIK_PUBLIC_KEY` exists and is correct

2. **Redeploy:**
   - Vercel → Deployments → Redeploy

3. **Clear browser cache:**
   - Press Ctrl+Shift+Delete
   - Clear cached images and files
   - Try again

4. **Check browser console:**
   - F12 → Console tab
   - Look for error messages
   - Send me a screenshot

---

## 📸 WHAT I NEED FROM YOU

To help debug, send me:

1. **Screenshot of browser console** (F12 → Console tab)
2. **Screenshot of Network tab** showing embed.js request
3. **Screenshot of Vercel environment variables** (blur sensitive values)
4. **Tell me:** Can you access `https://cdn.storrik.com/embed.js` in a new tab?

---

## 🔄 ALTERNATIVE: Test Locally

If you want to test locally to see if it's a Vercel issue:

1. Open terminal in your project folder
2. Create `.env.local` file with:
   ```
   NEXT_PUBLIC_STORRIK_PUBLIC_KEY=pk_live_UcQGVDAT8aH-M-NTV4UaVrY4IlNLKVXVUPEJ-4ya3D4
   ```
3. Run: `npm run dev`
4. Go to: `http://localhost:3000`
5. Try the checkout flow
6. If it works locally but not on Vercel, it's a Vercel environment variable issue

---

## 💡 TEMPORARY WORKAROUND

If Storrik embed keeps failing, we can:

1. **Use Storrik API directly** (if their API is working)
2. **Switch to Stripe temporarily** (works immediately)
3. **Add manual payment instructions** (contact support to pay)

Let me know what you find in the console and I'll help fix it!
