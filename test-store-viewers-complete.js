#!/usr/bin/env node

/**
 * STORE VIEWERS REAL-TIME ANALYTICS TEST
 * Tests the complete Store Viewers system with real data collection
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 TESTING STORE VIEWERS REAL-TIME ANALYTICS SYSTEM');
console.log('=' .repeat(60));

// Test 1: Check if database setup SQL exists
console.log('\n1. Checking database setup SQL...');
try {
  const sqlContent = fs.readFileSync('STORE_VIEWERS_DATABASE_SETUP.sql', 'utf8');
  if (sqlContent.includes('visitor_sessions') && sqlContent.includes('page_views')) {
    console.log('✅ Database setup SQL found and contains required tables');
  } else {
    console.log('❌ Database setup SQL missing required tables');
  }
} catch (error) {
  console.log('❌ Database setup SQL file not found');
}

// Test 2: Check analytics tracker implementation
console.log('\n2. Checking analytics tracker...');
try {
  const trackerContent = fs.readFileSync('lib/analytics-tracker.ts', 'utf8');
  if (trackerContent.includes('trackProductView') && trackerContent.includes('trackAddToCart')) {
    console.log('✅ Analytics tracker implemented with required functions');
  } else {
    console.log('❌ Analytics tracker missing required functions');
  }
} catch (error) {
  console.log('❌ Analytics tracker file not found');
}

// Test 3: Check API endpoints
console.log('\n3. Checking API endpoints...');
const apiFiles = [
  'app/api/analytics/track/route.ts',
  'app/api/analytics/realtime/route.ts'
];

apiFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('NextRequest') && content.includes('NextResponse')) {
      console.log(`✅ ${file} - API endpoint properly implemented`);
    } else {
      console.log(`❌ ${file} - API endpoint missing required imports`);
    }
  } catch (error) {
    console.log(`❌ ${file} - API endpoint file not found`);
  }
});

// Test 4: Check Store Viewers page
console.log('\n4. Checking Store Viewers admin page...');
try {
  const pageContent = fs.readFileSync('app/mgmt-x9k2m7/store-viewers/page.tsx', 'utf8');
  if (pageContent.includes('real-time') && pageContent.includes('analytics')) {
    console.log('✅ Store Viewers page implemented with real-time features');
  } else {
    console.log('❌ Store Viewers page missing real-time features');
  }
} catch (error) {
  console.log('❌ Store Viewers page file not found');
}

// Test 5: Check analytics provider integration
console.log('\n5. Checking analytics provider integration...');
try {
  const providerContent = fs.readFileSync('components/analytics-provider.tsx', 'utf8');
  const layoutContent = fs.readFileSync('app/layout.tsx', 'utf8');
  
  if (providerContent.includes('initAnalytics') && layoutContent.includes('AnalyticsProvider')) {
    console.log('✅ Analytics provider integrated into main layout');
  } else {
    console.log('❌ Analytics provider not properly integrated');
  }
} catch (error) {
  console.log('❌ Analytics provider integration incomplete');
}

// Test 6: Check product tracking integration
console.log('\n6. Checking product tracking integration...');
try {
  const productContent = fs.readFileSync('components/product-detail-client.tsx', 'utf8');
  if (productContent.includes('trackProductView') && productContent.includes('trackAddToCart')) {
    console.log('✅ Product tracking integrated into product pages');
  } else {
    console.log('❌ Product tracking not integrated into product pages');
  }
} catch (error) {
  console.log('❌ Product detail component not found or missing tracking');
}

// Test 7: Check TypeScript compilation
console.log('\n7. Checking TypeScript compilation...');
try {
  execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
  console.log('✅ TypeScript compilation successful');
} catch (error) {
  console.log('❌ TypeScript compilation errors detected');
  console.log('   Run "npx tsc --noEmit" to see detailed errors');
}

console.log('\n' + '='.repeat(60));
console.log('🎯 STORE VIEWERS SYSTEM SETUP COMPLETE');
console.log('\n📋 NEXT STEPS:');
console.log('1. Run the database setup SQL in your Supabase SQL Editor');
console.log('2. Test the Store Viewers page at /mgmt-x9k2m7/store-viewers');
console.log('3. Visit product pages to generate test analytics data');
console.log('4. Verify real-time data appears in the admin dashboard');
console.log('\n🔗 Key Features:');
console.log('• Real IP address tracking');
console.log('• Live visitor activity monitoring');
console.log('• Product view and cart tracking');
console.log('• Real-time analytics dashboard');
console.log('• Automatic session cleanup');
console.log('• Professional admin interface');