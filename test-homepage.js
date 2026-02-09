const { createClient } = require('@supabase/supabase-js');

async function testHomepage() {
  console.log('?? Testing homepage and header...\n');

  try {
    // Test 1: Homepage loads
    console.log('1?? Testing homepage...');
    const response = await fetch('http://localhost:3000');
    
    if (response.ok) {
      const html = await response.text();
      
      // Check for key elements
      const hasLogo = html.includes('magma-logo.png') || html.includes('Magma');
      const hasNavigation = html.includes('HOME') || html.includes('STORE');
      const hasHeader = html.includes('header') || html.includes('nav');
      
      console.log(`   ? Homepage loads: ${response.status} ${response.statusText}`);
      console.log(`   ${hasLogo ? '?' : '?'} Logo present: ${hasLogo}`);
      console.log(`   ${hasNavigation ? '?' : '?'} Navigation present: ${hasNavigation}`);
      console.log(`   ${hasHeader ? '?' : '?'} Header structure present: ${hasHeader}`);
      
      // Check for specific content
      if (html.includes('Play Without Limits')) {
        console.log('   ? Hero section found');
      }
      if (html.includes('Explore Cheats')) {
        console.log('   ? CTA button found');
      }
      
    } else {
      console.log(`   ? Homepage failed: ${response.status} ${response.statusText}`);
    }
    console.log('');

    // Test 2: Store page loads
    console.log('2?? Testing store page...');
    const storeResponse = await fetch('http://localhost:3000/store');
    
    if (storeResponse.ok) {
      console.log(`   ? Store page loads: ${storeResponse.status} ${storeResponse.statusText}`);
    } else {
      console.log(`   ? Store page failed: ${storeResponse.status} ${storeResponse.statusText}`);
    }
    console.log('');

    // Test 3: Logo file exists
    console.log('3?? Testing logo file...');
    const logoResponse = await fetch('http://localhost:3000/images/magma-logo.png');
    
    if (logoResponse.ok) {
      console.log(`   ? Logo file accessible: ${logoResponse.status} ${logoResponse.statusText}`);
      console.log(`   ? Logo content type: ${logoResponse.headers.get('content-type')}`);
    } else {
      console.log(`   ? Logo file failed: ${logoResponse.status} ${logoResponse.statusText}`);
    }
    console.log('');

    // Test 4: API endpoints
    console.log('4?? Testing API endpoints...');
    const apiResponse = await fetch('http://localhost:3000/api/test-connection');
    
    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      console.log(`   ? API connection: ${apiData.success ? 'Working' : 'Failed'}`);
    } else {
      console.log(`   ? API test failed: ${apiResponse.status}`);
    }
    console.log('');

    console.log('?? HOMEPAGE TEST COMPLETE!\n');
    console.log('?? VERIFY MANUALLY:');
    console.log('   ?? Homepage: http://localhost:3000');
    console.log('   ?? Store: http://localhost:3000/store');
    console.log('   ?? Status: http://localhost:3000/status');
    console.log('   ?? Admin: http://localhost:3000/mgmt-x9k2m7/login');
    console.log('');
    console.log('? EXPECTED RESULTS:');
    console.log('   • Magma logo visible in top-left corner');
    console.log('   • HOME link visible in navigation');
    console.log('   • Logo clickable and redirects to homepage');
    console.log('   • All navigation links working');
    console.log('   • Hero section with "Play Without Limits"');
    console.log('   • "Explore Cheats" button working');

  } catch (error) {
    console.error('? Test failed:', error.message);
    console.log('\n?? Troubleshooting:');
    console.log('   1. Make sure dev server is running: npm run dev');
    console.log('   2. Check http://localhost:3000 in your browser');
    console.log('   3. Verify the header component changes were saved');
  }
}

testHomepage();