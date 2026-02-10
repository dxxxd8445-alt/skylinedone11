# Storrik Payment Integration - Setup Instructions

## ✅ What I've Done

1. **Updated `.env.local`** with your Storrik API key:
   - `STORRIK_SECRET_KEY=sk_live_cvOn7sNpgwSCoE2J7akuPx-7akVBDS-FiYGL8L-eon4`

2. **Created Storrik API Routes**:
   - `/api/storrik/create-checkout` - Creates checkout sessions
   - `/api/webhooks/storrik` - Handles payment webhooks

3. **Updated Checkout Page** to use Storrik instead of MoneyMotion

4. **Storrik Library** already exists at `lib/storrik.ts`

## 🔧 What YOU Need To Do

### Step 1: Create Webhook in Storrik Dashboard

1. Go to your Storrik Dashboard: https://dashboard.storrik.com
2. Navigate to **Settings** → **Webhooks** (or **Developers** → **Webhooks**)
3. Click **Create Webhook** or **Add Webhook**
4. Enter these details:

**Webhook URL:**
```
https://skylinecheats.org/api/webhooks/storrik
```

**Events to Subscribe To:**
- ✅ `payment.succeeded` (or `checkout.completed`)
- ✅ `payment.failed`
- ✅ `transaction.completed` (if available)

5. After creating the webhook, Storrik will show you a **Webhook Secret** (looks like `whsec_...`)
6. **COPY THIS SECRET** - you'll need it in the next step

### Step 2: Add Webhook Secret to Environment Variables

**Local (.env.local):**
1. Open `magma src/.env.local`
2. Find the line: `STORRIK_WEBHOOK_SECRET=`
3. Add your webhook secret: `STORRIK_WEBHOOK_SECRET=whsec_your_secret_here`

**Vercel (Production):**
1. Go to https://vercel.com
2. Open your project: **skylinecheats**
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

| Key | Value |
|-----|-------|
| `STORRIK_SECRET_KEY` | `sk_live_cvOn7sNpgwSCoE2J7akuPx-7akVBDS-FiYGL8L-eon4` |
| `STORRIK_WEBHOOK_SECRET` | `whsec_your_secret_from_step_1` |

5. Make sure to check **ALL environments** (Production, Preview, Development)
6. Click **Save**

### Step 3: Deploy to Vercel

Run your push script:
```bash
PUSH_ALL_CHANGES.bat
```

Or manually:
```bash
cd "magma src"
git add -A
git commit -m "Implement Storrik payment processor"
git push
```

Wait 2-3 minutes for Vercel to deploy.

### Step 4: Test the Checkout

1. Go to https://skylinecheats.org
2. Add a product to cart
3. Go to checkout
4. Enter your email
5. Click "Complete Secure Payment"
6. You should be redirected to Storrik's hosted checkout page
7. The checkout page will look like the screenshots you showed me

## 🎨 Checkout Page Design

The Storrik checkout will show:
- Order summary on the left
- Payment form on the right
- Card information fields
- Country/Region selector
- "Pay $X.XX" button at the bottom
- Clean, dark theme matching your site

## 🔔 What Happens After Payment

1. Customer completes payment on Storrik
2. Storrik sends webhook to your site
3. Your site:
   - Generates license key
   - Updates order status to "completed"
   - Sends email with license key
   - Sends Discord notification
4. Customer is redirected to success page

## 📊 Testing

**Test Mode (Optional):**
If you want to test first:
1. Get your Storrik TEST API key (starts with `sk_test_`)
2. Temporarily replace `STORRIK_SECRET_KEY` with test key
3. Use test card: `4242 4242 4242 4242`
4. Any future date for expiry
5. Any 3 digits for CVC

**Live Mode:**
Your current key (`sk_live_...`) is already live mode, so real payments will work immediately.

## ❓ Troubleshooting

**If checkout doesn't redirect:**
- Check browser console for errors
- Check Vercel deployment logs
- Make sure API key is set in Vercel

**If webhook doesn't work:**
- Check webhook URL is correct in Storrik dashboard
- Check webhook secret is set in Vercel
- Check Vercel function logs for webhook errors

**If orders don't complete:**
- Check Supabase orders table
- Check email is being sent
- Check Discord webhook is working

## 🚀 You're Ready!

Once you:
1. ✅ Create webhook in Storrik dashboard
2. ✅ Add webhook secret to Vercel
3. ✅ Deploy to Vercel

Your payment system will be fully functional!

## 📝 Notes

- Storrik handles all PCI compliance
- Checkout page is hosted by Storrik (secure)
- Your site only handles order creation and fulfillment
- All sensitive card data stays with Storrik
- Webhook ensures you get notified of all payments
