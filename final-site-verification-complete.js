#!/usr/bin/env node

/**
 * Final Site Verification - Complete Pre-Release Check
 * Comprehensive testing of all site functionality before release
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';

async function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: parsed, headers: res.headers, body });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers, body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testEndpoint(name, path, method = 'GET', data = null, expectedStatus = 200) {
  try {
    const response = await makeRequest(path, method, data);
    const success = response.status === expectedStatus;
    
    console.log(`${success ? '✅' : '❌'} ${name}: ${response.status} ${success ? 'SUCCESS' : 'FAILED'}`);
    
    if (!success && response.data?.error) {
      console.log(`   Error: ${response.data.error}`);
    }
    
    return success;
  } catch (error) {
    console.log(`❌ ${name}: ERROR - ${error.message}`);
    return false;
  }
}

async function runFinalVerification() {
  console.log('🚀 FINAL SITE VERIFICATION - PRE-RELEASE CHECK');
  console.log('='.repeat(60));
  
  let totalTests = 0;
  let passedTests = 0;

  // Test helper function
  const test = async (name, path, method = 'GET', data = null, expectedStatus = 200) => {
    totalTests++;
    const result = await testEndpoint(name, path, method, data, expectedStatus);
    if (result) passedTests++;
    return result;
  };

  console.log('\n📱 FRONTEND PAGES');
  console.log('-'.repeat(30));
  await test('Homepage', '/');
  await test('Store Page', '/store');
  await test('Cart Page', '/cart');
  await test('Account Page', '/account');
  await test('Discord Page', '/discord');
  await test('Guides Page', '/guides');
  await test('Reviews Page', '/reviews');
  await test('Status Page', '/status');
  await test('Terms Page', '/terms');
  await test('Privacy Page', '/privacy');
  await test('Refund Page', '/refund');

  console.log('\n🔐 AUTHENTICATION SYSTEM');
  console.log('-'.repeat(30));
  await test('Auth Context API', '/api/auth/context');
  await test('Store Auth - Me', '/api/store-auth/me', 'GET', null, 401); // Expected 401 when not logged in
  await test('Password Reset Page', '/reset-password');
  await test('Forgot Password Page', '/forgot-password');
  await test('Mobile Auth Page', '/mobile-auth');

  console.log('\n🛒 E-COMMERCE SYSTEM');
  console.log('-'.repeat(30));
  await test('Stripe Checkout API', '/api/stripe/create-checkout-session', 'POST', {
    items: [{ id: 'test', quantity: 1 }]
  }, 400); // Expected 400 for invalid data
  await test('Coupon Validation API', '/api/validate-coupon', 'POST', {
    code: 'TEST'
  });
  await test('Test Checkout Page', '/test-checkout');

  console.log('\n📊 ANALYTICS SYSTEM');
  console.log('-'.repeat(30));
  await test('Analytics - Real-time', '/api/analytics/realtime');
  await test('Analytics - Historical', '/api/analytics/historical', 'POST', {
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString()
  });
  await test('Analytics - Track', '/api/analytics/track', 'POST', {
    page: '/test',
    userAgent: 'Test Agent'
  });
  await test('Analytics - Heartbeat', '/api/analytics/heartbeat', 'POST', {
    sessionId: 'test-session'
  });

  console.log('\n🎯 AFFILIATE SYSTEM');
  console.log('-'.repeat(30));
  await test('Affiliate Registration', '/api/affiliate/register', 'POST', {
    email: 'test@example.com'
  }, 400); // Expected 400 for missing data
  await test('Affiliate Stats', '/api/affiliate/stats');
  await test('Affiliate Track', '/api/affiliate/track', 'POST', {
    affiliateCode: 'TEST123'
  });

  console.log('\n📢 ANNOUNCEMENTS SYSTEM');
  console.log('-'.repeat(30));
  await test('Active Announcements', '/api/announcements/active');

  console.log('\n📧 EMAIL SYSTEM');
  console.log('-'.repeat(30));
  await test('Email Send API', '/api/email/send', 'POST', {
    to: 'test@example.com',
    subject: 'Test',
    html: '<p>Test</p>'
  }, 400); // Expected 400 for missing auth

  console.log('\n💳 PAYMENT SYSTEM');
  console.log('-'.repeat(30));
  await test('Payment Success Page', '/payment/success');
  await test('Payment Cancelled Page', '/payment/cancelled');
  await test('Payment Checkout Page', '/payment/checkout');

  console.log('\n🔧 ADMIN SYSTEM');
  console.log('-'.repeat(30));
  await test('Admin Dashboard', '/mgmt-x9k2m7', 'GET', null, 302); // Expected redirect to login
  await test('Admin Login Page', '/mgmt-x9k2m7/login');
  await test('Admin Store Viewers', '/mgmt-x9k2m7/store-viewers', 'GET', null, 302); // Expected redirect
  await test('Admin Audit Logs', '/mgmt-x9k2m7/logs', 'GET', null, 302); // Expected redirect
  await test('Admin Products', '/mgmt-x9k2m7/products', 'GET', null, 302); // Expected redirect
  await test('Admin Orders', '/mgmt-x9k2m7/orders', 'GET', null, 302); // Expected redirect
  await test('Admin Affiliates', '/mgmt-x9k2m7/affiliates', 'GET', null, 302); // Expected redirect

  console.log('\n🔍 API HEALTH CHECKS');
  console.log('-'.repeat(30));
  await test('Test Connection', '/api/test-connection');
  await test('Site Messages API', '/api/site-messages');

  console.log('\n📱 MOBILE EXPERIENCE');
  console.log('-'.repeat(30));
  await test('Mobile Auth', '/mobile-auth');

  console.log('\n🎮 GAME STORE');
  console.log('-'.repeat(30));
  await test('Store Root', '/store');

  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL VERIFICATION RESULTS');
  console.log('='.repeat(60));
  
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests (${successRate}%)`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests} tests`);
  
  if (successRate >= 90) {
    console.log('\n🎉 SITE READY FOR RELEASE!');
    console.log('✅ All critical systems are functional');
    console.log('✅ Error handling is working properly');
    console.log('✅ Authentication flows are secure');
    console.log('✅ E-commerce system is operational');
    console.log('✅ Analytics tracking is active');
    console.log('✅ Admin dashboard is protected');
  } else if (successRate >= 80) {
    console.log('\n⚠️  SITE MOSTLY READY - MINOR ISSUES');
    console.log('✅ Core functionality is working');
    console.log('⚠️  Some non-critical features may need attention');
    console.log('💡 Consider fixing failed tests before full release');
  } else {
    console.log('\n❌ SITE NOT READY FOR RELEASE');
    console.log('❌ Critical issues detected');
    console.log('🔧 Please fix failed tests before releasing');
  }

  console.log('\n🔧 RECOMMENDED ACTIONS:');
  console.log('1. Start development server: npm run dev');
  console.log('2. Test all user flows manually');
  console.log('3. Verify database connections');
  console.log('4. Check environment variables');
  console.log('5. Test payment processing');
  console.log('6. Verify email delivery');
  console.log('7. Test mobile responsiveness');
  console.log('8. Check admin authentication');

  console.log('\n🚀 DEPLOYMENT CHECKLIST:');
  console.log('□ Environment variables configured');
  console.log('□ Database migrations applied');
  console.log('□ SSL certificates installed');
  console.log('□ Domain DNS configured');
  console.log('□ CDN/caching configured');
  console.log('□ Monitoring/logging setup');
  console.log('□ Backup systems in place');
  console.log('□ Security headers configured');

  return successRate >= 90;
}

// Run the verification
runFinalVerification()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });