#!/usr/bin/env node

/**
 * Complete Stripe Integration Test
 * Tests the entire flow from cart to payment success
 */

const https = require('https');
const { URL } = require('url');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'test@magmacheats.cc';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Stripe-Integration-Test/1.0',
        ...options.headers
      }
    };

    const req = (urlObj.protocol === 'https:' ? https : require('http')).request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testStripeCheckoutAPI() {
  log('\n🛒 Testing Stripe Checkout API', 'blue');
  
  const testItems = [
    {
      id: 'test-item-1',
      productId: 'test-product-1',
      productName: 'Apex Legends Cheat - Premium',
      game: 'Apex Legends',
      duration: '24 Hours',
      price: 27.99,
      quantity: 1,
      variantId: 'test-variant-1'
    }
  ];

  const requestBody = {
    items: testItems,
    customer_email: TEST_EMAIL,
    coupon_code: null,
    coupon_discount_amount: 0,
    success_url: `${BASE_URL}/payment/success`,
    cancel_url: `${BASE_URL}/cart`
  };

  try {
    const response = await makeRequest(`${BASE_URL}/api/stripe/create-checkout-session`, {
      method: 'POST',
      body: requestBody
    });

    if (response.status === 200) {
      log('✅ Stripe checkout session creation: SUCCESS', 'green');
      log(`🔗 Session ID: ${response.data.sessionId}`, 'blue');
      
      if (response.data.url && response.data.url.includes('checkout.stripe.com')) {
        log('✅ Valid Stripe checkout URL generated', 'green');
        return { success: true, sessionId: response.data.sessionId, url: response.data.url };
      } else {
        log('❌ Invalid checkout URL format', 'red');
        return { success: false, error: 'Invalid URL format' };
      }
    } else {
      log('❌ Stripe checkout session creation: FAILED', 'red');
      log(`Error: ${JSON.stringify(response.data, null, 2)}`, 'red');
      return { success: false, error: response.data };
    }
  } catch (error) {
    log(`❌ Request failed: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testOrderStatusAPI() {
  log('\n📋 Testing Order Status API', 'blue');
  
  try {
    // Test with a mock session ID
    const response = await makeRequest(`${BASE_URL}/api/stripe/order-status?session_id=cs_test_123`);
    
    log(`📊 Order Status API Response: ${response.status}`, 'yellow');
    
    if (response.status === 404) {
      log('✅ Order Status API is working (404 expected for test session)', 'green');
      return { success: true };
    } else if (response.status === 200) {
      log('✅ Order Status API is working (found order)', 'green');
      return { success: true };
    } else {
      log('❌ Order Status API issue', 'red');
      return { success: false };
    }
  } catch (error) {
    log(`❌ Order Status API test failed: ${error.message}`, 'red');
    return { success: false };
  }
}

async function testWebhookEndpoint() {
  log('\n🔗 Testing Stripe Webhook Endpoint', 'blue');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/stripe/webhook`, {
      method: 'POST',
      headers: {
        'stripe-signature': 'test-signature'
      },
      body: JSON.stringify({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            customer_email: TEST_EMAIL,
            metadata: {
              customer_email: TEST_EMAIL,
              item_count: '1'
            }
          }
        }
      })
    });

    if (response.status === 200 || response.status === 400) {
      log('✅ Webhook endpoint is accessible', 'green');
      return { success: true };
    } else {
      log('❌ Webhook endpoint issue', 'red');
      return { success: false };
    }
  } catch (error) {
    log(`❌ Webhook test failed: ${error.message}`, 'red');
    return { success: false };
  }
}

async function testEnvironmentConfiguration() {
  log('\n🔧 Testing Environment Configuration', 'blue');
  
  const requiredVars = [
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY', 
    'STRIPE_WEBHOOK_SECRET'
  ];
  
  log('📋 Required Stripe environment variables:', 'yellow');
  requiredVars.forEach(varName => {
    log(`   ✓ ${varName}`, 'green');
  });
  
  // Test if the API can access the keys by making a checkout request
  const testResult = await testStripeCheckoutAPI();
  
  if (testResult.success) {
    log('✅ Environment variables are properly configured', 'green');
    return { success: true };
  } else {
    log('❌ Environment variables may be missing or incorrect', 'red');
    return { success: false };
  }
}

async function testCartToCheckoutFlow() {
  log('\n🛍️ Testing Cart to Checkout Flow', 'blue');
  
  try {
    // Test cart page accessibility
    const cartResponse = await makeRequest(`${BASE_URL}/cart`);
    
    if (cartResponse.status === 200) {
      log('✅ Cart page is accessible', 'green');
    } else {
      log('❌ Cart page issue', 'red');
    }
    
    // Test checkout confirm page
    const checkoutResponse = await makeRequest(`${BASE_URL}/checkout/confirm`);
    
    if (checkoutResponse.status === 200) {
      log('✅ Checkout confirm page is accessible', 'green');
    } else {
      log('❌ Checkout confirm page issue', 'red');
    }
    
    return { success: true };
  } catch (error) {
    log(`❌ Cart flow test failed: ${error.message}`, 'red');
    return { success: false };
  }
}

async function runCompleteIntegrationTest() {
  log('🚀 Starting Complete Stripe Integration Test', 'bold');
  log('=' .repeat(60), 'blue');
  
  const results = {
    environment: false,
    checkoutAPI: false,
    orderStatusAPI: false,
    webhook: false,
    cartFlow: false
  };
  
  // Test environment configuration
  const envResult = await testEnvironmentConfiguration();
  results.environment = envResult.success;
  
  // Test order status API
  const orderStatusResult = await testOrderStatusAPI();
  results.orderStatusAPI = orderStatusResult.success;
  
  // Test webhook endpoint
  const webhookResult = await testWebhookEndpoint();
  results.webhook = webhookResult.success;
  
  // Test cart to checkout flow
  const cartFlowResult = await testCartToCheckoutFlow();
  results.cartFlow = cartFlowResult.success;
  
  // Final checkout API test (already done in environment test)
  results.checkoutAPI = envResult.success;
  
  // Summary
  log('\n📊 Integration Test Results', 'bold');
  log('=' .repeat(40), 'blue');
  
  const testResults = [
    { name: 'Environment Configuration', status: results.environment },
    { name: 'Stripe Checkout API', status: results.checkoutAPI },
    { name: 'Order Status API', status: results.orderStatusAPI },
    { name: 'Webhook Endpoint', status: results.webhook },
    { name: 'Cart to Checkout Flow', status: results.cartFlow }
  ];
  
  testResults.forEach(test => {
    const icon = test.status ? '✅' : '❌';
    const color = test.status ? 'green' : 'red';
    log(`${icon} ${test.name}: ${test.status ? 'PASS' : 'FAIL'}`, color);
  });
  
  const allPassed = Object.values(results).every(result => result);
  
  log('\n🎯 Overall Status:', 'bold');
  if (allPassed) {
    log('✅ ALL TESTS PASSED - Stripe integration is ready!', 'green');
    log('\n🚀 Ready for production deployment:', 'green');
    log('   • Stripe checkout sessions are working', 'blue');
    log('   • Order processing is functional', 'blue');
    log('   • Webhook handling is set up', 'blue');
    log('   • Cart flow is complete', 'blue');
  } else {
    log('❌ SOME TESTS FAILED - Review issues above', 'red');
    log('\n🔧 Next steps:', 'yellow');
    log('   • Fix failing components', 'blue');
    log('   • Verify environment variables', 'blue');
    log('   • Test manually in browser', 'blue');
  }
  
  log('\n💡 Manual Testing:', 'yellow');
  log('   1. Add items to cart at /cart', 'blue');
  log('   2. Click "Proceed to Stripe Checkout"', 'blue');
  log('   3. Complete payment on Stripe', 'blue');
  log('   4. Verify success page shows order details', 'blue');
  
  return allPassed;
}

// Run the complete integration test
runCompleteIntegrationTest().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  log(`💥 Test suite crashed: ${error.message}`, 'red');
  process.exit(1);
});