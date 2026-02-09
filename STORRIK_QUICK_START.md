# Storrik Payment - Quick Start Guide

## 🚀 3-Step Setup

### 1️⃣ Run Database Script
Open Supabase SQL Editor and run:
```sql
-- Copy/paste contents of ADD_STORRIK_PAYMENT.sql
```

### 2️⃣ Add API Key
1. Get your Storrik Public Key from https://storrik.com/dashboard
2. Go to `/mgmt-x9k2m7/settings`
3. Paste API key in "Storrik Public API Key" field
4. Click "Save Changes"

### 3️⃣ Configure Webhook
In Storrik Dashboard:
- Webhook URL: `https://your-domain.com/api/webhooks/storrik`
- Events: `checkout.completed`, `payment.succeeded`

## ✅ Done!

Your site now accepts card payments through Storrik.

### Test It:
1. Add product to cart
2. Go to checkout
3. Click "Pay with Card"
4. Storrik modal opens
5. Complete payment
6. Order created + License sent via email

## 📋 What Happens on Payment:
- ✅ Order created in database
- ✅ License key generated
- ✅ Email sent to customer
- ✅ Discord notification (if configured)
- ✅ Customer can access license in account

## 🔧 Admin Features:
- **Settings**: Configure API key anytime
- **Orders**: View all Storrik payments
- **Licenses**: See generated keys
- **No code changes needed** - Everything configurable in admin dashboard

## 📖 Full Documentation:
See `STORRIK_INTEGRATION_COMPLETE.md` for detailed information.

---
**MoneyMotion has been completely replaced with Storrik** ✅
