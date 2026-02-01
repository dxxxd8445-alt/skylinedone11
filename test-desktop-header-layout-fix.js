#!/usr/bin/env node

/**
 * Test Desktop Header Layout Fix
 * 
 * This script verifies that the desktop header layout has been optimized
 * to prevent the Sign Up button from being cut off or extending too wide.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Testing Desktop Header Layout Fix...\n');

// Read the header component
const headerPath = path.join(__dirname, 'components', 'header.tsx');
const headerContent = fs.readFileSync(headerPath, 'utf8');

let allTestsPassed = true;
const issues = [];

// Test 1: Check if container padding has been reduced
console.log('1. Testing container padding optimization...');
if (headerContent.includes('px-3 sm:px-4 lg:px-6')) {
  console.log('   ✅ Container padding reduced from lg:px-8 to lg:px-6');
} else {
  console.log('   ❌ Container padding not optimized');
  issues.push('Container padding should be reduced for better space management');
  allTestsPassed = false;
}

// Test 2: Check if navigation gap has been reduced
console.log('2. Testing navigation spacing optimization...');
if (headerContent.includes('gap-6 flex-1 justify-center max-w-2xl')) {
  console.log('   ✅ Navigation gap reduced from gap-8 to gap-6 with max-width constraint');
} else {
  console.log('   ❌ Navigation spacing not optimized');
  issues.push('Navigation should have reduced gap and max-width constraint');
  allTestsPassed = false;
}

// Test 3: Check if navigation item padding has been reduced
console.log('3. Testing navigation item padding...');
if (headerContent.includes('gap-1.5 text-white/70 hover:text-white text-sm font-semibold transition-all duration-300 py-2 px-2.5')) {
  console.log('   ✅ Navigation item padding reduced from px-3 to px-2.5 and gap-2 to gap-1.5');
} else {
  console.log('   ❌ Navigation item padding not optimized');
  issues.push('Navigation items should have reduced padding for compactness');
  allTestsPassed = false;
}

// Test 4: Check if right controls gap has been reduced
console.log('4. Testing right controls spacing...');
if (headerContent.includes('flex items-center gap-1.5 flex-shrink-0')) {
  console.log('   ✅ Right controls gap reduced from gap-2 to gap-1.5');
} else {
  console.log('   ❌ Right controls spacing not optimized');
  issues.push('Right controls should have reduced gap');
  allTestsPassed = false;
}

// Test 5: Check if search bar width has been reduced
console.log('5. Testing search bar width optimization...');
if (headerContent.includes('w-32 transition-all duration-300 focus:w-44')) {
  console.log('   ✅ Search bar width reduced from w-40/focus:w-56 to w-32/focus:w-44');
} else {
  console.log('   ❌ Search bar width not optimized');
  issues.push('Search bar should have reduced width to save space');
  allTestsPassed = false;
}

// Test 6: Check if desktop control buttons have been made more compact
console.log('6. Testing desktop control button compactness...');
if (headerContent.includes('h-9 px-2.5 rounded-lg') && headerContent.includes('min-h-[36px]')) {
  console.log('   ✅ Desktop control buttons made more compact (h-9, px-2.5, min-h-36px)');
} else {
  console.log('   ❌ Desktop control buttons not made compact');
  issues.push('Desktop control buttons should be more compact');
  allTestsPassed = false;
}

// Test 7: Check if flag icons have been made smaller
console.log('7. Testing flag icon size optimization...');
if (headerContent.includes('w-3.5 h-3.5 rounded-[2px]')) {
  console.log('   ✅ Flag icons made smaller (w-3.5 h-3.5 instead of w-4 h-4)');
} else {
  console.log('   ❌ Flag icons not optimized');
  issues.push('Flag icons should be smaller to save space');
  allTestsPassed = false;
}

// Test 8: Check if desktop controls gap has been reduced
console.log('8. Testing desktop controls internal gap...');
if (headerContent.includes('lg:flex items-center gap-1.5')) {
  console.log('   ✅ Desktop controls internal gap reduced to gap-1.5');
} else {
  console.log('   ❌ Desktop controls internal gap not optimized');
  issues.push('Desktop controls should have reduced internal gap');
  allTestsPassed = false;
}

// Test 9: Check if main container gap has been optimized
console.log('9. Testing main container gap...');
if (headerContent.includes('gap-2 sm:gap-3')) {
  console.log('   ✅ Main container gap optimized (gap-2 sm:gap-3)');
} else {
  console.log('   ❌ Main container gap not optimized');
  issues.push('Main container should have optimized gap spacing');
  allTestsPassed = false;
}

console.log('\n' + '='.repeat(60));

if (allTestsPassed) {
  console.log('🎉 ALL TESTS PASSED! Desktop header layout has been optimized.');
  console.log('\n✨ Key Improvements Made:');
  console.log('   • Reduced container padding from lg:px-8 to lg:px-6');
  console.log('   • Reduced navigation gap from gap-8 to gap-6');
  console.log('   • Added max-width constraint to navigation (max-w-2xl)');
  console.log('   • Reduced navigation item padding from px-3 to px-2.5');
  console.log('   • Reduced gaps throughout (gap-2 to gap-1.5)');
  console.log('   • Made search bar more compact (w-32/focus:w-44)');
  console.log('   • Made control buttons smaller (h-9, px-2.5, min-h-36px)');
  console.log('   • Reduced flag icon sizes (w-3.5 h-3.5)');
  console.log('\n🎯 Result: Header is now more compact and Sign Up button should fit properly!');
} else {
  console.log('❌ SOME TESTS FAILED. Issues found:');
  issues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue}`);
  });
}

console.log('\n' + '='.repeat(60));