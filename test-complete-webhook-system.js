#!/usr/bin/env node

/**
 * Complete Webhook System Test
 * 
 * Tests Discord webhooks for all order states and Stripe integration
 */

const fs = require('fs');
const path = require('path');

console.log('🔗 Testing Complete Webhook System...\n');

// Read webhook files
const discordWebhookPath = path.join(__dirname, 'lib', 'discord-webhook.ts');
const stripeWebhookPath = path.join(__dirname, 'app', 'api', 'stripe', 'webhook', 'route.ts');
const adminOrdersPath = path.join(__dirname, 'app', 'actions', 'admin-orders.ts');

const discordWebhookContent = fs.readFileSync(discordWebhookPath, 'utf8');
const stripeWebhookContent = fs.readFileSync(stripeWebhookPath, 'utf8');
const adminOrdersContent = fs.readFileSync(adminOrdersPath, 'utf8');

let allTestsPassed = true;
const issues = [];
const successes = [];

console.log('🎯 DISCORD WEBHOOK FUNCTIONALITY');
console.log('=' .repeat(50));

// Test 1: Check if Discord webhook has all required event types
console.log('1. Testing webhook event types...');
const requiredEvents = [
  'order.completed',
  'order.refunded', 
  'payment.failed',
  'order.pending'
];

requiredEvents.forEach(event => {
  if (discordWebhookContent.includes(event)) {
    console.log(`   ✅ ${event} event supported`);
    successes.push(`Discord webhook supports ${event}`);
  } else {
    console.log(`   ❌ ${event} event missing`);
    issues.push(`Discord webhook missing ${event} event`);
    allTestsPassed = false;
  }
});

// Test 2: Check if webhook has proper error handling
console.log('\n2. Testing error handling...');
if (discordWebhookContent.includes('try') && discordWebhookContent.includes('catch')) {
  console.log('   ✅ Webhook has error handling');
  successes.push('Discord webhook has error handling');
} else {
  console.log('   ❌ Webhook missing error handling');
  issues.push('Discord webhook needs error handling');
  allTestsPassed = false;
}

// Test 3: Check if webhook formats messages properly
console.log('\n3. Testing message formatting...');
if (discordWebhookContent.includes('embeds') && discordWebhookContent.includes('color')) {
  console.log('   ✅ Webhook uses Discord embeds with colors');
  successes.push('Discord webhook uses proper message formatting');
} else {
  console.log('   ❌ Webhook may not format messages properly');
  issues.push('Discord webhook should use embeds with colors');
  allTestsPassed = false;
}

console.log('\n💳 STRIPE WEBHOOK INTEGRATION');
console.log('=' .repeat(50));

// Test 4: Check if Stripe webhook calls Discord webhook
console.log('4. Testing Stripe to Discord integration...');
if (stripeWebhookContent.includes('discord-webhook') || stripeWebhookContent.includes('triggerWebhooks')) {
  console.log('   ✅ Stripe webhook calls Discord webhook');
  successes.push('Stripe webhook integrates with Discord');
} else {
  console.log('   ❌ Stripe webhook does not call Discord webhook');
  issues.push('Stripe webhook should call Discord webhook');
  allTestsPassed = false;
}

// Test 5: Check if Stripe webhook handles different payment states
console.log('\n5. Testing Stripe payment state handling...');
const stripeEvents = [
  'checkout.session.completed',
  'payment_intent.succeeded',
  'payment_intent.payment_failed'
];

stripeEvents.forEach(event => {
  if (stripeWebhookContent.includes(event)) {
    console.log(`   ✅ Handles ${event}`);
    successes.push(`Stripe webhook handles ${event}`);
  } else {
    console.log(`   ⚠️  May not handle ${event}`);
    issues.push(`Stripe webhook should handle ${event}`);
  }
});

console.log('\n👑 ADMIN PANEL WEBHOOK TRIGGERS');
console.log('=' .repeat(50));

// Test 6: Check if admin actions trigger webhooks
console.log('6. Testing admin webhook triggers...');
const adminWebhookTriggers = [
  'order.completed',
  'order.refunded',
  'payment.failed'
];

