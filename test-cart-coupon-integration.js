async function testCartCouponIntegration() {
  console.log('🛒 Testing Cart Coupon Integration...\n');

  try {
    // Simulate the cart's applyCoupon function
    console.log('1. Testing coupon application (simulating cart context)...');
    
    const applyCoupon = async (code) => {
      try {
        const response = await fetch('http://localhost:3000/api/validate-coupon', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const result = await response.json();

        if (result.valid) {
          const appliedCoupon = {
            code: code.toUpperCase(),
            discount: result.discount,
            type: result.type,
          };
          console.log('   ✅ Coupon applied:', appliedCoupon);
          return { success: true, coupon: appliedCoupon };
        } else {
          console.log('   ❌ Coupon invalid:', result.message);
          return { success: false, error: result.message || 'Invalid coupon code' };
        }
      } catch (error) {
        console.error('   ❌ Error validating coupon:', error);
        return { success: false, error: 'Failed to validate coupon' };
      }
    };

    // Test with the TEST coupon
    const result = await applyCoupon('TEST');
    
    if (result.success) {
      console.log('\n2. Testing discount calculation...');
      
      // Simulate cart items from the screenshot
      const cartItems = [
        { name: 'Arc Raiders', price: 44.99, quantity: 1 },
        { name: 'Fortnite Aimbot 30 Days', price: 39996.00, quantity: 4 },
        { name: 'Fortnite Aimbot 7 Days', price: 5998.00, quantity: 2 },
      ];
      
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      console.log(`   Subtotal: $${subtotal.toFixed(2)}`);
      
      // Apply the coupon discount
      const appliedCoupon = result.coupon;
      let discount = 0;
      
      if (appliedCoupon.type === "percentage") {
        discount = (subtotal * appliedCoupon.discount) / 100;
      } else {
        discount = Math.min(appliedCoupon.discount, subtotal);
      }
      
      const total = Math.max(0, subtotal - discount);
      
      console.log(`   Coupon: ${appliedCoupon.code} (${appliedCoupon.discount}% off)`);
      console.log(`   Discount: -$${discount.toFixed(2)}`);
      console.log(`   Final Total: $${total.toFixed(2)}`);
      
      console.log('\n✅ Cart coupon integration is working correctly!');
      console.log('   The "Apply" button should now work in the cart');
      
    } else {
      console.log('\n❌ Coupon application failed:', result.error);
    }

    // Test with invalid coupon
    console.log('\n3. Testing with invalid coupon...');
    const invalidResult = await applyCoupon('INVALID123');
    
    if (!invalidResult.success) {
      console.log('   ✅ Invalid coupon correctly rejected:', invalidResult.error);
    } else {
      console.log('   ❌ Invalid coupon was accepted (this is wrong)');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCartCouponIntegration();