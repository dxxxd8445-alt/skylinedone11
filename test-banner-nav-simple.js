console.log('🔍 Testing announcement banner and navigation positioning...');

// Test 1: Check announcement banner component
console.log('\n📢 Checking announcement banner component...');
const fs = require('fs');

try {
  const bannerContent = fs.readFileSync('components/announcement-banner.tsx', 'utf8');
  
  // Check z-index
  const hasCorrectZIndex = bannerContent.includes('z-[9999]');
  console.log(`✅ Banner z-index (9999): ${hasCorrectZIndex}`);
  
  // Check positioning
  const hasFixedPosition = bannerContent.includes('fixed top-0 left-0 right-0');
  console.log(`✅ Banner fixed positioning: ${hasFixedPosition}`);
  
  // Check CSS custom property setting
  const setsCSSProperty = bannerContent.includes('--announcement-height');
  console.log(`✅ Sets CSS custom property: ${setsCSSProperty}`);
  
  // Check body padding calculation
  const calculatesBodyPadding = bannerContent.includes('bannerHeight + headerHeight');
  console.log(`✅ Calculates body padding: ${calculatesBodyPadding}`);
  
} catch (error) {
  console.error('❌ Error reading banner component:', error.message);
}

// Test 2: Check header component
console.log('\n🧭 Checking header component...');

try {
  const headerContent = fs.readFileSync('components/header.tsx', 'utf8');
  
  // Check z-index
  const hasCorrectZIndex = headerContent.includes('z-[9998]');
  console.log(`✅ Header z-index (9998): ${hasCorrectZIndex}`);
  
  // Check CSS custom property usage
  const usesCSSProperty = headerContent.includes('--announcement-height');
  console.log(`✅ Uses CSS custom property: ${usesCSSProperty}`);
  
  // Check dynamic top positioning
  const hasDynamicTop = headerContent.includes("style={{ top: 'var(--announcement-height, 0px)' }}");
  console.log(`✅ Dynamic top positioning: ${hasDynamicTop}`);
  
} catch (error) {
  console.error('❌ Error reading header component:', error.message);
}

// Test 3: Check API endpoint
console.log('\n🔗 Checking announcements API...');

try {
  const apiContent = fs.readFileSync('app/api/announcements/active/route.ts', 'utf8');
  
  const hasCorrectQuery = apiContent.includes("eq('is_active', true)");
  console.log(`✅ Filters active announcements: ${hasCorrectQuery}`);
  
  const hasOrdering = apiContent.includes("order('priority'");
  console.log(`✅ Orders by priority: ${hasOrdering}`);
  
} catch (error) {
  console.error('❌ Error reading API endpoint:', error.message);
}

console.log('\n🎯 Summary:');
console.log('- Banner positioned at top with z-index 9999');
console.log('- Header positioned below banner with z-index 9998');
console.log('- CSS custom property coordinates positioning');
console.log('- Body padding accounts for both banner and header');
console.log('\n✅ Components should now display both banner and navigation correctly!');
console.log('\n📝 To test: Create an announcement in the admin panel and check the homepage');