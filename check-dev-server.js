/**
 * Check if Dev Server is Running
 * Quick check to see if localhost:3000 is accessible
 */

async function checkDevServer() {
  console.log('🔍 Checking if dev server is running...\n');

  try {
    const response = await fetch('http://localhost:3000');
    
    if (response.ok) {
      console.log('✅ Dev server is running on http://localhost:3000');
      console.log('✅ Your checkout should work now!');
      
      console.log('\n🎯 Next Steps:');
      console.log('==============');
      console.log('1. Go to http://localhost:3000');
      console.log('2. Add items to cart');
      console.log('3. Sign in');
      console.log('4. Click "Proceed to Stripe Checkout"');
      console.log('5. You should be redirected to Stripe!');
      
    } else {
      console.log(`⚠️  Dev server responded with status: ${response.status}`);
      console.log('   This might indicate an issue with the app');
    }
    
  } catch (error) {
    if (error.message.includes('ECONNREFUSED')) {
      console.log('❌ Dev server is NOT running');
      console.log('');
      console.log('🔧 To start the dev server:');
      console.log('===========================');
      console.log('1. Open a terminal in your project folder');
      console.log('2. Run: npm run dev');
      console.log('3. Wait for "Ready on http://localhost:3000"');
      console.log('4. Then try the checkout again');
      console.log('');
      console.log('💡 The checkout needs the dev server running to work!');
    } else {
      console.log('❌ Error checking dev server:', error.message);
    }
  }
}

checkDevServer();