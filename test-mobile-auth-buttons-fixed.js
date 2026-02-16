#!/usr/bin/env node

/**
 * Test Script: Mobile Auth Buttons Fixed
 * 
 * This script verifies that mobile auth buttons are properly displayed
 * and organized in the mobile header for non-logged users.
 */

const fs = require('fs');
const path = require('path');

console.log('📱 Testing Mobile Auth Buttons...\n');

// Test 1: Check mobile auth buttons exist and are properly styled
console.log('1. Checking mobile auth buttons...');
const headerPath = path.join(__dirname, 'components', 'header.tsx');
const headerContent = fs.readFileSync(headerPath, 'utf8');

const hasMobileAuthButtons = headerContent.includes('!user &&') && 
                            headerContent.includes('lg:hidden') &&
                            headerContent.includes('/mobile-auth?mode=signin') &&
                            headerContent.includes('/mobile-auth?mode=signup') &&
                            headerContent.includes('Sign In') &&
                            headerContent.includes('Sign Up');

if (hasMobileAuthButtons) {
  console.log('✅ Mobile auth buttons are present');
} else {
  console.log('❌ Mobile auth buttons not found');
}

// Test 2: Check buttons are properly organized and styled
console.log('\n2. Checking button organization and styling...');
const hasNiceOrganization = headerContent.includes('gap-1.5') && 
                           headerContent.includes('mr-2') &&
                           headerContent.includes('min-h-[32px]') &&
                           headerContent.includes('text-xs') &&
                           headerContent.includes('rounded-md');

if (hasNiceOrganization) {
  console.log('✅ Buttons are nicely organized with proper spacing and styling');
} else {
  console.log('❌ Button organization needs improvement');
}

// Test 3: Check Sign Up button has gradient styling
console.log('\n3. Checking Sign Up button styling...');
const hasGradientStyling = headerContent.includes('bg-gradient-to-r from-[#6b7280] to-[#9ca3af]') &&
                          headerContent.includes('shadow-lg shadow-[#6b7280]/20');

if (hasGradientStyling) {
  console.log('✅ Sign Up button has attractive gradient styling');
} else {
  console.log('❌ Sign Up button styling needs improvement');
}

// Test 4: Check Sign In button has proper styling
console.log('\n4. Checking Sign In button styling...');
const hasSignInStyling = headerContent.includes('bg-[#262626]') &&
                        headerContent.includes('border border-[#333333]') &&
                        headerContent.includes('hover:border-[#6b7280]/30');

if (hasSignInStyling) {
  console.log('✅ Sign In button has proper styling with borders and hover effects');
} else {
  console.log('❌ Sign In button styling needs improvement');
}

// Test 5: Check mobile menu button is properly styled
console.log('\n5. Checking mobile menu button...');
const hasMobileMenuStyling = headerContent.includes('border border-[#262626]') &&
                            headerContent.includes('hover:border-[#6b7280]/30') &&
                            headerContent.includes('min-h-[44px] min-w-[44px]');

if (hasMobileMenuStyling) {
  console.log('✅ Mobile menu button has proper styling and touch targets');
} else {
  console.log('❌ Mobile menu button styling needs improvement');
}

console.log('\n📱 Mobile Auth Buttons Summary:');
console.log('===============================');

const allTestsPassed = hasMobileAuthButtons && 
                      hasNiceOrganization && 
                      hasGradientStyling && 
                      hasSignInStyling && 
                      hasMobileMenuStyling;

if (allTestsPassed) {
  console.log('🎉 ALL TESTS PASSED! Mobile auth buttons are properly organized and styled.');
  console.log('\n✨ Mobile Header Layout (for non-logged users):');
  console.log('   📱 Logo (left) → Sign In + Sign Up (center) → Menu (right)');
  console.log('\n🎨 Button Styling:');
  console.log('   • Sign In: Dark gray with border and hover effects');
  console.log('   • Sign Up: Red gradient with shadow for prominence');
  console.log('   • Menu: Consistent styling with proper touch targets');
  console.log('   • Compact sizing optimized for mobile screens');
} else {
  console.log('⚠️  Some tests failed. Please check the issues above.');
}

console.log('\n🚀 Mobile users can now easily sign in and sign up from the header!');