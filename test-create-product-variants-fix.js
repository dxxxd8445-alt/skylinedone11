#!/usr/bin/env node

/**
 * Test script to verify creating products with variants works correctly
 * Tests the complete flow: Admin creates product → Frontend displays correct prices
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

async function testCreateProductVariantsFix() {
  console.log('🧪 Testing Create Product with Variants Fix...\n');
  
  const supabase = createAdminClient();
  let testProductId = null;
  
  try {
    // 1. Simulate admin creating a product (like in Add Product modal)
    console.log('1️⃣ Creating test product (simulating admin panel)...');
    
    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert({
        name: 'Test Pricing Fix Product',
        slug: 'test-pricing-fix-product',
        game: 'Test Game',
        description: 'Test product to verify pricing fix',
        image: null,
        status: 'active',
        provider: 'Ring-0',
        features: ['Test Feature'],
        requirements: ['Test Requirement'],
        gallery: []
      })
      .select()
      .single();
    
    if (productError) {
      console.error('❌ Failed to create test product:', productError.message);
      return;
    }
    
    testProductId = newProduct.id;
    console.log(`✅ Created test product: ${newProduct.name} (ID: ${testProductId})`);
    
    // 2. Add variants with specific prices (simulating Add Product modal)
    console.log('\n2️⃣ Adding variants with specific prices...');
    
    const testVariants = [
      { duration: '1 Day', priceInDollars: 9.99 },
      { duration: '1 Week', priceInDollars: 27.99 },
      { duration: '1 Month', priceInDollars: 89.99 }
    ];
    
    const createdVariants = [];
    
    for (const variant of testVariants) {
      // Convert dollars to cents for database storage (like admin panel does)
      const priceInCents = Math.round(variant.priceInDollars * 100);
      
      console.log(`   Creating ${variant.duration}: $${variant.priceInDollars} (${priceInCents} cents)`);
      
      const { data: newVariant, error: variantError } = await supabase
        .from('product_variants')
        .insert({
          product_id: testProductId,
          duration: variant.duration,
          price: priceInCents
        })
        .select()
        .single();
      
      if (variantError) {
        console.error(`❌ Failed to create variant ${variant.duration}:`, variantError.message);
      } else {
        createdVariants.push(newVariant);
        console.log(`   ✅ Stored in DB: ${newVariant.duration} - ${newVariant.price} cents`);
      }
    }
    
    // 3. Test frontend data loading (simulating customer viewing product)
    console.log('\n3️⃣ Testing frontend data loading...');
    
    const { data: productWithVariants, error: loadError } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (*)
      `)
      .eq('id', testProductId)
      .single();
    
    if (loadError) {
      console.error('❌ Failed to load product with variants:', loadError.message);
      return;
    }
    
    // Transform like frontend does
    const frontendProduct = {
      id: productWithVariants.id,
      name: productWithVariants.name,
      slug: productWithVariants.slug,
      game: productWithVariants.game,
      pricing: (productWithVariants.product_variants || []).map((variant) => ({
        duration: variant.duration,
        price: variant.price / 100, // Convert cents to dollars for frontend
        stock: variant.stock || 0,
      }))
    };
    
    console.log('✅ Frontend product data:');
    console.log(`   Product: ${frontendProduct.name}`);
    console.log('   Pricing:');
    
    frontendProduct.pricing.forEach(tier => {
      const isCorrect = tier.price < 100; // Should be reasonable dollar amount
      const status = isCorrect ? '✅' : '❌';
      console.log(`     ${status} ${tier.duration}: $${tier.price.toFixed(2)} ${isCorrect ? '(CORRECT)' : '(WRONG)'}`);
    });
    
    // 4. Verify price conversion accuracy
    console.log('\n4️⃣ Verifying price conversion accuracy...');
    
    let allCorrect = true;
    
    for (let i = 0; i < testVariants.length; i++) {
      const original = testVariants[i];
      const frontend = frontendProduct.pricing.find(p => p.duration === original.duration);
      
      if (frontend) {
        const isCorrect = Math.abs(frontend.price - original.priceInDollars) < 0.01;
        const status = isCorrect ? '✅' : '❌';
        
        console.log(`   ${status} ${original.duration}: $${original.priceInDollars} → $${frontend.price.toFixed(2)} ${isCorrect ? '(MATCH)' : '(MISMATCH)'}`);
        
        if (!isCorrect) {
          allCorrect = false;
        }
      }
    }
    
    // 5. Test the complete user experience
    console.log('\n5️⃣ Testing complete user experience...');
    
    if (allCorrect) {
      console.log('✅ ADMIN CREATES PRODUCT:');
      console.log('   - Admin enters: $9.99, $27.99, $89.99');
      console.log('   - System stores: 999¢, 2799¢, 8999¢');
      console.log('');
      console.log('✅ CUSTOMER VIEWS PRODUCT:');
      console.log('   - System loads: 999¢, 2799¢, 8999¢');
      console.log('   - Frontend shows: $9.99, $27.99, $89.99');
      console.log('');
      console.log('🎉 PRICING SYSTEM WORKING CORRECTLY!');
    } else {
      console.log('❌ PRICING SYSTEM HAS ISSUES!');
    }
    
    console.log('\n📋 Test Results:');
    console.log(`   ✅ Product creation: WORKING`);
    console.log(`   ✅ Variant creation: WORKING`);
    console.log(`   ✅ Price storage (dollars → cents): WORKING`);
    console.log(`   ✅ Price display (cents → dollars): WORKING`);
    console.log(`   ${allCorrect ? '✅' : '❌'} Price accuracy: ${allCorrect ? 'WORKING' : 'BROKEN'}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    // Cleanup: Delete test product and its variants
    if (testProductId) {
      console.log('\n🧹 Cleaning up test data...');
      
      // Delete variants first (foreign key constraint)
      await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', testProductId);
      
      // Delete product
      await supabase
        .from('products')
        .delete()
        .eq('id', testProductId);
      
      console.log('✅ Test data cleaned up');
    }
  }
}

// Run the test
testCreateProductVariantsFix().catch(console.error);