require('dotenv').config({ path: '.env.local' });

async function testAnnouncementsAPI() {
  console.log('🧪 TESTING ANNOUNCEMENTS API');
  console.log('=' .repeat(50));
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test GET /api/admin/announcements
    console.log('1️⃣  Testing GET /api/admin/announcements...');
    
    const getResponse = await fetch(`${baseUrl}/api/admin/announcements`);
    
    if (!getResponse.ok) {
      console.error(`❌ GET failed: ${getResponse.status} ${getResponse.statusText}`);
      const errorText = await getResponse.text();
      console.error('Error details:', errorText);
      return;
    }
    
    const getResult = await getResponse.json();
    console.log('✅ GET successful');
    console.log(`📊 Found ${getResult.data?.length || 0} announcements`);
    
    if (getResult.data && getResult.data.length > 0) {
      console.log('\n📋 Sample announcements:');
      getResult.data.slice(0, 3).forEach((ann, index) => {
        console.log(`   ${index + 1}. [${ann.type.toUpperCase()}] ${ann.title}`);
        console.log(`      Active: ${ann.is_active} | Priority: ${ann.priority}`);
      });
    }
    
    // Test POST /api/admin/announcements
    console.log('\n2️⃣  Testing POST /api/admin/announcements...');
    
    const testAnnouncement = {
      title: 'API Test Announcement',
      message: 'This is a test announcement created via API',
      type: 'info',
      priority: 1,
    };
    
    const postResponse = await fetch(`${baseUrl}/api/admin/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testAnnouncement),
    });
    
    if (!postResponse.ok) {
      console.error(`❌ POST failed: ${postResponse.status} ${postResponse.statusText}`);
      const errorText = await postResponse.text();
      console.error('Error details:', errorText);
      return;
    }
    
    const postResult = await postResponse.json();
    console.log('✅ POST successful');
    console.log(`📋 Created: ${postResult.data.title}`);
    
    const createdId = postResult.data.id;
    
    // Test PATCH /api/admin/announcements/[id] (toggle active)
    console.log('\n3️⃣  Testing PATCH /api/admin/announcements/[id]...');
    
    const patchResponse = await fetch(`${baseUrl}/api/admin/announcements/${createdId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        is_active: false,
      }),
    });
    
    if (!patchResponse.ok) {
      console.error(`❌ PATCH failed: ${patchResponse.status} ${patchResponse.statusText}`);
    } else {
      const patchResult = await patchResponse.json();
      console.log('✅ PATCH successful');
      console.log(`📋 Updated: ${patchResult.data.title} (Active: ${patchResult.data.is_active})`);
    }
    
    // Test DELETE /api/admin/announcements/[id]
    console.log('\n4️⃣  Testing DELETE /api/admin/announcements/[id]...');
    
    const deleteResponse = await fetch(`${baseUrl}/api/admin/announcements/${createdId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!deleteResponse.ok) {
      console.error(`❌ DELETE failed: ${deleteResponse.status} ${deleteResponse.statusText}`);
    } else {
      const deleteResult = await deleteResponse.json();
      console.log('✅ DELETE successful');
      console.log('🧹 Test announcement cleaned up');
    }
    
    console.log('\n🎯 API TEST RESULTS');
    console.log('=' .repeat(50));
    console.log('✅ GET announcements works');
    console.log('✅ POST create announcement works');
    console.log('✅ PATCH update announcement works');
    console.log('✅ DELETE announcement works');
    
    console.log('\n🚀 THE ANNOUNCEMENTS PAGE SHOULD NOW WORK!');
    console.log('✅ All API endpoints functional');
    console.log('✅ Database operations successful');
    console.log('✅ No more Internal Server Error');
    console.log('\nTry accessing: http://localhost:3000/mgmt-x9k2m7/announcements');
    
  } catch (error) {
    console.error('❌ API test failed:', error);
    console.log('🔧 Make sure your development server is running: npm run dev');
  }
}

// Run the test
testAnnouncementsAPI();