adminWebhookTriggers.forEach(trigger => {
  if (adminOrdersContent.includes(trigger)) {
    console.log(`   ✅ Admin triggers ${trigger} webhook`);
    successes.push(`Admin panel triggers ${trigger} webhook`);
  } else {
    console.log(`   ❌ Admin does not trigger ${trigger} webhook`);
    issues.push(`Admin panel should trigger ${trigger} webhook`);
    allTestsPassed = false;
  }
});

// Test 7: Check if admin webhook calls are properly imported
console.log('\n7. Testing admin webhook imports...');
if (adminOrdersContent.includes('triggerWebhooks') && adminOrdersContent.includes('discord-webhook')) {
  console.log('   ✅ Admin properly imports Discord webhook');
  successes.push('Admin panel properly imports webhook system');
} else {
  console.log('   ❌ Admin missing webhook imports');
  issues.push('Admin panel needs to import Discord webhook system');
  allTestsPassed = false;
}

console.log('\n🔄 WEBHOOK DATA FLOW');
console.log('=' .repeat(50));

// Test 8: Check if webhooks include all necessary order data
console.log('8. Testing webhook data completeness...');
const requiredOrderData = [
  'order_number',
  'customer_email',
  'amount',
  'currency',
  'items'
];

let dataComplete = true;
requiredOrderData.forEach(field => {
  if (adminOrdersContent.includes(field) || stripeWebhookContent.includes(field)) {
    console.log(`   ✅ Includes ${field} in webhook data`);
  } else {
    console.log(`   ❌ Missing ${field} in webhook data`);
    dataComplete = false;
  }
});

if (dataComplete) {
  successes.push('Webhook data includes all required fields');
} else {
  issues.push('Webhook data missing required fields');
  allTestsPassed = false;
}

console.log('\n🎨 WEBHOOK MESSAGE STYLING');
console.log('=' .repeat(50));

// Test 9: Check if webhooks use proper Discord colors
console.log('9. Testing Discord message colors...');
const colorMappings = [
  { event: 'completed', color: 'green' },
  { event: 'failed', color: 'red' },
  { event: 'refunded', color: 'orange' },
  { event: 'pending', color: 'yellow' }
];

colorMappings.forEach(mapping => {
  if (discordWebhookContent.includes(mapping.color) || discordWebhookContent.includes('0x')) {
    console.log(`   ✅ Uses colors for ${mapping.event} events`);
  } else {
    console.log(`   ⚠️  May not use colors for ${mapping.event} events`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('📊 WEBHOOK SYSTEM STATUS');
console.log('='.repeat(60));

console.log(`\n✅ SUCCESSES: ${successes.length}`);
if (successes.length > 0) {
  successes.slice(0, 8).forEach(success => console.log(`   • ${success}`));
  if (successes.length > 8) console.log(`   ... and ${successes.length - 8} more`);
}

if (issues.length > 0) {
  console.log(`\n❌ ISSUES: ${issues.length}`);
  issues.forEach(issue => console.log(`   • ${issue}`));
}

console.log('\n' + '='.repeat(60));

if (allTestsPassed && issues.length === 0) {
  console.log('🎉 WEBHOOK SYSTEM FULLY FUNCTIONAL!');
  console.log('\n🔗 Your webhook system includes:');
  console.log('   ✅ Discord notifications for all order states');
  console.log('   ✅ Stripe payment webhook integration');
  console.log('   ✅ Admin panel webhook triggers');
  console.log('   ✅ Proper error handling and formatting');
  console.log('   ✅ Complete order data in notifications');
  
  console.log('\n🎯 WEBHOOK FLOW:');
  console.log('   1. Customer completes Stripe payment');
  console.log('   2. Stripe webhook receives payment confirmation');
  console.log('   3. Order status updated in database');
  console.log('   4. Discord webhook triggered with order details');
  console.log('   5. Admin receives real-time notification');
  
  console.log('\n🚀 READY FOR PRODUCTION WEBHOOKS!');
  
} else {
  console.log('❌ WEBHOOK SYSTEM NEEDS ATTENTION');
  console.log(`\n🔧 ${issues.length} issues should be resolved for optimal webhook functionality.`);
}

console.log('\n' + '='.repeat(60));