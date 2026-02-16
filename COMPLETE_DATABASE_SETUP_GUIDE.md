# 🗄️ Complete Database Setup Guide for New Supabase

## ✅ ONE FILE TO RULE THEM ALL

You only need **ONE SQL file** to set up your entire database:

### 📄 **`COMPLETE_SUPABASE_SETUP.sql`**

This file contains EVERYTHING you need:
- ✅ All tables (products, orders, licenses, etc.)
- ✅ All indexes for performance
- ✅ All RLS (Row Level Security) policies
- ✅ All permissions
- ✅ Sample data (optional)

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard/project/dbshpcygbhnuekcsywel
2. Click **"SQL Editor"** in left sidebar
3. Click **"New Query"**

### Step 2: Copy the Complete Setup File
1. Open the file: **`COMPLETE_SUPABASE_SETUP.sql`**
2. Select ALL content (Ctrl+A or Cmd+A)
3. Copy it (Ctrl+C or Cmd+C)

### Step 3: Run It
1. Paste into Supabase SQL Editor
2. Click **"Run"** button (or press Ctrl+Enter)
3. Wait for completion (may take 30-60 seconds)
4. Look for "Success. No rows returned" message

---

## 📋 What Tables Will Be Created

After running the script, you'll have these tables:

### Core E-commerce Tables
1. **products** - Your cheat products
2. **product_variants** - Different durations/prices
3. **categories** - Product categories
4. **orders** - Customer orders
5. **licenses** - License keys
6. **coupons** - Discount codes

### Customer & Auth Tables
7. **store_users** - Customer accounts
8. **password_reset_tokens** - Password resets
9. **cart_items** - Shopping cart

### Admin & Team Tables
10. **admin_users** - Admin accounts
11. **team_members** - Staff members
12. **team_invites** - Pending invites
13. **admin_audit_logs** - Login tracking

### Analytics Tables
14. **visitor_sessions** - Real-time visitors
15. **page_views** - Page tracking
16. **conversion_events** - User actions
17. **analytics_sessions** - Session tracking
18. **analytics_events** - Event tracking

### System Tables
19. **webhooks** - Discord webhooks
20. **stripe_sessions** - Stripe checkouts
21. **announcements** - Site announcements
22. **terms_accepted** - Terms popup tracking
23. **reviews** - Product reviews
24. **settings** - Site settings

### Affiliate System Tables
25. **affiliates** - Affiliate accounts
26. **affiliate_referrals** - Referral tracking
27. **affiliate_clicks** - Click tracking
28. **affiliate_payouts** - Payment tracking

---

## ✅ Verify Setup Worked

After running the SQL, verify tables exist:

### Method 1: Table Editor
1. Click **"Table Editor"** in left sidebar
2. You should see 25+ tables listed
3. Click on any table to see its structure

### Method 2: SQL Query
Run this query to count tables:

```sql
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public';
```

You should see **25 or more** tables.

---

## 🔧 Additional Setup (After Main Script)

### 1. Create Your Admin Account

Run this SQL to create admin login:

```sql
-- Create admin user
INSERT INTO admin_users (email, password_hash, role, is_active)
VALUES (
  'admin@ring-0cheats.org',
  crypt('Sk7yL!n3_Adm1n_2026_X9k2M7pQ', gen_salt('bf')),
  'super_admin',
  true
);
```

### 2. Setup Discord Webhooks

Run this SQL:

```sql
-- Setup Discord webhook
DELETE FROM webhooks WHERE url LIKE '%discord.com%';

INSERT INTO webhooks (name, url, events, is_active) VALUES
  (
    'Ring-0 Discord - All Order Events', 
    'https://discord.com/api/webhooks/1466894801541533707/6Z-YfKfQbE-UuakpsNLfULuf_3WefNpMbwLLiNJKMSf__Xv-7GL4e4b0M1F7409S5L54',
    ARRAY['checkout.started', 'order.pending', 'order.completed', 'payment.completed', 'payment.failed', 'order.refunded', 'order.disputed'],
    true
  );
```

