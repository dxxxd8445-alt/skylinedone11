console.log('🔧 Fixing Complete Variants System...\n');

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bcjzfqvomwtuyznnlxha.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjanpmcXZvbXd0dXl6bm5seGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3MDU1NSwiZXhwIjoyMDg1NDQ2NTU1fQ.1gp_MzZ1cU2ec4a2PwinO7wNr6I3YXz6wGHhSuORpvk'
);

async function fixVariantsSystem() {
  console.log('🔍 Analyzing current variants...');
  
  // Get all variants
  const { data: variants, error } = await supabase
    .from('product_variants')
    .select('*');
    
  if (error) {
    console.log('❌ Error fetching variants:', error.message);
    return;
  }
  
  console.log('📋 Found', variants.length, 'variants');
  
  // Check for price issues
  let needsFix = false;
  variants.forEach(v => {
    const dollarPrice = v.price / 100;
    console.log('  -', v.duration + ':', '$' + dollarPrice.toFixed(2), '(raw:', v.price + ')');
    
    // Check if price seems wrong (too high)
    if (v.price > 100000) { // More than $1000
      needsFix = true;
      console.log('    ⚠️  Price seems too high!');
    }
  });
  
  if (needsFix) {
    console.log('🔧 Fixing high prices...');
    
    for (const variant of variants) {
      if (variant.price > 100000) {
        // Assume it was stored as dollars instead of cents
        const correctedPrice = Math.round(variant.price / 100);
        console.log('  Fixing', variant.duration, 'from', variant.price, 'to', correctedPrice);
        
        await supabase
          .from('product_variants')
          .update({ price: correctedPrice })
          .eq('id', variant.id);
      }
    }
  }
  
  // Test variant operations
  console.log('🧪 Testing variant operations...');
  
  // Get a product to test with
  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .limit(1);
    
  if (products && products.length > 0) {
    const productId = products[0].id;
    console.log('📦 Testing with product:', products[0].name);
    
    // Test creating a variant
    const { data: newVariant, error: createError } = await supabase
      .from('product_variants')
      .insert({
        product_id: productId,
        duration: 'Test Duration',
        price: 1999 // $19.99 in cents
      })
      .select()
      .single();
      
    if (createError) {
      console.log('❌ Create variant error:', createError.message);
    } else {
      console.log('✅ Created test variant:', newVariant.duration, '$' + (newVariant.price/100).toFixed(2));
      
      // Test updating the variant
      const { error: updateError } = await supabase
        .from('product_variants')
        .update({
          duration: 'Updated Test Duration',
          price: 2999 // $29.99 in cents
        })
        .eq('id', newVariant.id);
        
      if (updateError) {
        console.log('❌ Update variant error:', updateError.message);
      } else {
        console.log('✅ Updated test variant successfully');
      }
      
      // Clean up test variant
      await supabase
        .from('product_variants')
        .delete()
        .eq('id', newVariant.id);
      console.log('🧹 Cleaned up test variant');
    }
  }
  
  console.log('✅ Variants system analysis complete!');
}

fixVariantsSystem().catch(console.error);