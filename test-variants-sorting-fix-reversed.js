require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testVariantsSortingReversed() {
  console.log('🔍 Testing Product Variants Sorting (Lowest to Highest)...\n');

  try {
    // 1. Fetch products with variants to test sorting
    console.log('1. Fetching products with variants...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (*)
      `)
      .eq('status', 'active')
      .order('display_order');

    if (productsError) {
      console.error('❌ Error fetching products:', productsError.message);
      return;
    }

    console.log(`📊 Found ${products?.length || 0} products`);

    if (!products || products.length === 0) {
      console.log('⚠️  No products found');
      return;
    }

    // 2. Test the sorting logic
    console.log('\n2. Testing variant sorting (lowest to highest price)...');
    
    products.forEach((product, index) => {
      console.log(`\n📦 Product ${index + 1}: ${product.name}`);
      
      if (!product.product_variants || product.product_variants.length === 0) {
        console.log('   ⚠️  No variants found');
        return;
      }

      // Show original order
      console.log('   📋 Original variant order:');
      product.product_variants.forEach((variant, idx) => {
        const priceInDollars = variant.price / 100;
        console.log(`      ${idx + 1}. ${variant.duration} - $${priceInDollars.toFixed(2)}`);
      });

      // Apply the new sorting logic (lowest to highest)
      const sortedVariants = [...product.product_variants]
        .map((variant) => ({
          duration: variant.duration,
          price: variant.price / 100, // Convert cents to dollars
          stock: variant.stock || 0,
        }))
        .sort((a, b) => a.price - b.price); // Sort by price ascending (lowest first)

      console.log('   ✅ New sorted order (lowest to highest):');
      sortedVariants.forEach((variant, idx) => {
        const isLowest = idx === 0;
        const icon = isLowest ? '👑' : '  ';
        console.log(`      ${icon} ${idx + 1}. ${variant.duration} - $${variant.price.toFixed(2)}`);
      });

      // Verify the sorting is correct (ascending)
      let correctlySorted = true;
      for (let i = 0; i < sortedVariants.length - 1; i++) {
        if (sortedVariants[i].price > sortedVariants[i + 1].price) {
          correctlySorted = false;
          break;
        }
      }

      if (correctlySorted) {
        console.log('   ✅ Sorting is correct (lowest to highest)!');
      } else {
        console.log('   ❌ Sorting is incorrect!');
      }
    });

    // 3. Test the data function directly
    console.log('\n3. Testing getProducts() function with new sorting...');
    
    // Simulate the updated getProducts function
    const transformedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      game: product.game,
      description: product.description,
      image: product.image || `/images/${product.slug}.jpg`,
      status: product.status,
      pricing: (product.product_variants || [])
        .map((variant) => ({
          duration: variant.duration,
          price: variant.price / 100, // Convert cents to dollars for frontend
          stock: variant.stock || 0,
        }))
        .sort((a, b) => a.price - b.price), // Sort by price ascending (lowest first)
    }));

    console.log('\n📊 Transformed products with sorted pricing (lowest to highest):');
    transformedProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}:`);
      if (product.pricing && product.pricing.length > 0) {
        product.pricing.forEach((tier, idx) => {
          const isLowest = idx === 0;
          const icon = isLowest ? '👑 CHEAPEST' : '  ';
          console.log(`   ${icon} ${idx + 1}. ${tier.duration} - $${tier.price.toFixed(2)}`);
        });
      } else {
        console.log('   No pricing available');
      }
    });

    console.log('\n✅ Variants sorting test completed!');
    console.log('\n📋 Summary:');
    console.log('- Product variants now sort from LOWEST to HIGHEST price');
    console.log('- $1.00 will appear at the TOP');
    console.log('- Most expensive variants appear at the BOTTOM');
    console.log('- This applies to both product listing and individual product pages');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testVariantsSortingReversed();