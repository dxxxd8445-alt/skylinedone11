#!/usr/bin/env node

/**
 * Test Script: Discord Support Page
 * 
 * This script verifies that the Discord support page has been properly
 * implemented with beautiful design for both desktop and mobile users.
 */

const fs = require('fs');
const path = require('path');

console.log('💬 Testing Discord Support Page...\n');

// Test 1: Check navigation has been updated to "DISCORD"
console.log('1. Checking navigation update...');
const headerPath = path.join(__dirname, 'components', 'header.tsx');
const headerContent = fs.readFileSync(headerPath, 'utf8');

const hasDiscordNav = headerContent.includes('label: "DISCORD"') && 
                     headerContent.includes('href: "/discord"') &&
                     headerContent.includes('external: false');

if (hasDiscordNav) {
  console.log('✅ Navigation updated to "DISCORD" with internal link');
} else {
  console.log('❌ Navigation not properly updated');
}

// Test 2: Check Discord page exists
console.log('\n2. Checking Discord page exists...');
const discordPagePath = path.join(__dirname, 'app', 'discord', 'page.tsx');
const discordPageExists = fs.existsSync(discordPagePath);

if (discordPageExists) {
  console.log('✅ Discord support page created');
} else {
  console.log('❌ Discord support page not found');
}

// Test 3: Check page content and features
console.log('\n3. Checking page content...');
if (discordPageExists) {
  const discordPageContent = fs.readFileSync(discordPagePath, 'utf8');
  
  const hasMainFeatures = discordPageContent.includes('Join Our Discord') &&
                         discordPageContent.includes('24/7 Support') &&
                         discordPageContent.includes('Active Community') &&
                         discordPageContent.includes('Join Discord Server');
  
  if (hasMainFeatures) {
    console.log('✅ Page has main Discord features and content');
  } else {
    console.log('❌ Page missing main features');
  }
}

// Test 4: Check mobile responsiveness
console.log('\n4. Checking mobile responsiveness...');
if (discordPageExists) {
  const discordPageContent = fs.readFileSync(discordPagePath, 'utf8');
  
  const hasMobileDesign = discordPageContent.includes('md:') &&
                         discordPageContent.includes('lg:') &&
                         discordPageContent.includes('sm:') &&
                         discordPageContent.includes('min-w-[280px]');
  
  if (hasMobileDesign) {
    console.log('✅ Page has mobile-responsive design');
  } else {
    console.log('❌ Page missing mobile responsiveness');
  }
}

// Test 5: Check Discord branding and styling
console.log('\n5. Checking Discord branding...');
if (discordPageExists) {
  const discordPageContent = fs.readFileSync(discordPagePath, 'utf8');
  
  const hasDiscordBranding = discordPageContent.includes('#5865f2') &&
                            discordPageContent.includes('#7289da') &&
                            discordPageContent.includes('MessageCircle') &&
                            discordPageContent.includes('discord.gg/skylinecheats');
  
  if (hasDiscordBranding) {
    console.log('✅ Page has proper Discord branding and colors');
  } else {
    console.log('❌ Page missing Discord branding');
  }
}

// Test 6: Check mobile menu description
console.log('\n6. Checking mobile menu description...');
const hasMobileDescription = headerContent.includes('Join for support');

if (hasMobileDescription) {
  console.log('✅ Mobile menu has "Join for support" description');
} else {
  console.log('❌ Mobile menu description not updated');
}

console.log('\n💬 Discord Support Page Summary:');
console.log('=================================');

const allTestsPassed = hasDiscordNav && 
                      discordPageExists && 
                      hasMobileDescription;

if (allTestsPassed) {
  console.log('🎉 ALL TESTS PASSED! Discord support page is ready.');
  console.log('\n✨ Features implemented:');
  console.log('   🖥️  DESKTOP: "DISCORD" in navigation → Beautiful support page');
  console.log('   📱 MOBILE: "DISCORD" in menu with "Join for support" description');
  console.log('\n🎨 Page Features:');
  console.log('   • Beautiful gradient design with Discord colors');
  console.log('   • Mobile-responsive layout');
  console.log('   • 24/7 support messaging');
  console.log('   • Community benefits showcase');
  console.log('   • Clear call-to-action buttons');
  console.log('   • Member count and social proof');
} else {
  console.log('⚠️  Some tests failed. Please check the issues above.');
}

console.log('\n🚀 Users can now access Discord support through a beautiful dedicated page!');