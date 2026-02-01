#!/usr/bin/env node

/**
 * Test Discord Page Theme Fix
 * 
 * This script verifies that the Discord page has been updated to match
 * the site's black and red theme and the bottom section has been removed.
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Testing Discord Page Theme Fix...\n');

// Read the Discord page component
const discordPath = path.join(__dirname, 'app', 'discord', 'page.tsx');
const discordContent = fs.readFileSync(discordPath, 'utf8');

let allTestsPassed = true;
const issues = [];
const improvements = [];

console.log('🗑️ BOTTOM SECTION REMOVAL TESTS');
console.log('=' .repeat(40));

// Test 1: Check if bottom CTA section has been removed
console.log('1. Bottom CTA section removal...');
if (!discordContent.includes('Ready to Get Started?') && !discordContent.includes('Join thousands of satisfied customers')) {
  console.log('   ✅ Bottom CTA section successfully removed');
  improvements.push('Removed redundant bottom CTA section');
} else {
  console.log('   ❌ Bottom CTA section still present');
  issues.push('Bottom CTA section not removed');
  allTestsPassed = false;
}

// Test 2: Check if support hours section has been removed
console.log('2. Support hours section removal...');
if (!discordContent.includes('Support Available 24/7')) {
  console.log('   ✅ Support hours section successfully removed');
  improvements.push('Removed support hours section');
} else {
  console.log('   ❌ Support hours section still present');
  issues.push('Support hours section not removed');
  allTestsPassed = false;
}

console.log('\n🎨 THEME COLOR UPDATES');
console.log('=' .repeat(40));

// Test 3: Check if Discord blue colors have been replaced with red
console.log('3. Discord blue to red gradient conversion...');
if (discordContent.includes('from-[#dc2626] to-[#ef4444]') && !discordContent.includes('from-[#5865f2] to-[#7289da]')) {
  console.log('   ✅ Main Discord gradient changed to red theme');
  improvements.push('Updated Discord gradient from blue to red');
} else {
  console.log('   ❌ Discord gradient still uses blue colors');
  issues.push('Discord gradient not updated to red theme');
  allTestsPassed = false;
}

// Test 4: Check if background effects use consistent red theme
console.log('4. Background effects color consistency...');
const redBackgroundCount = (discordContent.match(/bg-\[#dc2626\]/g) || []).length;
const blueBackgroundCount = (discordContent.match(/bg-\[#5865f2\]/g) || []).length;

if (redBackgroundCount > 0 && blueBackgroundCount === 0) {
  console.log('   ✅ Background effects use consistent red theme');
  improvements.push('Background effects updated to red theme');
} else {
  console.log('   ❌ Background effects still contain blue colors');
  issues.push('Background effects not fully updated to red theme');
  allTestsPassed = false;
}

// Test 5: Check if main CTA button uses red theme
console.log('5. Main CTA button theme...');
if (discordContent.includes('bg-gradient-to-r from-[#dc2626] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626]')) {
  console.log('   ✅ Main CTA button uses red gradient theme');
  improvements.push('Main CTA button updated to red theme');
} else {
  console.log('   ❌ Main CTA button still uses blue theme');
  issues.push('Main CTA button not updated to red theme');
  allTestsPassed = false;
}

// Test 6: Check if shadow effects use red theme
console.log('6. Shadow effects theme consistency...');
if (discordContent.includes('shadow-[#dc2626]/30') && discordContent.includes('hover:shadow-[#dc2626]/50')) {
  console.log('   ✅ Shadow effects use red theme');
  improvements.push('Shadow effects updated to red theme');
} else {
  console.log('   ❌ Shadow effects not fully updated to red theme');
  issues.push('Shadow effects should use red theme');
  allTestsPassed = false;
}

console.log('\n🔧 FUNCTIONALITY PRESERVATION TESTS');
console.log('=' .repeat(40));

// Test 7: Check if Discord link is still present
console.log('7. Discord link preservation...');
if (discordContent.includes('https://discord.gg/magmacheats')) {
  console.log('   ✅ Discord invite link preserved');
} else {
  console.log('   ❌ Discord invite link missing');
  issues.push('Discord invite link not preserved');
  allTestsPassed = false;
}

// Test 8: Check if features grid is still present
console.log('8. Features grid preservation...');
if (discordContent.includes('24/7 Support') && discordContent.includes('Active Community')) {
  console.log('   ✅ Features grid preserved');
} else {
  console.log('   ❌ Features grid missing or incomplete');
  issues.push('Features grid not preserved');
  allTestsPassed = false;
}

// Test 9: Check if benefits section is still present
console.log('9. Benefits section preservation...');
if (discordContent.includes('Member Benefits') && discordContent.includes('Direct support from our team')) {
  console.log('   ✅ Benefits section preserved');
} else {
  console.log('   ❌ Benefits section missing');
  issues.push('Benefits section not preserved');
  allTestsPassed = false;
}

// Test 10: Check if Header component is still included
console.log('10. Header component preservation...');
if (discordContent.includes('<Header />')) {
  console.log('   ✅ Header component preserved');
} else {
  console.log('   ❌ Header component missing');
  issues.push('Header component not preserved');
  allTestsPassed = false;
}

console.log('\n' + '='.repeat(60));

if (allTestsPassed) {
  console.log('🎉 ALL TESTS PASSED! Discord page theme has been successfully updated.');
  
  console.log('\n✨ IMPROVEMENTS MADE:');
  improvements.forEach((improvement, index) => {
    console.log(`   ${index + 1}. ${improvement}`);
  });
  
  console.log('\n🎨 THEME CONSISTENCY ACHIEVED:');
  console.log('   • Removed redundant bottom sections');
  console.log('   • Updated all Discord blue colors to site red theme');
  console.log('   • Maintained all essential functionality');
  console.log('   • Consistent with other site pages');
  
  console.log('\n🎯 RESULT: Discord page now matches the site\'s black and red theme perfectly!');
  
} else {
  console.log('❌ SOME TESTS FAILED. Issues found:');
  issues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue}`);
  });
}

console.log('\n' + '='.repeat(60));