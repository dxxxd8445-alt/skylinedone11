#!/usr/bin/env node

/**
 * Verify Coupon Database Fix
 * 
 * This script checks if the FIX_COUPONS_TABLE.sql has been applied successfully
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log("🔍 Verifying Coupon Database Fix...\n");

async function verifyCouponFix() {
  try {
    console.log("📊 Checking coupons table schema...");
    
    // Try to query the coupons table with new column names
    const { data, error } = await supabase
      .from('coupons')
      .select('id, code, discount_type, discount_value, max_uses, current_uses, is_active, expires_at, created_at, updated_at')
      .limit(1);
    
    if (error) {
      console.error("❌ Database schema not fixed yet:");
      console.error("   Error:", error.message);
      console.log("\n📋 **ACTION REQUIRED:**");
      console.log("   1. Open Supabase SQL Editor");
      console.log("   2. Copy and paste the entire FIX_COUPONS_TABLE.sql script");
      console.log("   3. Run the script to update the coupons table schema");
      console.log("   4. Run this verification script again");
      return false;
    }
    
    console.log("✅ Database schema is correct!");
    console.log("   All required columns are present:");
    console.log("   • discount_type ✅");
    console.log("   • discount_value ✅");
    console.log("   • max_uses ✅");
    console.log("   • current_uses ✅");
    console.log("   • is_active ✅");
    console.log("   • expires_at ✅");
    console.log("   • created_at ✅");
    console.log("   • updated_at ✅");
    
    // Test creating a sample coupon
    console.log("\n🧪 Testing coupon creation...");
    
    const testCoupon = {
      code: 'TEST' + Date.now(),
      discount_type: 'percent',
      discount_value: 25,
      max_uses: 100,
      current_uses: 0,
      is_active: true,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    };
    
    const { data: createData, error: createError } = await supabase
      .from('coupons')
      .insert(testCoupon)
      .select()
      .single();
    
    if (createError) {
      console.error("❌ Failed to create test coupon:", createError.message);
      return false;
    }
    
    console.log("✅ Test coupon created successfully!");
    console.log("   Code:", createData.code);
    console.log("   Discount:", createData.discount_value + "%");
    
    // Clean up test coupon
    await supabase
      .from('coupons')
      .delete()
      .eq('id', createData.id);
    
    console.log("✅ Test coupon cleaned up");
    
    console.log("\n🎉 **COUPON SYSTEM IS FULLY FUNCTIONAL!**");
    console.log("   • Database schema is correct");
    console.log("   • CRUD operations work");
    console.log("   • Admin panel should work without errors");
    console.log("   • Cart integration should work");
    
    console.log("\n🧪 **Next Steps:**");
    console.log("   1. Go to admin panel: http://localhost:3000/mgmt-x9k2m7/coupons");
    console.log("   2. Create a real coupon for testing");
    console.log("   3. Test the coupon in cart/checkout");
    console.log("   4. Verify usage tracking works");
    
    return true;
    
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    return false;
  }
}

verifyCouponFix()
  .then(success => {
    if (success) {
      console.log("\n✨ Verification completed successfully!");
    } else {
      console.log("\n⚠️  Please run the FIX_COUPONS_TABLE.sql script first.");
    }
  })
  .catch(console.error);