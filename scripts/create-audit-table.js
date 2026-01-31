const { createClient } = require('@supabase/supabase-js');

// Read environment variables directly from .env.local
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  return envVars;
}

async function createAuditLogsTable() {
  const env = loadEnvFile();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.log('Looking for:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('🔧 Creating admin_audit_logs table...');

  try {
    // Create the table directly
    const { error: tableError } = await supabase.sql`
      CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        event_type TEXT NOT NULL CHECK (event_type IN ('login', 'logout')),
        actor_role TEXT NOT NULL CHECK (actor_role IN ('admin', 'staff')),
        actor_identifier TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    if (tableError) {
      console.error('❌ Error creating table:', tableError);
      throw tableError;
    }

    // Create indexes
    await supabase.sql`CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);`;
    await supabase.sql`CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_actor ON admin_audit_logs(actor_role, actor_identifier);`;
    await supabase.sql`CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_event_type ON admin_audit_logs(event_type);`;

    // Enable RLS
    await supabase.sql`ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;`;
    
    // Create policy
    await supabase.sql`
      CREATE POLICY IF NOT EXISTS "Service role can manage audit logs" ON admin_audit_logs
        FOR ALL USING (auth.role() = 'service_role');
    `;

    // Test the table by inserting a sample record
    const { error: insertError } = await supabase
      .from('admin_audit_logs')
      .insert({
        event_type: 'login',
        actor_role: 'admin',
        actor_identifier: 'setup-test',
        ip_address: '127.0.0.1',
        user_agent: 'Setup Script'
      });

    if (insertError) {
      console.error('❌ Error testing table:', insertError);
      throw insertError;
    }

    // Clean up test record
    await supabase
      .from('admin_audit_logs')
      .delete()
      .eq('actor_identifier', 'setup-test');

    console.log('✅ admin_audit_logs table created successfully!');
    console.log('📊 You can now access the audit logs at: http://localhost:3000/mgmt-x9k2m7/logs');

  } catch (error) {
    console.error('❌ Failed to create table:', error);
    console.error('Full error:', error);
    process.exit(1);
  }
}

createAuditLogsTable();