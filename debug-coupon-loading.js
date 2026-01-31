const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bcjzfqvomwtuyznnlxha.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjanpmcXZvbXd0dXl6bm5seGhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NzA1NTUsImV4cCI6MjA4NTQ0NjU1NX0.sH5IPQ97DxvuSRATjtmnY9uw0ie76zNxRHDuIJzATNg';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjanpmcXZvbXd0dXl6bm5seGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3MDU1NSwiZXhwIjoyMDg1NDQ2NTU1fQ.1gp_MzZ1cU2ec4a2PwinO7wNr6I3YXz6wGHhSuORpvk';

async function debugCouponLoading() {
  console.log('🔍 Debugging Coupon Loading Issue...\n');

  try {
    // Test with service role (admin)
    console.log('1. Testing with service role key...');
    const adminSupabase = createClient(supabaseUrl, serviceKey);
    
    const { data: adminData, error: adminError } = await adminSupabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    console.log('Service role result:', { data: adminData, error: adminError });

    // Test with anon key (client)
    console.log('\n2. Testing with anon key (client simulation)...');
    const clientSupabase = createClient(supabaseUrl, anonKey);
    
    const { data: clientData, error: clientError } = await clientSupabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    console.log('Client role result:', { data: clientData, error: clientError });

    // Create a test coupon to verify the issue
    console.log('\n3. Creating test coupon...');
    const testCoupon = {
      code: 'TEST' + Date.now().toString().slice(-4),
      discount_type: 'percent',
      discount_value: 15,
      max_uses: 10,
      current_uses: 0,
      is_active: true,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const { data: newCoupon, error: createError } = await adminSupabase
      .from('coupons')
      .insert(testCoupon)
      .select()
      .single();

    if (createError) {
      console.error('❌ Failed to create test coupon:', createError.message);
    } else {
      console.log('✅ Test coupon created:', newCoupon.code);

      // Test loading again with both keys
      console.log('\n4. Testing loading after creation...');
      
      const { data: adminAfter, error: adminAfterError } = await adminSupabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      console.log('Admin after creation:', { count: adminAfter?.length, error: adminAfterError });

      const { data: clientAfter, error: clientAfterError } = await clientSupabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      console.log('Client after creation:', { count: clientAfter?.length, error: clientAfterError });
    }

    // Check RLS policies
    console.log('\n5. Checking RLS policies...');
    const { data: policies, error: policyError } = await adminSupabase
      .rpc('get_policies', { table_name: 'coupons' })
      .catch(() => ({ data: null, error: { message: 'RPC not available' } }));

    if (policyError) {
      console.log('Policy check failed (expected):', policyError.message);
    } else {
      console.log('Policies:', policies);
    }

    console.log('\n📋 DIAGNOSIS:');
    console.log(`   Service role access: ${adminError ? '❌' : '✅'}`);
    console.log(`   Client role access: ${clientError ? '❌' : '✅'}`);
    console.log(`   Coupon creation: ${createError ? '❌' : '✅'}`);
    
    if (clientError) {
      console.log('\n🔧 LIKELY ISSUE: RLS (Row Level Security) is blocking client access');
      console.log('   The admin panel uses client-side queries which need proper RLS policies');
      console.log('   or the queries need to use the service role key');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugCouponLoading();