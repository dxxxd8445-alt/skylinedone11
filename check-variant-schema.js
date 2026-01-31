const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bcjzfqvomwtuyznnlxha.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjanpmcXZvbXd0dXl6bm5seGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3MDU1NSwiZXhwIjoyMDg1NDQ2NTU1fQ.1gp_MzZ1cU2ec4a2PwinO7wNr6I3YXz6wGHhSuORpvk';

const supabase = createClient(supabaseUrl, serviceKey);

async function checkVariantSchema() {
  console.log('🔍 Checking Product Variants Schema...\n');

  try {
    // Try to get one record to see the structure
    console.log('1. Checking existing variants...');
    const { data: existingVariants, error: existingError } = await supabase
      .from('product_variants')
      .select('*')
      .limit(5);

    if (existingError) {
      console.error('❌ Error loading variants:', existingError.message);
    } else {
      console.log(`✅ Found ${existingVariants.length} existing variants`);
      if (existingVariants.length > 0) {
        console.log('   Sample variant structure:');
        console.log('  ', JSON.stringify(existingVariants[0], null, 2));
      }
    }

    // Try creating with integer price (cents)
    console.log('\n2. Testing variant creation with integer price (cents)...');
    const testVariantCents = {
      product_id: 'test-id-123', // This will fail but show us the error
      duration: '1 Day',
      price: 999, // 9.99 in cents
    };

    const { data: newVariant, error: createError } = await supabase
      .from('product_variants')
      .insert(testVariantCents)
      .select()
      .single();

    if (createError) {
      console.log('❌ Expected error (invalid product_id):', createError.message);
      console.log('   This tells us about the schema requirements');
    } else {
      console.log('✅ Variant created:', newVariant);
    }

    // Get a real product ID for testing
    console.log('\n3. Getting real product for testing...');
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name')
      .limit(1);

    if (productError || !products || products.length === 0) {
      console.error('❌ No products found for testing');
      return;
    }

    const testProduct = products[0];
    console.log(`✅ Using product: ${testProduct.name} (${testProduct.id})`);

    // Try creating with real product ID and integer price
    console.log('\n4. Testing variant creation with real product...');
    const realVariant = {
      product_id: testProduct.id,
      duration: 'Test Duration',
      price: 1999, // $19.99 in cents
    };

    const { data: realNewVariant, error: realCreateError } = await supabase
      .from('product_variants')
      .insert(realVariant)
      .select()
      .single();

    if (realCreateError) {
      console.error('❌ Failed to create real variant:', realCreateError.message);
      console.log('   This shows us the actual schema requirements');
    } else {
      console.log('✅ Real variant created:', realNewVariant);
      
      // Clean up - delete the test variant
      await supabase
        .from('product_variants')
        .delete()
        .eq('id', realNewVariant.id);
      console.log('   (Test variant cleaned up)');
    }

    console.log('\n📋 SCHEMA ANALYSIS:');
    console.log('   The price field appears to expect integers (cents)');
    console.log('   We need to convert decimal prices to cents before storing');
    console.log('   Example: $9.99 should be stored as 999 cents');

  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
  }
}

checkVariantSchema();