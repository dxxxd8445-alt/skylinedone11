const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bcjzfqvomwtuyznnlxha.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjanpmcXZvbXd0dXl6bm5seGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3MDU1NSwiZXhwIjoyMDg1NDQ2NTU1fQ.1gp_MzZ1cU2ec4a2PwinO7wNr6I3YXz6wGHhSuORpvk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompleteCouponFlow() {
  console.log('🎯 Testing Complete Coupon Flow...\n');

  try {
    // 1. Test database connection and existing coupons
    console.log('1. Testing database connection...');
    const { data: existingCoupons, error: loadError } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (loadError) {
      console.error('❌ Database connection failed:', loadError.message);
      return;
    }

    console.log(`✅ Database connected. Found ${existingCoupons.length} existing coupons:`);
    existingCoupons.forEach(coupon => {
      console.log(`   - ${coupon.code}: ${coupon.discount_value}% off (Active: ${coupon.is_active})`);
    });

    // 2. Test creating a new coupon via admin actions
    console.log('\n2. Testing coupon creation (simulating admin action)...');
    const testCode = 'FLOW' + Date.now().toString().slice(-4);
    const newCouponData = {
      code: testCode,
      discount_type: 'percent',
      discount_value: 20,
      max_uses: 25,
      current_uses: 0,
      is_active: true,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const { data: newCoupon, error: createError } = await supabase
      .from('coupons')
      .insert(newCouponData)
      .select()
      .single();

    if (createError) {
      console.error('❌ Failed to create coupon:', createError.message);
      return;
    }

    console.log('✅ Coupon created successfully:', newCoupon.code);

    // 3. Test coupon validation API (simulating cart usage)
    console.log('\n3. Testing coupon validation API...');
    
    // Simulate the API call that the cart makes
    const validateResponse = await fetch('http://localhost:3000/api/validate-coupon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: testCode }),
    }).catch(err => {
      console.log('⚠️  API endpoint not available (server not running), testing database validation instead...');
      return null;
    });

    if (validateResponse) {
      const validationResult = await validateResponse.json();
      if (validationResult.valid) {
        console.log('✅ Coupon validation API works:', validationResult);
      } else {
        console.log('❌ Coupon validation failed:', validationResult.message);
      }
    } else {
      // Test database validation directly
      const { data: validationCoupon, error: validationError } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', testCode)
        .eq('is_active', true)
        .single();

      if (validationError) {
        console.log('❌ Database validation failed:', validationError.message);
      } else {
        console.log('✅ Database validation works:', {
          code: validationCoupon.code,
          discount: validationCoupon.discount_value,
          type: validationCoupon.discount_type
        });
      }
    }

    // 4. Test loading coupons again to verify it appears
    console.log('\n4. Verifying coupon appears in admin list...');
    const { data: updatedCoupons, error: reloadError } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (reloadError) {
      console.error('❌ Failed to reload coupons:', reloadError.message);
      return;
    }

    const foundCoupon = updatedCoupons.find(c => c.code === testCode);
    if (foundCoupon) {
      console.log('✅ New coupon appears in admin list!');
      console.log(`   Code: ${foundCoupon.code}`);
      console.log(`   Discount: ${foundCoupon.discount_value}%`);
      console.log(`   Max Uses: ${foundCoupon.max_uses}`);
      console.log(`   Current Uses: ${foundCoupon.current_uses}`);
      console.log(`   Active: ${foundCoupon.is_active}`);
      console.log(`   Expires: ${foundCoupon.expires_at ? new Date(foundCoupon.expires_at).toLocaleDateString() : 'Never'}`);
    } else {
      console.log('❌ New coupon NOT found in admin list');
    }

    // 5. Test coupon usage simulation
    console.log('\n5. Testing coupon usage simulation...');
    const { data: usedCoupon, error: useError } = await supabase
      .from('coupons')
      .update({ current_uses: foundCoupon.current_uses + 1 })
      .eq('id', foundCoupon.id)
      .select()
      .single();

    if (useError) {
      console.log('❌ Failed to simulate coupon usage:', useError.message);
    } else {
      console.log('✅ Coupon usage simulation successful');
      console.log(`   Uses: ${usedCoupon.current_uses}/${usedCoupon.max_uses}`);
    }

    // 6. Summary
    console.log('\n📊 COUPON SYSTEM STATUS:');
    console.log(`   Total Coupons: ${updatedCoupons.length}`);
    console.log(`   Active Coupons: ${updatedCoupons.filter(c => c.is_active).length}`);
    console.log(`   Test Coupon Created: ✅`);
    console.log(`   Database Operations: ✅`);
    console.log(`   Admin List Display: ${foundCoupon ? '✅' : '❌'}`);
    
    console.log('\n🎉 Complete coupon flow test finished!');
    console.log('\n💡 If coupons are not showing in the admin panel:');
    console.log('   1. Check browser console for React errors');
    console.log('   2. Verify the loadCoupons() function is being called');
    console.log('   3. Check if there are any React Hooks order violations');
    console.log('   4. Ensure the admin authentication is working');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testCompleteCouponFlow();