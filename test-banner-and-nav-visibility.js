const puppeteer = require('puppeteer');

async function testBannerAndNavVisibility() {
  console.log('🔍 Testing announcement banner and navigation visibility...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1200, height: 800 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to homepage
    console.log('📱 Loading homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Wait for components to load
    await page.waitForTimeout(2000);
    
    // Check if announcement banner exists and is visible
    const bannerExists = await page.$('.fixed.top-0.left-0.right-0.z-\\[9999\\]');
    console.log(`📢 Announcement banner exists: ${!!bannerExists}`);
    
    if (bannerExists) {
      const bannerRect = await page.evaluate(() => {
        const banner = document.querySelector('[class*="z-[9999]"]');
        if (banner) {
          const rect = banner.getBoundingClientRect();
          return {
            top: rect.top,
            height: rect.height,
            visible: rect.height > 0 && rect.top >= 0
          };
        }
        return null;
      });
      console.log(`📢 Banner position: top=${bannerRect?.top}px, height=${bannerRect?.height}px, visible=${bannerRect?.visible}`);
    }
    
    // Check if header/navigation exists and is visible
    const headerExists = await page.$('header');
    console.log(`🧭 Navigation header exists: ${!!headerExists}`);
    
    if (headerExists) {
      const headerRect = await page.evaluate(() => {
        const header = document.querySelector('header');
        if (header) {
          const rect = header.getBoundingClientRect();
          return {
            top: rect.top,
            height: rect.height,
            visible: rect.height > 0 && rect.top >= 0
          };
        }
        return null;
      });
      console.log(`🧭 Header position: top=${headerRect?.top}px, height=${headerRect?.height}px, visible=${headerRect?.visible}`);
    }
    
    // Check if both are visible simultaneously
    const bothVisible = await page.evaluate(() => {
      const banner = document.querySelector('[class*="z-[9999]"]');
      const header = document.querySelector('header');
      
      if (!banner || !header) return false;
      
      const bannerRect = banner.getBoundingClientRect();
      const headerRect = header.getBoundingClientRect();
      
      return bannerRect.height > 0 && headerRect.height > 0 && 
             bannerRect.top >= 0 && headerRect.top >= 0 &&
             headerRect.top >= (bannerRect.top + bannerRect.height);
    });
    
    console.log(`✅ Both banner and navigation visible: ${bothVisible}`);
    
    // Take screenshot for verification
    await page.screenshot({ 
      path: 'banner-nav-test.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1200, height: 200 }
    });
    console.log('📸 Screenshot saved as banner-nav-test.png');
    
    console.log('\n🎯 Test Results:');
    console.log(`- Banner exists: ${!!bannerExists}`);
    console.log(`- Header exists: ${!!headerExists}`);
    console.log(`- Both visible: ${bothVisible}`);
    
    if (bothVisible) {
      console.log('✅ SUCCESS: Both announcement banner and navigation are visible!');
    } else {
      console.log('❌ ISSUE: Banner and/or navigation visibility problem detected');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testBannerAndNavVisibility();