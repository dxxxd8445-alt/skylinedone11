/**
 * Test Database Setup for Stripe
 * This checks if the required tables exist
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bcjzfqvomwtuyznnlxha.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjanpmcXZvbXd0dXl6bm5seGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3MDU1NSwiZXhwIjoyMDg1NDQ2NTU1fQ.1gp_MzZ1cU2ec4a2PwinO7wNr6I3YXz6wGHhSuORpvk'
);

async function testDatabaseSetup() {
  console.log('🗄️  Testing Database Setup...\n');

  try {
    // Test stripe_sessions table
    console.log('1️⃣ Checking stripe_sessions table...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('stripe_sessions')
      .select('*')
      .limit(1);

    if (sessionsError) {
      console.log('❌ stripe_sessions table not found:', sessionsError.message);
      console.log('   Please run the run-stripe-setup.sql script in Supabase');
    } else {
      console.log('✅ stripe_sessions table exists');
    }

    // Test orders table columns
    console.log('2️⃣ Checking orders table Stripe columns...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('payment_method, stripe_session_id, payment_intent_id')
      .limit(1);

    if (ordersError) {
      console.log('❌ Orders table missing Stripe columns:', ordersError.message);
      console.log('   Please run the run-stripe-setup.sql script in Supabase');
    } else {
      console.log('✅ Orders table has Stripe columns');
    }

    // Test licenses table columns
    console.log('3️⃣ Checking licenses table order tracking...');
    const { data: licenses, error: licensesError } = await supabase
      .from('licenses')
      .select('order_id, assigned_at')
      .limit(1);

    if (licensesError) {
      console.log('❌ Licenses table missing order tracking:', licensesError.message);
      console.log('   Please run the run-stripe-setup.sql script in Supabase');
    } else {
      console.log('✅ Licenses table has order tracking');
    }

    console.log('\n📋 Database Setup Status:');
    console.log('========================');
    
    if (!sessionsError && !ordersError && !licensesError) {
      console.log('✅ Database setup is COMPLETE');
      console.log('✅ All required tables and columns exist');
      console.log('✅ Stripe integration should work properly');
    } else {
      console.log('❌ Database setup is INCOMPLETE');
      console.log('⚠️  Please run the run-stripe-setup.sql script in Supabase SQL Editor');
      console.log('   This will create the missing tables and columns');
    }

  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testDatabaseSetup();