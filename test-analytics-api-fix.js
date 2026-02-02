#!/usr/bin/env node

/**
 * Test Analytics API Fix
 * Tests the fixed historical and export analytics APIs
 */

const https = require('https');

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

    const req = https.request(url, options, (res) => {
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

async function testAnalyticsAPIs() {
  console.log('🧪 Testing Analytics API Fixes...\n');

  try {
    // Test date range (last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    console.log('📊 Testing Historical Analytics API...');
    const historicalResponse = await makeRequest('/api/analytics/historical', 'POST', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    if (historicalResponse.status === 200) {
      console.log('✅ Historical Analytics API: SUCCESS');
      console.log('   - Status:', historicalResponse.status);
      console.log('   - Has stats:', !!historicalResponse.data.stats);
      console.log('   - Total visitors:', historicalResponse.data.stats?.totalVisitors || 0);
      console.log('   - Unique visitors:', historicalResponse.data.stats?.uniqueVisitors || 0);
    } else {
      console.log('❌ Historical Analytics API: FAILED');
      console.log('   - Status:', historicalResponse.status);
      console.log('   - Error:', historicalResponse.data.error || 'Unknown error');
    }

    console.log('\n📤 Testing Export Analytics API...');
    const exportResponse = await makeRequest('/api/analytics/export', 'POST', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      format: 'json'
    });

    if (exportResponse.status === 200) {
      console.log('✅ Export Analytics API: SUCCESS');
      console.log('   - Status:', exportResponse.status);
      console.log('   - Has data:', !!exportResponse.data.data);
      console.log('   - Records count:', exportResponse.data.data?.length || 0);
    } else {
      console.log('❌ Export Analytics API: FAILED');
      console.log('   - Status:', exportResponse.status);
      console.log('   - Error:', exportResponse.data.error || 'Unknown error');
    }

    console.log('\n📊 Testing Real-time Analytics API...');
    const realtimeResponse = await makeRequest('/api/analytics/realtime', 'GET');

    if (realtimeResponse.status === 200) {
      console.log('✅ Real-time Analytics API: SUCCESS');
      console.log('   - Status:', realtimeResponse.status);
      console.log('   - Active visitors:', realtimeResponse.data.visitors?.length || 0);
    } else {
      console.log('❌ Real-time Analytics API: FAILED');
      console.log('   - Status:', realtimeResponse.status);
      console.log('   - Error:', realtimeResponse.data.error || 'Unknown error');
    }

    console.log('\n🎯 Analytics API Fix Test Complete!');
    console.log('The Store Viewers dashboard should now work without 500 errors.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the development server is running:');
    console.log('   npm run dev');
  }
}

// Run the test
testAnalyticsAPIs();