#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function testMobileMenuFunctionality() {
  console.log('🧪 Testing Mobile Menu Functionality...\n');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    });

    const page = await browser.newPage();
    
    // Set mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    
    console.log('📱 Set mobile viewport (375x667)');
    
    // Navigate to admin dashboard
    await page.goto('http://localhost:3000/mgmt-x9k2m7', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    console.log('🏠 Navigated to admin dashboard');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Check if hamburger menu button is visible
    const hamburgerButton = await page.$('button[aria-label="Open navigation menu"]');
    
    if (!hamburgerButton) {
      throw new Error('❌ Hamburger menu button not found!');
    }
    
    console.log('✅ Hamburger menu button found');
    
    // Check if button is visible
    const isVisible = await hamburgerButton.isIntersectingViewport();
    
    if (!isVisible) {
      throw new Error('❌ Hamburger menu button is not visible!');
    }
    
    console.log('✅ Hamburger menu button is visible');
    
    // Check if sidebar is initially closed
    const sidebar = await page.$('aside');
    const sidebarTransform = await page.evaluate((el) => {
      return window.getComputedStyle(el).transform;
    }, sidebar);
    
    console.log('📋 Initial sidebar transform:', sidebarTransform);
    
    // Click the hamburger menu
    console.log('🍔 Clicking hamburger menu...');
    await hamburgerButton.click();
    
    // Wait for animation
    await page.waitForTimeout(500);
    
    // Check if sidebar is now visible
    const sidebarAfterClick = await page.evaluate(() => {
      const sidebar = document.querySelector('aside');
      const transform = window.getComputedStyle(sidebar).transform;
      const isVisible = transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)';
      return { transform, isVisible };
    });
    
    console.log('📋 Sidebar after click:', sidebarAfterClick);
    
    if (!sidebarAfterClick.isVisible) {
      throw new Error('❌ Sidebar did not open after clicking hamburger menu!');
    }
    
    console.log('✅ Sidebar opened successfully!');
    
    // Check if overlay is present
    const overlay = await page.$('div[class*="bg-black/60"]');
    
    if (!overlay) {
      throw new Error('❌ Mobile overlay not found!');
    }
    
    console.log('✅ Mobile overlay is present');
    
    // Test closing by clicking overlay
    console.log('🎯 Testing overlay close...');
    await overlay.click();
    
    // Wait for animation
    await page.waitForTimeout(500);
    
    // Check if sidebar is closed
    const sidebarAfterOverlay = await page.evaluate(() => {
      const sidebar = document.querySelector('aside');
      const transform = window.getComputedStyle(sidebar).transform;
      const isClosed = transform.includes('translateX(-100%)') || transform.includes('matrix(1, 0, 0, 1, -256, 0)');
      return { transform, isClosed };
    });
    
    console.log('📋 Sidebar after overlay click:', sidebarAfterOverlay);
    
    if (!sidebarAfterOverlay.isClosed) {
      throw new Error('❌ Sidebar did not close after clicking overlay!');
    }
    
    console.log('✅ Sidebar closed successfully via overlay!');
    
    // Test navigation
    console.log('🧭 Testing navigation...');
    
    // Open sidebar again
    await hamburgerButton.click();
    await page.waitForTimeout(500);
    
    // Click on Orders link
    const ordersLink = await page.$('a[href="/mgmt-x9k2m7/orders"]');
    
    if (!ordersLink) {
      throw new Error('❌ Orders navigation link not found!');
    }
    
    await ordersLink.click();
    
    // Wait for navigation
    await page.waitForTimeout(2000);
    
    // Check if we're on orders page
    const currentUrl = page.url();
    
    if (!currentUrl.includes('/orders')) {
      throw new Error('❌ Navigation to orders page failed!');
    }
    
    console.log('✅ Navigation to orders page successful!');
    
    // Check if sidebar auto-closed on mobile after navigation
    const sidebarAfterNav = await page.evaluate(() => {
      const sidebar = document.querySelector('aside');
      const transform = window.getComputedStyle(sidebar).transform;
      const isClosed = transform.includes('translateX(-100%)') || transform.includes('matrix(1, 0, 0, 1, -256, 0)');
      return { transform, isClosed };
    });
    
    console.log('📋 Sidebar after navigation:', sidebarAfterNav);
    
    if (!sidebarAfterNav.isClosed) {
      console.log('⚠️  Sidebar did not auto-close after navigation (this is okay)');
    } else {
      console.log('✅ Sidebar auto-closed after navigation!');
    }
    
    console.log('\n🎉 All mobile menu tests passed!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Hamburger button visible on mobile');
    console.log('✅ Hamburger button clickable');
    console.log('✅ Sidebar opens when clicked');
    console.log('✅ Mobile overlay appears');
    console.log('✅ Sidebar closes when overlay clicked');
    console.log('✅ Navigation works correctly');
    
  } catch (error) {
    console.error('\n❌ Mobile menu test failed:', error.message);
    
    // Take screenshot for debugging
    if (browser) {
      const page = (await browser.pages())[0];
      if (page) {
        await page.screenshot({ path: 'mobile-menu-error.png', fullPage: true });
        console.log('📸 Screenshot saved as mobile-menu-error.png');
      }
    }
    
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testMobileMenuFunctionality()
  .then(() => {
    console.log('\n✅ Mobile menu functionality test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Mobile menu functionality test failed:', error.message);
    process.exit(1);
  });