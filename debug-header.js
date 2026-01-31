const http = require('http');

console.log('🔍 Debugging Header Component...\n');

function checkHeaderRendering() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('📄 Page Status:', res.statusCode);
        
        // Check if header component is loading
        const hasHeader = data.includes('Header') || data.includes('header');
        console.log('🔧 Header component found:', hasHeader);
        
        // Check for navigation
        const hasNav = data.includes('<nav') || data.includes('nav');
        console.log('🧭 Navigation element found:', hasNav);
        
        // Check for logo references
        const hasLogoRef = data.includes('magma-logo') || data.includes('Magma');
        console.log('🖼️ Logo references found:', hasLogoRef);
        
        // Check for navigation items
        const hasStore = data.includes('STORE') || data.includes('Store');
        const hasStatus = data.includes('STATUS') || data.includes('Status');
        console.log('🏪 Store nav found:', hasStore);
        console.log('📊 Status nav found:', hasStatus);
        
        // Check for any JavaScript errors in the HTML
        const hasErrors = data.includes('error') || data.includes('Error');
        console.log('❌ Errors in HTML:', hasErrors);
        
        // Look for the specific navigation structure
        const navPattern = /nav.*?class.*?hidden.*?lg:flex/i;
        const hasDesktopNav = navPattern.test(data);
        console.log('🖥️ Desktop navigation found:', hasDesktopNav);
        
        resolve(true);
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Request failed:', err.message);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('⏰ Request timed out');
      req.destroy();
      resolve(false);
    });
  });
}

checkHeaderRendering().then(() => {
  console.log('\n🔍 Debug complete. Check the results above.');
}).catch(console.error);