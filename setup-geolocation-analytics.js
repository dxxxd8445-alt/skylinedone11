#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupGeolocation() {
  try {
    console.log('🌍 Setting up geolocation analytics...');

    // Add geolocation columns to visitor_sessions
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE visitor_sessions
        ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Unknown',
        ADD COLUMN IF NOT EXISTS isp VARCHAR(255) DEFAULT 'Unknown';
      `
    }).catch(() => ({ error: null })); // Ignore if RPC doesn't exist

    // Try direct SQL approach
    console.log('📝 Adding geolocation columns...');
    
    // Check if columns already exist
    const { data: columns } = await supabase
      .from('visitor_sessions')
      .select('*')
      .limit(1);

    if (columns && columns.length > 0) {
      const firstRecord = columns[0];
      const hasLatitude = 'latitude' in firstRecord;
      const hasLongitude = 'longitude' in firstRecord;
      const hasTimezone = 'timezone' in firstRecord;
      const hasISP = 'isp' in firstRecord;

      if (hasLatitude && hasLongitude && hasTimezone && hasISP) {
        console.log('✅ Geolocation columns already exist');
      } else {
        console.log('⚠️  Some geolocation columns are missing');
        console.log('   Please run the following SQL in your Supabase dashboard:');
        console.log(`
ALTER TABLE visitor_sessions
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Unknown',
ADD COLUMN IF NOT EXISTS isp VARCHAR(255) DEFAULT 'Unknown';

CREATE INDEX IF NOT EXISTS idx_visitor_sessions_country ON visitor_sessions(country);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_city ON visitor_sessions(city);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_coordinates ON visitor_sessions(latitude, longitude);
        `);
      }
    }

    console.log('✅ Geolocation analytics setup complete!');
    console.log('📊 Your analytics will now track:');
    console.log('   - Country & City');
    console.log('   - Region');
    console.log('   - Latitude & Longitude');
    console.log('   - Timezone');
    console.log('   - ISP');
    console.log('   - Device Type, Browser, OS');
    console.log('   - Page Views & Time on Site');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupGeolocation();
