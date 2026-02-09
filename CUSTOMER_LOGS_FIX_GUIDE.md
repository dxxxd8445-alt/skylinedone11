# 🔧 CUSTOMER LOGS FIX GUIDE

## ❓ PROBLEM
Customer Logs page shows "No store accounts yet" even though you have orders.

## 💡 SOLUTION
Customers are stored in the `store_users` table. You need to:
1. Ensure the table exists
2. Create customer accounts from existing orders

---

## 🚀 QUICK FIX (2 STEPS)

### Step 1: Create store_users Table
**File:** `FIX_CUSTOMER_LOGS.sql`

1. Open Supabase SQL Editor
2. Copy entire contents of `FIX_CUSTOMER_LOGS.sql`
3. Paste and click "Run"
4. Wait for "Success" message

**What this does:**
- Creates `store_users` table if missing
- Adds indexes for performance
- Sets up Row Level Security (RLS)
- Adds triggers for updated_at

### Step 2: Create Customers from Orders
**File:** `CREATE_CUSTOMERS_FROM_ORDERS.sql`

1. Open Supabase SQL Editor
2. Copy entire contents of `CREATE_CUSTOMERS_FROM_ORDERS.sql`
3. Paste and click "Run"
4. Wait for "Success" message

**What this does:**
- Creates customer accounts for all existing orders
- Links orders to customers by email
- Links licenses to customers by email
- Shows summary statistics

---

## ✅ VERIFICATION

After running both scripts, check:

### 1. Customer Logs Page
- Go to `http://localhost:3000/mgmt-x9k2m7/logins`
- Should see all customers listed
- Should show order count and license count for each

### 2. Run Verification Query
```sql
-- Check customer count
SELECT COUNT(*) as total_customers FROM store_users;

-- Check customers with orders
SELECT 
  su.email,
  su.username,
  COUNT(o.id) as orders,
  COUNT(l.id) as licenses
FROM store_users su
LEFT JOIN orders o ON LOWER(o.customer_email) = LOWER(su.email)
LEFT JOIN licenses l ON LOWER(l.customer_email) = LOWER(su.email)
GROUP BY su.id, su.email, su.username
ORDER BY orders DESC;
```

---

## 📊 UNDERSTANDING THE SYSTEM

### How Customers Work

1. **Customer Creation**
   - Customers are created when users sign up at `/account`
   - OR created from existing orders (using the script)

2. **Order Linking**
   - Orders are linked to customers by email
   - Case-insensitive matching
   - Works even if customer signed up after purchase

3. **License Linking**
   - Licenses are linked to customers by email
   - Shows in customer dashboard
   - Shows in admin customer logs

### Customer vs Guest Checkout

- **Guest Checkout:** Order created without customer account
- **Customer Account:** User signs up, can view all orders by email
- **Admin View:** Links all orders/licenses to customer by email

---

## 🔐 CUSTOMER LOGIN

### For Existing Orders (After Running Scripts)

Customers created from orders have random passwords. They need to:

1. Go to `http://localhost:3000/account`
2. Click "Forgot Password?"
3. Enter their email (from order)
4. Receive password reset email
5. Set new password
6. Login and see their orders/licenses

### For New Customers

New customers can:
1. Sign up at `/account`
2. Set their own password
3. Immediately see their orders (if email matches)

---

## 📋 WHAT YOU'LL SEE

### Customer Logs Page Shows:

| Column | Description |
|--------|-------------|
| Avatar | Customer profile picture |
| Email | Customer email address |
| Username | Customer display name |
| Orders | Number of orders |
| Licenses | Number of license keys |
| Created | Account creation date |
| Actions | View details, Reset password |

### Customer Details Modal Shows:

- **Account Info:** Email, username, phone, created date
- **Stats:** Total orders, license keys, last login
- **Order History:** All orders with status and amounts
- **Delivered Products:** All license keys with copy button

---

## 🎯 COMMON SCENARIOS

### Scenario 1: No Customers, Have Orders
**Solution:** Run `CREATE_CUSTOMERS_FROM_ORDERS.sql`
- Creates customers from all existing orders
- Links by email automatically

