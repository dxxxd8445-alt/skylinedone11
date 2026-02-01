#!/usr/bin/env node

/**
 * Test Game Links to Working Products
 * 
 * This script verifies that all game links in the footer point to actual
 * working products that exist in the database.
 */

const fs = require('fs');
const path = require('path');

console.log('🔗 Testing Game Links to Working Products...\n');

// Read the footer component
const footerPath = path.join(__dirname, 'components', 'footer.tsx');
const footerContent = fs.readFileSync(footerPath, 'utf8');

// Read the database setup to get actual products
const dbSetupPath = path.join(__dirname, 'scripts', 'setup_complete.sql');
const dbSetupContent = fs.readFileSync(dbSetupPath, 'utf8');

let allTestsPassed = true;
const issues = [];
const workingLinks = [];

console.log('📋 GAME LINK MAPPING VERIFICATION');
console.log('=' .repeat(50));

// Extract actual product slugs from database setup
const productMatches = dbSetupContent.match(/slug.*?'([^']+)'/g) || [];
const actualSlugs = productMatches.map(match => match.match(/'([^']+)'/)[1]);

console.log('✅ Products found in database:');
actualSlugs.forEach((slug, index) => {
  console.log(`   ${index + 1}. ${slug}`);
});

console.log('\n🔍 TESTING INDIVIDUAL GAME LINKS');
console.log('=' .repeat(50));

// Test each game mapping
const gameTests = [
  { game: 'Arc Raiders', expectedSlug: 'arc-raiders', footerName: 'Arc Raiders' },
  { game: 'Rainbow Six Siege', expectedSlug: 'rainbow-six-siege', footerName: 'Rainbow Six Siege' },
  { game: 'Battlefield 6', expectedSlug: 'battlefield-6', footerName: 'Battlefield 6' },
  { game: 'Black Ops & WZ', expectedSlug: 'cod-bo6', footerName: 'Black Ops & WZ' },
  { game: 'Rust', expectedSlug: 'rust', footerName: 'Rust' },
  { game: 'PUBG', expectedSlug: 'pubg', footerName: 'PUBG' },
  { game: 'Fortnite', expectedSlug: 'fortnite', footerName: 'Fortnite' },
  { game: 'Apex Legends', expectedSlug: 'apex-legends', footerName: 'Apex Legends' },
  { game: 'EFT', expectedSlug: 'escape-from-tarkov', footerName: 'EFT' },
  { game: 'Marvel Rivals', expectedSlug: 'marvel-rivals', footerName: 'Marvel Rivals' }
];

gameTests.forEach((test, index) => {
  console.log(`${index + 1}. Testing ${test.game}...`);
  
  // Check if the game is in the footer
  const gameInFooter = footerContent.includes(`"${test.footerName}"`);
  if (!gameInFooter) {
    console.log(`   ❌ Game "${test.footerName}" not found in footer`);
    issues.push(`${test.game} not found in footer`);
    allTestsPassed = false;
    return;
  }
  
  // Check if the mapping exists
  const mappingExists = footerContent.includes(`"${test.footerName}": "/store/${test.expectedSlug}"`);
  if (!mappingExists) {
    console.log(`   ❌ Mapping for ${test.game} incorrect or missing`);
    issues.push(`${test.game} mapping incorrect`);
    allTestsPassed = false;
    return;
  }
  
  // Check if the product exists in database
  const productExists = actualSlugs.includes(test.expectedSlug);
  if (!productExists) {
    console.log(`   ❌ Product ${test.expectedSlug} does not exist in database`);
    issues.push(`${test.game} product missing from database`);
    allTestsPassed = false;
    return;
  }
  
  console.log(`   ✅ ${test.game} → /store/${test.expectedSlug} (Product exists)`);
  workingLinks.push({
    game: test.game,
    url: `/store/${test.expectedSlug}`,
    status: 'working'
  });
});

console.log('\n🎯 SPECIAL MAPPINGS VERIFICATION');
console.log('=' .repeat(50));

// Test special mappings
console.log('1. Testing EFT → Escape from Tarkov mapping...');
if (footerContent.includes('"EFT": "/store/escape-from-tarkov"')) {
  console.log('   ✅ EFT correctly maps to Escape from Tarkov');
} else {
  console.log('   ❌ EFT mapping incorrect');
  issues.push('EFT should map to escape-from-tarkov');
  allTestsPassed = false;
}

console.log('2. Testing Black Ops & WZ → COD BO6 mapping...');
if (footerContent.includes('"Black Ops & WZ": "/store/cod-bo6"')) {
  console.log('   ✅ Black Ops & WZ correctly maps to COD BO6');
} else {
  console.log('   ❌ Black Ops & WZ mapping incorrect');
  issues.push('Black Ops & WZ should map to cod-bo6');
  allTestsPassed = false;
}

console.log('3. Testing Battlefield 6 mapping...');
if (footerContent.includes('"Battlefield 6": "/store/battlefield-6"')) {
  console.log('   ✅ Battlefield 6 correctly maps to battlefield-6');
} else {
  console.log('   ❌ Battlefield 6 mapping incorrect');
  issues.push('Battlefield 6 should map to battlefield-6');
  allTestsPassed = false;
}

console.log('\n📊 COVERAGE ANALYSIS');
console.log('=' .repeat(50));

const totalGames = gameTests.length;
const workingGames = workingLinks.length;
const coverage = Math.round((workingGames / totalGames) * 100);

console.log(`Total games in footer: ${totalGames}`);
console.log(`Working product links: ${workingGames}`);
console.log(`Coverage: ${coverage}%`);

console.log('\n' + '='.repeat(60));

if (allTestsPassed) {
  console.log('🎉 ALL TESTS PASSED! All game links point to working products.');
  
  console.log('\n✅ WORKING GAME LINKS:');
  workingLinks.forEach((link, index) => {
    console.log(`   ${index + 1}. ${link.game} → ${link.url}`);
  });
  
  console.log('\n🎯 VERIFICATION COMPLETE:');
  console.log('   • All 10 games have correct mappings');
  console.log('   • All mapped products exist in database');
  console.log('   • Special mappings (EFT, Black Ops & WZ) work correctly');
  console.log('   • Users can click any game and reach a working product page');
  
  console.log('\n🚀 RESULT: All game links are now functional and lead to real products!');
  
} else {
  console.log('❌ SOME TESTS FAILED. Issues found:');
  issues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue}`);
  });
  
  if (workingLinks.length > 0) {
    console.log('\n✅ Working links:');
    workingLinks.forEach((link, index) => {
      console.log(`   ${index + 1}. ${link.game} → ${link.url}`);
    });
  }
}

console.log('\n' + '='.repeat(60));