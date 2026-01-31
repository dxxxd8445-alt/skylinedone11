const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bcjzfqvomwtuyznnlxha.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjanpmcXZvbXd0dXl6bm5seGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3MDU1NSwiZXhwIjoyMDg1NDQ2NTU1fQ.1gp_MzZ1cU2ec4a2PwinO7wNr6I3YXz6wGHhSuORpvk';

async function addAdminUser() {
  console.log('👤 Adding admin user...');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Add admin user with full permissions
    const { data, error } = await supabase
      .from('team_members')
      .upsert({
        name: 'Admin User',
        email: 'admin@magma.local',
        username: 'admin',
        role: 'Owner',
        status: 'active',
        permissions: [
          'dashboard',
          'manage_products',
          'manage_categories', 
          'manage_orders',
          'stock_keys',
          'manage_coupons',
          'manage_webhooks',
          'manage_team',
          'manage_settings',
          'manage_logins'
        ]
      }, { 
        onConflict: 'email',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('❌ Failed to add admin user:', error.message);
      return;
    }

    console.log('✅ Admin user added successfully!');

    // Add some sample categories if they don't exist
    const { error: categoriesError } = await supabase
      .from('categories')
      .upsert([
        { name: 'Battle Royale', slug: 'battle-royale', description: 'Cheats for battle royale games', display_order: 1 },
        { name: 'FPS Shooters', slug: 'fps-shooters', description: 'First-person shooter game cheats', display_order: 2 },
        { name: 'Survival Games', slug: 'survival-games', description: 'Survival and crafting game cheats', display_order: 3 },
        { name: 'Utilities', slug: 'utilities', description: 'Gaming utilities and tools', display_order: 4 }
      ], { onConflict: 'slug' });

    if (!categoriesError) {
      console.log('✅ Sample categories added!');
    }

    // Add some sample products
    const { error: productsError } = await supabase
      .from('products')
      .upsert([
        {
          name: 'Fortnite Aimbot',
          slug: 'fortnite-aimbot',
          game: 'Fortnite',
          description: 'Advanced aimbot with customizable settings',
          features: ['Aimbot', 'ESP', 'No Recoil', 'Triggerbot'],
          requirements: ['Windows 10/11', '8GB RAM', 'DirectX 11'],
          status: 'active',
          display_order: 1
        },
        {
          name: 'Apex Legends Hack',
          slug: 'apex-legends-hack', 
          game: 'Apex Legends',
          description: 'Complete hack suite for Apex Legends',
          features: ['Aimbot', 'Wallhack', 'Radar', 'Item ESP'],
          requirements: ['Windows 10/11', '16GB RAM', 'NVIDIA GPU'],
          status: 'active',
          display_order: 2
        }
      ], { onConflict: 'slug' });

    if (!productsError) {
      console.log('✅ Sample products added!');
    }

    // Test admin user
    const { data: adminUser } = await supabase
      .from('team_members')
      .select('name, email, role, permissions')
      .eq('email', 'admin@magma.local')
      .single();

    if (adminUser) {
      console.log('✅ Admin user verified:', adminUser.name, '-', adminUser.role);
      console.log('📋 Permissions:', adminUser.permissions.length, 'permissions assigned');
    }

    console.log('🎉 Setup completed successfully!');
    console.log('🔗 Test your admin login at: http://localhost:3000/mgmt-x9k2m7/login');
    console.log('🔑 Password: mG7vK2QpN9xR5tH3yL8sD4wZ');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

addAdminUser();