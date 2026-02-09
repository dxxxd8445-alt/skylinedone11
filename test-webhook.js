// Test Discord Webhook
// Run with: node test-webhook.js

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1470214571913646246/QtYckEUaUFeG8ybiRMY1CVH1VnybbxS3-R4fdRECQZ7zGVVwgwSTn2EdI4rseTrFUaHr';

async function testWebhook() {
  console.log('🧪 Testing Discord Webhook...\n');

  const testMessages = [
    {
      title: '🛒 Checkout Started',
      description: 'Customer added items to cart and started checkout',
      color: 3447003, // Blue
      fields: [
        { name: 'Customer', value: 'test@example.com', inline: true },
        { name: 'Items', value: '1x HWID Spoofer', inline: true },
        { name: 'Total', value: '$49.99', inline: true }
      ]
    },
    {
      title: '⏳ Order Pending',
      description: 'Customer is in checkout process',
      color: 16776960, // Yellow
      fields: [
        { name: 'Order ID', value: '#TEST-001', inline: true },
        { name: 'Amount', value: '$49.99', inline: true }
      ]
    },
    {
      title: '✅ Payment Completed',
      description: 'Payment successful!',
      color: 5763719, // Green
      fields: [
        { name: 'Order ID', value: '#TEST-001', inline: true },
        { name: 'Amount', value: '$49.99', inline: true },
        { name: 'Customer', value: 'test@example.com', inline: true }
      ]
    },
    {
      title: '📦 Order Completed',
      description: 'Order fulfilled and license key delivered',
      color: 5763719, // Green
      fields: [
        { name: 'Order ID', value: '#TEST-001', inline: true },
        { name: 'Product', value: 'HWID Spoofer', inline: true },
        { name: 'License Key', value: 'XXXX-XXXX-XXXX-XXXX', inline: true }
      ]
    }
  ];

  for (const message of testMessages) {
    try {
      console.log(`Sending: ${message.title}...`);
      
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          embeds: [{
            title: message.title,
            description: message.description,
            color: message.color,
            fields: message.fields,
            timestamp: new Date().toISOString(),
            footer: {
              text: 'Skyline Cheats'
            }
          }]
        })
      });

      if (response.ok) {
        console.log(`✅ ${message.title} sent successfully!\n`);
      } else {
        console.log(`❌ Failed to send ${message.title}: ${response.status}\n`);
      }

      // Wait 2 seconds between messages
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Error sending ${message.title}:`, error.message, '\n');
    }
  }

  console.log('✅ Webhook test complete!');
  console.log('Check your Discord channel for the test messages.');
}

testWebhook();
