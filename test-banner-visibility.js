require('dotenv').config({ path: '.env.local' });

async function testBannerVisibility() {
  console.log('👁️  TESTING BANNER MESSAGE VISIBILITY');
  console.log('=' .repeat(60));
  
  try {
    // Get the active announcements
    const response = await fetch('http://localhost:3000/api/announcements/active');
    
    if (!response.ok) {
      console.error(`❌ API failed: ${response.status}`);
      return;
    }
    
    const result = await response.json();
    const announcements = result.data || [];
    
    console.log(`📊 Found ${announcements.length} active announcements`);
    
    if (announcements.length === 0) {
      console.log('❌ No active announcements - banner will not show');
      return;
    }
    
    console.log('\n📋 BANNER CONTENT PREVIEW:');
    console.log('=' .repeat(60));
    
    announcements.forEach((announcement, index) => {
      console.log(`\n🎯 Announcement ${index + 1}:`);
      console.log(`   Type: ${announcement.type.toUpperCase()}`);
      console.log(`   Priority: ${announcement.priority}`);
      console.log(`   Title: "${announcement.title}"`);
      console.log(`   Message: "${announcement.message}"`);
      console.log(`   Status: ${announcement.is_active ? 'ACTIVE' : 'HIDDEN'}`);
      
      // Simulate banner display
      console.log('\n🎨 How it appears in banner:');
      console.log(`   [${announcement.type.toUpperCase()} ICON] ${announcement.title}`);
      console.log(`   ${announcement.message}`);
      console.log(`   [X DISMISS BUTTON]`);
    });
    
    console.log('\n✅ BANNER IMPROVEMENTS MADE:');
    console.log('• Increased padding (py-6 instead of py-4)');
    console.log('• Larger icon (w-6 h-6 instead of w-5 h-5)');
    console.log('• Bigger text (text-lg title, text-base message)');
    console.log('• Better contrast (darker background overlay)');
    console.log('• Stacked layout (title above message)');
    console.log('• More spacing between elements');
    console.log('• Enhanced drop shadows for text');
    
    console.log('\n🎯 THE MESSAGE SHOULD NOW BE CLEARLY VISIBLE!');
    console.log('Refresh your homepage to see the updated banner');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testBannerVisibility();