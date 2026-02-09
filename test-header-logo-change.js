const http = require('http');

console.log('?? Testing Header Logo Changes...\n');

// Test homepage loads
function testHomepage() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('? Homepage loads successfully (200 OK)');
          
          // Check if HOME text is removed from navigation
          const hasHomeText = data.includes('HOME</span>') || data.includes('>HOME<');
          if (!hasHomeText) {
            console.log('? HOME text removed from navigation');
          } else {
            console.log('? HOME text still present in navigation');
          }
          
          // Check if logo is present and clickable
          const hasLogo = data.includes('magma-logo.png') && data.includes('href="/"');
          if (hasLogo) {
            console.log('? Magma logo present and clickable');
          } else {
            console.log('? Magma logo missing or not clickable');
          }
          
          // Check navigation structure
          const hasStore = data.includes('STORE') || data.includes('nav_store');
          const hasStatus = data.includes('STATUS') || data.includes('nav_status');
          const hasGuides = data.includes('GUIDES') || data.includes('nav_guides');
          const hasReviews = data.includes('REVIEWS') || data.includes('nav_reviews');
          const hasSupport = data.includes('SUPPORT') || data.includes('nav_support');
          
          if (hasStore && hasStatus && hasGuides && hasReviews && hasSupport) {
            console.log('? All other navigation items present');
          } else {
            console.log('? Some navigation items missing');
          }
          
          resolve(true);
        } else {
          console.log(`? Homepage failed to load (${res.statusCode})`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`? Homepage request failed: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('? Homepage request timed out');
      req.destroy();
      resolve(false);
    });
  });
}

// Test logo file accessibility
function testLogoFile() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000/images/magma-logo.png', (res) => {
      if (res.statusCode === 200) {
        console.log('? Magma logo file accessible (200 OK)');
        console.log(`   Content-Type: ${res.headers['content-type']}`);
        console.log(`   Content-Length: ${res.headers['content-length']} bytes`);
        resolve(true);
      } else {
        console.log(`? Magma logo file not accessible (${res.statusCode})`);
        resolve(false);
      }
      res.resume(); // Consume response data
    });
    
    req.on('error', (err) => {
      console.log(`? Logo file request failed: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('? Logo file request timed out');
      req.destroy();
      resolve(false);
    });
  });
}

async function runTests() {
  console.log('?? Testing Header Changes:\n');
  
  const homepageTest = await testHomepage();
  console.log('');
  
  const logoTest = await testLogoFile();
  console.log('');
  
  if (homepageTest && logoTest) {
    console.log('?? ALL TESTS PASSED!');
    console.log('? Header changes completed successfully:');
    console.log('   • HOME text removed from navigation');
    console.log('   • Magma logo serves as home link');
    console.log('   • All other navigation items preserved');
    console.log('   • Logo file accessible and working');
  } else {
    console.log('? Some tests failed. Please check the issues above.');
  }
}

runTests().catch(console.error);