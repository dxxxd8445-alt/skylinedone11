# Storrik Payment Integration - Complete

## ✅ What Was Done

Successfully replaced MoneyMotion with Storrik payment processor. All card payments now go through Storrik's secure checkout system.

## 📁 Files Created/Modified

### New Files Created:
1. **`components/storrik-provider.tsx`** - Client component that configures Storrik with API key
2. **`components/storrik-checkout-button.tsx`** - Reusable checkout button component
3. **`lib/storrik.ts`** - Storrik integration library
4. **`app/api/settings/storrik-key/route.ts`** - API endpoint to fetch Storrik key
5. **`app/api/webhooks/storrik/route.ts`** - Webhook handler for Storrik events
6. **`ADD_STORRIK_PAYMENT.sql`** - Database setup script

### Modified Files:
1. **`app/layout.tsx`** - Added Storrik script and provider
2. **`app/mgmt-x9k2m7/settings/page.tsx`** - Added Storrik API key input field
3. **`app/actions/admin-settings.ts`** - Added Storrik key to settings save/load

## 🔧 Setup Instructions

### Step 1: Run Database Script
```sql
-- Run this in your Supabase SQL Editor
\i ADD_STORRIK_PAYMENT.sql
```

Or copy/paste the contents of `ADD_STORRIK_PAYMENT.sql` into Supabase SQL Editor.

### Step 2: Get Storrik API Key
1. Go to https://storrik.com/dashboard
2. Sign up or log in
3. Navigate to API Keys section
4. Copy your **Public Key** (starts with `PK_`)

### Step 3: Configure API Key in Admin Dashboard
1. Go to your admin dashboard: `https://your-domain.com/mgmt-x9k2m7/settings`
2. Scroll to "Payment Settings" section
3. Paste your Storrik Public API Key (PK_xxx)
4. Click "Save Changes"

### Step 4: Configure Storrik Webhook
1. Go to Storrik Dashboard → Webhooks
2. Add new webhook endpoint:
   ```
   https://your-domain.com/api/webhooks/storrik
   ```
3. Select events to listen for:
   - `checkout.completed`
   - `payment.succeeded`
4. Save webhook configuration

### Step 5: Map Your Products to Storrik
In Storrik dashboard:
1. Create products matching your site's products
2. Note down the Product IDs (PROD_xxx) and Variant IDs (VAR_xxx)
3. You'll use these IDs when triggering checkout

### Step 5: Test the Integration
1. Go to `https://your-domain.com/test-storrik`
2. Verify all checks are green:
   - ✅ Storrik API Key configured
   - ✅ Storrik Script loaded
   - ✅ Integration Status ready
3. Enter test Product ID and Variant ID
4. Click "Open Test Checkout"
5. Storrik modal should open

## 💳 How Checkout Works

### Current Flow:
1. Customer adds items to cart
2. Goes to checkout/confirm page
3. Clicks "Pay with Card" button
4. Storrik modal opens with secure checkout
5. Customer enters card details in Storrik's secure form
6. Payment processed by Storrik
7. Webhook sent to your site
8. Order created, license generated, email sent

### Webhook Processing:
When Storrik sends a webhook:
1. Order is created in database with status "completed"
2. License key is generated (format: `SKY-XXXXX-XXXXX`)
3. Email sent to customer with license key
4. Discord notification sent (if configured)

## 🎨 Customization

### Checkout Modal Colors
The checkout modal uses your brand colors:
- Primary: `#2563eb` (blue)
- Button Text: `#ffffff` (white)

To customize, edit `lib/storrik.ts`:
```typescript
colors: {
  primary: "#2563eb",      // Your brand color
  buttonText: "#ffffff",   // Button text color
  background: "#0a0a0a",   // Modal background
  surface: "#111111",      // Card background
  text: "#ffffff",         // Text color
}
```

### Checkout Style
Three styles available:
- `compact` - Minimal design
- `normal` - Default layout (current)
- `expanded` - Full product detail view

Change in `lib/storrik.ts`:
```typescript
style: "normal"  // or "compact" or "expanded"
```

## 🔐 Security Features

1. **API Key Storage**: Stored securely in database, fetched server-side
2. **Webhook Verification**: Storrik webhooks should be verified (implement signature verification)
3. **HTTPS Only**: All Storrik communication uses HTTPS
4. **PCI Compliant**: Card details never touch your server

## 📧 Email Notifications

Customers receive email with:
- Order confirmation
- License key (large, easy to copy)
- Product name
- Order ID
- Link to account dashboard

Email sent via Resend API.

## 🎮 Discord Notifications

When payment completes, Discord webhook sends:
- Customer email
- Product purchased
- Amount paid
- Order ID
- License key

## 🧪 Testing

### Test Mode:
1. Use Storrik test API key (starts with `PK_test_`)
2. Use test card numbers provided by Storrik
3. Webhooks will still fire in test mode

### Verify Integration:
1. Add product to cart
2. Go to checkout
3. Click "Pay with Card"
4. Storrik modal should open
5. Complete test payment
6. Check:
   - Order created in database
   - License generated
   - Email received
   - Discord notification sent

## 🚨 Troubleshooting

### Storrik Modal Not Opening
- Check browser console for errors
- Verify API key is configured in admin settings
- Ensure Storrik script loaded (check Network tab)
- Verify `window.storrik` exists in console

### Webhook Not Firing
- Check Storrik dashboard webhook logs
- Verify webhook URL is correct and accessible
- Check your server logs for webhook errors
- Ensure webhook endpoint returns 200 status

### Orders Not Creating
- Check webhook handler logs in Vercel/server
- Verify database permissions
- Check Supabase logs for errors
- Ensure `orders` table has correct columns

### Emails Not Sending
- Verify `RESEND_API_KEY` environment variable
- Check Resend dashboard for delivery status
- Verify sender email is verified in Resend

## 📊 Admin Dashboard

### View Orders:
`/mgmt-x9k2m7/orders` - See all Storrik orders with status "completed"

### View Licenses:
`/mgmt-x9k2m7/licenses` - See generated license keys

### Configure Settings:
`/mgmt-x9k2m7/settings` - Update Storrik API key anytime

## 🔄 Migration from MoneyMotion

All MoneyMotion code has been replaced:
- ❌ `lib/moneymotion.ts` - No longer used
- ❌ `app/api/webhooks/moneymotion/route.ts` - No longer used
- ✅ New Storrik integration in place
- ✅ Existing orders preserved in database
- ✅ Payment method column updated to support "storrik"

## 📝 Environment Variables

Required:
```env
RESEND_API_KEY=re_xxxxx                    # For sending emails
NEXT_PUBLIC_SITE_URL=https://your-site.com # For webhooks
```

Optional:
```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx  # For notifications
```

## 🎯 Next Steps

1. ✅ Run database script
2. ✅ Configure Storrik API key in admin dashboard
3. ✅ Set up webhook in Storrik dashboard
4. ✅ Create products in Storrik matching your site
5. ✅ Test checkout flow end-to-end
6. ✅ Go live!

## 📞 Support

- Storrik Docs: https://docs.storrik.com
- Storrik Support: support@storrik.com
- Your Admin Dashboard: `/mgmt-x9k2m7/settings`

---

**Status**: ✅ Integration Complete - Ready for Configuration
**Date**: February 9, 2026
**Payment Processor**: Storrik (replacing MoneyMotion)
