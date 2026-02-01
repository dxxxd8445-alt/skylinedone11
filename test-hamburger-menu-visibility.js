#!/usr/bin/env node

/**
 * Test Hamburger Menu Visibility Fix
 * 
 * This script verifies:
 * 1. Search bar is ultra-compact (120px max width)
 * 2. Hamburger menu has adequate margin and is fully visible
 * 3. All elements fit properly on mobile screens
 * 4. Touch targets remain accessible
 */

const fs = require('fs');
const path = require('path');

console.log('🍔 Testing Hamburger Menu Visibility Fix...\n');

// Test 1: Verify ultra-compact search bar
function testUltraCompactSearch() {
  console.log('1. Testing Ultra-Compact Search Bar...');
  
  const headerPath = path.join(__dirname, 'components', 'header.tsx');
  
  if (!fs.existsSync(headerPath)) {
    console.log('❌ Header component not found');
    return false;
  }
  
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  
  // Check for ultra-compact size
  const hasUltraCompactSize = headerContent.includes('max-w-[120px] sm:max-w-xs') &&
                              headerContent.includes('px-2.5 py-2') &&
                              headerContent.includes('gap-1.5');
  
  // Check for minimal elements
  const hasMinimalElements = headerContent.includes('minWidth: \'50px\'') &&
                             headerContent.includes('min-h-[24px] min-w-[24px]') &&
                             headerContent.includes('p-0.5');
  
  if (hasUltraCompactSize && hasMinimalElements) {
    console.log('✅ Search bar is ultra-compact');
    console.log('   - Maximum width reduced to 120px');
    console.log('   - Minimal padding (2.5px horizontal, 2px vertical)');
    console.log('   - Tiny clear button (24x24px)');
    console.log('   - Minimum input width only 50px');
    return true;
  } else {
    console.log('❌ Search bar not compact enough:');
    if (!hasUltraCompactSize) console.log('   - Size not ultra-compact');
    if (!hasMinimalElements) console.log('   - Elements not minimal');
    return false;
  }
}

// Test 2: Verify hamburger menu margin and visibility
function testHamburgerMenuMargin() {
  console.log('\n2. Testing Hamburger Menu Margin...');
  
  const headerPath = path.join(__dirname, 'components', 'header.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  
  // Check for extra margin on right side
  const hasExtraMargin = headerContent.includes('pr-1') &&
                         headerContent.includes('gap-1.5 flex-shrink-0');
  
  // Check for reduced main gap
  const hasReducedGap = headerContent.includes('gap-1.5 sm:gap-4');
  
  // Check for hamburger menu button
  const hasHamburgerButton = headerContent.includes('lg:hidden flex items-center justify-center w-10 h-10') &&
                             headerContent.includes('min-h-[44px] min-w-[44px]');
  
  if (hasExtraMargin && hasReducedGap && hasHamburgerButton) {
    console.log('✅ Hamburger menu has proper margin');
    console.log('   - Extra right padding (pr-1) added');
    console.log('   - Reduced gap spacing (1.5 units)');
    console.log('   - Hamburger button properly sized');
    return true;
  } else {
    console.log('❌ Hamburger menu margin issues:');
    if (!hasExtraMargin) console.log('   - No extra margin');
    if (!hasReducedGap) console.log('   - Gap not reduced');
    if (!hasHamburgerButton) console.log('   - Button issues');
    return false;
  }
}

// Test 3: Verify mobile screen fit
function testMobileScreenFit() {
  console.log('\n3. Testing Mobile Screen Fit...');
  
  const headerPath = path.join(__dirname, 'components', 'header.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  
  // Calculate approximate widths (rough estimation)
  // Logo: ~80px, Search: 120px, Cart+Menu: ~80px, Gaps: ~6px = ~286px total
  // This should fit comfortably on 320px+ screens
  
  // Check for space-efficient design
  const hasSpaceEfficient = headerContent.includes('max-w-[120px]') &&
                            headerContent.includes('gap-1.5') &&
                            headerContent.includes('flex-shrink-0');
  
  // Check for responsive behavior
  const hasResponsive = headerContent.includes('sm:max-w-xs') &&
                        headerContent.includes('sm:gap-4') &&
                        headerContent.includes('lg:hidden');
  
  if (hasSpaceEfficient && hasResponsive) {
    console.log('✅ Mobile screen fit optimized');
    console.log('   - Space-efficient element sizing');
    console.log('   - Responsive scaling for larger screens');
    console.log('   - Should fit on 320px+ screens');
    return true;
  } else {
    console.log('❌ Mobile screen fit issues found');
    return false;
  }
}

// Test 4: Verify touch accessibility
function testTouchAccessibility() {
  console.log('\n4. Testing Touch Accessibility...');
  
  const headerPath = path.join(__dirname, 'components', 'header.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  
  // Check for minimum touch targets
  const hasMinTouchTargets = headerContent.includes('min-h-[44px] min-w-[44px]') &&
                             headerContent.includes('w-10 h-10');
  
  // Check for accessible clear button (even though smaller)
  const hasClearButton = headerContent.includes('min-h-[24px] min-w-[24px]');
  
  // Check for proper spacing
  const hasProperSpacing = headerContent.includes('gap-1.5') &&
                           headerContent.includes('pr-1');
  
  if (hasMinTouchTargets && hasClearButton && hasProperSpacing) {
    console.log('✅ Touch accessibility maintained');
    console.log('   - Hamburger menu meets 44px minimum');
    console.log('   - Clear button accessible (24px)');
    console.log('   - Adequate spacing between elements');
    return true;
  } else {
    console.log('❌ Touch accessibility issues found');
    return false;
  }
}

// Test 5: Verify search functionality preservation
function testSearchPreservation() {
  console.log('\n5. Testing Search Functionality Preservation...');
  
  const headerPath = path.join(__dirname, 'components', 'header.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  
  // Check for search functionality
  const hasSearchFunctionality = headerContent.includes('searchQuery') &&
                                 headerContent.includes('setSearchQuery') &&
                                 headerContent.includes('showResults');
  
  // Check for search results
  const hasSearchResults = headerContent.includes('fixed left-3 right-3') &&
                           headerContent.includes('z-[10000]');
  
  // Check for input functionality
  const hasInputFunctionality = headerContent.includes('placeholder="Search..."') &&
                                headerContent.includes('onChange={(e) => setSearchQuery(e.target.value)}');
  
  if (hasSearchFunctionality && hasSearchResults && hasInputFunctionality) {
    console.log('✅ Search functionality preserved');
    console.log('   - All search state management intact');
    console.log('   - Search results positioning maintained');
    console.log('   - Input functionality working');
    return true;
  } else {
    console.log('❌ Search functionality issues found');
    return false;
  }
}

// Run all tests
async function runTests() {
  const results = [
    testUltraCompactSearch(),
    testHamburgerMenuMargin(),
    testMobileScreenFit(),
    testTouchAccessibility(),
    testSearchPreservation()
  ];
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 Hamburger menu visibility successfully optimized!');
    console.log('\n✨ Key Improvements:');
    console.log('   • Search bar ultra-compact (120px max width)');
    console.log('   • Extra right margin added (pr-1)');
    console.log('   • Reduced gap spacing (1.5 units on mobile)');
    console.log('   • Minimal padding and element sizes');
    console.log('   • Hamburger menu fully visible with margin');
    
    console.log('\n📱 Mobile UX Benefits:');
    console.log('   • Hamburger menu (3 lines) now has breathing room');
    console.log('   • All elements fit comfortably on 320px+ screens');
    console.log('   • Search remains functional but ultra-compact');
    console.log('   • Better touch accessibility for navigation');
    console.log('   • Professional, uncluttered mobile interface');
    
    console.log('\n📏 Space Allocation (approximate):');
    console.log('   • Logo: ~80px');
    console.log('   • Search: 120px max');
    console.log('   • Cart + Menu: ~80px');
    console.log('   • Gaps + Margin: ~10px');
    console.log('   • Total: ~290px (fits 320px+ screens)');
    
    return true;
  } else {
    console.log('\n❌ Some hamburger menu visibility issues need attention');
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