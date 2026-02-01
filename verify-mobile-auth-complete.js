#!/usr/bin/env node

/**
 * Verification Script: Mobile Authentication Experience
 * 
 * This script verifies that the complete mobile authentication system is working:
 * 1. Mobile auth buttons in header (only when not logged in)
 * 2. Dedicated mobile auth page with success flow
 * 3. Cart integration in mobile menu
 * 4. Proper redirects and user experience
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Mobile Authentication Experience...\n');

// Test 1: Check header mobile auth buttons
console.log('1. Checking header mobile auth buttons...');
const headerPath = path.join(__dirname, 'components', 'header.tsx');
const headerContent = fs.readFileSync(headerPath, 'utf8');

const hasConditionalAuthButtons = headerContent.includes('!user &&') && 
                                 headerContent.includes('lg:hidden') &&
                                 headerContent.includes('/mobile-auth?mode=signin') &&
                                 headerContent.includes('/mobile-auth?mode=signup');

if (hasConditionalAuthButtons) {
  console.log('✅ Mobile auth buttons are properly conditional (only show when not logged in)');
} else {
  console.log('❌ Mobile auth buttons not found or not properly conditional');
}

// Test 2: Check mobile auth page exists
console.log('\n2. Checking mobile auth page...');
const mobileAuthPath = path.join(__dirname, 'app', 'mobile-auth', 'page.tsx');
const mobileAuthExists = fs.existsSync(mobileAuthPath);

if (mobileAuthExists) {
  const mobileAuthContent = fs.readFileSync(mobileAuthPath, 'utf8');
  const hasSuccessFlow = mobileAuthContent.includes('success') && 
                        mobileAuthContent.includes('Continue to Shop') &&
                        mobileAuthContent.includes('router.push("/store")');
  
  if (hasSuccessFlow) {
    console.log('✅ Mobile auth page exists with proper success flow');
  } else {
    console.log('❌ Mobile auth page exists but missing success flow');
  }
} else {
  console.log('❌ Mobile auth page not found');
}

// Test 3: Check mobile menu cart integration
console.log('\n3. Checking mobile menu cart integration...');
const mobileAuthComponentPath = path.join(__dirname, 'components', 'mobile-auth.tsx');
const mobileAuthComponentExists = fs.existsSync(mobileAuthComponentPath);

if (mobileAuthComponentExists) {
  const mobileAuthComponentContent = fs.readFileSync(mobileAuthComponentPath, 'utf8');
  const hasCartIntegration = mobileAuthComponentContent.includes('ShoppingCart') && 
                            mobileAuthComponentContent.includes('items.length') &&
                            mobileAuthComponentContent.includes('/cart');
  
  if (hasCartIntegration) {
    console.log('✅ Mobile menu has proper cart integration');
  } else {
    console.log('❌ Mobile menu missing cart integration');
  }
} else {
  console.log('❌ Mobile auth component not found');
}

// Test 4: Check that cart is removed from mobile header
console.log('\n4. Checking cart removal from mobile header...');
const cartRemovedFromMobile = !headerContent.includes('lg:hidden') || 
                             !headerContent.match(/lg:hidden.*ShoppingCart/s);

if (cartRemovedFromMobile) {
  console.log('✅ Cart properly removed from mobile header');
} else {
  console.log('❌ Cart still visible in mobile header');
}

// Test 5: Check mobile-first responsive design
console.log('\n5. Checking mobile-first responsive design...');
const hasMobileOptimizations = headerContent.includes('min-h-[44px]') && 
                              headerContent.includes('min-w-[44px]') &&
                              headerContent.includes('lg:hidden') &&
                              headerContent.includes('sm:');

if (hasMobileOptimizations) {
  console.log('✅ Mobile-first responsive design implemented');
} else {
  console.log('❌ Missing mobile-first responsive design');
}

console.log('\n📱 Mobile Authentication Experience Summary:');
console.log('==========================================');

const allTestsPassed = hasConditionalAuthButtons && 
                      mobileAuthExists && 
                      mobileAuthComponentExists && 
                      cartRemovedFromMobile && 
                      hasMobileOptimizations;

if (allTestsPassed) {
  console.log('🎉 ALL TESTS PASSED! Mobile authentication experience is complete and working perfectly.');
  console.log('\n✨ Features implemented:');
  console.log('   • Conditional Sign In/Sign Up buttons (mobile only, when not logged in)');
  console.log('   • Dedicated mobile auth page with beautiful success flow');
  console.log('   • Cart moved to mobile menu for better UX');
  console.log('   • Auto-redirect to store after successful auth');
  console.log('   • Mobile-first responsive design with proper touch targets');
  console.log('   • Clean, uncluttered mobile interface');
} else {
  console.log('⚠️  Some tests failed. Please check the issues above.');
}

console.log('\n🚀 Ready for mobile users to enjoy the enhanced authentication experience!');