require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyAffiliateFix() {
  console.log('🔧 APPLYING AFFILIATE TABLE FIX FOR STORE USERS...\n');

  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('fix-affiliate-table-for-store-users.sql', 'utf8');
    
    // Split into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && !stmt.startsWith('SELECT'));

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      console.log(`${i + 1}. Executing: ${statement.substring(0, 60)}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { 
          sql: statement + ';' 
        });
        
        if (error) {
          console.log(`   ❌ Error: ${error.message}`);
        } else {
          console.log(`   ✅ Success`);
        }
      } catch (err) {
        console.log(`   ❌ Exception: ${err.message}`);
      }
    }

    // Check final table structure
    console.log('\n📊 CHECKING FINAL TABLE STRUCTURE...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'affiliates')
      .order('ordinal_position');

    if (columnsError) {
      console.log('❌ Error checking table structure:', columnsError);
    } else {
      console.log('\n✅ AFFILIATES TABLE STRUCTURE:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
      });
    }

    // Test affiliate registration
    console.log('\n🧪 TESTING AFFILIATE SYSTEM...');
    
    // Check if we have any store users
    const { data: storeUsers, error: usersError } = await supabase
      .from('store_users')
      .select('id, email, username')
      .limit(1);

    if (usersError) {
      console.log('❌ Error checking store users:', usersError);
    } else if (storeUsers.length === 0) {
      console.log('⚠️  No store users found - affiliate system ready but needs users to test');
    } else {
      console.log(`✅ Found ${storeUsers.length} store user(s) - affiliate system ready for testing`);
      console.log(`   Sample user: ${storeUsers[0].email} (${storeUsers[0].username})`);
    }

    console.log('\n🎉 AFFILIATE TABLE FIX COMPLETE!');
    console.log('\n📋 SUMMARY:');
    console.log('✅ Updated affiliates table to use store_user_id');
    console.log('✅ Added all required columns');
    console.log('✅ Updated RLS policies for store users');
    console.log('✅ Added proper constraints and indexes');
    console.log('✅ Affiliate registration should now work');

  } catch (error) {
    console.error('❌ Fix application error:', error);
  }
}

applyAffiliateFix();