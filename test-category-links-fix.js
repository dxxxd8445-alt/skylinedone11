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

async function testCategoryLinks() {
  console.log('🧪 TESTING CATEGORY LINKS FIX...\n');

  try {
    // Get all products
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, game, slug')
      .order('game');

    if (error) {
      console.error('❌ Error fetching products:', error);
      return;
    }

    console.log('🎮 GAME CATEGORIES AND THEIR PRODUCTS:\n');

    // Group products by game
    const gameGroups = {};
    products.forEach(p => {
      if (!gameGroups[p.game]) gameGroups[p.game] = [];
      gameGroups[p.game].push(p);
    });

    // Test each category
    for (const [game, gameProducts] of Object.entries(gameGroups)) {
      const gameSlug = gameToSlug(game);
      const categoryUrl = `http://localhost:3000/store/${gameSlug}`;
      
      console.log(`📦 ${game}:`);
      console.log(`   Slug: ${gameSlug}`);
      console.log(`   URL: ${categoryUrl}`);
      console.log(`   Products: ${gameProducts.length}`);
      
      // Test the URL
      try {
        const response = await fetch(categoryUrl);
        const status = response.ok ? '✅' : '❌';
        console.log(`   Status: ${status} ${response.status} ${response.statusText}`);
      } catch (error) {
        console.log(`   Status: ❌ Connection failed`);
      }
      
      // List products in this category
      gameProducts.forEach(p => {
        console.log(`     - ${p.name} (${p.slug})`);
      });
      console.log('');
    }

    console.log('🔧 FIXES APPLIED:');
    console.log('✅ Updated gameToSlug function to handle & character');
    console.log('✅ Convert & to "and" for URL-safe slugs');
    console.log('✅ Remove special characters from slugs');
    console.log('✅ Added Black Ops 7 & Warzone to gameConfig');
    console.log('✅ Fixed slug conversion in both store-filters.tsx and [game]/page.tsx');
    console.log('');

    console.log('🎯 EXPECTED RESULTS:');
    console.log('• Black Ops 7 & Warzone -> black-ops-7-and-warzone');
    console.log('• All category links should return 200 OK');
    console.log('• Each category should show its products');
    console.log('• No more 404 errors for any game category');
    console.log('');

    console.log('🌐 TEST URLS:');
    Object.keys(gameGroups).forEach(game => {
      const slug = gameToSlug(game);
      console.log(`• ${game}: http://localhost:3000/store/${slug}`);
    });

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testCategoryLinks();