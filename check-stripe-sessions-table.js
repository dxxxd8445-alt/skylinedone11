#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

async function checkStripeSessionsTable() {
  console.log('🔍 Checking stripe_sessions table...\n');
  
  const supabase = createAdminClient();
  
  try {
    // Try to query the table
    const { data, error } = await supabase
      .from('stripe_sessions')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ stripe_sessions table error:', error.message);
      
      if (error.message.includes('does not exist') || error.code === '42P01') {
        console.log('💡 Table does not exist. Creating it...\n');
        
        // Create the table using SQL
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS stripe_sessions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            session_id TEXT UNIQUE NOT NULL,
            customer_email TEXT NOT NULL,
            items JSONB NOT NULL,
            coupon_code TEXT,
            coupon_discount_amount DECIMAL(10,2) DEFAULT 0,
            subtotal DECIMAL(10,2) NOT NULL,
            total DECIMAL(10,2) NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Add RLS policies
          ALTER TABLE stripe_sessions ENABLE ROW LEVEL SECURITY;
          
          -- Allow service role to do everything
          CREATE POLICY "Service role can manage stripe_sessions" ON stripe_sessions
            FOR ALL USING (auth.role() = 'service_role');
        `;
        
        const { error: createError } = await supabase.rpc('exec_sql', {
          sql: createTableSQL
        });
        
        if (createError) {
          console.log('❌ Failed to create stripe_sessions table:', createError.message);
          console.log('🔧 Trying alternative method...\n');
          
          // Try creating with individual queries
          const queries = [
            `CREATE TABLE IF NOT EXISTS stripe_sessions (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              session_id TEXT UNIQUE NOT NULL,
              customer_email TEXT NOT NULL,
              items JSONB NOT NULL,
              coupon_code TEXT,
              coupon_discount_amount DECIMAL(10,2) DEFAULT 0,
              subtotal DECIMAL(10,2) NOT NULL,
              total DECIMAL(10,2) NOT NULL,
              status TEXT DEFAULT 'pending',
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )`,
            `ALTER TABLE stripe_sessions ENABLE ROW LEVEL SECURITY`,
            `CREATE POLICY IF NOT EXISTS "Service role can manage stripe_sessions" ON stripe_sessions
              FOR ALL USING (auth.role() = 'service_role')`
          ];
          
          for (const query of queries) {
            const { error: queryError } = await supabase.rpc('exec_sql', { sql: query });
            if (queryError) {
              console.log(`❌ Query failed: ${queryError.message}`);
            }
          }
          
        } else {
          console.log('✅ stripe_sessions table created successfully');
        }
        
        // Test the table again
        const { data: testData, error: testError } = await supabase
          .from('stripe_sessions')
          .select('*')
          .limit(1);
        
        if (testError) {
          console.log('❌ Table still not accessible:', testError.message);
        } else {
          console.log('✅ stripe_sessions table is now accessible');
        }
        
      } else {
        console.log('❌ Other database error:', error.message);
      }
    } else {
      console.log('✅ stripe_sessions table exists and is accessible');
      console.log(`   Found ${data?.length || 0} existing sessions`);
    }
    
    // Test inserting a sample session
    console.log('\n🧪 Testing session insertion...');
    
    const testSession = {
      session_id: 'test_session_' + Date.now(),
      customer_email: 'test@example.com',
      items: JSON.stringify([{
        id: 'test-item',
        productName: 'Test Product',
        price: 9.99,
        quantity: 1
      }]),
      subtotal: 9.99,
      total: 9.99,
      status: 'test'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('stripe_sessions')
      .insert(testSession)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Failed to insert test session:', insertError.message);
    } else {
      console.log('✅ Test session inserted successfully');
      
      // Clean up test session
      await supabase
        .from('stripe_sessions')
        .delete()
        .eq('id', insertData.id);
      
      console.log('🧹 Test session cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }
}

checkStripeSessionsTable().catch(console.error);