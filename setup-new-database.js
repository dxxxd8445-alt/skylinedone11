const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Your Supabase credentials
const SUPABASE_URL = 'https://bcjzfqvomwtuyznnlxha.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjanpmcXZvbXd0dXl6bm5seGhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NzA1NTUsImV4cCI6MjA4NTQ0NjU1NX0.sH5IPQ97DxvuSRATjtmnY9uw0ie76zNxRHDuIJzATNg';

// You'll need to add your service role key here
const SUPABASE_SERVICE_KEY = 'YOUR_SERVICE_ROLE_KEY_HERE'; // Get this from Supabase dashboard

async function setupDatabase() {
  console.log('🚀 Setting up your new Supabase database...');
  
  if (SUPABASE_SERVICE_KEY === 'YOUR_SERVICE_ROLE_KEY_HERE') {
    console.log('❌ Please add your service role key to this script first!');
    console.log('📋 Steps to get your service role key:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project: bcjzfqvomwtuyznnlxha');
    console.log('3. Go to Settings → API');
    console.log('4. Find "service_role" key and click "Reveal"');
    console.log('5. Copy that key and replace YOUR_SERVICE_ROLE_KEY_HERE in this script');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Test connection
    console.log('🔌 Testing database connection...');
    const { data, error } = await supabase.from('_test').select('*').limit(1);
    
    if (error && !error.message.includes('does not exist')) {
      throw new Error(`Connection failed: ${error.message}`);
    }
    
    console.log('✅ Database connection successful!');
    console.log('📋 Next steps:');
    console.log('1. Go to your Supabase dashboard SQL Editor');
    console.log('2. Copy and paste the content from COMPLETE_SUPABASE_SETUP.sql');
    console.log('3. Click "Run" to create all tables and data');
    console.log('4. Update your .env.local with the service role key');
    console.log('5. Restart your development server');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupDatabase();