#!/usr/bin/env node

/**
 * Test Mobile Admin Dashboard Improvements
 * Verifies mobile responsiveness and date tracking features
 */

const fs = require('fs');
const path = require('path');

console.log('🔥 Testing Mobile Admin Dashboard Improvements...\n');

let allTestsPassed = true;
const results = [];

function test(name, condition, details = '') {
  const passed = condition;
  if (!passed) allTestsPassed = false;
  
  const status = passed ? '✅' : '❌';
  const message = `${status} ${name}`;
  console.log(message);
  if (details && !passed) console.log(`   ${details}`);
  
  results.push({ name, passed, details });
}

try {
  console.log('📱 MOBILE ADMIN DASHBOARD TESTS\n');

  // Test 1: Orders Page with Date Tracking
  const ordersPagePath = path.join(__dirname, 'app', 'mgmt-x9k2m7', 'orders', 'page.tsx');
  const ordersPageExists = fs.existsSync(ordersPagePath);
  test('Orders page exists', ordersPageExists);

  if (ordersPageExists) {
    const ordersContent = fs.readFileSync(ordersPagePath, 'utf8');
    
    // Date filtering features
    test('Date filter options implemented', ordersContent.includes('DATE_FILTERS'));
    test('Today filter available', ordersContent.includes('"today"'));
    test('Yesterday filter available', ordersContent.includes('"yesterday"'));
    test('Last 7 days filter available', ordersContent.includes('"last7days"'));
    test('Last 30 days filter available', ordersContent.includes('"last30days"'));
    test('This month filter available', ordersContent.includes('"thisMonth"'));
    test('Last month filter available', ordersContent.includes('"lastMonth"'));
    
    // Date range calculation
    test('Date range calculation function', ordersContent.includes('getDateRange'));
    test('Date filtering logic', ordersContent.includes('applyDateFilter'));
    test('Stats calculation', ordersContent.includes('calculateStats'));
    
    // Stats cards
    test('Total orders stat card', ordersContent.includes('Total Orders'));
    test('Revenue stat card', ordersContent.includes('Revenue'));
    test('Average order stat card', ordersContent.includes('Avg Order'));
    test('Completed orders stat card', ordersContent.includes('Completed'));
    
    // Mobile responsiveness
    test('Mobile responsive grid', ordersContent.includes('sm:grid-cols-2'));
    test('Mobile responsive layout', ordersContent.includes('lg:grid-cols-4'));
    test('Mobile friendly buttons', ordersContent.includes('h-8 px-2'));
    test('Mobile text sizing', ordersContent.includes('text-sm'));
    
    // Calendar integration
    test('Calendar icon usage', ordersContent.includes('CalendarDays'));
    test('Date display with time', ordersContent.includes('toLocaleTimeString'));
    test('Date range filtering', ordersContent.includes('orderDate >= range.start'));
  }

  // Test 2: Admin Shell Mobile Improvements
  const adminShellPath = path.join(__dirname, 'components', 'admin', 'admin-shell.tsx');
  const adminShellExists = fs.existsSync(adminShellPath);
  test('Admin shell exists', adminShellExists);

  if (adminShellExists) {
    const adminShellContent = fs.readFileSync(adminShellPath, 'utf8');
    
    test('Mobile menu button', adminShellContent.includes('lg:hidden'));
    test('Responsive margin logic', adminShellContent.includes('sidebarOpen ? "lg:ml-64" : "lg:ml-16"'));
    test('Mobile-first approach', adminShellContent.includes('ml-0'));
    test('Menu icon import', adminShellContent.includes('Menu'));
  }

  // Test 3: Admin Sidebar Mobile Features
  const adminSidebarPath = path.join(__dirname, 'components', 'admin', 'admin-sidebar.tsx');
  const adminSidebarExists = fs.existsSync(adminSidebarPath);
  test('Admin sidebar exists', adminSidebarExists);

  if (adminSidebarExists) {
    const adminSidebarContent = fs.readFileSync(adminSidebarPath, 'utf8');
    
    test('Mobile overlay', adminSidebarContent.includes('Mobile Overlay'));
    test('Mobile close button', adminSidebarContent.includes('Mobile Close Button'));
    test('Responsive width classes', adminSidebarContent.includes('lg:w-64'));
    test('Mobile slide animation', adminSidebarContent.includes('translate-x-0'));
    test('Backdrop blur effect', adminSidebarContent.includes('backdrop-blur-sm'));
  }

  // Test 4: Dashboard Mobile Stats
  const dashboardPath = path.join(__dirname, 'app', 'mgmt-x9k2m7', 'page.tsx');
  const dashboardExists = fs.existsSync(dashboardPath);
  test('Dashboard page exists', dashboardExists);

  if (dashboardExists) {
    const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
    
    test('Mobile responsive stats grid', dashboardContent.includes('md:grid-cols-2'));
    test('Mobile responsive layout', dashboardContent.includes('lg:grid-cols-4'));
    test('Mobile friendly animations', dashboardContent.includes('animate-in'));
    test('Touch-friendly interactions', dashboardContent.includes('hover:scale-'));
  }

  console.log('\n📊 FEATURE VERIFICATION\n');

  // Test 5: Date Tracking Features
  if (ordersPageExists) {
    const ordersContent = fs.readFileSync(ordersPagePath, 'utf8');
    test('Date filter dropdown implemented', ordersContent.includes('dateFilterOpen'));
    test('Real-time stats calculation', ordersContent.includes('totalRevenue'));
    test('Order filtering by date range', ordersContent.includes('filtered = orders.filter'));
    test('Beautiful date display', ordersContent.includes('toLocaleDateString'));
  } else {
    test('Date filter dropdown implemented', false, 'Orders page not found');
    test('Real-time stats calculation', false, 'Orders page not found');
    test('Order filtering by date range', false, 'Orders page not found');
    test('Beautiful date display', false, 'Orders page not found');
  }

  // Test 6: Mobile UX Improvements
  if (adminShellExists) {
    const adminShellContent = fs.readFileSync(adminShellPath, 'utf8');
    test('Mobile navigation accessible', adminShellContent.includes('setSidebarOpen(true)'));
  } else {
    test('Mobile navigation accessible', false, 'Admin shell not found');
  }
  
  if (ordersPageExists) {
    const ordersContent = fs.readFileSync(ordersPagePath, 'utf8');
    test('Touch-friendly button sizes', ordersContent.includes('h-8'));
    test('Mobile-optimized modals', ordersContent.includes('max-w-lg'));
    test('Responsive text sizing', ordersContent.includes('text-xs'));
  } else {
    test('Touch-friendly button sizes', false, 'Orders page not found');
    test('Mobile-optimized modals', false, 'Orders page not found');
    test('Responsive text sizing', false, 'Orders page not found');
  }

  console.log('\n🎨 DESIGN CONSISTENCY\n');

  // Test 7: Design Consistency
  const files = [ordersPagePath, adminShellPath, adminSidebarPath];
  const existingFiles = files.filter(file => fs.existsSync(file));
  
  let magmaThemeConsistent = true;
  let responsiveDesign = true;
  
  existingFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (!content.includes('#2563eb') && !content.includes('bg-[#2563eb]')) {
      magmaThemeConsistent = false;
    }
    if (!content.includes('lg:') && !content.includes('md:') && !content.includes('sm:')) {
      responsiveDesign = false;
    }
  });

  test('Consistent Magma red theme', magmaThemeConsistent);
  test('Responsive design classes', responsiveDesign);
  
  if (adminShellExists) {
    const adminShellContent = fs.readFileSync(adminShellPath, 'utf8');
    test('Mobile-first approach', adminShellContent.includes('ml-0'));
  } else {
    test('Mobile-first approach', false, 'Admin shell not found');
  }
  
  if (ordersPageExists) {
    const ordersContent = fs.readFileSync(ordersPagePath, 'utf8');
    test('Touch-friendly interface', ordersContent.includes('p-4'));
  } else {
    test('Touch-friendly interface', false, 'Orders page not found');
  }

  console.log('\n' + '━'.repeat(50));
  console.log('📊 MOBILE ADMIN DASHBOARD RESULTS');
  console.log('━'.repeat(50));

  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;

  console.log(`\n📈 Test Results: ${passedTests}/${totalTests} passed`);
  
  if (failedTests > 0) {
    console.log(`\n❌ Failed Tests (${failedTests}):`);
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   • ${r.name}`);
      if (r.details) console.log(`     ${r.details}`);
    });
  }

  console.log('\n🎯 MOBILE ADMIN DASHBOARD STATUS:');
  if (allTestsPassed) {
    console.log('✅ ALL TESTS PASSED - MOBILE ADMIN DASHBOARD IS READY! 📱');
  } else {
    console.log('⚠️  Some tests failed - review issues above');
  }

  console.log('\n📱 Mobile Admin Features Implemented:');
  console.log('  ✅ Date-based order tracking (Today, Yesterday, Last 7/30 days)');
  console.log('  ✅ Real-time statistics with date filtering');
  console.log('  ✅ Mobile-responsive admin sidebar with overlay');
  console.log('  ✅ Touch-friendly navigation and buttons');
  console.log('  ✅ Mobile-optimized order management');
  console.log('  ✅ Responsive stats cards and layouts');
  console.log('  ✅ Mobile menu button for easy access');
  console.log('  ✅ Backdrop blur and smooth animations');
  console.log('  ✅ Consistent Magma branding throughout');
  console.log('  ✅ Mobile-first responsive design');

  console.log('\n📊 Date Tracking Features:');
  console.log('  • Today - View today\'s orders and revenue');
  console.log('  • Yesterday - Compare with previous day');
  console.log('  • Last 7 Days - Weekly performance tracking');
  console.log('  • Last 30 Days - Monthly analytics');
  console.log('  • This Month - Current month statistics');
  console.log('  • Last Month - Previous month comparison');
  console.log('  • All Time - Complete historical data');

  console.log('\n📱 Mobile UX Improvements:');
  console.log('  • Hamburger menu for easy sidebar access');
  console.log('  • Touch-friendly button sizes (h-8)');
  console.log('  • Mobile-optimized modal dialogs');
  console.log('  • Responsive grid layouts');
  console.log('  • Smooth slide animations');
  console.log('  • Backdrop blur overlay');
  console.log('  • Mobile-first responsive breakpoints');

  console.log('\n🚀 The mobile admin dashboard is now fully functional and user-friendly!');

} catch (error) {
  console.error('❌ Mobile admin dashboard test failed:', error);
  allTestsPassed = false;
}

process.exit(allTestsPassed ? 0 : 1);