### 3. Add Sample Products (Optional)

You can add products through the admin panel or via SQL:

```sql
-- Add a sample product
INSERT INTO products (name, description, game, price, is_active)
VALUES (
  'Fortnite Cheat',
  'Premium Fortnite cheat with aimbot and ESP',
  'Fortnite',
  29.99,
  true
);
```

---

## 🔄 If You Need to Start Over

If something goes wrong, you can reset:

### Option 1: Drop All Tables (Nuclear Option)
```sql
-- WARNING: This deletes EVERYTHING!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Then run `COMPLETE_SUPABASE_SETUP.sql` again.

### Option 2: Drop Specific Tables
```sql
-- Drop specific tables if needed
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS licenses CASCADE;
-- etc...
```

---

## 📁 Other SQL Files (Reference Only)

You have many other SQL files in your project, but you **DON'T NEED THEM** for initial setup. They were created during development for specific fixes:

### Don't Use These (Already in COMPLETE_SUPABASE_SETUP.sql):
- ❌ `QUICK_SETUP.sql` - Older version
- ❌ `PRODUCTION_DATABASE_SETUP.sql` - Partial setup
- ❌ `AFFILIATE_SYSTEM_*.sql` - Affiliate tables only
- ❌ `STRIPE_DATABASE_SETUP.sql` - Stripe tables only
- ❌ `STORE_VIEWERS_*.sql` - Analytics only
- ❌ `SETUP_*.sql` - Individual components

### Use These AFTER Main Setup:
- ✅ `setup-discord-webhooks.sql` - Discord configuration
- ✅ `reset-orders.sql` - Reset orders to 0

---

## 🎯 Step-by-Step Checklist

Follow this exact order:

- [ ] 1. Open Supabase SQL Editor
- [ ] 2. Copy `COMPLETE_SUPABASE_SETUP.sql` contents
- [ ] 3. Paste and run in SQL Editor
- [ ] 4. Verify 25+ tables created
- [ ] 5. Run admin user creation SQL
- [ ] 6. Run Discord webhook SQL
- [ ] 7. Restart your dev server (`npm run dev`)
- [ ] 8. Test admin login: http://localhost:3000/mgmt-x9k2m7/login
- [ ] 9. Add products through admin panel
- [ ] 10. Stock license keys
- [ ] 11. Test a purchase
- [ ] 12. Launch! 🚀

---

## 🆘 Troubleshooting

### Error: "relation already exists"
**Problem**: Table already exists
**Solution**: Either drop the table first or ignore the error (it's safe)

### Error: "permission denied"
**Problem**: Not enough permissions
**Solution**: Make sure you're using the service_role key in your app

### Error: "syntax error"
**Problem**: SQL syntax issue
**Solution**: Make sure you copied the ENTIRE file, including all semicolons

### Tables Not Showing
**Problem**: Script didn't run completely
**Solution**: Check for errors in SQL Editor, fix them, and run again

---

## 📞 Quick Reference

### Main Setup File
**File**: `COMPLETE_SUPABASE_SETUP.sql`
**Location**: Root of `magma src` folder
**Size**: ~2000+ lines
**Time to Run**: 30-60 seconds

### Your Supabase Project
**URL**: https://dbshpcygbhnuekcsywel.supabase.co
**Dashboard**: https://supabase.com/dashboard/project/dbshpcygbhnuekcsywel
**SQL Editor**: https://supabase.com/dashboard/project/dbshpcygbhnuekcsywel/sql

### Admin Login
**URL**: http://localhost:3000/mgmt-x9k2m7/login
**Password**: `Sk7yL!n3_Adm1n_2026_X9k2M7pQ`

---

## ✅ You're Done!

Once you run `COMPLETE_SUPABASE_SETUP.sql`, your database is ready. Just add your products and you can start selling! 🎉
