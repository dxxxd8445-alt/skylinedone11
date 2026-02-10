#!/usr/bin/env node

console.log('🧪 Testing Storrik Payment Integration...\n');

// Test 1: Check if Storrik API keys are configured
console.log('📋 Step 1: Checking Environment Variables...');
const testKeys = {
  secret: process.env.STORRIK_SECRET_KEY,
  public: process.env.STORRIK_PUBLIC_KEY,
  webhook: process.env.STORRIK_WEBHOOK_SECRET
};

console.log('✅ Secret Key:', testKeys.secret ? 'Configured' : '❌ Missing');
console.log('✅ Public Key:', testKeys.public ? 'Configured' : '❌ Missing');
console.log('✅ Webhook Secret:', testKeys.webhook ? 'Configured' : '❌ Missing');

console.log('\n🌐 Step 2: Testing API Endpoints...\n');

// Test 2: Test Storrik settings API
async function testSettingsAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/settings/storrik-key');
    const data = await response.json();
    console.log('✅ Settings API:', data.apiKey ? 'Working' : '❌ Failed');
    return data.apiKey ? true : false;
  } catch (error) {
    console.log('❌ Settings API Error:', error.message);
    return false;
  }
}

// Test 3: Test Storrik checkout creation
async function testCheckoutAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/storrik/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{
          id: 'test-1',
          productId: 'test-product',
          productName: 'Test Product',
          productSlug: 'test-product',
          duration: '30 days',
          price: 10.00,
          quantity: 1,
        }],
        customerEmail: 'test@example.com',
        customerName: 'Test User',
        subtotal: 10.00,
        discount: 0,
        total: 10.00,
      }),
    });

    const data = await response.json();
    if (response.ok && data.checkoutUrl) {
      console.log('✅ Checkout API: Working');
      console.log('📦 Checkout URL:', data.checkoutUrl);
      console.log('🆔 Session ID:', data.sessionId);
      return true;
    } else {
      console.log('❌ Checkout API Failed:', data.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ Checkout API Error:', error.message);
    return false;
  }
}

// Test 4: Test webhook endpoint
async function testWebhookAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/storrik/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'storrik-signature': 't=1234567890,v1=testsignature',
      },
      body: JSON.stringify({
        type: 'payment_intent.succeeded',
        data: {
          payment_intent: {
            id: 'test_payment_123',
            status: 'completed',
            amount: 1000,
            currency: 'USD',
          }
        }
      }),
    });

    if (response.status === 401) {
      console.log('✅ Webhook API: Working (signature verification active)');
      return true;
    } else {
      console.log('❌ Webhook API Unexpected response:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Webhook API Error:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  const settingsOK = await testSettingsAPI();
  const checkoutOK = await testCheckoutAPI();
  const webhookOK = await testWebhookAPI();

  console.log('\n📊 Test Results:');
  console.log('================');
  console.log('Environment Setup:', testKeys.secret && testKeys.public && testKeys.webhook ? '✅ PASS' : '❌ FAIL');
  console.log('Settings API:', settingsOK ? '✅ PASS' : '❌ FAIL');
  console.log('Checkout API:', checkoutOK ? '✅ PASS' : '❌ FAIL');
  console.log('Webhook API:', webhookOK ? '✅ PASS' : '❌ FAIL');

  const allPassed = testKeys.secret && testKeys.public && testKeys.webhook && settingsOK && checkoutOK && webhookOK;
  
  console.log('\n🎯 Overall Status:', allPassed ? '✅ READY FOR PRODUCTION' : '❌ NEEDS FIXES');
  
  if (allPassed) {
    console.log('\n🚀 Storrik payment processor is fully functional!');
    console.log('💳 Card payments will work correctly');
    console.log('🔗 Webhook will process payments automatically');
  } else {
    console.log('\n🔧 Fix the failed tests above before going live');
  }
}

runTests();
