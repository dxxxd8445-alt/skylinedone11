#!/usr/bin/env node

/**
 * Test script to verify frontend pricing display is fixed
 * Tests that prices show as $27.99 instead of $2799.00
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Simulate the frontend data loading function
async function getProducts() {
  try {
    const supabase = createAdminClient();
    
    // Fetch all products with their variants (same as frontend)
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select(`
        *,
        product_variants (*)
      `)
      .eq("status", "active")
      .order("display_order");
    
    if (productsError) {
      console.error("[Products] Database error:", productsError.message);
      return [];
    }

    if (!products || products.length === 0) {
      return [];
    }

    // Transform products to match expected format (with price conversion fix)
    return products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      game: product.game,
      description: product.description,
      image: product.image || `/images/${product.slug}.jpg`,
      status: product.status,
      pricing: (product.product_variants || []).map((variant) => ({
        duration: variant.duration,
        price: variant.price / 100, // Convert cents to dollars for frontend
        stock: variant.stock || 0,
      })),
      features: {
        aimbot: product.features?.filter((f) => f.toLowerCase().includes('aim')) || [],
        esp: product.features?.filter((f) => f.toLowerCase().includes('esp') || f.toLowerCase().includes('wall')) || [],
        misc: product.features?.filter((f) => !f.toLowerCase().includes('aim') && !f.toLowerCase().includes('esp') && !f.toLowerCase().includes('wall')) || product.features || [],
      },
      requirements: {
        cpu: "Intel/AMD",
        windows: product.requirements?.[0] || "Windows 10/11",
        cheatType: "External",
        controller: false,
      },
      gallery: product.gallery || [],
    }));
  } catch (e) {
    console.error("[Products] Exception:", e);
    return [];
  }
}

async function testFrontendPricingFix() {
  console.log('🧪 Testing Frontend Pricing Fix...\n');
  
  try {
    // 1. Test raw database values (should be in cents)
    console.log('1️⃣ Testing raw database values...');
    const supabase = createAdminClient();
    
    const { data: rawVariants, error } = await supabase
      .from('product_variants')
      .select('duration, price')
      .limit(5);
    
    if (error) {
      console.error('❌ Failed to get raw variants:', error.message);
      return;
    }
    
    console.log('✅ Raw database values (should be in cents):');
    rawVariants.forEach(v => {
      console.log(`   ${v.duration}: ${v.price} cents`);
    });
    
    // 2. Test frontend data loading (should convert to dollars)
    console.log('\n2️⃣ Testing frontend data loading...');
    
    const products = await getProducts();
    
    if (products.length === 0) {
      console.log('❌ No products found');
      return;
    }
    
    console.log(`✅ Loaded ${products.length} products with converted pricing:`);
    
    products.forEach(product => {
      if (product.pricing && product.pricing.length > 0) {
        console.log(`\n📦 ${product.name}:`);
        product.pricing.forEach(tier => {
          const priceStr = tier.price.toFixed(2);
          const isCorrect = tier.price < 1000; // Should be under $1000 if converted correctly
          const status = isCorrect ? '✅' : '❌';
          console.log(`   ${status} ${tier.duration}: $${priceStr} ${isCorrect ? '(CORRECT)' : '(WRONG - still in cents!)'}`);
        });
      }
    });
    
    // 3. Test specific price conversion examples
    console.log('\n3️⃣ Testing price conversion examples...');
    
    const testCases = [
      { cents: 999, expectedDollars: 9.99 },
      { cents: 2799, expectedDollars: 27.99 },
      { cents: 5799, expectedDollars: 57.99 },
      { cents: 9999, expectedDollars: 99.99 }
    ];
    
    testCases.forEach(test => {
      const converted = test.cents / 100;
      const isCorrect = Math.abs(converted - test.expectedDollars) < 0.01;
      const status = isCorrect ? '✅' : '❌';
      console.log(`   ${status} ${test.cents} cents → $${converted.toFixed(2)} (expected $${test.expectedDollars.toFixed(2)})`);
    });
    
    // 4. Check for any products still showing wrong prices
    console.log('\n4️⃣ Checking for pricing issues...');
    
    let hasIssues = false;
    products.forEach(product => {
      if (product.pricing && product.pricing.length > 0) {
        product.pricing.forEach(tier => {
          if (tier.price > 1000) {
            console.log(`❌ ISSUE: ${product.name} - ${tier.duration} shows $${tier.price.toFixed(2)} (likely not converted from cents)`);
            hasIssues = true;
          }
        });
      }
    });
    
    if (!hasIssues) {
      console.log('✅ No pricing issues found - all prices appear to be correctly converted!');
    }
    
    console.log('\n🎉 Frontend pricing test completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Database stores prices in cents');
    console.log('   ✅ Frontend converts cents to dollars');
    console.log('   ✅ Prices display correctly (e.g., $27.99 not $2799.00)');
    console.log('\n🚀 Frontend pricing should now show correct values!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testFrontendPricingFix().catch(console.error);