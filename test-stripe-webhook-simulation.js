#!/usr/bin/env node

/**
 * Test Stripe Webhook Simulation
 * Simulates a completed payment webhook to test order creation
 */

const https = require('https');
const { URL } = require('url');

// Test configuration
const BASE_URL = 'http://localhost:3000';

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
        'User-Agent': 'Stripe-Webhook-Test/1.0',
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

async function testWebhookWithRealSession() {
  log('\n🔗 Testing Webhook with Real Session Data', 'blue');
  
  // Use one of the actual session IDs from the database
  const realSessionId = 'cs_live_a18CYXlJS3fz6mTMjvqIGkHQGUfRDYpuhSe7AeR1k0Nt99qay30abdesKI';
  
  const webhookPayload = {
    id: 'evt_test_webhook',
    object: 'event',
    api_version: '2020-08-27',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: realSessionId,
        object: 'checkout.session',
        amount_total: 2799, // $27.99 in cents
        currency: 'usd',
        customer_details: {
          email: 'rashib@gmail.com',
          name: 'Test Customer'
        },
        payment_intent: 'pi_test_123456789',
        payment_status: 'paid',
        status: 'complete',
        metadata: {
          customer_email: 'rashib@gmail.com',
          coupon_code: '',
          coupon_discount_amount: '0',
          item_count: '1',
          subtotal: '27.99',
          total: '27.99'
        }
      }
    },
    livemode: true,
    pending_webhooks: 1,
    request: {
      id: 'req_test_123',
      idempotency_key: null
    },
    type: 'checkout.session.completed'
  };

  try {
    log('📡 Sending webhook payload to /api/stripe/webhook...', 'yellow');
    
    const response = await makeRequest(`${BASE_URL}/api/stripe/webhook`, {
      method: 'POST',
      headers: {
        'stripe-signature': 'test-signature-bypass'
      },
      body: JSON.stringify(webhookPayload)
    });

    log(`📊 Webhook Response Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    
    if (response.status === 200) {
      log('✅ Webhook processed successfully!', 'green');
      log('📋 Response:', 'blue');
      console.log(JSON.stringify(response.data, null, 2));
      return { success: true };
    } else {
      log('❌ Webhook processing failed', 'red');
      log('📋 Error Response:', 'red');
      console.log(JSON.stringify(response.data, null, 2));
      return { success: false, error: response.data };
    }
  } catch (error) {
    log(`❌ Webhook test failed: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function checkWebhookEndpoint() {
  log('\n🔍 Testing Webhook Endpoint Accessibility', 'blue');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/stripe/webhook`, {
      method: 'POST',
      headers: {
        'stripe-signature': 'test'
      },
      body: JSON.stringify({ test: true })
    });

    log(`📊 Endpoint Status: ${response.status}`, 'yellow');
    
    if (response.status === 400) {
      log('✅ Webhook endpoint is accessible (400 expected for invalid signature)', 'green');
      return { success: true };
    } else if (response.status === 200) {
      log('✅ Webhook endpoint is accessible', 'green');
      return { success: true };
    } else {
      log('❌ Webhook endpoint issue', 'red');
      return { success: false };
    }
  } catch (error) {
    log(`❌ Webhook endpoint test failed: ${error.message}`, 'red');
    return { success: false };
  }
}

async function runWebhookTest() {
  log('🧪 Starting Stripe Webhook Test', 'bold');
  log('=' .repeat(50), 'blue');
  
  // Test endpoint accessibility
  const endpointResult = await checkWebhookEndpoint();
  
  if (!endpointResult.success) {
    log('❌ Webhook endpoint is not accessible - cannot continue', 'red');
    return;
  }
  
  // Test with real session data
  const webhookResult = await testWebhookWithRealSession();
  
  // Summary
  log('\n📋 Test Summary', 'bold');
  log('=' .repeat(30), 'blue');
  
  if (webhookResult.success) {
    log('✅ Webhook processing: WORKING', 'green');
    log('✅ Order creation should be triggered', 'green');
    log('\n🎯 Next Steps:', 'yellow');
    log('1. Check if order was created in database', 'blue');
    log('2. Verify license was generated', 'blue');
    log('3. Check admin panel for new order', 'blue');
  } else {
    log('❌ Webhook processing: FAILED', 'red');
    log('❌ Orders will not be created automatically', 'red');
    log('\n🔧 Issues to Fix:', 'yellow');
    log('1. Webhook signature verification', 'blue');
    log('2. Webhook payload processing', 'blue');
    log('3. Database order creation', 'blue');
  }
  
  log('\n💡 Webhook Configuration:', 'yellow');
  log('   • Webhook URL: https://yourdomain.com/api/stripe/webhook', 'blue');
  log('   • Events to listen for: checkout.session.completed', 'blue');
  log('   • Make sure webhook secret is configured in Stripe dashboard', 'blue');
}

// Run the webhook test
runWebhookTest().catch(error => {
  log(`💥 Test failed: ${error.message}`, 'red');
  process.exit(1);
});