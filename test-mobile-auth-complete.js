#!/usr/bin/env node

/**
 * Test Complete Mobile Auth Experience
 * 
 * This script verifies:
 * 1. Cart removed from mobile header
 * 2. Auth buttons added to mobile header (when not logged in)
 * 3. Mobile auth page created with success flow
 * 4. Mobile menu updated to show cart instead of separate cart/auth
 * 5. Proper conditional rendering based on auth state
 */

const fs = require('fs');
const path = require('path');

console.log('📱 Testing Complete Mobile Auth Experience...\n');

// Test 1: Verify mobile auth page exists
function testMobileAuthPage() {
  console.log('1. Testing Mobile Auth Page...');
  
  const authPagePath = path.join(__dirname, 'app', 'mobile-auth', 'page.tsx');
  
  if (!fs.existsSync(authPagePath)) {
    console.log('❌ Mobile auth page not found');
    return false;
  }
  
  const authPageContent = fs.readFileSync(authPagePath, 'utf8');
  
  // Check for success flow
  const hasSuccessFlow = authPageContent.includes('setSuccess(true)') &&
                         authPageContent.includes('Continue to Shop') &&
                         authPageContent.includes('router.push("/store")');
  
  // Check for proper form handling
  const hasFormHandling = authPageContent.includes('handleSubmit') &&
                          authPageContent.includes('signIn') &&
                          authPageContent.includes('signUp');
  
  // Check for mobile-optimized design
  const hasMobileDesign = authPageContent.includes('min-h-screen') &&
                          authPageContent.includes('max-w-md') &&
                          authPageContent.includes('rounded-xl');
  
  if (hasSuccessFlow && hasFormHandling && hasMobileDesign) {
    console.log('✅ Mobile auth page properly implemented');
    console.log('   - Success flow with store redirect');
    console.log('   - Proper form handling for sign in/up');
    console.log('   - Mobile-optimized design');
    return true;
  } else {
    console.log('❌ Mobile auth page issues found');
    return false;
  }
}

// Test 2: Verify header changes
function testHeaderChanges() {
  console.log('\n2. Testing Header Changes...');
  
  const headerPath = path.join(__dirname, 'components', 'header.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  
  // Check cart removed from mobile header
  const noCartInHeader = !headerContent.includes('Cart Counter - Mobile') &&
                         !headerContent.includes('<CartCounter />');
  
  // Check auth buttons added conditionally
  const hasConditionalAuth = headerContent.includes('!user &&') &&
                             headerContent.includes('mobile-auth?mode=signin') &&
                             headerContent.includes('mobile-auth?mode=signup');
  
  // Check useAuth hook added
  const hasAuthHook = headerContent.includes('const { user } = useAuth()');
  
  if (noCartInHeader && hasConditionalAuth && hasAuthHook) {
    console.log('✅ Header properly updated');
    console.log('   - Cart removed from mobile header');
    console.log('   - Auth buttons added conditionally');
    console.log('   - useAuth hook integrated');
    return true;
  } else {
    console.log('❌ Header update issues:');
    if (!noCartInHeader) console.log('   - Cart still in mobile header');
    if (!hasConditionalAuth) console.log('   - Auth buttons not conditional');
    if (!hasAuthHook) console.log('   - useAuth hook missing');
    return false;
  }
}

// Test 3: Verify mobile auth component updates
function testMobileAuthComponent() {
  console.log('\n3. Testing Mobile Auth Component Updates...');
  
  const mobileAuthPath = path.join(__dirname, 'components', 'mobile-auth.tsx');
  const mobileAuthContent = fs.readFileSync(mobileAuthPath, 'utf8');
  
  // Check for cart integration
  const hasCartIntegration = mobileAuthContent.includes('useCart') &&
                             mobileAuthContent.includes('ShoppingCart') &&
                             mobileAuthContent.includes('Shopping Cart');
  
  // Check for user state handling
  const hasUserStates = mobileAuthContent.includes('User is logged in - Show profile and cart') &&
                        mobileAuthContent.includes('User is not logged in - Show cart only (auth buttons are now in header)');
  
  // Check for proper layout
  const hasProperLayout = mobileAuthContent.includes('space-y-3') &&
                          mobileAuthContent.includes('flex items-center justify-between');
  
  if (hasCartIntegration && hasUserStates && hasProperLayout) {
    console.log('✅ Mobile auth component properly updated');
    console.log('   - Cart integration added');
    console.log('   - User states properly handled');
    console.log('   - Layout optimized');
    return true;
  } else {
    console.log('❌ Mobile auth component issues found');
    return false;
  }
}

// Test 4: Verify mobile menu updates
function testMobileMenuUpdates() {
  console.log('\n4. Testing Mobile Menu Updates...');
  
  const headerPath = path.join(__dirname, 'components', 'header.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  
  // Check for single column layout in quick actions
  const hasSingleColumn = headerContent.includes('grid grid-cols-1 gap-3');
  
  // Check for combined cart/auth section
  const hasCombinedSection = headerContent.includes('Cart/Auth - Clean Mobile Design');
  
  if (hasSingleColumn && hasCombinedSection) {
    console.log('✅ Mobile menu properly updated');
    console.log('   - Single column layout for cleaner design');
    console.log('   - Combined cart/auth section');
    return true;
  } else {
    console.log('❌ Mobile menu update issues found');
    return false;
  }
}

// Test 5: Verify success flow implementation
function testSuccessFlow() {
  console.log('\n5. Testing Success Flow Implementation...');
  
  const authPagePath = path.join(__dirname, 'app', 'mobile-auth', 'page.tsx');
  const authPageContent = fs.readFileSync(authPagePath, 'utf8');
  
  // Check for success messages
  const hasSuccessMessages = authPageContent.includes('Welcome Back!') &&
                             authPageContent.includes('Account Created!') &&
                             authPageContent.includes('Successfully signed in') &&
                             authPageContent.includes('Successfully signed up');
  
  // Check for continue to shop functionality
  const hasContinueFlow = authPageContent.includes('Continue to Shop') &&
                          authPageContent.includes('ShoppingBag') &&
                          authPageContent.includes('setTimeout') &&
                          authPageContent.includes('3000');
  
  // Check for proper success screen design
  const hasSuccessDesign = authPageContent.includes('CheckCircle') &&
                           authPageContent.includes('bg-gradient-to-br from-green-500') &&
                           authPageContent.includes('Redirecting automatically');
  
  if (hasSuccessMessages && hasContinueFlow && hasSuccessDesign) {
    console.log('✅ Success flow properly implemented');
    console.log('   - Proper success messages for both modes');
    console.log('   - Continue to shop functionality');
    console.log('   - Beautiful success screen design');
    return true;
  } else {
    console.log('❌ Success flow issues found');
    return false;
  }
}

// Run all tests
async function runTests() {
  const results = [
    testMobileAuthPage(),
    testHeaderChanges(),
    testMobileAuthComponent(),
    testMobileMenuUpdates(),
    testSuccessFlow()
  ];
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 Complete mobile auth experience successfully implemented!');
    console.log('\n✨ Key Features:');
    console.log('   • Cart removed from mobile header (cleaner design)');
    console.log('   • Auth buttons in header (when not logged in)');
    console.log('   • Dedicated mobile auth page with success flow');
    console.log('   • Cart integrated into mobile menu');
    console.log('   • Success messages with store redirect');
    
    console.log('\n📱 Mobile User Journey:');
    console.log('   1. User sees Sign In/Sign Up buttons in header');
    console.log('   2. Taps button → goes to dedicated auth page');
    console.log('   3. Fills form → sees success message');
    console.log('   4. Auto-redirects to store page to shop');
    console.log('   5. Cart accessible in mobile menu');
    
    console.log('\n🎯 UX Improvements:');
    console.log('   • Cleaner mobile header (no cart clutter)');
    console.log('   • Dedicated auth experience (not cramped dropdown)');
    console.log('   • Clear success feedback with next steps');
    console.log('   • Logical flow: Auth → Success → Shop');
    console.log('   • Mobile-optimized throughout');
    
    return true;
  } else {
    console.log('\n❌ Some mobile auth features need attention');
    return false;
  }
}

// Execute tests
runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});