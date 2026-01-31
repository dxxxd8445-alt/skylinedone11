const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bcjzfqvomwtuyznnlxha.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjanpmcXZvbXd0dXl6bm5seGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3MDU1NSwiZXhwIjoyMDg1NDQ2NTU1fQ.1gp_MzZ1cU2ec4a2PwinO7wNr6I3YXz6wGHhSuORpvk';

const supabase = createClient(supabaseUrl, serviceKey);

async function createTestCoupon() {
  console.log('🎯 Creating Test Coupon for Cart Testing...\n');

  try {
    // Create a simple test coupon
    const testCoupon = {
      code: 'TEST',
      discount_type: 'percent',
      discount_value: 25, // 25% off
      max_uses: 100,
      current_uses: 0,
      is_active: true,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    };

    console.log('Creating coupon:', testCoupon);

    const { data: newCoupon, error: createError } = await supabase
      .from('coupons')
      .upsert(testCoupon, { onConflict: 'code' }) // Use upsert to avoid duplicates
      .select()
      .single();

    if (createError) {
      console.error('❌ Failed to create coupon:', createError.message);
      return;
    }

    console.log('✅ Test coupon created/updated:', newCoupon);

    // Verify it can be found
    console.log('\nVerifying coupon can be found...');
    const { data: foundCoupon, error: findError } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', 'TEST')
      .eq('is_active', true)
      .single();

    if (findError) {
      console.error('❌ Failed to find coupon:', findError.message);
      return;
    }

    console.log('✅ Coupon found:', foundCoupon);
    console.log(`   Code: ${foundCoupon.code}`);
    console.log(`   Discount: ${foundCoupon.discount_value}% off`);
    console.log(`   Active: ${foundCoupon.is_active}`);
    console.log(`   Expires: ${foundCoupon.expires_at ? new Date(foundCoupon.expires_at).toLocaleDateString() : 'Never'}`);

    console.log('\n🎉 Test coupon is ready for cart testing!');
    console.log('   You can now use code "TEST" in the cart for 25% off');

  } catch (error) {
    console.error('❌ Failed to create test coupon:', error.message);
  }
}

createTestCoupon();