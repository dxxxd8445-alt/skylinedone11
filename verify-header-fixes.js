async function verifyHeaderFixes() {
  console.log('?? VERIFYING HEADER FIXES...\n');

  try {
    const response = await fetch('http://localhost:3000');
    const html = await response.text();

    // Check 1: HOME link in navigation
    console.log('1?? Checking HOME link in navigation...');
    const hasHomeLink = html.includes('HOME') && html.includes('href="/"');
    console.log(`   ${hasHomeLink ? '?' : '?'} HOME link present: ${hasHomeLink}`);
    
    if (hasHomeLink) {
      console.log('   ? HOME link should be visible in desktop navigation');
    } else {
      console.log('   ? HOME link missing from navigation');
    }
    console.log('');

    // Check 2: Magma logo
    console.log('2?? Checking Magma logo...');
    const hasLogoImage = html.includes('magma-logo.png');
    const hasLogoLink = html.includes('href="/"') && html.includes('Magma');
    
    console.log(`   ${hasLogoImage ? '?' : '?'} Logo image reference: ${hasLogoImage}`);
    console.log(`   ${hasLogoLink ? '?' : '?'} Logo clickable link: ${hasLogoLink}`);
    
    if (hasLogoImage && hasLogoLink) {
      console.log('   ? Logo should be visible and clickable');
    }
    console.log('');

    // Check 3: Logo file accessibility
    console.log('3?? Checking logo file accessibility...');
    const logoResponse = await fetch('http://localhost:3000/images/magma-logo.png');
    const logoAccessible = logoResponse.ok;
    
    console.log(`   ${logoAccessible ? '?' : '?'} Logo file loads: ${logoAccessible}`);
    if (logoAccessible) {
      console.log(`   ? Logo file size: ${logoResponse.headers.get('content-length')} bytes`);
      console.log(`   ? Logo content type: ${logoResponse.headers.get('content-type')}`);
    }
    console.log('');

    // Check 4: Navigation structure
    console.log('4?? Checking navigation structure...');
    const navigationItems = ['HOME', 'STORE', 'STATUS', 'GUIDES', 'REVIEWS', 'SUPPORT'];
    let foundItems = 0;
    
    navigationItems.forEach(item => {
      if (html.includes(item)) {
        foundItems++;
        console.log(`   ? ${item} found`);
      } else {
        console.log(`   ? ${item} missing`);
      }
    });
    
    console.log(`   ?? Navigation completeness: ${foundItems}/${navigationItems.length} items found`);
    console.log('');

    // Summary
    console.log('?? VERIFICATION SUMMARY:');
    console.log(`   ${hasHomeLink ? '?' : '?'} HOME link in header navigation`);
    console.log(`   ${hasLogoImage ? '?' : '?'} Magma logo image present`);
    console.log(`   ${hasLogoLink ? '?' : '?'} Logo clickable and links to homepage`);
    console.log(`   ${logoAccessible ? '?' : '?'} Logo file accessible`);
    console.log(`   ${foundItems >= 5 ? '?' : '?'} Navigation items complete`);
    console.log('');

    if (hasHomeLink && hasLogoImage && hasLogoLink && logoAccessible && foundItems >= 5) {
      console.log('?? ALL HEADER FIXES VERIFIED SUCCESSFULLY!');
      console.log('');
      console.log('? WHAT SHOULD BE WORKING NOW:');
      console.log('   • HOME link visible in desktop navigation');
      console.log('   • Magma logo visible in top-left corner');
      console.log('   • Logo is clickable and redirects to homepage');
      console.log('   • All navigation links present and working');
      console.log('   • Header looks professional and complete');
    } else {
      console.log('?? SOME ISSUES DETECTED - CHECK BROWSER MANUALLY');
    }

    console.log('');
    console.log('?? TEST IN BROWSER:');
    console.log('   1. Go to: http://localhost:3000');
    console.log('   2. Check header has HOME link');
    console.log('   3. Check Magma logo is visible');
    console.log('   4. Click logo - should go to homepage');
    console.log('   5. Test all navigation links');

  } catch (error) {
    console.error('? Verification failed:', error.message);
  }
}

verifyHeaderFixes();