# 🚀 Ring-0 - Quick Start Guide

## ⚡ Get Started in 3 Steps

---

## Step 1: Setup Database (5 minutes)

### Open Supabase SQL Editor
1. Go to your Supabase project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Run the Complete Setup
1. Open the file: `COMPLETE_SUPABASE_SETUP.sql`
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. Click **Run** (or press F5)

### Add Discord Webhook
1. Open the file: `SETUP_DISCORD_WEBHOOK_AUTO.sql`
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. Click **Run**

✅ **Done!** Your database is now fully configured with Discord webhooks!

---

## Step 2: Verify Everything Works (2 minutes)

### Check Tables Were Created
Run this in Supabase SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see 12 tables:
- admin_audit_logs
- categories
- coupons
- licenses
- orders
- product_variants
- products
- reviews
- settings
- stripe_sessions
- team_members
- webhooks

### Check Discord Webhook
Run this in Supabase SQL Editor:

```sql
SELECT name, is_active, array_length(events, 1) as event_count
FROM webhooks 
WHERE is_active = true;
```

You should see:
- Name: "Discord Order Notifications"
- Active: true
- Event count: 7

✅ **Done!** Everything is configured correctly!

---

## Step 3: Test the System (3 minutes)

### Start the Development Server
```bash
npm run dev
```

### Make a Test Purchase
1. Go to: http://localhost:3000
2. Click on any product
3. Click "Add to Cart"
4. Click "Checkout"
5. Fill in test email: `test@ring-0.com`
6. Use Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
7. Click "Pay"

### Check Discord
Go to your Discord channel - you should see **4 messages**:

1. 🛒 **Customer Started Checkout** (blue embed)
2. ⏳ **Order Pending Payment** (light blue embed)
3. 💰 **Payment Completed** (blue embed)
4. 🎉 **New Order Completed** (blue embed)

### Check Admin Panel
1. Go to: http://localhost:3000/mgmt-x9k2m7/login
2. Login with:
   - Password: `Sk7yL!n3_Adm1n_2026_X9k2M7pQ`
3. Check **Dashboard** - revenue should show
4. Check **Orders** tab - new order should appear
5. Check **License Keys** tab - key should be assigned

✅ **Done!** Everything is working perfectly!

---

## 🎯 What You Just Accomplished

✅ **Database Setup** - All 12 tables created with proper indexes and security
✅ **Discord Webhooks** - Automatic notifications for all order events
✅ **Order System** - Complete checkout → payment → license flow
✅ **License Assignment** - Automatic key delivery on purchase
✅ **Email Delivery** - Blue Ring-0 branded emails
✅ **Revenue Tracking** - Real-time stats in admin panel

---

## 📋 Next Steps

### 1. Stock License Keys
Before selling, you need to add license keys:

1. Go to admin panel: http://localhost:3000/mgmt-x9k2m7/login
2. Click **License Keys** tab
3. Click **Add License Key**
4. Fill in:
   - Product: Select product
   - Variant: Select duration
   - License Key: Your actual key
   - Status: Unused
5. Repeat for all products

**OR** bulk import via SQL:

```sql
INSERT INTO licenses (product_id, variant_id, product_name, license_key, status, customer_email)
SELECT 
  p.id,
  pv.id,
  p.name || ' - ' || pv.duration,
  'KEY-' || gen_random_uuid()::text,
  'unused',
  ''
FROM products p
JOIN product_variants pv ON pv.product_id = p.id
LIMIT 50; -- Creates 50 test keys
```

### 2. Add Your Products
1. Go to admin panel → **Products** tab
2. Click **Add Product**
3. Fill in product details
4. Add variants (durations and prices)
5. Upload product images

### 3. Configure Production
When ready to go live:

1. Update `.env.production` with:
   - Production Supabase URL and keys
   - Production Stripe keys (not test keys)
   - Production domain URL
   - Verify Resend domain

2. Add Stripe webhook in Stripe Dashboard:
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `payment_intent.payment_failed`, `charge.dispute.created`
   - Copy webhook secret to `.env.production`

3. Verify Resend domain:
   - Go to Resend dashboard
   - Add and verify `ring-0cheats.org`
   - Update DNS records

---

## 🔍 Troubleshooting

### Discord Webhooks Not Appearing?

**Check webhook is active:**
```sql
SELECT * FROM webhooks WHERE is_active = true;
```

**Test webhook manually:**
```bash
curl -X POST "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN" -H "Content-Type: application/json" -d "{\"content\": \"Test from Ring-0!\"}"
```

### Orders Not Creating?

**Check Stripe webhook secret:**
- In `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`
- Should start with `whsec_`

**Check Supabase connection:**
```bash
# Test in terminal
curl "YOUR_SUPABASE_URL/rest/v1/products?select=*" -H "apikey: YOUR_ANON_KEY"
```

### License Keys Not Assigning?

**Check available stock:**
```sql
SELECT product_name, COUNT(*) as available
FROM licenses 
WHERE status = 'unused'
GROUP BY product_name;
```

If no keys available, add some (see "Stock License Keys" above).

---

## 📞 Quick Reference

### URLs
- **Store**: http://localhost:3000
- **Admin**: http://localhost:3000/mgmt-x9k2m7/login
- **Guides**: http://localhost:3000/guides
- **Account**: http://localhost:3000/account

### Admin Credentials
- **Password**: `Sk7yL!n3_Adm1n_2026_X9k2M7pQ`

### Stripe Test Cards
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Auth**: `4000 0025 0000 3155`

### Important Files
- `COMPLETE_SUPABASE_SETUP.sql` - Database setup
- `SETUP_DISCORD_WEBHOOK_AUTO.sql` - Discord webhook
- `DISCORD_WEBHOOKS_VERIFICATION.md` - Webhook guide
- `SYSTEM_STATUS_COMPLETE.md` - Full system status

---

## 🎉 You're All Set!

Your Ring-0 store is now:
- ✅ Fully branded with blue theme
- ✅ Database configured and ready
- ✅ Discord webhooks working
- ✅ Payment processing operational
- ✅ License system automated
- ✅ Email delivery configured
- ✅ Admin panel functional

**Start selling!** 🚀

Just stock your license keys and you're ready to accept orders!
