/**
 * Debug Checkout Issue
 * This will help us see exactly what's happening when you click checkout
 */

async function debugCheckoutIssue() {
  console.log('🔍 Debugging Checkout Issue...\n');

  try {
    // Test the actual checkout API endpoint
    console.log('1️⃣ Testing Checkout API Endpoint...');
    
    const testCheckoutData = {
      items: [
        {
          id: 'test-item',
          productId: 'arc-raiders',
          productName: 'Arc Raiders',
          game: 'Arc Raiders',
          duration: '1 Month',
          price: 29.99,
          quantity: 1
        }
      ],
      customer_email: 'test@skylinecheats.org',
      success_url: 'http://localhost:3000/payment/success',
      cancel_url: 'http://localhost:3000/cart'
    };

    console.log('📡 Making request to checkout API...');
    
    const response = await fetch('http://localhost:3000/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCheckoutData),
    });

    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📊 Response Headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ API Error Response:', errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.log('❌ Parsed Error:', errorJson);
      } catch (e) {
        console.log('❌ Raw Error Text:', errorText);
      }
    } else {
      const result = await response.json();
      console.log('✅ API Success Response:', result);
      
      if (result.url) {
        console.log('✅ Stripe Checkout URL Generated:', result.url);
      } else {
        console.log('❌ No checkout URL in response');
      }
    }

  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🚨 CONNECTION REFUSED ERROR:');
      console.log('============================');
      console.log('❌ Your Next.js development server is not running!');
      console.log('');
      console.log('🔧 To fix this:');
      console.log('1. Open a new terminal');
      console.log('2. Run: npm run dev');
      console.log('3. Wait for "Ready on http://localhost:3000"');
      console.log('4. Then try the checkout again');
      console.log('');
      console.log('💡 The checkout needs the dev server running to work!');
    } else if (error.message.includes('fetch')) {
      console.log('\n🚨 FETCH ERROR:');
      console.log('===============');
      console.log('❌ Cannot connect to localhost:3000');
      console.log('');
      console.log('🔧 Possible solutions:');
      console.log('1. Make sure "npm run dev" is running');
      console.log('2. Check if port 3000 is available');
      console.log('3. Try restarting the dev server');
    }
  }
}

debugCheckoutIssue();