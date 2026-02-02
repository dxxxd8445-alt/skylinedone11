require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugIssues() {
  console.log('🔍 DEBUGGING PASSWORD RESET AND AFFILIATE ISSUES\n');

  try {
    // 1. Check store_users table structure
    console.log('1️⃣ CHECKING STORE_USERS TABLE...');
    const { data: storeUsers, error: storeUsersError } = await supabase
      .from('store_users')
      .select('*')
      .limit(1);

    if (storeUsersError) {
      console.log('❌ Store users table error:', storeUsersError);
    } else {
      console.log('✅ Store users table accessible');
      if (storeUsers.length > 0) {
        console.log('   Sample columns:', Object.keys(storeUsers[0]));
      }
    }

    // 2. Check affiliates table structure
    console.log('\n2️⃣ CHECKING AFFILIATES TABLE...');
    const { data: affiliates, error: affiliatesError } = await supabase
      .from('affiliates')
      .select('*')
      .limit(1);

    if (affiliatesError) {
      console.log('❌ Affiliates table error:', affiliatesError);
      console.log('   This might be why affiliate registration is failing');
    } else {
      console.log('✅ Affiliates table accessible');
      if (affiliates.length > 0) {
        console.log('   Sample columns:', Object.keys(affiliates[0]));
      }
    }

    // 3. Check if we have any password reset tokens
    console.log('\n3️⃣ CHECKING PASSWORD RESET TOKENS...');
    const { data: resetTokens, error: resetError } = await supabase
      .from('store_users')
      .select('id, email, password_reset_token, password_reset_expires_at')
      .not('password_reset_token', 'is', null);

    if (resetError) {
      console.log('❌ Error checking reset tokens:', resetError);
    } else {
      console.log(`✅ Found ${resetTokens.length} active reset tokens`);
      resetTokens.forEach(token => {
        const expires = new Date(token.password_reset_expires_at);
        const isExpired = expires.getTime() < Date.now();
        console.log(`   - ${token.email}: ${isExpired ? '❌ EXPIRED' : '✅ VALID'} (expires: ${expires.toLocaleString()})`);
      });
    }

    // 4. Test affiliate table creation if it doesn't exist
    if (affiliatesError && affiliatesError.code === 'PGRST116') {
      console.log('\n4️⃣ CREATING MISSING AFFILIATES TABLE...');
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS affiliates (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          affiliate_code TEXT UNIQUE NOT NULL,
          commission_rate DECIMAL(5,2) DEFAULT 5.00,
          payment_email TEXT NOT NULL,
          payment_method TEXT DEFAULT 'paypal',
          status TEXT DEFAULT 'active',
          total_earnings DECIMAL(10,2) DEFAULT 0.00,
          total_clicks INTEGER DEFAULT 0,
          total_referrals INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Users can view their own affiliate data" ON affiliates
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own affiliate data" ON affiliates
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own affiliate data" ON affiliates
          FOR UPDATE USING (auth.uid() = user_id);
      `;

      try {
        const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
        if (createError) {
          console.log('❌ Failed to create affiliates table:', createError);
        } else {
          console.log('✅ Affiliates table created successfully');
        }
      } catch (err) {
        console.log('❌ Error creating table:', err);
      }
    }

    // 5. Check auth.users table
    console.log('\n5️⃣ CHECKING AUTH USERS...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Auth users error:', authError);
    } else {
      console.log(`✅ Found ${authUsers.users.length} auth users`);
    }

    console.log('\n🔧 POTENTIAL FIXES:');
    console.log('1. Password Reset Issues:');
    console.log('   - Check if reset tokens are being generated correctly');
    console.log('   - Verify token expiration logic');
    console.log('   - Ensure password hashing is working');
    
    console.log('\n2. Affiliate Registration Issues:');
    console.log('   - Verify affiliates table exists and has correct structure');
    console.log('   - Check RLS policies allow user operations');
    console.log('   - Ensure user authentication is working');

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugIssues();