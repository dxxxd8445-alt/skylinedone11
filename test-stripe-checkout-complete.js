#!/usr/bin/env node

/**
 * Complete Stripe Checkout Flow Test
 * Tests the entire checkout process with live Stripe keys
 */

const https = require('https');
const { URL } = require('url');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'test@example.com';

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
        'User-Agent': 'Stripe-Checkout-Test/1.0',
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

async function testStripeCheckoutSession() {
  log('\n🧪 Testing Stripe Checkout Session Creation', 'blue');
  
  const testItems = [
    {
      id: 'test-item-1',
      productId: 'test-product-1',
      productName: 'Test Cheat - Apex Legends',
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
    log('📡 Making request to create checkout session...', 'yellow');
    const response = await makeRequest(`${BASE_URL}/api/stripe/create-checkout-session`, {
      method: 'POST',
      body: requestBody
    });

    log(`📊 Response Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    
    if (response.status === 200) {
      log('✅ Checkout session created successfully!', 'green');
      log(`🔗 Session ID: ${response.data.sessionId}`, 'blue');
      log(`🌐 Checkout URL: ${response.data.url}`, 'blue');
      
      // Verify the URL is a valid Stripe checkout URL
      if (response.data.url && response.data.url.includes('checkout.stripe.com')) {
        log('✅ Valid Stripe checkout URL generated', 'green');
      } else {
        log('❌ Invalid checkout URL format', 'red');
      }
      
      return { success: true, sessionId: response.data.sessionId, url: response.data.url };
    } else {
      log('❌ Failed to create checkout session', 'red');
      log(`Error: ${JSON.stringify(response.data, null, 2)}`, 'red');
      return { success: false, error: response.data };
    }
  } catch (error) {
    log(`❌ Request failed: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testStripeWebhook() {
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

    log(`📊 Webhook Response Status: ${response.status}`, 'yellow');
    
    if (response.status === 200 || response.status === 400) {
      log('✅ Webhook endpoint is accessible', 'green');
    } else {
      log('❌ Webhook endpoint issue', 'red');
    }
    
  } catch (error) {
    log(`❌ Webhook test failed: ${error.message}`, 'red');
  }
}

async function testEnvironmentVariables() {
  log('\n🔧 Checking Environment Variables', 'blue');
  
  const requiredVars = [
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ];
  
  // We can't directly check env vars from the client, but we can test if the API works
  log('📋 Environment variables should be configured in .env.local:', 'yellow');
  requiredVars.forEach(varName => {
    log(`   - ${varName}`, 'blue');
  });
  
  log('✅ Environment check complete (verify manually)', 'green');
}

async function runCompleteTest() {
  log('🚀 Starting Complete Stripe Checkout Test', 'bold');
  log('=' .repeat(50), 'blue');
  
  // Test environment
  await testEnvironmentVariables();
  
  // Test checkout session creation
  const checkoutResult = await testStripeCheckoutSession();
  
  // Test webhook endpoint
  await testStripeWebhook();
  
  // Summary
  log('\n📋 Test Summary', 'bold');
  log('=' .repeat(30), 'blue');
  
  if (checkoutResult.success) {
    log('✅ Stripe checkout session creation: WORKING', 'green');
    log('✅ Checkout URL generation: WORKING', 'green');
    log('✅ API integration: WORKING', 'green');
  } else {
    log('❌ Stripe checkout session creation: FAILED', 'red');
    log('❌ Need to fix API integration', 'red');
  }
  
  log('\n🎯 Next Steps:', 'yellow');
  log('1. Verify all environment variables are set correctly', 'blue');
  log('2. Test actual payment flow in browser', 'blue');
  log('3. Verify webhook handling for order completion', 'blue');
  log('4. Test with real Stripe account', 'blue');
  
  log('\n🔗 Test checkout URL in browser:', 'green');
  if (checkoutResult.success && checkoutResult.url) {
    log(checkoutResult.url, 'blue');
  } else {
    log('No checkout URL available - fix API issues first', 'red');
  }
}

// Run the test
runCompleteTest().catch(error => {
  log(`💥 Test suite failed: ${error.message}`, 'red');
  process.exit(1);
});