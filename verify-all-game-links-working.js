require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Fixed slug conversion function
function gameToSlug(game) {
  return game.toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[:\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function verifyAllGameLinks() {
  console.log('🎮 COMPREHENSIVE GAME LINKS VERIFICATION\n');

  try {
    // Get all products
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, game, slug, image, status')
      .order('game');

    if (error) {
      console.error('❌ Error fetching products:', error);
      return;
    }

    console.log(`📊 Total Products: ${products.length}\n`);

    // Group products by game
    const gameGroups = {};
    products.forEach(p => {
      if (!gameGroups[p.game]) gameGroups[p.game] = [];
      gameGroups[p.game].push(p);
    });

    console.log(`🎯 Total Game Categories: ${Object.keys(gameGroups).length}\n`);

    let allWorking = true;
    let categoryResults = [];

    // Test each category
    for (const [game, gameProducts] of Object.entries(gameGroups)) {
      const gameSlug = gameToSlug(game);
      const categoryUrl = `http://localhost:3000/store/${gameSlug}`;
      
      console.log(`🎮 Testing: ${game}`);
      console.log(`   Slug: ${gameSlug}`);
      console.log(`   Products: ${gameProducts.length}`);
      
      // Test category page
      let categoryWorking = false;
      try {
        const response = await fetch(categoryUrl);
        categoryWorking = response.ok;
        const status = response.ok ? '✅' : '❌';
        console.log(`   Category Page: ${status} ${response.status}`);
        
        if (!response.ok) allWorking = false;
      } catch (error) {
        console.log(`   Category Page: ❌ Connection failed`);
        allWorking = false;
      }
      
      // Test each product in this category
      let productResults = [];
      for (const product of gameProducts) {
        const productUrl = `http://localhost:3000/store/${gameSlug}/${product.slug}`;
        
        try {
          const response = await fetch(productUrl);
          const productWorking = response.ok;
          const status = response.ok ? '✅' : '❌';
          console.log(`     Product "${product.name}": ${status} ${response.status}`);
          
          productResults.push({
            name: product.name,
            slug: product.slug,
            url: productUrl,
            working: productWorking,
            status: response.status
          });
          
          if (!response.ok) allWorking = false;
        } catch (error) {
          console.log(`     Product "${product.name}": ❌ Connection failed`);
          productResults.push({
            name: product.name,
            slug: product.slug,
            url: productUrl,
            working: false,
            status: 'Connection failed'
          });
          allWorking = false;
        }
      }
      
      categoryResults.push({
        game,
        gameSlug,
        categoryUrl,
        categoryWorking,
        products: productResults
      });
      
      console.log('');
    }

    // Summary Report
    console.log('📋 VERIFICATION SUMMARY:\n');
    
    const workingCategories = categoryResults.filter(c => c.categoryWorking).length;
    const totalCategories = categoryResults.length;
    
    console.log(`Categories: ${workingCategories}/${totalCategories} working`);
    
    let totalProducts = 0;
    let workingProducts = 0;
    categoryResults.forEach(category => {
      totalProducts += category.products.length;
      workingProducts += category.products.filter(p => p.working).length;
    });
    
    console.log(`Products: ${workingProducts}/${totalProducts} working`);
    console.log(`Overall Status: ${allWorking ? '✅ ALL WORKING' : '❌ ISSUES FOUND'}\n`);

    // Detailed Issues Report
    if (!allWorking) {
      console.log('🚨 ISSUES FOUND:\n');
      
      categoryResults.forEach(category => {
        if (!category.categoryWorking) {
          console.log(`❌ Category "${category.game}" not working`);
          console.log(`   URL: ${category.categoryUrl}`);
        }
        
        const brokenProducts = category.products.filter(p => !p.working);
        if (brokenProducts.length > 0) {
          console.log(`❌ ${brokenProducts.length} broken products in "${category.game}":`);
          brokenProducts.forEach(p => {
            console.log(`   - ${p.name}: ${p.status}`);
            console.log(`     URL: ${p.url}`);
          });
        }
      });
    } else {
      console.log('🎉 SUCCESS REPORT:\n');
      console.log('✅ All game categories are accessible');
      console.log('✅ All product pages are working');
      console.log('✅ Black Ops 7 & Warzone category fixed');
      console.log('✅ URL slug conversion working properly');
      console.log('✅ No 404 errors found');
      console.log('✅ Complete user flow functional');
    }

    console.log('\n🔗 QUICK ACCESS LINKS:');
    console.log('• Store Homepage: http://localhost:3000/store');
    categoryResults.forEach(category => {
      console.log(`• ${category.game}: ${category.categoryUrl}`);
    });

  } catch (error) {
    console.error('❌ Verification error:', error);
  }
}

verifyAllGameLinks();