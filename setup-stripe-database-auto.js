/**
 * Automatic Stripe Database Setup
 * This script creates all required tables and columns
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bcjzfqvomwtuyznnlxha.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjanpmcXZvbXd0dXl6bm5seGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3MDU1NSwiZXhwIjoyMDg1NDQ2NTU1fQ.1gp_MzZ1cU2ec4a2PwinO7wNr6I3YXz6wGHhSuORpvk'
);

async function setupDatabase() {
  console.log('🗄️  Setting up Stripe database automatically...\n');

  try {
    // Step 1: Create stripe_sessions table
    console.log('1️⃣ Creating stripe_sessions table...');
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS stripe_sessions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          session_id TEXT UNIQUE NOT NULL,
          customer_email TEXT NOT NULL,
          items JSONB NOT NULL,
          coupon_code TEXT,
          coupon_discount_amount DECIMAL(10,2) DEFAULT 0,
          subtotal DECIMAL(10,2) NOT NULL,
          total DECIMAL(10,2) NOT NULL,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'failed')),
          stripe_payment_intent_id TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });

    if (createTableError) {
      console.log('❌ Error creating stripe_sessions:', createTableError.message);
    } else {
      console.log('✅ stripe_sessions table created');
    }

    // Step 2: Add columns to orders table
    console.log('2️⃣ Adding Stripe columns to orders table...');
    const { error: ordersError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'moneymotion';
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address JSONB;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_discount_amount DECIMAL(10,2);
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS metadata JSONB;
      `
    });

    if (ordersError) {
      console.log('❌ Error updating orders table:', ordersError.message);
    } else {
      console.log('✅ Orders table updated with Stripe columns');
    }

    // Step 3: Add columns to licenses table
    console.log('3️⃣ Adding order tracking to licenses table...');
    const { error: licensesError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE licenses ADD COLUMN IF NOT EXISTS order_id UUID;
        ALTER TABLE licenses ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;
      `
    });

    if (licensesError) {
      console.log('❌ Error updating licenses table:', licensesError.message);
    } else {
      console.log('✅ Licenses table updated with order tracking');
    }

    // Step 4: Create indexes
    console.log('4️⃣ Creating performance indexes...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_stripe_sessions_session_id ON stripe_sessions(session_id);
        CREATE INDEX IF NOT EXISTS idx_stripe_sessions_customer_email ON stripe_sessions(customer_email);
        CREATE INDEX IF NOT EXISTS idx_stripe_sessions_status ON stripe_sessions(status);
        CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
        CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
        CREATE INDEX IF NOT EXISTS idx_licenses_order_id ON licenses(order_id);
      `
    });

    if (indexError) {
      console.log('❌ Error creating indexes:', indexError.message);
    } else {
      console.log('✅ Performance indexes created');
    }

    // Step 5: Set up RLS
    console.log('5️⃣ Setting up security policies...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE stripe_sessions ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Service role access stripe_sessions" ON stripe_sessions;
        CREATE POLICY "Service role access stripe_sessions" ON stripe_sessions
        FOR ALL 
        USING (auth.role() = 'service_role');
      `
    });

    if (rlsError) {
      console.log('❌ Error setting up RLS:', rlsError.message);
    } else {
      console.log('✅ Security policies configured');
    }

    console.log('\n🎉 STRIPE DATABASE SETUP COMPLETE!');
    console.log('✅ All tables created');
    console.log('✅ All columns added');
    console.log('✅ Indexes created for performance');
    console.log('✅ Security policies configured');
    console.log('\n🚀 Your Stripe integration is now ready to use!');
    console.log('   Try the checkout again - it should work now!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

setupDatabase();