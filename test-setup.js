const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bcjzfqvomwtuyznnlxha.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjanpmcXZvbXd0dXl6bm5seGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3MDU1NSwiZXhwIjoyMDg1NDQ2NTU1fQ.1gp_MzZ1cU2ec4a2PwinO7wNr6I3YXz6wGHhSuORpvk';

async function testSetup() {
  console.log('🧪 Testing your database setup...');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Test each table
    const tables = ['categories', 'products', 'team_members', 'admin_audit_logs'];
    
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('count').limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Table exists and accessible`);
      }
    }

    // Test admin user
    const { data: adminUser, error: adminError } = await supabase
      .from('team_members')
      .select('name, email, role, permissions')
      .eq('email', 'admin@skyline.local')
      .single();

    if (adminError) {
      console.log('❌ Admin user: Not found');
    } else {
      console.log('✅ Admin user: Found -', adminUser.name, adminUser.role);
    }

    // Test sample data
    const { data: products } = await supabase.from('products').select('name');
    const { data: categories } = await supabase.from('categories').select('name');

    console.log(`📦 Products: ${products?.length || 0} found`);
    console.log(`📂 Categories: ${categories?.length || 0} found`);

    console.log('🎉 Setup test completed!');
    console.log('🔗 Now test your site at: http://localhost:3000');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSetup();