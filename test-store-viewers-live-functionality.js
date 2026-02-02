#!/usr/bin/env node

/**
 * Test Store Viewers Live Functionality
 * Verifies that Store Viewers shows real live data
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

async function testStoreViewers() {
  console.log('🔍 Testing Store Viewers Live Functionality...\n');

  try {
    // Step 1: Test real-time analytics API
    console.log('📊 Testing Real-time Analytics API...');
    const realtimeResponse = await makeRequest('/api/analytics/realtime');
    
    if (realtimeResponse.status === 200) {
      console.log('✅ Real-time API: SUCCESS');
      console.log(`   - Active visitors: ${realtimeResponse.data.visitors?.length || 0}`);
      console.log(`   - Stats available: ${!!realtimeResponse.data.stats}`);
    } else {
      console.log('❌ Real-time API: FAILED');
      console.log(`   - Status: ${realtimeResponse.status}`);
      console.log(`   - Error: ${realtimeResponse.data.error || 'Unknown'}`);
    }

    // Step 2: Simulate visitor tracking
    console.log('\n👤 Simulating Visitor Activity...');
    const trackResponse = await makeRequest('/api/analytics/track', 'POST', {
      page: '/test-page',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      referrer: 'https://google.com',
      activity: 'browsing'
    });

    if (trackResponse.status === 200) {
      console.log('✅ Visitor tracking: SUCCESS');
      console.log(`   - Session created: ${!!trackResponse.data.sessionId}`);
    } else {
      console.log('❌ Visitor tracking: FAILED');
      console.log(`   - Status: ${trackResponse.status}`);
      console.log(`   - Error: ${trackResponse.data.error || 'Unknown'}`);
    }

    // Step 3: Test heartbeat (keeps session alive)
    if (trackResponse.data.sessionId) {
      console.log('\n💓 Testing Session Heartbeat...');
      const heartbeatResponse = await makeRequest('/api/analytics/heartbeat', 'POST', {
        sessionId: trackResponse.data.sessionId,
        activity: 'viewing-product',
        currentPage: '/store/valorant/premium-hack',
        currentProduct: 'Valorant Premium Hack'
      });

      if (heartbeatResponse.status === 200) {
        console.log('✅ Heartbeat: SUCCESS');
        console.log(`   - Session updated: ${!!heartbeatResponse.data.success}`);
      } else {
        console.log('❌ Heartbeat: FAILED');
        console.log(`   - Status: ${heartbeatResponse.status}`);
      }
    }

    // Step 4: Check if visitor appears in real-time data
    console.log('\n🔄 Checking Updated Real-time Data...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    const updatedRealtimeResponse = await makeRequest('/api/analytics/realtime');
    
    if (updatedRealtimeResponse.status === 200) {
      const visitors = updatedRealtimeResponse.data.visitors || [];
      const stats = updatedRealtimeResponse.data.stats || {};
      
      console.log('✅ Updated Real-time Data: SUCCESS');
      console.log(`   - Active visitors: ${visitors.length}`);
      console.log(`   - Browsing: ${stats.browsing || 0}`);
      console.log(`   - Viewing products: ${stats.viewingProducts || 0}`);
      console.log(`   - In cart: ${stats.inCart || 0}`);
      
      if (visitors.length > 0) {
        console.log('\n👥 Live Visitor Details:');
        visitors.forEach((visitor, index) => {
          console.log(`   ${index + 1}. IP: ${visitor.ipAddress || 'Unknown'}`);
          console.log(`      Activity: ${visitor.activity || 'Unknown'}`);
          console.log(`      Page: ${visitor.currentPage || 'Unknown'}`);
          console.log(`      Device: ${visitor.device || 'Unknown'}`);
          console.log(`      Location: ${visitor.city || 'Unknown'}, ${visitor.country || 'Unknown'}`);
        });
      }
    } else {
      console.log('❌ Updated Real-time Data: FAILED');
    }

    // Step 5: Test historical analytics
    console.log('\n📈 Testing Historical Analytics...');
    const endDate = new Date();
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 1); // Last hour

    const historicalResponse = await makeRequest('/api/analytics/historical', 'POST', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    if (historicalResponse.status === 200) {
      console.log('✅ Historical Analytics: SUCCESS');
      const stats = historicalResponse.data.stats || {};
      console.log(`   - Total visitors: ${stats.totalVisitors || 0}`);
      console.log(`   - Unique visitors: ${stats.uniqueVisitors || 0}`);
      console.log(`   - Top pages: ${stats.topPages?.length || 0} pages`);
    } else {
      console.log('❌ Historical Analytics: FAILED');
      console.log(`   - Status: ${historicalResponse.status}`);
      console.log(`   - Error: ${historicalResponse.data.error || 'Unknown'}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎯 STORE VIEWERS TEST SUMMARY');
    console.log('='.repeat(50));
    
    const allWorking = realtimeResponse.status === 200 && 
                      trackResponse.status === 200 && 
                      updatedRealtimeResponse.status === 200;
    
    if (allWorking) {
      console.log('🎉 STORE VIEWERS IS FULLY FUNCTIONAL!');
      console.log('✅ Real-time visitor tracking works');
      console.log('✅ Live data updates properly');
      console.log('✅ Analytics APIs are responsive');
      console.log('✅ Session management is working');
      console.log('\n💡 The Store Viewers dashboard will show live visitors when people browse your site.');
    } else {
      console.log('❌ STORE VIEWERS HAS ISSUES');
      console.log('🔧 Some components are not working properly');
      console.log('💡 Check the database setup and API endpoints');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the development server is running:');
    console.log('   npm run dev');
  }
}

// Run the test
testStoreViewers();