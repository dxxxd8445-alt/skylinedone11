require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Simple Discord webhook function
async function sendDiscordWebhook(webhookUrl, payload) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Discord webhook failed:', response.status, response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Discord webhook error:', error);
    return false;
  }
}

function createTestOrderEmbed(orderData) {
  return {
    title: '🎉 New Order Received!',
    description: `A new order has been successfully processed through Stripe.`,
    color: 0x00ff00, // Green color
    fields: [
      {
        name: '💰 Amount',
        value: `$${orderData.amount.toFixed(2)} ${orderData.currency}`,
        inline: true,
      },
      {
        name: '👤 Customer',
        value: orderData.customer_name || 'Unknown',
        inline: true,
      },
      {
        name: '📧 Email',
        value: orderData.customer_email,
        inline: true,
      },
      {
        name: '🔢 Order ID',
        value: orderData.order_number,
        inline: false,
      },
      {
        name: '🛒 Items',
        value: orderData.items.map(item => `• ${item.name} (x${item.quantity}) - $${item.price.toFixed(2)}`).join('\n'),
        inline: false,
      },
    ],
    footer: {
      text: 'Skyline Cheats • Order System',
    },
    timestamp: new Date().toISOString(),
  };
}

async function testDiscordWebhook() {
  console.log('🔍 Testing Discord Webhook...\n');

  try {
    // 1. Get the Discord webhook from database
    console.log('1. Fetching Discord webhook from database...');
    const { data: webhooks, error: webhooksError } = await supabase
      .from('webhooks')
      .select('*')
      .eq('is_active', true);

    if (webhooksError) {
      console.error('❌ Error fetching webhooks:', webhooksError.message);
      return;
    }

    if (!webhooks || webhooks.length === 0) {
      console.log('❌ No active webhooks found');
      return;
    }

    const discordWebhook = webhooks.find(w => w.url.includes('discord.com'));
    if (!discordWebhook) {
      console.log('❌ No Discord webhook found');
      return;
    }

    console.log('✅ Found Discord webhook:', discordWebhook.name);
    console.log('   URL:', discordWebhook.url.substring(0, 50) + '...');

    // 2. Create test order data
    const testOrderData = {
      order_number: 'TEST-' + Date.now(),
      customer_email: 'test@skylinecheats.org',
      customer_name: 'Test Customer',
      amount: 27.99,
      currency: 'USD',
      items: [
        {
          name: 'Arc Raiders - 1 Week',
          quantity: 1,
          price: 27.99,
        }
      ],
    };

    // 3. Send test Discord message
    console.log('\n2. Sending test Discord notification...');
    const embed = createTestOrderEmbed(testOrderData);
    const payload = {
      embeds: [embed],
      username: 'Skyline Cheats',
      content: '🚨 **TEST ORDER NOTIFICATION** 🚨',
    };

    const success = await sendDiscordWebhook(discordWebhook.url, payload);
    
    if (success) {
      console.log('✅ Discord webhook sent successfully!');
      console.log('   Check your Discord channel for the test message');
    } else {
      console.log('❌ Discord webhook failed');
    }

    // 4. Check recent completed orders
    console.log('\n3. Checking recent completed orders...');
    const { data: recentOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(3);

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError.message);
    } else {
      console.log(`📊 Found ${recentOrders?.length || 0} recent completed orders`);
      if (recentOrders && recentOrders.length > 0) {
        console.log('   Recent orders that should have triggered webhooks:');
        recentOrders.forEach((order, index) => {
          const amount = order.amount_cents ? (order.amount_cents / 100).toFixed(2) : 'N/A';
          console.log(`   ${index + 1}. ${order.order_number} - $${amount} - ${order.customer_email}`);
        });
      }
    }

    console.log('\n✅ Discord webhook test completed!');
    console.log('\n📋 Status:');
    console.log('- Discord webhook is configured and active');
    console.log('- Test message sent (check Discord channel)');
    console.log('- Webhooks should trigger automatically on new orders');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDiscordWebhook();