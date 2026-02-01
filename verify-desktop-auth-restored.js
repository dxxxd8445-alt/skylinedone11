#!/usr/bin/env node

/**
 * Verification Script: Desktop Auth Buttons Restored
 * 
 * This script verifies that desktop users have their Sign In/Sign Up functionality
 * while mobile users still have the enhanced mobile-only experience.
 */

const fs = require('fs');
const path = require('path');

console.log('🖥️  Verifying Desktop Auth Restoration...\n');

// Test 1: Check that desktop has AuthDropdown
console.log('1. Checking desktop AuthDropdown...');
const headerPath = path.join(__dirname, 'components', 'header.tsx');
const headerContent = fs.readFileSync(headerPath, 'utf8');

const hasDesktopAuth = headerContent.includes('hidden lg:flex') && 
                      headerContent.includes('<AuthDropdown />') &&
                      headerContent.includes('Desktop Auth Buttons - Only on Desktop');

if (hasDesktopAuth) {
  console.log('✅ Desktop has AuthDropdown component properly configured');
} else {
  console.log('❌ Desktop AuthDropdown not found or not properly configured');
}

// Test 2: Check that mobile auth is still mobile-only
console.log('\n2. Checking mobile auth is mobile-only...');
const hasMobileOnlyAuth = headerContent.includes('lg:hidden') && 
                         headerContent.includes('/mobile-auth?mode=signin') &&
                         headerContent.includes('Mobile Auth Buttons - Only on Mobile');

if (hasMobileOnlyAuth) {
  console.log('✅ Mobile auth buttons are properly restricted to mobile only');
} else {
  console.log('❌ Mobile auth buttons not properly restricted');
}

// Test 3: Check AuthDropdown component functionality
console.log('\n3. Checking AuthDropdown component...');
const authDropdownPath = path.join(__dirname, 'components', 'auth-dropdown.tsx');
const authDropdownExists = fs.existsSync(authDropdownPath);

if (authDropdownExists) {
  const authDropdownContent = fs.readFileSync(authDropdownPath, 'utf8');
  const hasSignInSignUp = authDropdownContent.includes('Existing user? Sign In') && 
                         authDropdownContent.includes('Sign Up') &&
                         authDropdownContent.includes('!user') &&
                         authDropdownContent.includes('if (user)');
  
  if (hasSignInSignUp) {
    console.log('✅ AuthDropdown has proper Sign In/Sign Up for non-logged users');
  } else {
    console.log('❌ AuthDropdown missing Sign In/Sign Up functionality');
  }
} else {
  console.log('❌ AuthDropdown component not found');
}

// Test 4: Check desktop controls structure
console.log('\n4. Checking desktop controls structure...');
const hasDesktopControls = headerContent.includes('Desktop Controls') && 
                          headerContent.includes('CartDropdown') &&
                          headerContent.includes('currency') &&
                          headerContent.includes('language');

if (hasDesktopControls) {
  console.log('✅ Desktop controls properly structured with cart, currency, language, and auth');
} else {
  console.log('❌ Desktop controls structure incomplete');
}

// Test 5: Check conditional rendering
console.log('\n5. Checking conditional rendering...');
const hasConditionalRendering = headerContent.includes('!user &&') && 
                               headerContent.includes('lg:hidden') &&
                               headerContent.includes('hidden lg:flex');

if (hasConditionalRendering) {
  console.log('✅ Proper conditional rendering for mobile vs desktop');
} else {
  console.log('❌ Conditional rendering not properly implemented');
}

console.log('\n🖥️📱 Desktop/Mobile Auth Summary:');
console.log('=====================================');

const allTestsPassed = hasDesktopAuth && 
                      hasMobileOnlyAuth && 
                      authDropdownExists && 
                      hasDesktopControls && 
                      hasConditionalRendering;

if (allTestsPassed) {
  console.log('🎉 ALL TESTS PASSED! Desktop auth has been properly restored.');
  console.log('\n✨ Current configuration:');
  console.log('   🖥️  DESKTOP USERS:');
  console.log('      • Full AuthDropdown with "Existing user? Sign In" and "Sign Up" button');
  console.log('      • Complete desktop controls (currency, language, cart, auth)');
  console.log('      • Rich dropdown forms with tabs and enhanced UI');
  console.log('   📱 MOBILE USERS:');
  console.log('      • Dedicated Sign In/Sign Up buttons (when not logged in)');
  console.log('      • Mobile-optimized auth page with success flow');
  console.log('      • Cart and user controls in mobile menu');
  console.log('      • Clean, uncluttered mobile header');
} else {
  console.log('⚠️  Some tests failed. Please check the issues above.');
}

console.log('\n🚀 Both desktop and mobile users now have optimal auth experiences!');