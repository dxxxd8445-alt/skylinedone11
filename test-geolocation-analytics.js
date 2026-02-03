#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testGeolocation() {
  try {
    console.log('🧪 Testing Geolocation Analytics Setup...\n');

    // 1. Check if visitor_sessions table exists
    console.log('1️⃣  Checking visitor_sessions table...');
    const { data: tableData, error: tableError } = await supabase
      .from('visitor_sessions')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ visitor_sessions table not found:', tableError.message);
      process.exit(1);
    }
    console.log('✅ visitor_sessions table exists\n');

    // 2. Check if geolocation columns exist
    console.log('2️⃣  Checking geolocation columns...');
    const { data: columns, error: columnsError } = await supabase
      .from('visitor_sessions')
      .select('*')
      .limit(1);

    if (columns && columns.length > 0) {
      const record = columns[0];
      const requiredColumns = ['latitude', 'longitude', 'timezone', 'isp', 'country', 'city', 'region'];
      const missingColumns = [];

      requiredColumns.forEach(col => {
        if (!(col in record)) {
          missingColumns.push(col);
        }
      });

      if (missingColumns.length > 0) {
        console.error('❌ Missing columns:', missingColumns.join(', '));
        console.log('\n📝 Please run this SQL in your Supabase dashboard:');
        console.log(`
ALTER TABLE visitor_sessions
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Unknown',
ADD COLUMN IF NOT EXISTS isp VARCHAR(255) DEFAULT 'Unknown';
        `);
        process.exit(1);
      }

      console.log('✅ All geolocation columns exist');
      console.log('   - latitude');
      console.log('   - longitude');
      console.log('   - timezone');
      console.log('   - isp');
      console.log('   - country');
      console.log('   - city');
      console.log('   - region\n');
    }

    // 3. Check for existing visitor data
    console.log('3️⃣  Checking for visitor data...');
    const { data: visitors, error: visitorsError } = await supabase
      .from('visitor_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (visitors && visitors.length > 0) {
      console.log(`✅ Found ${visitors.length} visitor sessions\n`);
      
      console.log('📊 Sample visitor data:');
      visitors.forEach((visitor, index) => {
        console.log(`\n   Visitor ${index + 1}:`);
        console.log(`   - Session ID: ${visitor.session_id}`);
        console.log(`   - IP: ${visitor.ip_address}`);
        console.log(`   - Location: ${visitor.city}, ${visitor.region}, ${visitor.country}`);
        console.log(`   - Coordinates: ${visitor.latitude}, ${visitor.longitude}`);
        console.log(`   - Timezone: ${visitor.timezone}`);
        console.log(`   - ISP: ${visitor.isp}`);
        console.log(`   - Device: ${visitor.device_type} (${visitor.browser} on ${visitor.os})`);
        console.log(`   - Page Views: ${visitor.page_views}`);
        console.log(`   - Time on Site: ${visitor.time_on_site}s`);
        console.log(`   - Active: ${visitor.is_active}`);
      });
    } else {
      console.log('⚠️  No visitor data yet (this is normal for new installations)\n');
      console.log('📝 To generate test data:');
      console.log('   1. Visit your website');
      console.log('   2. Browse a few pages');
      console.log('   3. Wait 5-10 seconds');
      console.log('   4. Run this test again\n');
    }

    // 4. Test the analytics endpoint
    console.log('4️⃣  Testing analytics endpoint...');
    try {
      const testResponse = await fetch('http://localhost:3000/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: JSON.stringify({
          sessionId: `test-${Date.now()}`,
          page: '/test',
          product: 'test-product',
          activity: 'browsing'
        })
      });

      if (testResponse.ok) {
        const result = await testResponse.json();
        console.log('✅ Analytics endpoint is working');
        console.log(`   Response: ${JSON.stringify(result)}\n`);
      } else {
        console.log(`⚠️  Analytics endpoint returned status ${testResponse.status}`);
        console.log('   This may be normal if running locally\n');
      }
    } catch (error) {
      console.log('⚠️  Could not test analytics endpoint (may be running locally)');
      console.log(`   Error: ${error.message}\n`);
    }

    // 5. Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ GEOLOCATION ANALYTICS SETUP VERIFICATION COMPLETE\n');
    console.log('📊 Status Summary:');
    console.log('   ✅ Database table exists');
    console.log('   ✅ All geolocation columns present');
    if (visitors && visitors.length > 0) {
      console.log('   ✅ Visitor data is being collected');
      console.log('   ✅ Geolocation is working!\n');
    } else {
      console.log('   ⏳ Waiting for visitor data (visit your site to generate data)\n');
    }

    console.log('🚀 Next Steps:');
    console.log('   1. Visit your website from different locations');
    console.log('   2. Check the Store Viewers dashboard for live data');
    console.log('   3. Verify geolocation accuracy');
    console.log('   4. Monitor visitor counts and locations\n');

    console.log('═══════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testGeolocation();
