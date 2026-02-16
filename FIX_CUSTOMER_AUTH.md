# 🔧 FIX CUSTOMER LOGIN/SIGNUP

## ❌ PROBLEM
Customer dashboard login and signup not working.

## ✅ SOLUTION (2 STEPS)

### STEP 1: Add Session Secret to .env.local

Open `magma src/.env.local` and add this line:

```env
STORE_SESSION_SECRET=ring-0-store-secret-key-2026-change-in-production
```

### STEP 2: Verify Database Table

Run this SQL in Supabase to ensure the table is correct:

```sql
-- Check if store_users table exists and has correct structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'store_users'
ORDER BY ordinal_position;

-- If table is missing or wrong, recreate it:
DROP TABLE IF EXISTS store_users CASCADE;

CREATE TABLE store_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_store_users_email ON store_users(email);

-- Enable RLS
ALTER TABLE store_users ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow all for service role" ON store_users FOR ALL USING (true);

-- Test insert
INSERT INTO store_users (email, username, password_hash) 
VALUES ('test@example.com', 'testuser', 'test123')
ON CONFLICT (email) DO NOTHING;

-- Verify
SELECT id, email, username, created_at FROM store_users;
```

## 🧪 TEST IT

1. **Restart your dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Then start again:
   npm run dev
   ```

2. **Try to sign up:**
   - Go to `http://localhost:3000/account`
   - Click "Sign Up"
   - Enter: username, email, password
   - Click "Create Account"

3. **Should work!** ✅

## 🔍 TROUBLESHOOTING

### Error: "Sign up failed"
**Check:**
1. Is `STORE_SESSION_SECRET` in `.env.local`?
2. Did you restart the dev server?
3. Check browser console for errors (F12)

### Error: "Email already exists"
**Solution:**
```sql
-- Delete test user
DELETE FROM store_users WHERE email = 'your@email.com';
```

### Error: "Database error"
**Check:**
1. Is Supabase running?
2. Are environment variables correct?
3. Run the SQL script above

### Still not working?
**Check browser console (F12):**
- Look for red errors
- Check Network tab for failed requests
- Look for 400/500 status codes

**Check terminal:**
- Look for error messages
- Check if server is running
- Verify environment variables loaded

## ✅ VERIFICATION

After fixing, you should be able to:
- ✅ Sign up with new account
- ✅ Sign in with existing account
- ✅ See customer dashboard
- ✅ View orders and licenses
- ✅ Register as affiliate

---

**Time to fix:** 2 minutes
**Difficulty:** Easy
