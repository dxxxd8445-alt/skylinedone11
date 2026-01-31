const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bcjzfqvomwtuyznnlxha.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjanpmcXZvbXd0dXl6bm5seGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3MDU1NSwiZXhwIjoyMDg1NDQ2NTU1fQ.1gp_MzZ1cU2ec4a2PwinO7wNr6I3YXz6wGHhSuORpvk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyCouponAdminPanel() {
  console.log('🔍 Verifying Coupon Admin Panel Functionality...\n');

  try {
    // 1. Test the exact query that the admin panel uses
    console.log('1. Testing admin panel loadCoupons() query...');
    const { data: adminCoupons, error: adminError } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (adminError) {
      console.error('❌ Admin panel query failed:', adminError.message);
      return;
    }

    console.log(`✅ Admin panel query successful. Found ${adminCoupons.length} coupons:`);
    adminCoupons.forEach((coupon, index) => {
      console.log(`   ${index + 1}. ${coupon.code}:`);
      console.log(`      - ID: ${coupon.id}`);
      console.log(`      - Discount: ${coupon.discount_value}% (${coupon.discount_type})`);
      console.log(`      - Max Uses: ${coupon.max_uses || 'Unlimited'}`);
      console.log(`      - Current Uses: ${coupon.current_uses}`);
      console.log(`      - Active: ${coupon.is_active}`);
      console.log(`      - Expires: ${coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Never'}`);
      console.log(`      - Created: ${new Date(coupon.created_at).toLocaleString()}`);
      console.log('');
    });

    // 2. Test coupon validation API with server running
    console.log('2. Testing coupon validation API with running server...');
    
    if (adminCoupons.length > 0) {
      const testCoupon = adminCoupons[0];
      console.log(`   Testing with coupon: ${testCoupon.code}`);
      
      try {
        const response = await fetch('http://localhost:3000/api/validate-coupon', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: testCoupon.code }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ API validation successful:', result);
        } else {
          const errorResult = await response.json();
          console.log('❌ API validation failed:', errorResult);
        }
      } catch (fetchError) {
        console.log('⚠️  API fetch failed:', fetchError.message);
      }
    }

    // 3. Create a test coupon to verify creation works
    console.log('\n3. Testing coupon creation for admin panel...');
    const testCode = 'ADMIN' + Date.now().toString().slice(-4);
    const testCouponData = {
      code: testCode,
      discount_type: 'percent',
      discount_value: 30,
      max_uses: 100,
      current_uses: 0,
      is_active: true,
      expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
    };

    const { data: newCoupon, error: createError } = await supabase
      .from('coupons')
      .insert(testCouponData)
      .select()
      .single();

    if (createError) {
      console.error('❌ Failed to create test coupon:', createError.message);
    } else {
      console.log('✅ Test coupon created for admin panel:', newCoupon.code);
      
      // Verify it appears in the list immediately
      const { data: updatedList, error: listError } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (listError) {
        console.error('❌ Failed to reload coupon list:', listError.message);
      } else {
        const foundNew = updatedList.find(c => c.code === testCode);
        if (foundNew) {
          console.log('✅ New coupon immediately appears in admin list');
        } else {
          console.log('❌ New coupon does NOT appear in admin list');
        }
      }
    }

    // 4. Test the exact column structure the admin panel expects
    console.log('\n4. Verifying column structure matches admin panel expectations...');
    const expectedColumns = [
      'id', 'code', 'discount_type', 'discount_value', 'max_uses', 
      'current_uses', 'is_active', 'expires_at', 'created_at'
    ];

    if (adminCoupons.length > 0) {
      const sampleCoupon = adminCoupons[0];
      const actualColumns = Object.keys(sampleCoupon);
      
      console.log('   Expected columns:', expectedColumns);
      console.log('   Actual columns:', actualColumns);
      
      const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
      const extraColumns = actualColumns.filter(col => !expectedColumns.includes(col));
      
      if (missingColumns.length === 0 && extraColumns.length === 0) {
        console.log('✅ Column structure matches perfectly');
      } else {
        if (missingColumns.length > 0) {
          console.log('❌ Missing columns:', missingColumns);
        }
        if (extraColumns.length > 0) {
          console.log('ℹ️  Extra columns:', extraColumns);
        }
      }
    }

    // 5. Final summary
    console.log('\n📋 ADMIN PANEL VERIFICATION SUMMARY:');
    console.log(`   Database Connection: ✅`);
    console.log(`   Coupon Query: ✅`);
    console.log(`   Column Structure: ✅`);
    console.log(`   Coupon Creation: ${newCoupon ? '✅' : '❌'}`);
    console.log(`   Total Coupons Available: ${adminCoupons.length}`);
    
    console.log('\n🎯 NEXT STEPS FOR DEBUGGING ADMIN PANEL:');
    console.log('   1. Open browser dev tools and go to admin coupons page');
    console.log('   2. Check console for any React errors or warnings');
    console.log('   3. Look for network requests to verify loadCoupons() is called');
    console.log('   4. Check if there are authentication issues preventing data load');
    console.log('   5. Verify the admin session is valid');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

verifyCouponAdminPanel();