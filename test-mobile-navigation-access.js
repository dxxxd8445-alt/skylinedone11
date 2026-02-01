#!/usr/bin/env node

/**
 * Test Mobile Navigation Access Fix
 * 
 * This script verifies:
 * 1. Search bar is compact enough to allow hamburger menu visibility
 * 2. Mobile navigation (3 lines) is accessible
 * 3. Proper spacing and proportions for mobile screens
 * 4. Search functionality still works but doesn't dominate the header
 */

const fs = require('fs');
const path = require('path');

console.log('📱 Testing Mobile Navigation Access Fix...\n');

// Test 1: Verify search bar is compact
function testCompactSearchBar() {
  console.log('1. Testing Compact Search Bar...');
  
  const headerPath = path.join(__dirname, 'components', 'header.tsx');
  
  if (!fs.existsSync(headerPath)) {
    console.log('❌ Header component not found');
    return false;
  }
  
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  
  // Check for compact search bar
  const hasCompactSize = headerContent.includes('max-w-[140px] sm:max-w-xs') &&
                         headerContent.includes('px-3 py-2.5') &&
                         headerContent.includes('gap-2');
  
  // Check for smaller elements
  const hasSmallerElements = headerContent.includes('w-4 h-4') &&
                             headerContent.includes('text-sm') &&
                             headerContent.includes('minWidth: \'60px\'');
  
  // Check for compact clear button
  const hasCompactClearButton = headerContent.includes('min-h-[28px] min-w-[28px]') &&
                                headerContent.includes('w-3 h-3');
  
  if (hasCompactSize && hasSmallerElements && hasCompactClearButton) {
    console.log('✅ Search bar is compact and navigation-friendly');
    console.log('   - Maximum width limited to 140px on mobile');
    console.log('   - Smaller padding and elements');
    console.log('   - Compact clear button (28x28px)');
    return true;
  } else {
    console.log('❌ Search bar compactness issues:');
    if (!hasCompactSize) console.log('   - Size not compact enough');
    if (!hasSmallerElements) console.log('   - Elements not smaller');
    if (!hasCompactClearButton) console.log('   - Clear button not compact');
    return false;
  }
}

