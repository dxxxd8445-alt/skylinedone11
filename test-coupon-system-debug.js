const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bcjzfqvomwtuyznnlxha.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjanpmcXZvbXd0dXl6bm5seGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3MDU1NSwiZXhwIjoyMDg1NDQ2NTU1fQ.1gp_MzZ1cU2ec4a2PwinO7wNr6I3YXz6wGHhSuORpvk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCouponSystem() {
  console.log('🧪 Testing Coupon System...\n');

  try {
    // 1. Test loading existing coupons
    console.log('1. Loading existing coupons...');
    const { data: existingCoupons, error: loadError } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (loadError) {
      console.error('❌ Failed to load coupons:', loadError.message);
      return;
    }

    console.log(`✅ Found ${existingCoupons.length} existing coupons`);
    existingCoupons.forEach(coupon => {
      console.log(`   - ${coupon.code}: ${coupon.discount_value}% off (Active: ${coupon.is_active})`);
    });

    // 2. Test creating a new coupon
    console.log('\n2. Creating test coupon...');
    const testCode = 'DEBUG' + Date.now().toString().slice(-4);
    const testCoupon = {
      code: testCode,
      discount_type: 'percent',
      discount_value: 15,
      max_uses: 50,
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

    // 3. Verify the coupon appears in the list
    console.log('\n3. Verifying coupon appears in list...');
    const { data: updatedCoupons, error: verifyError } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (verifyError) {
      console.error('❌ Failed to verify coupons:', verifyError.message);
      return;
    }

    const foundCoupon = updatedCoupons.find(c => c.code === testCode);
    if (foundCoupon) {
      console.log('✅ Test coupon found in list!');
      console.log(`   Code: ${foundCoupon.code}`);
      console.log(`   Discount: ${foundCoupon.discount_value}%`);
      console.log(`   Max Uses: ${foundCoupon.max_uses}`);
      console.log(`   Active: ${foundCoupon.is_active}`);
    } else {
      console.log('❌ Test coupon NOT found in list');
    }

    console.log(`\n📊 Total coupons now: ${updatedCoupons.length}`);
    console.log('\n🎉 Coupon system test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testCouponSystem();