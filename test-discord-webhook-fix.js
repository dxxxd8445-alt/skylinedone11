require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDiscordWebhookSystem() {
  console.log('🔍 Testing Discord Webhook System...\n');

  try {
    // 1. Check if webhooks table exists and has Discord webhooks
    console.log('1. Checking webhooks table...');
    const { data: webhooks, error: webhooksError } = await supabase
      .from('webhooks')
      .select('*');

    if (webhooksError) {
      console.error('❌ Error fetching webhooks:', webhooksError.message);
      return;
    }

    console.log(`📊 Found ${webhooks?.length || 0} webhooks in database`);
    
    if (webhooks && webhooks.length > 0) {
      webhooks.forEach((webhook, index) => {
        console.log(`   ${index + 1}. ${webhook.name}: ${webhook.url}`);
        console.log(`      Events: ${JSON.stringify(webhook.events)}`);
        console.log(`      Active: ${webhook.is_active}`);
      });
    } else {
      console.log('⚠️  No webhooks found in database');
      
      // Create a test Discord webhook entry
      console.log('\n2. Creating test Discord webhook entry...');
      const testWebhook = {
        name: 'Discord Order Notifications',
        url: 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN',
        events: ['payment.completed', 'order.completed', 'payment.failed'],
        is_active: false, // Set to false until user provides real webhook URL
        created_at: new Date().toISOString(),
      };

      const { data: newWebhook, error: createError } = await supabase
        .from('webhooks')
        .insert(testWebhook)
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating test webhook:', createError.message);
      } else {
        console.log('✅ Test webhook entry created:', newWebhook.name);
        console.log('   📝 Note: Update the URL with your actual Discord webhook URL');
      }
    }

    // 3. Test the Discord webhook function
    console.log('\n3. Testing Discord webhook function...');
    
    // Import the Discord webhook function
    const { triggerWebhooks } = require('./lib/discord-webhook.ts');
    
    // Test data
    const testOrderData = {
      order_number: 'TEST-12345678',
      customer_email: 'test@example.com',
      customer_name: 'Test Customer',
      amount: 27.99,
      currency: 'USD',
      payment_intent_id: 'pi_test_123456789',
      stripe_session_id: 'cs_test_123456789',
      items: [
        {
          name: 'Test Product - 1 Month',
          quantity: 1,
          price: 27.99,
        }
      ],
    };

    console.log('📤 Attempting to trigger test webhook...');
    await triggerWebhooks('payment.completed', testOrderData);
    console.log('✅ Webhook trigger function executed (check Discord for message)');

    // 4. Check recent orders to see if webhooks should have been triggered
    console.log('\n4. Checking recent orders...');
    const { data: recentOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(5);

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError.message);
    } else {
      console.log(`📊 Found ${recentOrders?.length || 0} recent completed orders`);
      if (recentOrders && recentOrders.length > 0) {
        recentOrders.forEach((order, index) => {
          console.log(`   ${index + 1}. ${order.order_number} - $${(order.amount_cents / 100).toFixed(2)} - ${order.customer_email}`);
        });
      }
    }

    console.log('\n✅ Discord webhook system test completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Get your Discord webhook URL from your Discord server settings');
    console.log('2. Update the webhook URL in the database');
    console.log('3. Set is_active to true for the webhook');
    console.log('4. Test with a real order to verify notifications work');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDiscordWebhookSystem();