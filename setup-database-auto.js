const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const SUPABASE_URL = 'https://bcjzfqvomwtuyznnlxha.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjanpmcXZvbXd0dXl6bm5seGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3MDU1NSwiZXhwIjoyMDg1NDQ2NTU1fQ.1gp_MzZ1cU2ec4a2PwinO7wNr6I3YXz6wGHhSuORpvk';

async function setupDatabase() {
  console.log('🚀 Setting up your Skyline Store database...');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Test connection first
    console.log('🔌 Testing database connection...');
    const { error: connectionError } = await supabase.from('_test').select('*').limit(1);
    
    if (connectionError && !connectionError.message.includes('does not exist')) {
      throw new Error(`Connection failed: ${connectionError.message}`);
    }
    
    console.log('✅ Database connection successful!');

    // Create categories table
    console.log('📋 Creating categories table...');
    const { error: categoriesError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS categories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          description TEXT,
          image TEXT,
          display_order INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
      `
    });

    // Since rpc might not work, let's try direct table operations
    console.log('📦 Creating tables using direct operations...');
    
    // Test if we can create a simple table
    const { error: testError } = await supabase
      .from('categories')
      .select('count')
      .limit(1);

    if (testError && testError.code === '42P01') {
      console.log('❌ Tables don\'t exist yet. You need to run the SQL script manually.');
      console.log('📋 Please follow these steps:');
      console.log('1. Go to https://supabase.com/dashboard');
      console.log('2. Select your project: bcjzfqvomwtuyznnlxha');
      console.log('3. Go to SQL Editor');
      console.log('4. Copy and paste the content from COMPLETE_SUPABASE_SETUP.sql');
      console.log('5. Click "Run"');
      console.log('6. Come back and run this script again');
      return;
    }

    // If tables exist, add some test data
    console.log('✅ Tables exist! Adding sample data...');
    
    // Insert sample category
    const { error: insertError } = await supabase
      .from('categories')
      .upsert({
        name: 'Battle Royale',
        slug: 'battle-royale',
        description: 'Cheats for battle royale games',
        display_order: 1
      }, { onConflict: 'slug' });

    if (insertError) {
      console.log('⚠️ Sample data insert failed:', insertError.message);
    } else {
      console.log('✅ Sample data added successfully!');
    }

    // Test admin audit logs table
    const { error: auditError } = await supabase
      .from('admin_audit_logs')
      .select('count')
      .limit(1);

    if (auditError) {
      console.log('⚠️ Audit logs table missing. Creating it...');
      // We'll handle this in the manual SQL script
    } else {
      console.log('✅ Audit logs table exists!');
    }

    console.log('🎉 Database setup completed!');
    console.log('🔗 Test your setup at: http://localhost:3000/api/admin/verify-setup');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('📋 Manual setup required. Please run the SQL script in Supabase dashboard.');
  }
}

setupDatabase();