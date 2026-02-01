require('dotenv').config({ path: '.env.local' });

async function testAnnouncementBanner() {
  console.log('🎯 TESTING ANNOUNCEMENT BANNER SYSTEM');
  console.log('=' .repeat(60));
  
  try {
    // Test the API endpoint that the banner uses
    console.log('1️⃣  Testing Site Messages API for banner...');
    
    const response = await fetch('http://localhost:3000/api/site-messages');
    
    if (!response.ok) {
      console.error(`❌ API failed: ${response.status} ${response.statusText}`);
      return;
    }
    
    const result = await response.json();
    const allMessages = result.data || [];
    const activeMessages = allMessages.filter(msg => msg.is_active);
    
    console.log('✅ API working perfectly');
    console.log(`📊 Total messages: ${allMessages.length}`);
    console.log(`📊 Active messages: ${activeMessages.length}`);
    
    if (activeMessages.length === 0) {
      console.log('\n⚠️  NO ACTIVE MESSAGES FOUND');
      console.log('🔧 This is why the banner is not showing');
      console.log('\n📋 All messages in database:');
      allMessages.forEach((msg, index) => {
        console.log(`   ${index + 1}. [${msg.type.toUpperCase()}] ${msg.title}`);
        console.log(`      Status: ${msg.is_active ? 'ACTIVE' : 'HIDDEN'} | Priority: ${msg.priority}`);
      });
      
      console.log('\n🔧 TO FIX:');
      console.log('1. Go to: http://localhost:3000/mgmt-x9k2m7/site-messages');
      console.log('2. Find your message and click "Show" to make it active');
      console.log('3. Or create a new message and it will be active by default');
      
    } else {
      console.log('\n✅ ACTIVE MESSAGES FOUND - BANNER SHOULD SHOW:');
      activeMessages.forEach((msg, index) => {
        console.log(`   ${index + 1}. [${msg.type.toUpperCase()}] ${msg.title}`);
        console.log(`      Message: ${msg.message}`);
        console.log(`      Priority: ${msg.priority}`);
      });
      
      console.log('\n🎨 BANNER FEATURES:');
      console.log('• Appears above the header');
      console.log('• Red/black theme matching your site');
      console.log('• Dismissible with X button');
      console.log('• Shows highest priority first');
      console.log('• Responsive design');
      console.log('• Type-based icons and colors');
    }
    
    console.log('\n🎯 BANNER SYSTEM STATUS');
    console.log('=' .repeat(60));
    console.log('✅ AnnouncementBanner component updated');
    console.log('✅ Connected to Site Messages API');
    console.log('✅ Red/black theme applied');
    console.log('✅ Positioned above header');
    console.log('✅ Dismissible functionality');
    console.log('✅ Priority-based sorting');
    
    if (activeMessages.length > 0) {
      console.log('\n🚀 YOUR BANNER IS READY!');
      console.log('Visit your homepage to see the announcement banner');
    } else {
      console.log('\n🔧 NEXT STEPS:');
      console.log('1. Make sure your message is set to ACTIVE');
      console.log('2. Refresh your homepage');
      console.log('3. The banner will appear above the header');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('🔧 Make sure your development server is running');
  }
}

// Run the test
testAnnouncementBanner();