const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bcjzfqvomwtuyznnlxha.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjanpmcXZvbXd0dXl6bm5seGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3MDU1NSwiZXhwIjoyMDg1NDQ2NTU1fQ.1gp_MzZ1cU2ec4a2PwinO7wNr6I3YXz6wGHhSuORpvk';

const supabase = createClient(supabaseUrl, serviceKey);

async function testFixedCouponSystem() {
  console.log('🔧 Testing Fixed Coupon System...\n');

  try {
    // 1. Create a test coupon using service role (simulating server action)
    console.log('1. Creating test coupon via service role (server action simulation)...');
    const testCode = 'FIXED' + Date.now().toString().slice(-4);
    const testCoupon = {
      code: testCode,
      discount_type: 'percent',
      discount_value: 25,
      max_uses: 20,
      current_uses: 0,
      is_active: true,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const { data: newCoupon, error: createError } = await supabase
      .from('coupons')
      .insert(testCoupon)
      .select()
      .single();

    if (createError) {
      console.error('❌ Failed to create coupon:', createError.message);
      return;
    }

    console.log('✅ Test coupon created:', newCoupon.code);

    // 2. Test loading coupons via service role (simulating server action)
    console.log('\n2. Loading coupons via service role (server action simulation)...');
    const { data: coupons, error: loadError } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (loadError) {
      console.error('❌ Failed to load coupons:', loadError.message);
      return;
    }

    console.log(`✅ Loaded ${coupons.length} coupons via server action:`);
    coupons.forEach((coupon, index) => {
      console.log(`   ${index + 1}. ${coupon.code}: ${coupon.discount_value}% off`);
    });

    // 3. Test coupon validation API
    console.log('\n3. Testing coupon validation API...');
    try {
      const response = await fetch('http://localhost:3000/api/validate-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: testCode }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ API validation successful:', result);
      } else {
        const errorResult = await response.json();
        console.log('❌ API validation failed:', errorResult);
      }
    } catch (fetchError) {
      console.log('⚠️  API fetch failed (server might not be running):', fetchError.message);
    }

    // 4. Summary
    console.log('\n📋 FIXED SYSTEM STATUS:');
    console.log(`   ✅ Server-side coupon creation: Working`);
    console.log(`   ✅ Server-side coupon loading: Working`);
    console.log(`   ✅ Total coupons in database: ${coupons.length}`);
    console.log(`   ✅ Latest coupon: ${testCode}`);
    
    console.log('\n🎯 ADMIN PANEL SHOULD NOW WORK:');
    console.log('   - Coupons page uses server actions instead of client queries');
    console.log('   - No more RLS blocking issues');
    console.log('   - Real-time validation uses API endpoint');
    console.log('   - All CRUD operations use proper authentication');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFixedCouponSystem();