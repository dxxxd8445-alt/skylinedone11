#!/usr/bin/env node

/**
 * Debug Affiliate Registration Flow
 * Tests the complete flow from customer registration to admin display
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

async function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
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

async function debugAffiliateFlow() {
  console.log('🔍 DEBUGGING AFFILIATE REGISTRATION FLOW');
  console.log('='.repeat(60));

  try {
    console.log('\n1️⃣ Testing Admin Affiliates API...');
    const adminResponse = await makeRequest('/api/admin/affiliates');
    
    console.log(`Status: ${adminResponse.status}`);
    if (adminResponse.status === 200) {
      console.log(`✅ Admin API working`);
      console.log(`Affiliates found: ${adminResponse.data.affiliates?.length || 0}`);
      
      if (adminResponse.data.affiliates?.length > 0) {
        console.log('\n📋 Current Affiliates:');
        adminResponse.data.affiliates.forEach((affiliate, index) => {
          console.log(`${index + 1}. Code: ${affiliate.affiliate_code}`);
          console.log(`   User ID: ${affiliate.store_user_id || affiliate.user_id}`);
          console.log(`   Email: ${affiliate.payment_email}`);
          console.log(`   Status: ${affiliate.status}`);
          console.log(`   Created: ${affiliate.created_at}`);
          console.log(`   Store User: ${affiliate.store_users?.username || 'Not linked'}`);
          console.log('');
        });
      } else {
        console.log('❌ No affiliates found in admin API');
      }
    } else {
      console.log(`❌ Admin API failed: ${adminResponse.data.error || 'Unknown error'}`);
    }

    console.log('\n2️⃣ Testing Affiliate Stats API...');
    const statsResponse = await makeRequest('/api/affiliate/stats');
    
    console.log(`Status: ${statsResponse.status}`);
    if (statsResponse.status === 200) {
      console.log(`✅ Stats API working`);
      console.log(`Stats data:`, JSON.stringify(statsResponse.data, null, 2));
    } else {
      console.log(`❌ Stats API failed: ${statsResponse.data.error || 'Unknown error'}`);
    }

    console.log('\n3️⃣ Testing Affiliate Registration API (without auth)...');
    const regResponse = await makeRequest('/api/affiliate/register', 'POST', {
      payment_email: 'debug@test.com',
      payment_method: 'paypal'
    });
    
    console.log(`Status: ${regResponse.status}`);
    console.log(`Response:`, JSON.stringify(regResponse.data, null, 2));
    
    if (regResponse.status === 401) {
      console.log('✅ Registration API correctly requires authentication');
    } else if (regResponse.status === 200) {
      console.log('⚠️  Registration API allowed registration without auth (this might be an issue)');
    } else {
      console.log('❌ Registration API returned unexpected status');
    }

    console.log('\n4️⃣ Checking Database Tables...');
    
    // Test if we can query the affiliates table directly
    console.log('This would require direct database access to debug further.');
    console.log('Please check your Supabase dashboard for:');
    console.log('- affiliates table exists');
    console.log('- store_users table exists');
    console.log('- Proper foreign key relationships');
    console.log('- RLS policies allow admin access');

    console.log('\n' + '='.repeat(60));
    console.log('🔧 DEBUGGING SUMMARY');
    console.log('='.repeat(60));
    
    if (adminResponse.status === 200 && adminResponse.data.affiliates?.length === 0) {
      console.log('❌ ISSUE IDENTIFIED: Admin API works but no affiliates found');
      console.log('');
      console.log('🔧 POSSIBLE CAUSES:');
      console.log('1. Affiliate registration is not actually creating records');
      console.log('2. Database table relationships are broken');
      console.log('3. RLS policies are blocking admin access');
      console.log('4. Wrong table structure or column names');
      console.log('');
      console.log('🚀 NEXT STEPS:');
      console.log('1. Check Supabase dashboard for affiliates table');
      console.log('2. Verify affiliate registration creates actual records');
      console.log('3. Check RLS policies on affiliates table');
      console.log('4. Verify store_users relationship');
    } else if (adminResponse.status !== 200) {
      console.log('❌ ISSUE IDENTIFIED: Admin API is not working');
      console.log('');
      console.log('🔧 POSSIBLE CAUSES:');
      console.log('1. Database connection issues');
      console.log('2. Missing affiliates table');
      console.log('3. Authentication problems');
      console.log('4. API endpoint errors');
    } else {
      console.log('✅ System appears to be working');
      console.log('If you still don\'t see affiliates, the issue might be:');
      console.log('1. Frontend display problems');
      console.log('2. Data filtering issues');
      console.log('3. Real-time update problems');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.log('\n💡 Make sure the development server is running:');
    console.log('   npm run dev');
  }
}

// Run the debug
debugAffiliateFlow();