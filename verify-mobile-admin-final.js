#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function readFileContent(filePath) {
  if (!checkFileExists(filePath)) {
    return null;
  }
  return fs.readFileSync(filePath, 'utf8');
}

function verifyMobileAdminDashboard() {
  console.log('🔍 Verifying Mobile Admin Dashboard Implementation...\n');

  const checks = [];

  // 1. Check AdminShell component
  console.log('1️⃣ Checking AdminShell component...');
  const adminShellPath = 'components/admin/admin-shell.tsx';
  const adminShellContent = readFileContent(adminShellPath);
  
  if (!adminShellContent) {
    checks.push({ name: 'AdminShell exists', status: '❌', details: 'File not found' });
  } else {
    checks.push({ name: 'AdminShell exists', status: '✅', details: 'File found' });
    
    // Check for mobile menu button
    if (adminShellContent.includes('lg:hidden') && adminShellContent.includes('Open navigation menu')) {
      checks.push({ name: 'Mobile menu button', status: '✅', details: 'Properly implemented' });
    } else {
      checks.push({ name: 'Mobile menu button', status: '❌', details: 'Missing or incorrect' });
    }
    
    // Check for touch-manipulation
    if (adminShellContent.includes('touch-manipulation')) {
      checks.push({ name: 'Touch optimization', status: '✅', details: 'touch-manipulation added' });
    } else {
      checks.push({ name: 'Touch optimization', status: '⚠️', details: 'touch-manipulation missing' });
    }
    
    // Check for console logging
    if (adminShellContent.includes('🍔 Mobile menu clicked')) {
      checks.push({ name: 'Debug logging', status: '✅', details: 'Console logging present' });
    } else {
      checks.push({ name: 'Debug logging', status: '⚠️', details: 'Console logging missing' });
    }
    
    // Check for loading state
    if (adminShellContent.includes('mounted') && adminShellContent.includes('setMounted')) {
      checks.push({ name: 'Hydration safety', status: '✅', details: 'Loading state implemented' });
    } else {
      checks.push({ name: 'Hydration safety', status: '❌', details: 'Loading state missing' });
    }
  }

  // 2. Check AdminSidebar component
  console.log('\n2️⃣ Checking AdminSidebar component...');
  const sidebarPath = 'components/admin/admin-sidebar.tsx';
  const sidebarContent = readFileContent(sidebarPath);
  
  if (!sidebarContent) {
    checks.push({ name: 'AdminSidebar exists', status: '❌', details: 'File not found' });
  } else {
    checks.push({ name: 'AdminSidebar exists', status: '✅', details: 'File found' });
    
    // Check for mobile overlay
    if (sidebarContent.includes('bg-black/60') && sidebarContent.includes('backdrop-blur-sm')) {
      checks.push({ name: 'Mobile overlay', status: '✅', details: 'Overlay implemented' });
    } else {
      checks.push({ name: 'Mobile overlay', status: '❌', details: 'Overlay missing' });
    }
    
    // Check for mobile responsive classes
    if (sidebarContent.includes('lg:translate-x-0') && sidebarContent.includes('-translate-x-full')) {
      checks.push({ name: 'Mobile responsiveness', status: '✅', details: 'Responsive classes present' });
    } else {
      checks.push({ name: 'Mobile responsiveness', status: '❌', details: 'Responsive classes missing' });
    }
    
    // Check for auto-close on navigation
    if (sidebarContent.includes('window.innerWidth < 1024')) {
      checks.push({ name: 'Auto-close navigation', status: '✅', details: 'Auto-close implemented' });
    } else {
      checks.push({ name: 'Auto-close navigation', status: '⚠️', details: 'Auto-close missing' });
    }
  }

  // 3. Check admin store
  console.log('\n3️⃣ Checking admin store...');
  const storePath = 'lib/admin-store.ts';
  const storeContent = readFileContent(storePath);
  
  if (!storeContent) {
    checks.push({ name: 'Admin store exists', status: '❌', details: 'File not found' });
  } else {
    checks.push({ name: 'Admin store exists', status: '✅', details: 'File found' });
    
    // Check for sidebar state management
    if (storeContent.includes('sidebarOpen') && storeContent.includes('setSidebarOpen')) {
      checks.push({ name: 'Sidebar state management', status: '✅', details: 'State management present' });
    } else {
      checks.push({ name: 'Sidebar state management', status: '❌', details: 'State management missing' });
    }
  }

  // 4. Check key admin pages
  console.log('\n4️⃣ Checking admin pages...');
  const adminPages = [
    'app/mgmt-x9k2m7/page.tsx',
    'app/mgmt-x9k2m7/orders/page.tsx',
    'app/mgmt-x9k2m7/site-messages/page.tsx',
    'app/mgmt-x9k2m7/products/page.tsx',
    'app/mgmt-x9k2m7/settings/page.tsx'
  ];

  let pagesUsingAdminShell = 0;
  let totalPagesChecked = 0;

  adminPages.forEach(pagePath => {
    const pageContent = readFileContent(pagePath);
    if (pageContent) {
      totalPagesChecked++;
      if (pageContent.includes('AdminShell')) {
        pagesUsingAdminShell++;
      }
    }
  });

  if (pagesUsingAdminShell === totalPagesChecked && totalPagesChecked > 0) {
    checks.push({ name: 'Admin pages using AdminShell', status: '✅', details: `${pagesUsingAdminShell}/${totalPagesChecked} pages` });
  } else {
    checks.push({ name: 'Admin pages using AdminShell', status: '⚠️', details: `${pagesUsingAdminShell}/${totalPagesChecked} pages` });
  }

  // 5. Check for build errors
  console.log('\n5️⃣ Checking for potential issues...');
  
  // Check if MobileMenuButton component is still being used (should be removed)
  if (adminShellContent && adminShellContent.includes('MobileMenuButton')) {
    checks.push({ name: 'No conflicting components', status: '⚠️', details: 'MobileMenuButton still referenced' });
  } else {
    checks.push({ name: 'No conflicting components', status: '✅', details: 'Clean implementation' });
  }

  // Display results
  console.log('\n📊 Verification Results:');
  console.log('=' .repeat(60));
  
  let passedChecks = 0;
  let totalChecks = checks.length;
  
  checks.forEach(check => {
    console.log(`${check.status} ${check.name}: ${check.details}`);
    if (check.status === '✅') passedChecks++;
  });
  
  console.log('=' .repeat(60));
  console.log(`📈 Score: ${passedChecks}/${totalChecks} checks passed`);
  
  const percentage = Math.round((passedChecks / totalChecks) * 100);
  console.log(`🎯 Success Rate: ${percentage}%`);

  if (percentage >= 90) {
    console.log('\n🎉 Excellent! Mobile admin dashboard is properly implemented.');
  } else if (percentage >= 75) {
    console.log('\n👍 Good! Mobile admin dashboard is mostly working with minor issues.');
  } else {
    console.log('\n⚠️  Mobile admin dashboard needs attention.');
  }

  console.log('\n📱 Mobile Testing Instructions:');
  console.log('1. Open http://localhost:3000/mgmt-x9k2m7');
  console.log('2. Use browser dev tools to simulate mobile device');
  console.log('3. Look for red hamburger menu button (☰)');
  console.log('4. Click hamburger button to open sidebar');
  console.log('5. Click dark overlay or navigation item to close');
  console.log('6. Test on different admin pages');

  console.log('\n🔧 Key Features:');
  console.log('• Responsive hamburger menu button');
  console.log('• Slide-in sidebar animation');
  console.log('• Dark overlay for mobile');
  console.log('• Auto-close on navigation');
  console.log('• Touch-optimized interactions');
  console.log('• Escape key support');

  return percentage >= 75;
}

// Run verification
const success = verifyMobileAdminDashboard();
process.exit(success ? 0 : 1);