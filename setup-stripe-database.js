/**
 * Setup Stripe Database Tables
 * This script creates the necessary tables for Stripe integration
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupStripeDatabase() {
  console.log('🗄️  Setting up Stripe database tables...\n');

  try {
    // Create stripe_sessions table
    console.log('1️⃣ Creating stripe_sessions table...');
    const { error: sessionsError } = await supabase.rpc('exec_sql', {
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

    if (sessionsError) {
      console.log('❌ Error creating stripe_sessions table:', sessionsError.message);
    } else {
      console.log('✅ stripe_sessions table created successfully');
    }

    // Add columns to orders table
    console.log('2️⃣ Updating orders table for Stripe...');
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
      console.log('✅ orders table updated successfully');
    }

    // Update licenses table
    console.log('3️⃣ Updating licenses table...');
    const { error: licensesError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE licenses ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id);
        ALTER TABLE licenses ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;
      `
    });

    if (licensesError) {
      console.log('❌ Error updating licenses table:', licensesError.message);
    } else {
      console.log('✅ licenses table updated successfully');
    }

    // Create indexes
    console.log('4️⃣ Creating indexes...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_stripe_sessions_session_id ON stripe_sessions(session_id);
        CREATE INDEX IF NOT EXISTS idx_stripe_sessions_customer_email ON stripe_sessions(customer_email);
        CREATE INDEX IF NOT EXISTS idx_stripe_sessions_status ON stripe_sessions(status);
        CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
        CREATE INDEX IF NOT EXISTS idx_orders_payment_intent_id ON orders(payment_intent_id);
        CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
        CREATE INDEX IF NOT EXISTS idx_licenses_order_id ON licenses(order_id);
      `
    });

    if (indexError) {
      console.log('❌ Error creating indexes:', indexError.message);
    } else {
      console.log('✅ Indexes created successfully');
    }

    // Enable RLS on stripe_sessions
    console.log('5️⃣ Setting up RLS policies...');
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
      console.log('✅ RLS policies created successfully');
    }

    console.log('\n🎉 Stripe database setup complete!');
    console.log('✅ All tables and indexes created');
    console.log('✅ RLS policies configured');
    console.log('✅ Ready for Stripe payments!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

// Run the setup
setupStripeDatabase();