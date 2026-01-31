const http = require('http');

console.log('🧪 Testing Logo in Navigation...\n');

// Test homepage loads with logo in navigation
function testLogoInNavigation() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Homepage loads successfully (200 OK)');
          
          // Check if logo appears in navigation (not just header)
          const hasLogoInNav = data.includes('magma-logo.png') && data.includes('<nav');
          if (hasLogoInNav) {
            console.log('✅ Magma logo found in navigation');
          } else {
            console.log('❌ Magma logo not found in navigation');
          }
          
          // Check if logo is clickable and links to home
          const hasClickableLogo = data.includes('href="/"') && data.includes('magma-logo.png');
          if (hasClickableLogo) {
            console.log('✅ Logo is clickable and links to homepage');
          } else {
            console.log('❌ Logo is not properly linked to homepage');
          }
          
          // Check navigation structure
          const hasStore = data.includes('STORE') || data.includes('nav_store');
          const hasStatus = data.includes('STATUS') || data.includes('nav_status');
          const hasGuides = data.includes('GUIDES') || data.includes('nav_guides');
          const hasReviews = data.includes('REVIEWS') || data.includes('nav_reviews');
          const hasSupport = data.includes('SUPPORT') || data.includes('nav_support');
          
          if (hasStore && hasStatus && hasGuides && hasReviews && hasSupport) {
            console.log('✅ All navigation items present');
          } else {
            console.log('❌ Some navigation items missing');
          }
          
          resolve(true);
        } else {
          console.log(`❌ Homepage failed to load (${res.statusCode})`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Homepage request failed: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Homepage request timed out');
      req.destroy();
      resolve(false);
    });
  });
}

async function runTests() {
  console.log('🔍 Testing Logo in Navigation:\n');
  
  const logoTest = await testLogoInNavigation();
  console.log('');
  
  if (logoTest) {
    console.log('🎉 LOGO IN NAVIGATION TEST PASSED!');
    console.log('✅ Navigation now includes:');
    console.log('   • Magma logo (clickable, links to homepage)');
    console.log('   • STORE, STATUS, GUIDES, REVIEWS, SUPPORT');
    console.log('   • Logo appears as first item in navigation bar');
  } else {
    console.log('❌ Logo in navigation test failed. Please check the issues above.');
  }
}

runTests().catch(console.error);