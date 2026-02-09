/**
 * COMPREHENSIVE WEBHOOK TEST SCRIPT
 * Tests all 7 webhook events with enhanced Discord embeds
 * 
 * Run with: node test-all-webhooks.js
 */

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1470214571913646246/QtYckEUaUFeG8ybiRMY1CVH1VnybbxS3-R4fdRECQZ7zGVVwgwSTn2EdI4rseTrFUaHr';

// Test data for each event type
const testEvents = {
  'checkout.started': {
    customer_email: 'test@skylinecheats.org',
    customer_name: 'John Doe',
    session_id: 'cs_test_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
    items: [
      { name: 'Fortnite Cheat - 30 Days', quantity: 1, price: 29.99 },
      { name: 'HWID Spoofer - Lifetime', quantity: 1, price: 49.99 }
    ],
    subtotal: 79.98,
    discount: 8.00,
    total: 71.98,
    currency: 'USD'
  },
  
  'order.pending': {
    order_number: 'ORD-TEST-12345',
    customer_email: 'test@skylinecheats.org',
    customer_name: 'John Doe',
    amount: 71.98,
    currency: 'USD',
    payment_method: 'Stripe Card',
    items: [
      { name: 'Fortnite Cheat - 30 Days', quantity: 1, price: 29.99 },
      { name: 'HWID Spoofer - Lifetime', quantity: 1, price: 49.99 }
    ]
  },
  
  'payment.completed': {
    order_number: 'ORD-TEST-12345',
    customer_email: 'test@skylinecheats.org',
    customer_name: 'John Doe',
    amount: 71.98,
    currency: 'USD',
    items: [
      { name: 'Fortnite Cheat - 30 Days', quantity: 1, price: 29.99 },
      { name: 'HWID Spoofer - Lifetime', quantity: 1, price: 49.99 }
    ]
  },
  
  'order.completed': {
    order_number: 'ORD-TEST-12345',
    customer_email: 'test@skylinecheats.org',
    customer_name: 'John Doe',
    amount: 71.98,
    currency: 'USD',
    items: [
      { name: 'Fortnite Cheat - 30 Days', quantity: 1, price: 29.99 },
      { name: 'HWID Spoofer - Lifetime', quantity: 1, price: 49.99 }
    ]
  },
  
  'payment.failed': {
    payment_intent_id: 'pi_test_1234567890abcdef',
    order_number: 'ORD-TEST-12346',
    customer_email: 'test@skylinecheats.org',
    customer_name: 'Jane Smith',
    amount: 29.99,
    currency: 'USD',
    error_message: 'Your card was declined. Please try a different payment method or contact your bank.'
  },
  
  'order.refunded': {
    order_number: 'ORD-TEST-12345',
    customer_email: 'test@skylinecheats.org',
    customer_name: 'John Doe',
    amount: 71.98,
    currency: 'USD',
    reason: 'Customer requested refund due to compatibility issues with their system.'
  },
  
  'order.disputed': {
    order_number: 'ORD-TEST-12347',
    customer_email: 'dispute@example.com',
    customer_name: 'Dispute User',
    amount: 49.99,
    currency: 'USD',
    dispute_reason: 'Customer filed a chargeback with their bank',
    dispute_status: 'needs_response'
  }
};

// Create embed functions (matching the TypeScript implementation)
function createCheckoutStartedEmbed(data) {
  const fields = [
    { name: '👤 Customer Name', value: `\`${data.customer_name || 'Guest'}\``, inline: true },
    { name: '📧 Email Address', value: `\`${data.customer_email}\``, inline: true },
    { name: '💰 Total Amount', value: `**$${data.total.toFixed(2)} ${data.currency.toUpperCase()}**`, inline: true }
  ];

  if (data.items && data.items.length > 0) {
    const itemsText = data.items
      .map(item => `🎮 **${item.name}**\n   └ Qty: ${item.quantity} × $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}`)
      .join('\n\n');
    fields.push({ name: '🛒 Cart Items', value: itemsText, inline: false });
  }

  if (data.subtotal) {
    fields.push({ name: '📊 Subtotal', value: `$${data.subtotal.toFixed(2)}`, inline: true });
  }

  if (data.discount && data.discount > 0) {
    fields.push({ name: '🎟️ Discount Applied', value: `**-$${data.discount.toFixed(2)}**`, inline: true });
  }

  fields.push({ name: '🔑 Session ID', value: `\`${data.session_id.substring(0, 30)}...\``, inline: false });

  return {
    title: '🛒 New Checkout Started!',
    description: '🎯 A customer has initiated checkout and is reviewing their order.',
    color: 0x3b82f6,
    fields,
    footer: { text: 'Skyline Cheats • Checkout System' },
    timestamp: new Date().toISOString()
  };
}

