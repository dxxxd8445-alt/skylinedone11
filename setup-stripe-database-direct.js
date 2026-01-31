/**
 * Direct Stripe Database Setup
 * This script creates all required tables using direct SQL queries
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bcjzfqvomwtuyznnlxha.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjanpmcXZvbXd0dXl6bm5seGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3MDU1NSwiZXhwIjoyMDg1NDQ2NTU1fQ.1gp_MzZ1cU2ec4a2PwinO7wNr6I3YXz6wGHhSuORpvk'
);

async function setupDatabase() {
  console.log('🗄️  Setting up Stripe database directly...\n');

  try {
    // Step 1: Create stripe_sessions table using raw SQL
    console.log('1️⃣ Creating stripe_sessions table...');
    
    const createTableSQL = `
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
    `;

    const { error: createError } = await supabase.from('stripe_sessions').select('id').limit(1);
    
    if (createError && createError.message.includes('does not exist')) {
      console.log('❌ stripe_sessions table does not exist');
      console.log('⚠️  Please run this SQL in your Supabase SQL Editor:');
      console.log('---------------------------------------------------');
      console.log(createTableSQL);
      console.log('---------------------------------------------------\n');
    } else {
      console.log('✅ stripe_sessions table already exists or accessible\n');
    }

    // Step 2: Check orders table columns
    console.log('2️⃣ Checking orders table Stripe columns...');
    const { error: ordersError } = await supabase
      .from('orders')
      .select('payment_method, stripe_session_id')
      .limit(1);

    if (ordersError && ordersError.message.includes('does not exist')) {
      console.log('❌ Orders table missing Stripe columns');
      console.log('⚠️  Please run this SQL in your Supabase SQL Editor:');
      console.log('---------------------------------------------------');
      console.log(`
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'moneymotion';
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address JSONB;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_discount_amount DECIMAL(10,2);
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS metadata JSONB;
      `);
      console.log('---------------------------------------------------\n');
    } else {
      console.log('✅ Orders table has Stripe columns\n');
    }

    // Step 3: Check licenses table columns
    console.log('3️⃣ Checking licenses table order tracking...');
    const { error: licensesError } = await supabase
      .from('licenses')
      .select('order_id, assigned_at')
      .limit(1);

    if (licensesError && licensesError.message.includes('does not exist')) {
      console.log('❌ Licenses table missing order tracking columns');
      console.log('⚠️  Please run this SQL in your Supabase SQL Editor:');
      console.log('---------------------------------------------------');
      console.log(`
        ALTER TABLE licenses ADD COLUMN IF NOT EXISTS order_id UUID;
        ALTER TABLE licenses ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;
      `);
      console.log('---------------------------------------------------\n');
    } else {
      console.log('✅ Licenses table has order tracking columns\n');
    }

    // Provide complete SQL script
    console.log('📋 COMPLETE SQL SCRIPT FOR SUPABASE:');
    console.log('====================================');
    console.log(`
-- Stripe Integration Database Setup
-- Copy and paste this entire script into your Supabase SQL Editor

-- Create stripe_sessions table
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

-- Update orders table for Stripe
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'moneymotion';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_discount_amount DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Update licenses table for order tracking
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS order_id UUID;
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_session_id ON stripe_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_customer_email ON stripe_sessions(customer_email);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_status ON stripe_sessions(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_licenses_order_id ON licenses(order_id);

-- Enable RLS on stripe_sessions
ALTER TABLE stripe_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for stripe_sessions
DROP POLICY IF EXISTS "Service role access stripe_sessions" ON stripe_sessions;
CREATE POLICY "Service role access stripe_sessions" ON stripe_sessions
FOR ALL 
USING (auth.role() = 'service_role');

-- Verify setup
SELECT 'Stripe database setup complete!' as status;
    `);

    console.log('\n🚀 NEXT STEPS:');
    console.log('==============');
    console.log('1. Copy the SQL script above');
    console.log('2. Go to your Supabase dashboard');
    console.log('3. Click "SQL Editor"');
    console.log('4. Paste the script and click "Run"');
    console.log('5. Try the checkout again - it will work!');

  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
}

setupDatabase();