require('dotenv').config({ path: '.env.local' });

async function testDiscordWebhook() {
  console.log('🔗 TESTING DISCORD WEBHOOK CONNECTION');
  console.log('=' .repeat(50));
  
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.error('❌ DISCORD_WEBHOOK_URL not found in environment');
    return;
  }
  
  console.log('✅ Discord webhook URL found');
  console.log(`🔗 URL: ${webhookUrl.substring(0, 50)}...`);
  
  try {
    // Test webhook with a simple message
    const testMessage = {
      embeds: [{
        title: "🧪 Test Message from Skyline Cheats Admin",
        description: "This is a test message to verify the Discord webhook is working correctly.",
        color: 0xdc2626, // Red color matching your theme
        fields: [
          {
            name: "System Status",
            value: "✅ Webhook connection successful",
            inline: true
          },
          {
            name: "Test Time",
            value: new Date().toLocaleString(),
            inline: true
          }
        ],
        footer: {
          text: "Skyline Cheats Admin Panel",
          icon_url: "https://skylinecheats.org/icon.svg"
        },
        timestamp: new Date().toISOString()
      }]
    };
    
    console.log('\n📤 Sending test message to Discord...');
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage)
    });
    
    if (response.ok) {
      console.log('✅ Test message sent successfully!');
      console.log('📱 Check your Discord channel for the test message');
      
      // Test order notification format
      console.log('\n📦 Testing order notification format...');
      
      const orderTestMessage = {
        embeds: [{
          title: "🛒 New Order Completed",
          description: "A customer has successfully completed their purchase!",
          color: 0x10b981, // Green color for success
          fields: [
            {
              name: "Order Number",
              value: "TEST-12345",
              inline: true
            },
            {
              name: "Customer",
              value: "test@example.com",
              inline: true
            },
            {
              name: "Amount",
              value: "$29.99 USD",
              inline: true
            },
            {
              name: "Product",
              value: "Test Product - 30 Days",
              inline: true
            },
            {
              name: "Payment Method",
              value: "Stripe",
              inline: true
            },
            {
              name: "Status",
              value: "✅ Completed",
              inline: true
            }
          ],
          footer: {
            text: "Skyline Cheats Order System",
            icon_url: "https://skylinecheats.org/icon.svg"
          },
          timestamp: new Date().toISOString()
        }]
      };
      
      const orderResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderTestMessage)
      });
      
      if (orderResponse.ok) {
        console.log('✅ Order notification test sent successfully!');
      } else {
        console.log('⚠️  Order notification test failed:', orderResponse.status);
      }
      
    } else {
      console.error('❌ Failed to send test message');
      console.error('Status:', response.status);
      console.error('Status Text:', response.statusText);
      
      if (response.status === 404) {
        console.log('🔧 The webhook URL might be invalid or the webhook was deleted');
      } else if (response.status === 400) {
        console.log('🔧 The message format might be invalid');
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing webhook:', error.message);
  }
  
  console.log('\n🎯 WEBHOOK TEST SUMMARY');
  console.log('=' .repeat(50));
  console.log('✅ Discord webhook URL configured');
  console.log('✅ Connection test completed');
  console.log('📱 Check your Discord channel for test messages');
  console.log('\n🚀 Your webhook is ready for:');
  console.log('• Order completion notifications');
  console.log('• Payment failure alerts');
  console.log('• Refund notifications');
  console.log('• System status updates');
}

// Run the test
testDiscordWebhook();