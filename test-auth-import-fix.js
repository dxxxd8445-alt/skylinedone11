#!/usr/bin/env node

/**
 * Test Auth Import Fix
 * 
 * This script verifies:
 * 1. Both AuthDropdown and MobileAuth are properly imported
 * 2. AuthDropdown is used in desktop section
 * 3. MobileAuth is used in mobile section
 * 4. No undefined component references
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Testing Auth Import Fix...\n');

function testAuthImports() {
  console.log('1. Testing Auth Component Imports...');
  
  const headerPath = path.join(__dirname, 'components', 'header.tsx');
  
  if (!fs.existsSync(headerPath)) {
    console.log('❌ Header component not found');
    return false;
  }
  
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  
  // Check for both imports
  const hasAuthDropdownImport = headerContent.includes('import { AuthDropdown } from "@/components/auth-dropdown"');
  const hasMobileAuthImport = headerContent.includes('import { MobileAuth } from "@/components/mobile-auth"');
  
  // Check for proper usage
  const authDropdownUsage = headerContent.includes('<AuthDropdown />');
  const mobileAuthUsage = headerContent.includes('<MobileAuth />');
  
  // Check that both are used in correct contexts
  const desktopSection = headerContent.substring(
    headerContent.indexOf('Desktop Controls'),
    headerContent.indexOf('Mobile Menu - Optimized for Mobile UX')
  );
  const mobileSection = headerContent.substring(
    headerContent.indexOf('Quick Actions - Mobile Optimized'),
    headerContent.indexOf('Settings - Mobile Optimized')
  );
  
  const authDropdownInDesktop = desktopSection.includes('<AuthDropdown />');
  const mobileAuthInMobile = mobileSection.includes('<MobileAuth />');
  
  if (hasAuthDropdownImport && hasMobileAuthImport && authDropdownUsage && mobileAuthUsage && authDropdownInDesktop && mobileAuthInMobile) {
    console.log('✅ Auth imports and usage fixed');
    console.log('   - AuthDropdown imported and used in desktop');
    console.log('   - MobileAuth imported and used in mobile');
    console.log('   - No undefined component references');
    return true;
  } else {
    console.log('❌ Auth import issues:');
    if (!hasAuthDropdownImport) console.log('   - AuthDropdown not imported');
    if (!hasMobileAuthImport) console.log('   - MobileAuth not imported');
    if (!authDropdownUsage) console.log('   - AuthDropdown not used');
    if (!mobileAuthUsage) console.log('   - MobileAuth not used');
    if (!authDropdownInDesktop) console.log('   - AuthDropdown not in desktop section');
    if (!mobileAuthInMobile) console.log('   - MobileAuth not in mobile section');
    return false;
  }
}

// Run test
const success = testAuthImports();

if (success) {
  console.log('\n🎉 Auth import fix successful!');
  console.log('\n✨ Fix Applied:');
  console.log('   • Added AuthDropdown import back for desktop usage');
  console.log('   • Kept MobileAuth import for mobile usage');
  console.log('   • Both components properly referenced');
  console.log('   • No more "AuthDropdown is not defined" error');
  
  console.log('\n📱 Component Usage:');
  console.log('   • Desktop: Uses AuthDropdown (complex dropdown)');
  console.log('   • Mobile: Uses MobileAuth (clean buttons)');
  console.log('   • Each optimized for their respective platforms');
} else {
  console.log('\n❌ Auth import fix needs attention');
}

process.exit(success ? 0 : 1);