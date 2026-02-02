require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Mapping of games to their local image files
const gameImageMap = {
  'Escape From Tarkov': '/images/tarkov.jpg',
  'Apex Legends': '/images/apex-product.png',
  'Delta Force': '/images/delta-force.jpg',
  'Black Ops 7 & Warzone': '/images/cod-bo7.jpg',
  'Arc Raiders': '/images/arc-raiders.png',
  'Dayz': '/images/dayz.jpg',
  'Hwid Spoofer': '/images/hwid-spoofer.jpg',
  'Universal': '/images/hwid-spoofer.jpg',
  'Valorant': '/images/valorant.jpg',
  'Rust': '/images/rust.jpg',
  'Rainbow Six Siege': '/images/rainbow-six.jpg',
  'Fortnite': '/images/fortnite.jpg',
  'PUBG': '/images/pubg.jpg',
  'Marvel Rivals': '/images/marvel-rivals.jpg',
  'Dead By Daylight': '/images/dead-by-daylight.jpg',
  'Dune Awakening': '/images/dune-awakening.jpg',
  'Battlefield 6': '/images/battlefield-6.jpg',
  'Call of Duty Black Ops 6': '/images/cod-bo6.jpg'
};

async function fixProductImages() {
  console.log('🔧 FIXING PRODUCT IMAGES...\n');

  try {
    // Get all products
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, game, image');

    if (fetchError) {
      console.error('❌ Error fetching products:', fetchError);
      return;
    }

    console.log(`📦 Found ${products.length} products to update:\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      const currentImage = product.image;
      const newImage = gameImageMap[product.game];

      console.log(`🎮 ${product.name} (${product.game})`);
      console.log(`   Current: ${currentImage || 'NO IMAGE'}`);
      
      if (newImage) {
        console.log(`   New: ${newImage}`);
        
        // Update the product image
        const { error: updateError } = await supabase
          .from('products')
          .update({ image: newImage })
          .eq('id', product.id);

        if (updateError) {
          console.log(`   ❌ Error updating: ${updateError.message}`);
        } else {
          console.log(`   ✅ Updated successfully`);
          updatedCount++;
        }
      } else {
        console.log(`   ⚠️  No local image found for game: ${product.game}`);
        skippedCount++;
      }
      console.log('');
    }

    console.log('📊 SUMMARY:');
    console.log(`✅ Updated: ${updatedCount} products`);
    console.log(`⚠️  Skipped: ${skippedCount} products`);
    console.log(`📦 Total: ${products.length} products`);

    if (updatedCount > 0) {
      console.log('\n🎉 Product images have been fixed!');
      console.log('🌐 Visit http://localhost:3000/store to see the updated images');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixProductImages();