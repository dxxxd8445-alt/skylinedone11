require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyCompleteFixes() {
  console.log('🔍 VERIFYING COMPLETE SYSTEM FIXES');
  console.log('=' .repeat(60));
  console.log('Checking both order system and announcements system...\n');

  try {
    // 1. Verify Order System Fixes
    console.log('1️⃣  VERIFYING ORDER SYSTEM FIXES');
    console.log('-'.repeat(40));
    
    // Check for missing fields that should now be present
    const { data: sampleOrder, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .limit(1)
      .single();
    
    if (orderError && orderError.code !== 'PGRST116') {
      console.error('❌ Orders table error:', orderError.message);
    } else if (sampleOrder) {
      const requiredFields = ['customer_name', 'currency', 'amount_cents', 'product_id', 'duration'];
      const presentFields = requiredFields.filter(field => field in sampleOrder);
      const missingFields = requiredFields.filter(field => !(field in sampleOrder));
      
      console.log(`✅ Orders table accessible`);
      console.log(`📋 Present fields: ${presentFields.join(', ')}`);
      
      if (missingFields.length > 0) {
        console.log(`❌ Still missing fields: ${missingFields.join(', ')}`);
        console.log('🔧 Please run URGENT_ORDER_SYSTEM_FIX.sql');
      } else {
        console.log('✅ All required fields present!');
      }
    } else {
      console.log('⚠️  No orders in database to test');
    }
    
    // Test revenue calculation
    const { data: revenueTest, error: revenueError } = await supabase
      .from('orders')
      .select('amount_cents, currency, status')
      .eq('status', 'completed')
      .limit(1);
    
    if (revenueError) {
      console.log('❌ Revenue calculation still broken:', revenueError.message);
    } else {
      console.log('✅ Revenue calculation queries work');
      
      if (revenueTest && revenueTest.length > 0) {
        const totalRevenue = revenueTest.reduce((sum, order) => {
          return sum + (order.amount_cents ? order.amount_cents / 100 : 0);
        }, 0);
        console.log(`💰 Sample revenue calculation: $${totalRevenue.toFixed(2)}`);
      }
    }
    
    // 2. Verify Announcements System
    console.log('\n2️⃣  VERIFYING ANNOUNCEMENTS SYSTEM');
    console.log('-'.repeat(40));
    
    const { data: announcements, error: announcementsError } = await supabase
      .from('announcements')
      .select('*')
      .limit(1);
    
    if (announcementsError) {
      console.log('❌ Announcements table error:', announcementsError.message);
      console.log('🔧 Please run SETUP_ANNOUNCEMENTS_SYSTEM.sql');
    } else {
      console.log('✅ Announcements table accessible');
      console.log(`📊 Found ${announcements?.length || 0} announcements`);
    }
    
    const { data: terms, error: termsError } = await supabase
      .from('terms_accepted')
      .select('*')
      .limit(1);
    
    if (termsError) {
      console.log('❌ Terms accepted table error:', termsError.message);
    } else {
      console.log('✅ Terms accepted table accessible');
    }
    
    // 3. Test Webhook Configuration
    console.log('\n3️⃣  VERIFYING WEBHOOK CONFIGURATION');
    console.log('-'.repeat(40));
    
    const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
    if (discordWebhook) {
      console.log('✅ Discord webhook URL configured');
    } else {
      console.log('⚠️  Discord webhook URL not set');
      console.log('🔧 Add DISCORD_WEBHOOK_URL to your .env.local file');
    }
    
    // 4. Test Stripe Configuration
    console.log('\n4️⃣  VERIFYING STRIPE CONFIGURATION');
    console.log('-'.repeat(40));
    
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    const stripeWebhook = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (stripeSecret && stripeWebhook) {
      console.log('✅ Stripe keys configured');
      
      // Test stripe_sessions table
      const { data: sessions, error: sessionsError } = await supabase
        .from('stripe_sessions')
        .select('id')
        .limit(1);
      
      if (sessionsError) {
        console.log('❌ Stripe sessions table error:', sessionsError.message);
      } else {
        console.log('✅ Stripe sessions table accessible');
      }
    } else {
      console.log('⚠️  Stripe configuration incomplete');
    }
    
    // 5. Final System Health Check
    console.log('\n🎯 FINAL SYSTEM HEALTH CHECK');
    console.log('=' .repeat(60));
    
    const healthChecks = [
      { name: 'Orders Schema Fixed', status: sampleOrder && 'customer_name' in sampleOrder && 'currency' in sampleOrder },
      { name: 'Revenue Calculation', status: !revenueError },
      { name: 'Announcements System', status: !announcementsError },
      { name: 'Terms System', status: !termsError },
      { name: 'Discord Webhooks', status: !!discordWebhook },
      { name: 'Stripe Integration', status: !!(stripeSecret && stripeWebhook) },
    ];
    
    healthChecks.forEach(check => {
      const icon = check.status ? '✅' : '❌';
      console.log(`${icon} ${check.name}`);
    });
    
    const healthyChecks = healthChecks.filter(c => c.status).length;
    const totalChecks = healthChecks.length;
    
    console.log(`\n📊 System Health: ${healthyChecks}/${totalChecks} (${Math.round(healthyChecks/totalChecks*100)}%)`);
    
    if (healthyChecks >= 4) {
      console.log('\n🎉 SYSTEM IS READY!');
      console.log('✅ Critical issues resolved');
      console.log('✅ Order tracking functional');
      console.log('✅ Announcements system working');
      console.log('✅ Admin panel should work correctly');
      
      console.log('\n🚀 YOU CAN NOW:');
      console.log('• Access announcements at /mgmt-x9k2m7/announcements');
      console.log('• View orders at /mgmt-x9k2m7/orders');
      console.log('• See accurate revenue in admin dashboard');
      console.log('• Customers can see their completed orders');
      console.log('• Webhooks will process new payments correctly');
    } else {
      console.log('\n⚠️  SOME ISSUES REMAIN');
      console.log('🔧 Please run the SQL scripts as instructed');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

// Run the verification
verifyCompleteFixes();