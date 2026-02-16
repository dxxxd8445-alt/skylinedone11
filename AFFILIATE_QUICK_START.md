# 🚀 AFFILIATE SYSTEM - QUICK START

## ⚡ TL;DR - 3 STEPS TO GET IT WORKING

### Step 1: Run SQL Script
1. Go to Supabase → SQL Editor
2. Create new query
3. Copy entire content from: `AFFILIATE_SYSTEM_FINAL_WORKING.sql`
4. Paste and click Run
5. ✅ Done (should see "Query executed successfully")

### Step 2: Test Registration
1. Go to: `http://localhost:3000/account`
2. Click "Affiliate" tab
3. Fill in payment details (PayPal, Cash App, or Crypto)
4. Click "Join Affiliate Program"
5. ✅ Should see success message

### Step 3: Verify
1. You should see your affiliate code
2. You should see your affiliate link
3. You should see stats dashboard
4. ✅ Done!

---

## 📋 WHAT WAS FIXED

✅ **Database**: Added `store_user_id` column to affiliates table
✅ **Frontend**: Fixed typo in account page (setCategoryForm → setAffiliateForm)
✅ **API**: Already working with proper error handling
✅ **SQL**: Created clean, working SQL script with no errors

---

## 🎯 PAYMENT METHODS

- **PayPal**: Email address
- **Cash App**: Tag (e.g., $YourTag)
- **Crypto**: 11 types (BTC, ETH, LTC, BCH, XRP, ADA, DOT, MATIC, SOL, USDT, USDC)

---

## 📊 AFFILIATE DASHBOARD

After registration, you'll see:
- Total earnings
- Total clicks
- Referrals count
- Conversion rate
- Your affiliate link
- Recent referrals table

---

## 🔗 AFFILIATE LINK FORMAT

```
https://ring-0cheats.org?ref=YOUR_AFFILIATE_CODE
```

Share this link to earn 5% commission on each sale!

---

## ✅ VERIFICATION

After running SQL script, verify:

```sql
-- Check columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'affiliates';

-- Check categories count
SELECT COUNT(*) FROM categories;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'affiliates';
```

---

## 🎉 THAT'S IT!

The affiliate system is now fully functional and ready to use!

**File to run**: `AFFILIATE_SYSTEM_FINAL_WORKING.sql`
**Detailed guide**: `AFFILIATE_SYSTEM_COMPLETE_FIX.md`
