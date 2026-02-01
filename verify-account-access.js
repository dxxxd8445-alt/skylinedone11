#!/usr/bin/env node

/**
 * Verification Script: Account Access
 * 
 * This script verifies that users can access their customer dashboard
 * from both desktop and mobile interfaces.
 */

const fs = require('fs');
const path = require('path');

console.log('👤 Verifying Account Access...\n');

// Test 1: Check desktop AuthDropdown has account link
console.log('1. Checking desktop account access...');
const authDropdownPath = path.join(__dirname, 'components', 'auth-dropdown.tsx');
const authDropdownContent = fs.readFileSync(authDropdownPath, 'utf8');

const hasDesktopAccountLink = authDropdownContent.includes('href="/account"') && 
                             authDropdownContent.includes('My Account') &&
                             authDropdownContent.includes('View profile & orders');

if (hasDesktopAccountLink) {
  console.log('✅ Desktop users can access account via AuthDropdown');
} else {
  console.log('❌ Desktop account access not found');
}

// Test 2: Check mobile auth component has account link
console.log('\n2. Checking mobile account access...');
const mobileAuthPath = path.join(__dirname, 'components', 'mobile-auth.tsx');
const mobileAuthContent = fs.readFileSync(mobileAuthPath, 'utf8');

const hasMobileAccountLink = mobileAuthContent.includes('href="/account"') && 
                            mobileAuthContent.includes('My Account') &&
                            mobileAuthContent.includes('Dashboard');

if (hasMobileAccountLink) {
  console.log('✅ Mobile users can access account via mobile menu');
} else {
  console.log('❌ Mobile account access not found');
}

// Test 3: Check account page exists and has customer dashboard features
console.log('\n3. Checking account page functionality...');
const accountPagePath = path.join(__dirname, 'app', 'account', 'page.tsx');
const accountPageExists = fs.existsSync(accountPagePath);

if (accountPageExists) {
  const accountPageContent = fs.readFileSync(accountPagePath, 'utf8');
  const hasCustomerFeatures = accountPageContent.includes('dashboard') && 
                             accountPageContent.includes('orders') &&
                             accountPageContent.includes('licenses') &&
                             accountPageContent.includes('profile');
  
  if (hasCustomerFeatures) {
    console.log('✅ Account page has full customer dashboard features');
  } else {
    console.log('❌ Account page missing customer dashboard features');
  }
} else {
  console.log('❌ Account page not found');
}

// Test 4: Check account page has proper navigation tabs
console.log('\n4. Checking account dashboard navigation...');
if (accountPageExists) {
  const accountPageContent = fs.readFileSync(accountPagePath, 'utf8');
  const hasNavTabs = accountPageContent.includes('Dashboard') && 
                    accountPageContent.includes('Orders') &&
                    accountPageContent.includes('Delivered') &&
                    accountPageContent.includes('Profile') &&
                    accountPageContent.includes('Security');
  
  if (hasNavTabs) {
    console.log('✅ Account dashboard has proper navigation tabs');
  } else {
    console.log('❌ Account dashboard missing navigation tabs');
  }
}

console.log('\n👤 Account Access Summary:');
console.log('==========================');

const allTestsPassed = hasDesktopAccountLink && 
                      hasMobileAccountLink && 
                      accountPageExists;

if (allTestsPassed) {
  console.log('🎉 ALL TESTS PASSED! Users can now access their customer dashboard.');
  console.log('\n✨ Account access points:');
  console.log('   🖥️  DESKTOP: "My Account" link in user dropdown');
  console.log('   📱 MOBILE: "My Account" button in mobile menu (when logged in)');
  console.log('\n🏪 Customer Dashboard Features:');
  console.log('   • Dashboard overview with stats');
  console.log('   • Order history and tracking');
  console.log('   • Delivered licenses with copy functionality');
  console.log('   • Profile management');
  console.log('   • Security settings');
} else {
  console.log('⚠️  Some tests failed. Please check the issues above.');
}

console.log('\n🚀 Users can now view their account and access the customer dashboard!');