function createPendingOrderEmbed(data) {
  const fields = [
    { name: '🔖 Order Number', value: `\`${data.order_number}\``, inline: false },
    { name: '💳 Payment Amount', value: `**$${data.amount.toFixed(2)} ${data.currency.toUpperCase()}**`, inline: true },
    { name: '👤 Customer', value: `\`${data.customer_name || data.customer_email}\``, inline: true },
    { name: '💰 Payment Method', value: data.payment_method || 'Stripe', inline: true },
    { name: '📧 Email', value: `\`${data.customer_email}\``, inline: false }
  ];

  if (data.items && data.items.length > 0) {
    const itemsText = data.items
      .map(item => `⏳ **${item.name}**\n   └ Qty: ${item.quantity} × $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}`)
      .join('\n\n');
    fields.push({ name: '📦 Order Items', value: itemsText, inline: false });
  }

  fields.push({ name: '⏰ Status', value: '**PENDING** - Awaiting payment confirmation...', inline: false });

  return {
    title: '⏳ Order Pending Payment',
    description: '💳 A new order has been created and is awaiting payment confirmation from Stripe.',
    color: 0xf59e0b,
    fields,
    footer: { text: 'Skyline Cheats • Order System' },
    timestamp: new Date().toISOString()
  };
}

function createCompletedOrderEmbed(data) {
  const fields = [
    { name: '🎉 Order Number', value: `\`${data.order_number}\``, inline: false },
    { name: '💵 Payment Amount', value: `**$${data.amount.toFixed(2)} ${data.currency.toUpperCase()}**`, inline: true },
    { name: '👤 Customer', value: `\`${data.customer_name || 'Guest'}\``, inline: true },
    { name: '📧 Email', value: `\`${data.customer_email}\``, inline: true }
  ];

  if (data.items && data.items.length > 0) {
    const itemsText = data.items
      .map(item => `✅ **${item.name}**\n   └ Qty: ${item.quantity} × $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}`)
      .join('\n\n');
    fields.push({ name: '📦 Purchased Items', value: itemsText, inline: false });
  }

  fields.push({ name: '✨ Status', value: '**COMPLETED** - Payment processed successfully!', inline: false });

  return {
    title: '✅ Order Completed Successfully!',
    description: '🎊 **Ka-ching!** A new order has been successfully processed and payment confirmed.',
    color: 0x10b981,
    fields,
    footer: { text: 'Skyline Cheats • Order System' },
    timestamp: new Date().toISOString()
  };
}

function createPaymentFailedEmbed(data) {
  const fields = [];

  if (data.order_number) {
    fields.push({ name: '🔖 Order Number', value: `\`${data.order_number}\``, inline: false });
  }

  if (data.payment_intent_id) {
    fields.push({ name: '🔑 Payment Intent ID', value: `\`${data.payment_intent_id}\``, inline: false });
  }

  if (data.customer_name) {
    fields.push({ name: '👤 Customer Name', value: `\`${data.customer_name}\``, inline: true });
  }

  if (data.customer_email) {
    fields.push({ name: '📧 Customer Email', value: `\`${data.customer_email}\``, inline: true });
  }

  if (data.amount && data.currency) {
    fields.push({ name: '💸 Failed Amount', value: `**$${data.amount.toFixed(2)} ${data.currency.toUpperCase()}**`, inline: true });
  }

  if (data.error_message) {
    fields.push({ name: '⚠️ Error Details', value: `\`\`\`${data.error_message}\`\`\``, inline: false });
  }

  fields.push({ name: '❌ Status', value: '**FAILED** - Payment could not be processed', inline: false });

  return {
    title: '❌ Payment Failed',
    description: '⚠️ A payment attempt has failed. Customer may retry or contact support.',
    color: 0xef4444,
    fields,
    footer: { text: 'Skyline Cheats • Payment System' },
    timestamp: new Date().toISOString()
  };
}

