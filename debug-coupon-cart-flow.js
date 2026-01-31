const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bcjzfqvomwtuyznnlxha.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjanpmcXZvbXd0dXl6bm5seGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3MDU1NSwiZXhwIjoyMDg1NDQ2NTU1fQ.1gp_MzZ1cU2ec4a2PwinO7wNr6I3YXz6wGHhSuORpvk';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjanpmcXZvbXd0dXl6bm5seGhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NzA1NTUsImV4cCI6MjA4NTQ0NjU1NX0.sH5IPQ97DxvuSRATjtmnY9uw0ie76zNxRHDuIJzATNg';

async function debugCouponCartFlow() {
  console.log('🔍 Debugging Complete Coupon Cart Flow...\n');

  try {
    // 1. Test database access with service role
    console.log('1. Testing database access with service role...');
    const serviceSupabase = createClient(supabaseUrl, serviceKey);
    
    const { data: serviceCoupons, error: serviceError } = await serviceSupabase
      .from('coupons')
      .select('*')
      .eq('code', 'TEST')
      .eq('is_active', true)
      .single();

    if (serviceError) {
      console.error('❌ Service role access failed:', serviceError.message);
    } else {
      console.log('✅ Service role can access coupon:', serviceCoupons.code);
    }

    // 2. Test database access with anon key (like the API uses)
    console.log('\n2. Testing database access with anon key (API simulation)...');
    const anonSupabase = createClient(supabaseUrl, anonKey);
    
    const { data: anonCoupons, error: anonError } = await anonSupabase
      .from('coupons')
      .select('*')
      .eq('code', 'TEST')
      .eq('is_active', true)
      .single();

    if (anonError) {
      console.error('❌ Anon key access failed:', anonError.message);
      console.log('   This is likely the issue - RLS is blocking the validation API');
    } else {
      console.log('✅ Anon key can access coupon:', anonCoupons.code);
    }

    // 3. Test the validation API directly
    console.log('\n3. Testing validation API...');
    
    try {
      const response = await fetch('http://localhost:3000/api/validate-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: 'TEST' }),
      });

      console.log(`   API Status: ${response.status}`);
      
      const result = await response.json();
      console.log('   API Response:', result);
      
      if (result.valid) {
        console.log(`   ✅ API validation successful: ${result.discount}% off`);
      } else {
        console.log(`   ❌ API validation failed: ${result.message}`);
      }
      
    } catch (fetchError) {
      console.log(`   ⚠️  API call failed: ${fetchError.message}`);
    }

    // 4. Test cart discount calculation
    console.log('\n4. Testing cart discount calculation...');
    
    // Simulate cart items
    const cartItems = [
      { price: 44.99, quantity: 1 }, // Arc Raiders
      { price: 39996.00, quantity: 4 }, // Fortnite Aimbot 30 Days
      { price: 5998.00, quantity: 2 }, // Fortnite Aimbot 7 Days
    ];
    
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    console.log(`   Subtotal: $${subtotal.toFixed(2)}`);
    
    // Apply 25% discount
    const discount = subtotal * 0.25;
    const total = subtotal - discount;
    
    console.log(`   25% Discount: -$${discount.toFixed(2)}`);
    console.log(`   Final Total: $${total.toFixed(2)}`);

    // 5. Summary
    console.log('\n📋 DIAGNOSIS:');
    console.log(`   Service role access: ${serviceError ? '❌' : '✅'}`);
    console.log(`   Anon key access: ${anonError ? '❌' : '✅'}`);
    console.log(`   API validation: Testing above`);
    
    if (anonError) {
      console.log('\n🔧 LIKELY ISSUE: RLS Policy');
      console.log('   The validation API uses server-side client which may be blocked by RLS');
      console.log('   Need to run the RLS fix SQL script');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugCouponCartFlow();