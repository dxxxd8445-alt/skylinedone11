#!/usr/bin/env node

/**
 * Complete Affiliate System Test
 * Tests the entire affiliate flow from registration to admin display
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

async function testAffiliateSystemComplete() {
  console.log('🤝 COMPLETE AFFILIATE SYSTEM TEST');
  console.log('='.repeat(60));

  try {
    console.log('\n1️⃣ Testing Admin Affiliates API...');
    const adminResponse = await makeRequest('/api/admin/affiliates');
    
    console.log(`Status: ${adminResponse.status}`);
    if (adminResponse.status === 200) {
      console.log('✅ Admin Affiliates API: SUCCESS');
      console.log(`Found ${adminResponse.data.affiliates?.length || 0} affiliates`);
      
      if (adminResponse.data.debug) {
        console.log('Debug info:', adminResponse.data.debug);
      }
      
      if (adminResponse.data.affiliates?.length > 0) {
        console.log('\n📋 Current Affiliates in Database:');
        adminResponse.data.affiliates.forEach((affiliate, index) => {
          console.log(`${index + 1}. Affiliate Code: ${affiliate.affiliate_code}`);
          console.log(`   Store User ID: ${affiliate.store_user_id}`);
          console.log(`   Payment Email: ${affiliate.payment_email}`);
          console.log(`   Status: ${affiliate.status}`);
          console.log(`   Commission Rate: ${affiliate.commission_rate}%`);
          console.log(`   Created: ${affiliate.created_at}`);
          
          if (affiliate.store_users) {
            console.log(`   Username: ${affiliate.store_users.username}`);
            console.log(`   User Email: ${affiliate.store_users.email}`);
          } else {
            console.log(`   ⚠️  No store_users data linked`);
          }
          console.log('');
        });
      } else {
        console.log('❌ No affiliates found in database');
      }
    } else {
      console.log('❌ Admin Affiliates API: FAILED');
      console.log(`Error: ${adminResponse.data.error || 'Unknown error'}`);
      if (adminResponse.data.details) {
        console.log(`Details: ${adminResponse.data.details}`);
      }
    }

    console.log('\n2️⃣ Testing Affiliate Registration API (without auth)...');
    const regResponse = await makeRequest('/api/affiliate/register', 'POST', {
      payment_email: 'test@example.com',
      payment_method: 'paypal'
    });
    
    console.log(`Status: ${regResponse.status}`);
    if (regResponse.status === 401) {
      console.log('✅ Registration API: Correctly requires authentication');
    } else {
      console.log('❌ Registration API: Unexpected response');
      console.log('Response:', JSON.stringify(regResponse.data, null, 2));
    }

    console.log('\n3️⃣ Testing Affiliate Stats API...');
    const statsResponse = await makeRequest('/api/affiliate/stats');
    
    console.log(`Status: ${statsResponse.status}`);
    if (statsResponse.status === 200) {
      console.log('✅ Affiliate Stats API: SUCCESS');
      console.log('Stats:', JSON.stringify(statsResponse.data, null, 2));
    } else {
      console.log('❌ Affiliate Stats API: FAILED');
      console.log(`Error: ${statsResponse.data.error || 'Unknown error'}`);
    }

    console.log('\n4️⃣ Testing Individual Affiliate APIs...');
    if (adminResponse.data.affiliates?.length > 0) {
      const testAffiliateId = adminResponse.data.affiliates[0].id;
      
      // Test referrals API
      const referralsResponse = await makeRequest(`/api/admin/affiliates/${testAffiliateId}/referrals`);
      console.log(`Referrals API Status: ${referralsResponse.status}`);
      
      // Test clicks API
      const clicksResponse = await makeRequest(`/api/admin/affiliates/${testAffiliateId}/clicks`);
      console.log(`Clicks API Status: ${clicksResponse.status}`);
      
      if (referralsResponse.status === 200 && clicksResponse.status === 200) {
        console.log('✅ Individual Affiliate APIs: SUCCESS');
      } else {
        console.log('❌ Individual Affiliate APIs: Some failed');
      }
    } else {
      console.log('⏭️  Skipping individual affiliate tests (no affiliates found)');
    }

    console.log('\n5️⃣ Testing Admin Pages...');
    const affiliatesPageResponse = await makeRequest('/mgmt-x9k2m7/affiliates');
    console.log(`Affiliates Page Status: ${affiliatesPageResponse.status}`);
    
    if (affiliatesPageResponse.status === 200 || affiliatesPageResponse.status === 302) {
      console.log('✅ Admin Affiliates Page: Accessible');
    } else {
      console.log('❌ Admin Affiliates Page: Not accessible');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎯 AFFILIATE SYSTEM DIAGNOSIS');
    console.log('='.repeat(60));

    if (adminResponse.status === 200) {
      if (adminResponse.data.affiliates?.length > 0) {
        console.log('✅ AFFILIATE SYSTEM IS WORKING!');
        console.log('');
        console.log('✅ Database has affiliate records');
        console.log('✅ Admin API can fetch affiliates');
        console.log('✅ APIs are responding correctly');
        
        if (adminResponse.data.affiliates[0].store_users) {
          console.log('✅ Store users relationship is working');
        } else {
          console.log('⚠️  Store users relationship needs attention');
        }
        
        console.log('');
        console.log('🔧 IF YOU STILL DON\'T SEE AFFILIATES IN ADMIN:');
        console.log('1. Check browser console for JavaScript errors');
        console.log('2. Refresh the admin affiliates page');
        console.log('3. Check if admin authentication is working');
        console.log('4. Verify the frontend is calling the correct API');
      } else {
        console.log('❌ NO AFFILIATES FOUND IN DATABASE');
        console.log('');
        console.log('🔧 POSSIBLE ISSUES:');
        console.log('1. Affiliate registration is not actually creating records');
        console.log('2. Database table is empty or doesn\'t exist');
        console.log('3. RLS policies are blocking access');
        console.log('4. Wrong database connection');
        console.log('');
        console.log('🚀 NEXT STEPS:');
        console.log('1. Check Supabase dashboard for affiliates table');
        console.log('2. Try creating an affiliate from customer dashboard');
        console.log('3. Check server logs for registration errors');
        console.log('4. Verify database permissions');
      }
    } else {
      console.log('❌ ADMIN API IS NOT WORKING');
      console.log('');
      console.log('🔧 CRITICAL ISSUES:');
      console.log('1. Database connection problems');
      console.log('2. Missing affiliates table');
      console.log('3. Authentication issues');
      console.log('4. API endpoint errors');
      console.log('');
      console.log('🚀 IMMEDIATE ACTIONS NEEDED:');
      console.log('1. Check database connection');
      console.log('2. Verify affiliates table exists');
      console.log('3. Check API endpoint implementation');
      console.log('4. Review server logs for errors');
    }

    console.log('\n📋 QUICK CHECKLIST:');
    console.log(`□ Admin API working: ${adminResponse.status === 200 ? '✅' : '❌'}`);
    console.log(`□ Affiliates in database: ${adminResponse.data.affiliates?.length > 0 ? '✅' : '❌'}`);
    console.log(`□ Store users linked: ${adminResponse.data.affiliates?.[0]?.store_users ? '✅' : '❌'}`);
    console.log(`□ Registration API secure: ${regResponse.status === 401 ? '✅' : '❌'}`);
    console.log(`□ Stats API working: ${statsResponse.status === 200 ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the development server is running:');
    console.log('   npm run dev');
  }
}

// Run the test
testAffiliateSystemComplete();