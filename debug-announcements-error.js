require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugAnnouncementsError() {
  console.log('🔍 DEBUGGING ANNOUNCEMENTS ERROR');
  console.log('=' .repeat(50));

  try {
    // 1. Check if announcements table exists
    console.log('1️⃣  Checking announcements table...');
    
    const { data: announcements, error: announcementsError } = await supabase
      .from('announcements')
      .select('*')
      .limit(1);

    if (announcementsError) {
      console.error('❌ Announcements table error:', announcementsError.message);
      console.log('🔧 The announcements table does not exist or has permission issues');
      console.log('📋 Please run the SQL setup in Supabase SQL Editor');
      return;
    } else {
      console.log('✅ Announcements table accessible');
      console.log(`📊 Found ${announcements?.length || 0} sample records`);
    }

    // 2. Check if user_preferences table exists
    console.log('\n2️⃣  Checking user_preferences table...');
    
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .limit(1);

    if (preferencesError) {
      console.error('❌ User preferences table error:', preferencesError.message);
      console.log('🔧 The user_preferences table does not exist or has permission issues');
      console.log('📋 Please run the SQL setup in Supabase SQL Editor');
      return;
    } else {
      console.log('✅ User preferences table accessible');
    }

    // 3. Test the admin action directly
    console.log('\n3️⃣  Testing admin action...');
    
    try {
      // Simulate what the admin action does
      const { data: testAnnouncements, error: testError } = await supabase
        .from("announcements")
        .select("*")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (testError) {
        console.error('❌ Admin action simulation failed:', testError.message);
      } else {
        console.log('✅ Admin action simulation successful');
        console.log(`📊 Would return ${testAnnouncements?.length || 0} announcements`);
        
        if (testAnnouncements && testAnnouncements.length > 0) {
          console.log('\n📋 Sample announcements:');
          testAnnouncements.slice(0, 3).forEach((ann, index) => {
            console.log(`   ${index + 1}. [${ann.type.toUpperCase()}] ${ann.title} (${ann.is_active ? 'Active' : 'Hidden'})`);
          });
        }
      }
    } catch (actionError) {
      console.error('❌ Admin action error:', actionError);
    }

    // 4. Check RLS policies
    console.log('\n4️⃣  Checking RLS policies...');
    
    // Try with service role (should work)
    const { data: serviceRoleTest, error: serviceRoleError } = await supabase
      .from('announcements')
      .select('count')
      .limit(1);

    if (serviceRoleError) {
      console.error('❌ Service role access failed:', serviceRoleError.message);
      console.log('🔧 RLS policies may be blocking access');
    } else {
      console.log('✅ Service role access working');
    }

    // 5. Check environment variables
    console.log('\n5️⃣  Checking environment variables...');
    
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    let envIssues = false;
    requiredEnvVars.forEach(envVar => {
      if (process.env[envVar]) {
        console.log(`✅ ${envVar} is set`);
      } else {
        console.log(`❌ ${envVar} is missing`);
        envIssues = true;
      }
    });

    if (envIssues) {
      console.log('🔧 Please check your .env.local file');
    }

    console.log('\n🎯 DIAGNOSIS COMPLETE');
    console.log('=' .repeat(50));

    if (!announcementsError && !preferencesError && !testError) {
      console.log('✅ All database checks passed');
      console.log('🔧 The error might be in the admin authentication or permissions');
      console.log('📋 Try logging into the admin panel first at /mgmt-x9k2m7/login');
    } else {
      console.log('❌ Database setup issues detected');
      console.log('🔧 Please run the SQL setup in Supabase SQL Editor');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugAnnouncementsError();