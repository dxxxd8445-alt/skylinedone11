# 🆕 New Supabase Database Setup Guide

## ✅ Configuration Updated!

Your `.env.local` and `.env.production` files have been updated with your new Supabase credentials:

**Project URL**: `https://dbshpcygbhnuekcsywel.supabase.co`
**Project ID**: `dbshpcygbhnuekcsywel`

---

## 🚨 IMPORTANT: Set Up Your Database Tables

Your new Supabase project is **empty** - you need to create all the database tables!

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project: `dbshpcygbhnuekcsywel`
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### Step 2: Run the Complete Setup Script

Copy and paste the ENTIRE contents of this file into the SQL Editor:

**File**: `COMPLETE_SUPABASE_SETUP.sql`

This will create all tables:
- ✅ products
- ✅ product_variants
- ✅ orders
- ✅ licenses
- ✅ coupons
- ✅ webhooks
- ✅ stripe_sessions
- ✅ admin_users
- ✅ store_users
- ✅ analytics_sessions
- ✅ analytics_events
- ✅ And more...

### Step 3: Click "Run" Button
- Wait for the script to complete
- You should see "Success" messages
- Check for any errors (red text)

### Step 4: Verify Tables Were Created
1. Click **"Table Editor"** in the left sidebar
2. You should see all the tables listed
3. If you see tables like `products`, `orders`, `licenses` - you're good!

---

## 🔧 Additional Setup Required

### 1. Create Admin User
Run this SQL to create your admin account:

```sql
-- Create admin user
INSERT INTO admin_users (email, password_hash, role, is_active)
VALUES (
  'admin@skylinecheats.org',
  crypt('Sk7yL!n3_Adm1n_2026_X9k2M7pQ', gen_salt('bf')),
  'super_admin',
  true
);
```

### 2. Setup Discord Webhooks
Run this SQL:

```sql
-- Setup Discord webhook
INSERT INTO webhooks (name, url, events, is_active) VALUES
  (
    'Skyline Discord - All Order Events', 
    'https://discord.com/api/webhooks/1466894801541533707/6Z-YfKfQbE-UuakpsNLfULuf_3WefNpMbwLLiNJKMSf__Xv-7GL4e4b0M1F7409S5L54',
    ARRAY['checkout.started', 'order.pending', 'order.completed', 'payment.completed', 'payment.failed', 'order.refunded', 'order.disputed'],
    true
  );
```

### 3. Add Sample Products (Optional)
You can add products through the admin panel or via SQL.

---

## 🔄 Restart Your Development Server

After setting up the database:

1. **Stop your current server** (Ctrl+C in terminal)
2. **Restart it**:
   ```bash
   npm run dev
   ```
3. **Clear browser cache** or open in incognito mode
4. **Test the connection**:
   - Go to http://localhost:3000
   - Try accessing admin panel: http://localhost:3000/mgmt-x9k2m7/login
   - Login with: `Sk7yL!n3_Adm1n_2026_X9k2M7pQ`

---

## ✅ Verification Checklist

After setup, verify these work:

- [ ] Admin panel login works
- [ ] Dashboard loads without errors
- [ ] Products page loads (may be empty)
- [ ] Orders page loads (will be empty)
- [ ] License keys page loads (will be empty)
- [ ] Store front page loads
- [ ] No console errors about Supabase

---

## 🆘 Troubleshooting

### Error: "relation does not exist"
**Problem**: Tables weren't created
**Solution**: Run the `COMPLETE_SUPABASE_SETUP.sql` script

### Error: "Invalid API key"
**Problem**: Keys not updated correctly
**Solution**: Check `.env.local` has the correct keys, restart server

### Error: "Failed to fetch"
**Problem**: Network/CORS issue
**Solution**: 
1. Check Supabase project is active
2. Verify URL is correct
3. Check browser console for specific error

### Admin Login Fails
**Problem**: Admin user not created
**Solution**: Run the admin user creation SQL above

---

## 📊 What's Different From Old Database

Your **NEW** database is completely empty:
- ❌ No orders
- ❌ No products
- ❌ No licenses
- ❌ No customers
- ❌ No analytics data

This is perfect for launching fresh! You'll need to:
1. Add your products through admin panel
2. Stock license keys
3. Configure any coupons you want

---

## 🚀 Next Steps

1. **Run the database setup SQL** (most important!)
2. **Create admin user**
3. **Setup Discord webhooks**
4. **Restart dev server**
5. **Login to admin panel**
6. **Add your products**
7. **Stock license keys**
8. **Test a purchase**
9. **Launch!** 🎉

---

## 📝 Quick Reference

### New Supabase Project
- **URL**: https://dbshpcygbhnuekcsywel.supabase.co
- **Dashboard**: https://supabase.com/dashboard/project/dbshpcygbhnuekcsywel

### Admin Login
- **URL**: http://localhost:3000/mgmt-x9k2m7/login
- **Password**: `Sk7yL!n3_Adm1n_2026_X9k2M7pQ`

### Files to Run in SQL Editor
1. `COMPLETE_SUPABASE_SETUP.sql` - Creates all tables
2. Admin user creation SQL (above)
3. Discord webhook SQL (above)

---

Good luck with your fresh database! 🎊