### Scenario 2: Some Customers Missing
**Solution:** Run `CREATE_CUSTOMERS_FROM_ORDERS.sql` again
- Script checks for existing customers
- Only creates missing ones
- Safe to run multiple times

### Scenario 3: Customer Can't Login
**Solution:** Use "Reset Password" in admin panel
1. Go to Customer Logs
2. Find customer
3. Click "Reset" button
4. Set new password
5. Customer can login immediately

### Scenario 4: Orders Not Showing for Customer
**Check:**
1. Email matches exactly (case-insensitive)
2. Order has `customer_email` field filled
3. Run verification query to check linking

---

## 🔍 TROUBLESHOOTING

### Issue: Table doesn't exist
**Error:** `relation "store_users" does not exist`
**Fix:** Run `FIX_CUSTOMER_LOGS.sql`

### Issue: No customers created
**Check:**
1. Do you have orders in `orders` table?
   ```sql
   SELECT COUNT(*) FROM orders;
   ```
2. Do orders have email addresses?
   ```sql
   SELECT customer_email FROM orders LIMIT 10;
   ```
3. Run `CREATE_CUSTOMERS_FROM_ORDERS.sql` again

### Issue: Customers show 0 orders
**Check:**
1. Email matching is case-insensitive
2. Run this query:
   ```sql
   SELECT 
     su.email as customer_email,
     o.customer_email as order_email,
     LOWER(su.email) = LOWER(o.customer_email) as matches
   FROM store_users su
   LEFT JOIN orders o ON LOWER(o.customer_email) = LOWER(su.email)
   LIMIT 10;
   ```

### Issue: Permission denied
**Error:** `permission denied for table store_users`
**Fix:** 
1. Check RLS policies
2. Run `FIX_CUSTOMER_LOGS.sql` again
3. Ensure using service role key in `.env.local`

---

## 📝 SQL SCRIPTS SUMMARY

### 1. FIX_CUSTOMER_LOGS.sql
- Creates `store_users` table
- Sets up indexes and RLS
- Adds triggers
- **Run this FIRST**

### 2. CREATE_CUSTOMERS_FROM_ORDERS.sql
- Creates customers from orders
- Links orders and licenses
- Shows statistics
- **Run this SECOND**

### 3. COMPLETE_DATABASE_WITH_AFFILIATE.sql
- Complete database setup
- Includes `store_users` table
- **Alternative:** Run this instead of FIX_CUSTOMER_LOGS.sql

---

## ✅ SUCCESS CHECKLIST

After running the scripts, verify:

- [ ] `store_users` table exists in Supabase
- [ ] Customer Logs page shows customers
- [ ] Customer count matches order count (or close)
- [ ] Clicking "View" shows order history
- [ ] Clicking "View" shows license keys
- [ ] Order count and license count are correct
- [ ] Can reset customer passwords
- [ ] Customers can login at `/account`

---

## 🎉 EXPECTED RESULTS

### Before Fix:
```
Total accounts: 0
With orders: 0
With licenses: 0
Table: "No store accounts yet"
```

### After Fix:
```
Total accounts: 15
With orders: 12
With licenses: 10
Table: Shows all customers with details
```

---

## 💡 TIPS

1. **Run scripts in order:** FIX_CUSTOMER_LOGS.sql → CREATE_CUSTOMERS_FROM_ORDERS.sql
2. **Safe to re-run:** Both scripts check for existing data
3. **Email matching:** Case-insensitive, automatic
4. **Password reset:** Use admin panel or "Forgot Password"
5. **Guest orders:** Still work, just not linked to account until customer signs up

---

## 📞 STILL HAVING ISSUES?

If customers still don't show:

1. Check Supabase logs for errors
2. Verify `store_users` table exists
3. Check orders have `customer_email` field
4. Run verification queries above
5. Check browser console for errors
6. Verify admin authentication is working

---

**Status:** Ready to fix!
**Time:** 5 minutes
**Difficulty:** Easy
**Files:** 2 SQL scripts
