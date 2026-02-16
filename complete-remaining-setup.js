const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bcjzfqvomwtuyznnlxha.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjanpmcXZvbXd0dXl6bm5seGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3MDU1NSwiZXhwIjoyMDg1NDQ2NTU1fQ.1gp_MzZ1cU2ec4a2PwinO7wNr6I3YXz6wGHhSuORpvk';

async function completeSetup() {
  console.log('🔧 Completing remaining setup...');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Add product variants for existing products
    console.log('📦 Adding product variants...');
    
    // Get existing products
    const { data: products } = await supabase
      .from('products')
      .select('id, slug');

    if (products && products.length > 0) {
      const variants = [];
      
      for (const product of products) {
        if (product.slug === 'fortnite-aimbot') {
          variants.push(
            { product_id: product.id, duration: '1 Day', price: 999, stock: 50 },
            { product_id: product.id, duration: '7 Days', price: 2999, stock: 30 },
            { product_id: product.id, duration: '30 Days', price: 9999, stock: 20 }
          );
        } else if (product.slug === 'apex-legends-hack') {
          variants.push(
            { product_id: product.id, duration: '1 Day', price: 1499, stock: 40 },
            { product_id: product.id, duration: '7 Days', price: 3999, stock: 25 },
            { product_id: product.id, duration: '30 Days', price: 12999, stock: 15 }
          );
        }
      }

      if (variants.length > 0) {
        const { error: variantsError } = await supabase
          .from('product_variants')
          .upsert(variants, { onConflict: 'product_id,duration' });

        if (!variantsError) {
          console.log('✅ Product variants added!');
        }
      }
    }

    // Add sample coupons
    console.log('🎫 Adding sample coupons...');
    const { error: couponsError } = await supabase
      .from('coupons')
      .upsert([
        {
          code: 'WELCOME10',
          discount_percent: 10,
          max_uses: 100,
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true
        },
        {
          code: 'SAVE20',
          discount_percent: 20,
          max_uses: 50,
          valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true
        }
      ], { onConflict: 'code' });

    if (!couponsError) {
      console.log('✅ Sample coupons added!');
    }

    // Add sample settings
    console.log('⚙️ Adding system settings...');
    const { error: settingsError } = await supabase
      .from('settings')
      .upsert([
        { key: 'site_name', value: '"Ring-0 Store"', description: 'Website name' },
        { key: 'site_description', value: '"Premium gaming software and cheats"', description: 'Website description' },
        { key: 'maintenance_mode', value: 'false', description: 'Enable/disable maintenance mode' },
        { key: 'max_licenses_per_order', value: '5', description: 'Maximum licenses per order' },
        { key: 'default_license_duration', value: '"30 Days"', description: 'Default license duration' }
      ], { onConflict: 'key' });

    if (!settingsError) {
      console.log('✅ System settings added!');
    }

    // Add sample reviews
    console.log('⭐ Adding sample reviews...');
    const { data: sampleProduct } = await supabase
      .from('products')
      .select('id')
      .eq('slug', 'fortnite-aimbot')
      .single();

    if (sampleProduct) {
      const { error: reviewsError } = await supabase
        .from('reviews')
        .upsert([
          {
            product_id: sampleProduct.id,
            customer_name: 'ProGamer99',
            rating: 5,
            comment: 'Amazing aimbot! Works perfectly and undetected.',
            is_verified: true,
            is_approved: true
          },
          {
            product_id: sampleProduct.id,
            customer_name: 'ShadowHunter',
            rating: 4,
            comment: 'Great product, easy to use and configure.',
            is_verified: true,
            is_approved: true
          }
        ], { onConflict: 'product_id,customer_name' });

      if (!reviewsError) {
        console.log('✅ Sample reviews added!');
      }
    }

    // Test audit log functionality
    console.log('📝 Testing audit log system...');
    const { error: auditError } = await supabase
      .from('admin_audit_logs')
      .insert({
        event_type: 'login',
        actor_role: 'admin',
        actor_identifier: 'setup-test',
        ip_address: '127.0.0.1',
        user_agent: 'Setup Script Test'
      });

    if (!auditError) {
      console.log('✅ Audit log system working!');
      
      // Clean up test record
      await supabase
        .from('admin_audit_logs')
        .delete()
        .eq('actor_identifier', 'setup-test');
    }

    // Final verification
    console.log('🧪 Running final verification...');
    const verificationResults = await Promise.all([
      supabase.from('categories').select('count'),
      supabase.from('products').select('count'),
      supabase.from('product_variants').select('count'),
      supabase.from('team_members').select('count'),
      supabase.from('coupons').select('count'),
      supabase.from('settings').select('count'),
      supabase.from('reviews').select('count')
    ]);

    console.log('📊 Final Database Summary:');
    console.log(`   Categories: ${verificationResults[0].data?.length || 0}`);
    console.log(`   Products: ${verificationResults[1].data?.length || 0}`);
    console.log(`   Product Variants: ${verificationResults[2].data?.length || 0}`);
    console.log(`   Team Members: ${verificationResults[3].data?.length || 0}`);
    console.log(`   Coupons: ${verificationResults[4].data?.length || 0}`);
    console.log(`   Settings: ${verificationResults[5].data?.length || 0}`);
    console.log(`   Reviews: ${verificationResults[6].data?.length || 0}`);

    console.log('🎉 Setup completed successfully!');
    console.log('🔗 Your site is ready at: http://localhost:3000');
    console.log('🔐 Admin login: http://localhost:3000/mgmt-x9k2m7/login');
    console.log('🔑 Password: mG7vK2QpN9xR5tH3yL8sD4wZ');
    console.log('📊 Audit logs: http://localhost:3000/mgmt-x9k2m7/logs');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

completeSetup();