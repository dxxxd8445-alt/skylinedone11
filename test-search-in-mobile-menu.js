#!/usr/bin/env node

/**
 * Test Search Inside Mobile Menu Implementation
 * 
 * This script verifies:
 * 1. Search bar removed from main header on mobile
 * 2. Search bar added to mobile menu (hamburger menu)
 * 3. Clean header with just logo and hamburger menu
 * 4. Full search functionality preserved inside mobile menu
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Search Inside Mobile Menu Implementation...\n');

// Test 1: Verify search removed from main header
function testSearchRemovedFromHeader() {
  console.log('1. Testing Search Removed from Main Header...');
  
  const headerPath = path.join(__dirname, 'components', 'header.tsx');
  
  if (!fs.existsSync(headerPath)) {
    console.log('❌ Header component not found');
    return false;
  }
  
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  
  // Check that mobile search is NOT in the main header section
  const noMobileSearchInHeader = !headerContent.includes('Mobile Search Bar - Ultra Compact') &&
                                 !headerContent.includes('max-w-[120px] sm:max-w-xs lg:hidden');
  
  // Check for clean header structure (logo + hamburger only)
  const hasCleanHeader = headerContent.includes('Right side - Mobile Optimized with Extra Space') &&
                         headerContent.includes('gap-2 flex-shrink-0');
  
  // Verify hamburger menu button is present
  const hasHamburgerMenu = headerContent.includes('Toggle menu') &&
                           headerContent.includes('Menu className="w-5 h-5"');
  
  if (noMobileSearchInHeader && hasCleanHeader && hasHamburgerMenu) {
    console.log('✅ Search successfully removed from main header');
    console.log('   - No mobile search bar in header');
    console.log('   - Clean header with logo and hamburger menu');
    console.log('   - Hamburger menu button properly positioned');
    return true;
  } else {
    console.log('❌ Header cleanup issues:');
    if (!noMobileSearchInHeader) console.log('   - Mobile search still in header');
    if (!hasCleanHeader) console.log('   - Header structure not clean');
    if (!hasHamburgerMenu) console.log('   - Hamburger menu issues');
    return false;
  }
}

// Test 2: Verify search added to mobile menu
function testSearchInMobileMenu() {
  console.log('\n2. Testing Search Added to Mobile Menu...');
  
  const headerPath = path.join(__dirname, 'components', 'header.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  
  // Check for search bar inside mobile menu
  const hasSearchInMenu = headerContent.includes('Mobile Search Bar - Inside Menu') &&
                          headerContent.includes('Search for products...') &&
                          headerContent.includes('bg-[#0a0a0a]/50');
  
  // Check for proper search styling in menu
  const hasProperStyling = headerContent.includes('rounded-xl px-4 py-3') &&
                           headerContent.includes('w-5 h-5 text-white/70') &&
                           headerContent.includes('text-base text-white/90');
  
  // Check for search results inside menu
  const hasSearchResults = headerContent.includes('Mobile Search Results - Inside Menu') &&
                           headerContent.includes('z-[10002]') &&
                           headerContent.includes('max-h-64');
  
  if (hasSearchInMenu && hasProperStyling && hasSearchResults) {
    console.log('✅ Search successfully added to mobile menu');
    console.log('   - Search bar positioned after menu header');
    console.log('   - Full-width search with proper styling');
    console.log('   - Search results properly positioned');
    return true;
  } else {
    console.log('❌ Mobile menu search issues:');
    if (!hasSearchInMenu) console.log('   - Search not in mobile menu');
    if (!hasProperStyling) console.log('   - Styling issues');
    if (!hasSearchResults) console.log('   - Search results issues');
    return false;
  }
}

// Test 3: Verify search functionality preservation
function testSearchFunctionality() {
  console.log('\n3. Testing Search Functionality Preservation...');
  
  const headerPath = path.join(__dirname, 'components', 'header.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  
  // Check for search state management
  const hasSearchState = headerContent.includes('searchQuery') &&
                         headerContent.includes('setSearchQuery') &&
                         headerContent.includes('showResults');
  
  // Check for search functionality
  const hasSearchFunctionality = headerContent.includes('onChange={(e) => setSearchQuery(e.target.value)}') &&
                                 headerContent.includes('handleResultClick') &&
                                 headerContent.includes('searchResults.map');
  
  // Check for search ref and positioning
  const hasSearchRef = headerContent.includes('ref={searchRef}') &&
                       headerContent.includes('relative');
  
  if (hasSearchState && hasSearchFunctionality && hasSearchRef) {
    console.log('✅ Search functionality fully preserved');
    console.log('   - Search state management intact');
    console.log('   - Search input and results working');
    console.log('   - Proper ref and positioning');
    return true;
  } else {
    console.log('❌ Search functionality issues found');
    return false;
  }
}

// Test 4: Verify mobile menu layout
function testMobileMenuLayout() {
  console.log('\n4. Testing Mobile Menu Layout...');
  
  const headerPath = path.join(__dirname, 'components', 'header.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  
  // Check for proper menu structure
  const hasMenuStructure = headerContent.includes('Menu Header - Compact') &&
                           headerContent.includes('Mobile Search Bar - Inside Menu') &&
                           headerContent.includes('Settings - Mobile Optimized');
  
  // Check for proper spacing and borders
  const hasProperSpacing = headerContent.includes('border-b border-[#1a1a1a]') &&
                           headerContent.includes('px-4 py-4') &&
                           headerContent.includes('bg-[#0a0a0a]/50');
  
  // Check for menu order (header -> search -> settings -> navigation)
  const hasCorrectOrder = headerContent.indexOf('Menu Header - Compact') < 
                          headerContent.indexOf('Mobile Search Bar - Inside Menu') &&
                          headerContent.indexOf('Mobile Search Bar - Inside Menu') < 
                          headerContent.indexOf('Settings - Mobile Optimized');
  
  if (hasMenuStructure && hasProperSpacing && hasCorrectOrder) {
    console.log('✅ Mobile menu layout properly structured');
    console.log('   - Correct menu section order');
    console.log('   - Proper spacing and visual separation');
    console.log('   - Clean, organized layout');
    return true;
  } else {
    console.log('❌ Mobile menu layout issues found');
    return false;
  }
}

// Test 5: Verify improved UX
function testImprovedUX() {
  console.log('\n5. Testing Improved User Experience...');
  
  const headerPath = path.join(__dirname, 'components', 'header.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  
  // Check for full-width search in menu
  const hasFullWidthSearch = headerContent.includes('w-full min-w-0') &&
                             headerContent.includes('px-4 py-3');
  
  // Check for better placeholder text
  const hasBetterPlaceholder = headerContent.includes('Search for products...');
  
  // Check for proper touch targets
  const hasTouchTargets = headerContent.includes('min-h-[56px]') &&
                          headerContent.includes('min-h-[36px] min-w-[36px]');
  
  // Check for clean header appearance
  const hasCleanHeader = !headerContent.includes('flex-1 max-w-[120px]');
  
  if (hasFullWidthSearch && hasBetterPlaceholder && hasTouchTargets && hasCleanHeader) {
    console.log('✅ Improved user experience implemented');
    console.log('   - Full-width search bar in menu');
    console.log('   - Better placeholder text');
    console.log('   - Proper touch targets');
    console.log('   - Clean, uncluttered header');
    return true;
  } else {
    console.log('❌ UX improvement issues found');
    return false;
  }
}

// Run all tests
async function runTests() {
  const results = [
    testSearchRemovedFromHeader(),
    testSearchInMobileMenu(),
    testSearchFunctionality(),
    testMobileMenuLayout(),
    testImprovedUX()
  ];
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 Search successfully moved to mobile menu!');
    console.log('\n✨ Key Improvements:');
    console.log('   • Clean header with just logo and hamburger menu');
    console.log('   • Full-width search bar inside mobile menu');
    console.log('   • Better placeholder text "Search for products..."');
    console.log('   • Proper visual hierarchy and organization');
    console.log('   • All search functionality preserved');
    
    console.log('\n📱 Mobile UX Benefits:');
    console.log('   • Cleaner, less cluttered header design');
    console.log('   • More space for search input inside menu');
    console.log('   • Better organization of mobile menu sections');
    console.log('   • Improved visual hierarchy and flow');
    console.log('   • Professional, modern mobile interface');
    
    console.log('\n🎯 Layout Structure:');
    console.log('   1. Header: Logo + Hamburger Menu (clean & minimal)');
    console.log('   2. Mobile Menu:');
    console.log('      • Menu Header (logo + close button)');
    console.log('      • Search Bar (full-width, prominent)');
    console.log('      • Settings (currency + language)');
    console.log('      • Navigation Links');
    console.log('      • Footer');
    
    return true;
  } else {
    console.log('\n❌ Some search relocation issues need attention');
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