function createRefundEmbed(data) {
  const fields = [
    { name: '🔖 Order Number', value: `\`${data.order_number}\``, inline: false },
    { name: '💸 Refund Amount', value: `**$${data.amount.toFixed(2)} ${data.currency.toUpperCase()}**`, inline: true },
    { name: '👤 Customer', value: `\`${data.customer_name || 'Guest'}\``, inline: true },
    { name: '📧 Email', value: `\`${data.customer_email}\``, inline: true }
  ];

  if (data.reason) {
    fields.push({ name: '📝 Refund Reason', value: data.reason, inline: false });
  } else {
    fields.push({ name: '📝 Refund Reason', value: 'No reason provided', inline: false });
  }

  fields.push({ name: '🔄 Status', value: '**REFUNDED** - Funds returned to customer', inline: false });

  return {
    title: '🔄 Order Refunded',
    description: '💰 A refund has been processed and funds are being returned to the customer.',
    color: 0x8b5cf6,
    fields,
    footer: { text: 'Skyline Cheats • Refund System' },
    timestamp: new Date().toISOString()
  };
}

// Send webhook function
async function sendWebhook(eventType, embed) {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [embed],
        username: 'Skyline Cheats'
      })
    });

    if (response.ok) {
      console.log(`✅ ${eventType} webhook sent successfully!`);
      return true;
    } else {
      console.error(`❌ ${eventType} webhook failed:`, response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error(`❌ ${eventType} webhook error:`, error.message);
    return false;
  }
}

// Main test function
async function testAllWebhooks() {
  console.log('🚀 Starting comprehensive webhook test...\n');
  console.log('📍 Webhook URL:', WEBHOOK_URL);
  console.log('📊 Testing 7 webhook events\n');
  console.log('=' .repeat(60));

  const results = [];

  // Test 1: Checkout Started
  console.log('\n1️⃣ Testing: checkout.started');
  const checkoutEmbed = createCheckoutStartedEmbed(testEvents['checkout.started']);
  results.push(await sendWebhook('checkout.started', checkoutEmbed));
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Order Pending
  console.log('\n2️⃣ Testing: order.pending');
  const pendingEmbed = createPendingOrderEmbed(testEvents['order.pending']);
  results.push(await sendWebhook('order.pending', pendingEmbed));
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 3: Payment Completed
  console.log('\n3️⃣ Testing: payment.completed');
  const paymentEmbed = createCompletedOrderEmbed(testEvents['payment.completed']);
  results.push(await sendWebhook('payment.completed', paymentEmbed));
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 4: Order Completed
  console.log('\n4️⃣ Testing: order.completed');
  const orderEmbed = createCompletedOrderEmbed(testEvents['order.completed']);
  results.push(await sendWebhook('order.completed', orderEmbed));
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 5: Payment Failed
  console.log('\n5️⃣ Testing: payment.failed');
  const failedEmbed = createPaymentFailedEmbed(testEvents['payment.failed']);
  results.push(await sendWebhook('payment.failed', failedEmbed));
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 6: Order Refunded
  console.log('\n6️⃣ Testing: order.refunded');
  const refundEmbed = createRefundEmbed(testEvents['order.refunded']);
  results.push(await sendWebhook('order.refunded', refundEmbed));
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 7: Order Disputed (generic format)
  console.log('\n7️⃣ Testing: order.disputed');
  const disputeEmbed = {
    title: '⚠️ Order Disputed',
    description: 'A customer has filed a dispute/chargeback for their order.',
    color: 0xdc2626,
    fields: [
      { name: '🔖 Order Number', value: `\`${testEvents['order.disputed'].order_number}\``, inline: false },
      { name: '💸 Disputed Amount', value: `**$${testEvents['order.disputed'].amount.toFixed(2)} ${testEvents['order.disputed'].currency}**`, inline: true },
      { name: '👤 Customer', value: `\`${testEvents['order.disputed'].customer_name}\``, inline: true },
      { name: '📧 Email', value: `\`${testEvents['order.disputed'].customer_email}\``, inline: true },
      { name: '⚠️ Dispute Reason', value: testEvents['order.disputed'].dispute_reason, inline: false },
      { name: '📋 Status', value: `**${testEvents['order.disputed'].dispute_status.toUpperCase()}**`, inline: false }
    ],
    footer: { text: 'Skyline Cheats • Dispute System' },
    timestamp: new Date().toISOString()
  };
  results.push(await sendWebhook('order.disputed', disputeEmbed));

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 TEST SUMMARY:');
  console.log(`✅ Successful: ${results.filter(r => r).length}/7`);
  console.log(`❌ Failed: ${results.filter(r => !r).length}/7`);
  
  if (results.every(r => r)) {
    console.log('\n🎉 ALL WEBHOOKS WORKING PERFECTLY!');
    console.log('✅ Check your Discord channel for 7 beautiful embeds!');
  } else {
    console.log('\n⚠️ Some webhooks failed. Check the errors above.');
  }
}

// Run the tests
testAllWebhooks().catch(console.error);
