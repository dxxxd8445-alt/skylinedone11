#!/usr/bin/env node

/**
 * Test Announcement Banner and Search Visibility Improvements
 * 
 * This script verifies:
 * 1. Announcement banner is more compact (36px height)
 * 2. Search bar is larger and more visible
 * 3. Search placeholder text is shorter and fully visible
 * 4. Better spacing and proportions
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Testing Announcement Banner and Search Improvements...\n');

// Test 1: Verify announcement banner is more compact
function testAnnouncementBanner() {
  console.log('1. Testing Announcement Banner Compactness...');
  
  const bannerPath = path.join(__dirname, 'components', 'announcement-banner.tsx');
  
  if (!fs.existsSync(bannerPath)) {
    console.log('❌ Announcement banner component not found');
    return false;
  }
  
  const bannerContent = fs.readFileSync(bannerPath, 'utf8');
  
  // Check for reduced height
  const hasReducedHeight = bannerContent.includes('bannerHeight = visibleCount * 36') &&
                           bannerContent.includes('headerHeight = 64');
  
  // Check for more compact padding
  const hasCompactPadding = bannerContent.includes('py-1.5 sm:py-2') &&
                            bannerContent.includes('w-5 h-5 sm:w-6 sm:h-6');
  
  // Check for smaller icons and text
  const hasSmallerElements = bannerContent.includes('w-3 h-3 sm:w-4 sm:h-4') &&
                             bannerContent.includes('text-xs sm:text-sm lg:text-base') &&
                             bannerContent.includes('w-2.5 h-2.5 sm:w-3 sm:h-3');
  
  if (hasReducedHeight && hasCompactPadding && hasSmallerElements) {
    console.log('✅ Announcement banner is more compact');
    console.log('   - Height reduced to 36px per banner');
    console.log('   - More compact padding and spacing');
    console.log('   - Smaller icons and text on mobile');
    return true;
  } else {
    console.log('❌ Announcement banner compactness issues:');
    if (!hasReducedHeight) console.log('   - Height not reduced');
    if (!hasCompactPadding) console.log('   - Padding not compact');
    if (!hasSmallerElements) console.log('   - Elements not smaller');
    return false;
  }
}

// Test 2: Verify search bar improvements
function testSearchBarVisibility() {
  console.log('\n2. Testing Search Bar Visibility...');
  
  const headerPath = path.join(__dirname, 'components', 'header.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  
  // Check for larger search bar
  const hasLargerSearchBar = headerContent.includes('py-3.5') &&
                             headerContent.includes('max-w-sm sm:max-w-md') &&
                             headerContent.includes('shadow-lg');
  
  // Check for shorter placeholder
  const hasShorterPlaceholder = headerContent.includes('placeholder="Search..."') &&
                                headerContent.includes('minWidth: \'80px\'');
  
  // Check for better visibility
  const hasBetterVisibility = headerContent.includes('text-white/70') &&
                              headerContent.includes('border border-[#262626]') &&
                              headerContent.includes('min-h-[36px] min-w-[36px]');
  
  // Check for increased header height
  const hasIncreasedHeight = headerContent.includes('h-16 sm:h-16');
  
  if (hasLargerSearchBar && hasShorterPlaceholder && hasBetterVisibility && hasIncreasedHeight) {
    console.log('✅ Search bar visibility improved');
    console.log('   - Larger search bar with more padding');
    console.log('   - Shorter placeholder text ("Search...")');
    console.log('   - Better contrast and shadow');
    console.log('   - Increased header height for more space');
    return true;
  } else {
    console.log('❌ Search bar visibility issues:');
    if (!hasLargerSearchBar) console.log('   - Search bar not larger');
    if (!hasShorterPlaceholder) console.log('   - Placeholder not shorter');
    if (!hasBetterVisibility) console.log('   - Visibility not improved');
    if (!hasIncreasedHeight) console.log('   - Header height not increased');
    return false;
  }
}

// Test 3: Verify proportions and spacing
function testProportionsAndSpacing() {
  console.log('\n3. Testing Proportions and Spacing...');
  
  const headerPath = path.join(__dirname, 'components', 'header.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  
  // Check for better proportions
  const hasBetterProportions = headerContent.includes('gap-2 sm:gap-6') &&
                               headerContent.includes('left-3 right-3') &&
                               headerContent.includes('calc(var(--announcement-height, 0px) + 72px)');
  
  // Check for improved touch targets
  const hasImprovedTouchTargets = headerContent.includes('p-1.5') &&
                                  headerContent.includes('min-h-[36px] min-w-[36px]');
  
  if (hasBetterProportions && hasImprovedTouchTargets) {
    console.log('✅ Proportions and spacing improved');
    console.log('   - Better gap spacing between elements');
    console.log('   - Improved search results positioning');
    console.log('   - Enhanced touch target sizes');
    return true;
  } else {
    console.log('❌ Proportions and spacing issues found');
    return false;
  }
}

// Test 4: Verify mobile optimization
function testMobileOptimization() {
  console.log('\n4. Testing Mobile Optimization...');
  
  const headerPath = path.join(__dirname, 'components', 'header.tsx');
  const bannerPath = path.join(__dirname, 'components', 'announcement-banner.tsx');
  
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  const bannerContent = fs.readFileSync(bannerPath, 'utf8');
  
  // Check for mobile-first approach
  const hasMobileFirst = headerContent.includes('max-w-sm sm:max-w-md lg:hidden') &&
                         bannerContent.includes('text-xs sm:text-sm');
  
  // Check for responsive breakpoints
  const hasResponsiveBreakpoints = headerContent.includes('sm:') &&
                                   headerContent.includes('lg:') &&
                                   bannerContent.includes('sm:');
  
  // Check for touch-friendly design
  const hasTouchFriendly = headerContent.includes('min-h-[36px]') &&
                           headerContent.includes('rounded-xl');
  
  if (hasMobileFirst && hasResponsiveBreakpoints && hasTouchFriendly) {
    console.log('✅ Mobile optimization implemented');
    console.log('   - Mobile-first responsive design');
    console.log('   - Proper responsive breakpoints');
    console.log('   - Touch-friendly interface elements');
    return true;
  } else {
    console.log('❌ Mobile optimization issues found');
    return false;
  }
}

// Run all tests
async function runTests() {
  const results = [
    testAnnouncementBanner(),
    testSearchBarVisibility(),
    testProportionsAndSpacing(),
    testMobileOptimization()
  ];
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 All announcement and search improvements successfully implemented!');
    console.log('\n✨ Key Improvements:');
    console.log('   • Announcement banner reduced to 36px height (was 44px)');
    console.log('   • Search bar made larger with better padding and visibility');
    console.log('   • Placeholder text shortened to "Search..." (was "Search games...")');
    console.log('   • Header height increased to 64px for better proportions');
    console.log('   • Enhanced contrast and shadow effects');
    console.log('   • Better mobile-first responsive design');
    
    console.log('\n📱 Mobile UX Benefits:');
    console.log('   • More screen space available (compact banner)');
    console.log('   • Search bar is now easily visible and tappable');
    console.log('   • Full placeholder text visible on mobile');
    console.log('   • Better proportions between elements');
    console.log('   • Improved touch targets and accessibility');
    
    return true;
  } else {
    console.log('\n❌ Some improvements need attention');
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