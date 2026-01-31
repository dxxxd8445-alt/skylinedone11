const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bcjzfqvomwtuyznnlxha.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjanpmcXZvbXd0dXl6bm5seGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3MDU1NSwiZXhwIjoyMDg1NDQ2NTU1fQ.1gp_MzZ1cU2ec4a2PwinO7wNr6I3YXz6wGHhSuORpvk';

async function fixDatabaseData() {
  console.log('🔧 Fixing database data...');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Get existing products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');

    if (productsError) {
      console.error('❌ Error fetching products:', productsError.message);
      return;
    }

    console.log(`📦 Found ${products?.length || 0} products`);

    // Add product variants for existing products
    if (products && products.length > 0) {
      for (const product of products) {
        console.log(`🔧 Adding variants for ${product.name}...`);
        
        // Check if variants already exist
        const { data: existingVariants } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', product.id);

        if (existingVariants && existingVariants.length > 0) {
          console.log(`✅ ${product.name} already has ${existingVariants.length} variants`);
          continue;
        }

        // Add variants based on product type
        let variants = [];
        if (product.slug === 'hwid-spoofer') {
          variants = [
            { product_id: product.id, duration: 'Lifetime', price: 4999, stock: 100 }
          ];
        } else {
          variants = [
            { product_id: product.id, duration: '1 Day', price: 999, stock: 50 },
            { product_id: product.id, duration: '7 Days', price: 2999, stock: 30 },
            { product_id: product.id, duration: '30 Days', price: 9999, stock: 20 }
          ];
        }

        const { error: variantsError } = await supabase
          .from('product_variants')
          .insert(variants);

        if (variantsError) {
          console.error(`❌ Error adding variants for ${product.name}:`, variantsError.message);
        } else {
          console.log(`✅ Added ${variants.length} variants for ${product.name}`);
        }
      }
    }

    // Test data fetching
    console.log('🧪 Testing data fetching...');
    const { data: testProducts, error: testError } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (*)
      `)
      .eq('status', 'active');

    if (testError) {
      console.error('❌ Error testing data fetch:', testError.message);
    } else {
      console.log(`✅ Successfully fetched ${testProducts?.length || 0} products with variants`);
      testProducts?.forEach(product => {
        console.log(`  - ${product.name}: ${product.product_variants?.length || 0} variants`);
      });
    }

    console.log('🎉 Database data fixed successfully!');
    console.log('🔗 Now test your site at: http://localhost:3000');

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

fixDatabaseData();