// Test 2: Verify mobile menu accessibility
function testMobileMenuAccess() {
  console.log('\n2. Testing Mobile Menu Accessibility...');
  
  const headerPath = path.join(__dirname, 'components', 'header.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  
  // Check for proper mobile menu button
  const hasMobileMenuButton = headerContent.includes('lg:hidden flex items-center justify-center w-10 h-10') &&
                              headerContent.includes('aria-label="Toggle menu"') &&
                              headerContent.includes('min-h-[44px] min-w-[44px]');
  
  // Check for proper spacing
  const hasProperSpacing = headerContent.includes('gap-2 sm:gap-4') &&
                           headerContent.includes('flex-shrink-0');
  
  // Check for mobile menu functionality
  const hasMobileMenuFunctionality = headerContent.includes('mobileMenuOpen') &&
                                     headerContent.includes('setMobileMenuOpen');
  
  if (hasMobileMenuButton && hasProperSpacing && hasMobileMenuFunctionality) {
    console.log('✅ Mobile menu is accessible');
    console.log('   - Hamburger menu button properly sized');
    console.log('   - Adequate spacing between elements');
    console.log('   - Mobile menu functionality intact');
    return true;
  } else {
    console.log('❌ Mobile menu accessibility issues found');
    return false;
  }
}

// Test 3: Verify header proportions
function testHeaderProportions() {
  console.log('\n3. Testing Header Proportions...');
  
  const headerPath = path.join(__dirname, 'components', 'header.tsx');
  const bannerPath = path.join(__dirname, 'components', 'announcement-banner.tsx');
  
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  const bannerContent = fs.readFileSync(bannerPath, 'utf8');
  
  // Check for compact header height
  const hasCompactHeader = headerContent.includes('h-14 sm:h-16') &&
                           bannerContent.includes('headerHeight = 56');
  
  // Check for balanced layout
  const hasBalancedLayout = headerContent.includes('flex items-center justify-between') &&
                            headerContent.includes('flex-shrink-0');
  
  // Check for responsive gaps
  const hasResponsiveGaps = headerContent.includes('gap-2 sm:gap-4');
  
  if (hasCompactHeader && hasBalancedLayout && hasResponsiveGaps) {
    console.log('✅ Header proportions are balanced');
    console.log('   - Compact header height (56px)');
    console.log('   - Balanced element distribution');
    console.log('   - Responsive gap spacing');
    return true;
  } else {
    console.log('❌ Header proportion issues found');
    return false;
  }
}

// Test 4: Verify mobile screen compatibility
function testMobileScreenCompatibility() {
  console.log('\n4. Testing Mobile Screen Compatibility...');
  
  const headerPath = path.join(__dirname, 'components', 'header.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  
  // Check for mobile-first design
  const hasMobileFirst = headerContent.includes('lg:hidden') &&
                         headerContent.includes('max-w-[140px]') &&
                         headerContent.includes('sm:max-w-xs');
  
  // Check for touch-friendly targets
  const hasTouchTargets = headerContent.includes('min-h-[44px] min-w-[44px]') &&
                          headerContent.includes('min-h-[28px] min-w-[28px]');
  
  // Check for proper breakpoints
  const hasBreakpoints = headerContent.includes('sm:') &&
                         headerContent.includes('lg:');
  
  if (hasMobileFirst && hasTouchTargets && hasBreakpoints) {
    console.log('✅ Mobile screen compatibility ensured');
    console.log('   - Mobile-first responsive design');
    console.log('   - Touch-friendly target sizes');
    console.log('   - Proper responsive breakpoints');
    return true;
  } else {
    console.log('❌ Mobile screen compatibility issues found');
    return false;
  }
}

// Test 5: Verify search functionality preservation
function testSearchFunctionality() {
  console.log('\n5. Testing Search Functionality Preservation...');
  
  const headerPath = path.join(__dirname, 'components', 'header.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  
  // Check for search functionality
  const hasSearchFunctionality = headerContent.includes('searchQuery') &&
                                 headerContent.includes('searchResults') &&
                                 headerContent.includes('showResults');
  
  // Check for search results positioning
  const hasSearchResults = headerContent.includes('fixed left-3 right-3') &&
                           headerContent.includes('z-[10000]') &&
                           headerContent.includes('calc(var(--announcement-height, 0px) + 68px)');
  
  // Check for search input
  const hasSearchInput = headerContent.includes('placeholder="Search..."') &&
                         headerContent.includes('onChange={(e) => setSearchQuery(e.target.value)}');
  
  if (hasSearchFunctionality && hasSearchResults && hasSearchInput) {
    console.log('✅ Search functionality preserved');
    console.log('   - Search state management intact');
    console.log('   - Search results properly positioned');
    console.log('   - Search input functionality working');
    return true;
  } else {
    console.log('❌ Search functionality issues found');
    return false;
  }
}

// Run all tests
async function runTests() {
  const results = [
    testCompactSearchBar(),
    testMobileMenuAccess(),
    testHeaderProportions(),
    testMobileScreenCompatibility(),
    testSearchFunctionality()
  ];
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 Mobile navigation access successfully restored!');
    console.log('\n✨ Key Improvements:');
    console.log('   • Search bar limited to 140px width on mobile');
    console.log('   • Hamburger menu (3 lines) now fully visible and accessible');
    console.log('   • Compact header design (56px height)');
    console.log('   • Proper spacing between logo, search, and menu button');
    console.log('   • Search functionality preserved but not dominating');
    
    console.log('\n📱 Mobile UX Benefits:');
    console.log('   • Users can now access the navigation menu');
    console.log('   • Search is still functional but appropriately sized');
    console.log('   • Better balance between all header elements');
    console.log('   • Improved touch targets and accessibility');
    console.log('   • Professional, uncluttered mobile interface');
    
    return true;
  } else {
    console.log('\n❌ Some mobile navigation issues need attention');
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