async function testCouponValidationAPI() {
  console.log('🧪 Testing Coupon Validation API...\n');

  try {
    // Test with a known coupon code
    const testCodes = ['TEST', 'FIXED2098', 'ADMIN3258', 'MAGMA10'];
    
    for (const code of testCodes) {
      console.log(`Testing coupon code: ${code}`);
      
      try {
        const response = await fetch('http://localhost:3000/api/validate-coupon', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: code }),
        });

        const result = await response.json();
        
        console.log(`  Status: ${response.status}`);
        console.log(`  Response:`, result);
        
        if (result.valid) {
          console.log(`  ✅ ${code} is valid: ${result.discount}% off`);
        } else {
          console.log(`  ❌ ${code} is invalid: ${result.message}`);
        }
        
      } catch (fetchError) {
        console.log(`  ⚠️  API call failed: ${fetchError.message}`);
      }
      
      console.log('');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCouponValidationAPI();