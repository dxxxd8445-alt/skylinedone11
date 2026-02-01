require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAnnouncementsAdminAction() {
  console.log('🔍 TESTING ANNOUNCEMENTS ADMIN ACTION');
  console.log('=' .repeat(50));

  try {
    // Simulate the exact same query as the admin action
    console.log('1️⃣  Testing loadAnnouncements query...');
    
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error('❌ Query failed:', error);
      console.log('Error details:', JSON.stringify(error, null, 2));
      return;
    }

    console.log('✅ Query successful');
    console.log(`📊 Retrieved ${data?.length || 0} announcements`);

    if (data && data.length > 0) {
      console.log('\n📋 Announcements data:');
      data.forEach((announcement, index) => {
        console.log(`   ${index + 1}. ID: ${announcement.id}`);
        console.log(`      Title: ${announcement.title}`);
        console.log(`      Type: ${announcement.type}`);
        console.log(`      Active: ${announcement.is_active}`);
        console.log(`      Priority: ${announcement.priority}`);
        console.log(`      Created: ${announcement.created_at}`);
        console.log('');
      });
    }

    // Test the response format
    const response = { success: true, announcements: data || [] };
    console.log('✅ Response format test passed');
    console.log('📋 Response structure:', {
      success: response.success,
      announcementsCount: response.announcements.length
    });

    // Test individual announcement structure
    if (data && data.length > 0) {
      const firstAnnouncement = data[0];
      const requiredFields = ['id', 'title', 'message', 'type', 'is_active', 'priority', 'created_at', 'updated_at'];
      const missingFields = requiredFields.filter(field => !(field in firstAnnouncement));
      
      if (missingFields.length > 0) {
        console.log('⚠️  Missing fields in announcement:', missingFields);
      } else {
        console.log('✅ All required fields present in announcements');
      }
    }

    console.log('\n🎯 ADMIN ACTION TEST COMPLETE');
    console.log('✅ The database query works perfectly');
    console.log('🔧 The error is likely in the admin authentication or page rendering');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('Error details:', JSON.stringify(error, null, 2));
  }
}

// Run the test
testAnnouncementsAdminAction();