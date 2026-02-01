#!/usr/bin/env node

/**
 * Debug Stripe Orders - Check what's in the database
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://bcjzfqvomwtuyznnlxha.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjanpmcXZvbXd0dXl6bm5seGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3MDU1NSwiZXhwIjoyMDg1NDQ2NTU1fQ.1gp_MzZ1cU2ec4a2PwinO7wNr6I3YXz6wGHhSuORpvk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkOrdersTable() {
  log('\n🔍 Checking orders table...', 'blue');
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      log(`❌ Error querying orders: ${error.message}`, 'red');
      return;
    }
    
    log(`📊 Found ${data?.length || 0} orders in orders table`, 'yellow');
    
    if (data && data.length > 0) {
      log('\n📋 Recent orders:', 'green');
      data.forEach((order, index) => {
        log(`${index + 1}. Order: ${order.order_number}`, 'blue');
        log(`   Customer: ${order.customer_email}`, 'reset');
        log(`   Product: ${order.product_name}`, 'reset');
        log(`   Amount: $${order.amount}`, 'reset');
        log(`   Status: ${order.status}`, 'reset');
        log(`   Payment: ${order.payment_method}`, 'reset');
        log(`   Created: ${order.created_at}`, 'reset');
        log('', 'reset');
      });
    } else {
      log('❌ No orders found in orders table!', 'red');
    }
    
  } catch (error) {
    log(`❌ Exception checking orders: ${error.message}`, 'red');
  }
}

async function checkStripeSessionsTable() {
  log('\n🔍 Checking stripe_sessions table...', 'blue');
  
  try {
    const { data, error } = await supabase
      .from('stripe_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      log(`❌ Error querying stripe_sessions: ${error.message}`, 'red');
      return;
    }
    
    log(`📊 Found ${data?.length || 0} sessions in stripe_sessions table`, 'yellow');
    
    if (data && data.length > 0) {
      log('\n📋 Recent Stripe sessions:', 'green');
      data.forEach((session, index) => {
        log(`${index + 1}. Session: ${session.session_id}`, 'blue');
        log(`   Customer: ${session.customer_email}`, 'reset');
        log(`   Status: ${session.status}`, 'reset');
        log(`   Total: $${session.total}`, 'reset');
        log(`   Created: ${session.created_at}`, 'reset');
        log('', 'reset');
      });
    } else {
      log('❌ No sessions found in stripe_sessions table!', 'red');
    }
    
  } catch (error) {
    log(`❌ Exception checking stripe_sessions: ${error.message}`, 'red');
  }
}

async function checkLicensesTable() {
  log('\n🔍 Checking licenses table...', 'blue');
  
  try {
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      log(`❌ Error querying licenses: ${error.message}`, 'red');
      return;
    }
    
    log(`📊 Found ${data?.length || 0} licenses in licenses table`, 'yellow');
    
    if (data && data.length > 0) {
      log('\n📋 Recent licenses:', 'green');
      data.forEach((license, index) => {
        log(`${index + 1}. License: ${license.license_key}`, 'blue');
        log(`   Customer: ${license.customer_email}`, 'reset');
        log(`   Product: ${license.product_name}`, 'reset');
        log(`   Status: ${license.status}`, 'reset');
        log(`   Order ID: ${license.order_id}`, 'reset');
        log(`   Created: ${license.created_at}`, 'reset');
        log('', 'reset');
      });
    } else {
      log('❌ No licenses found in licenses table!', 'red');
    }
    
  } catch (error) {
    log(`❌ Exception checking licenses: ${error.message}`, 'red');
  }
}

async function checkTableSchemas() {
  log('\n🔍 Checking table schemas...', 'blue');
  
  // Check orders table schema
  try {
    const { data: ordersSchema, error } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (!error && ordersSchema) {
      log('✅ Orders table exists and is accessible', 'green');
    } else {
      log(`❌ Orders table issue: ${error?.message}`, 'red');
    }
  } catch (error) {
    log(`❌ Orders table schema check failed: ${error.message}`, 'red');
  }
  
  // Check stripe_sessions table schema
  try {
    const { data: sessionsSchema, error } = await supabase
      .from('stripe_sessions')
      .select('*')
      .limit(1);
    
    if (!error) {
      log('✅ Stripe_sessions table exists and is accessible', 'green');
    } else {
      log(`❌ Stripe_sessions table issue: ${error?.message}`, 'red');
    }
  } catch (error) {
    log(`❌ Stripe_sessions table schema check failed: ${error.message}`, 'red');
  }
}

async function runDiagnostics() {
  log('🔍 Starting Stripe Orders Diagnostics', 'bold');
  log('=' .repeat(50), 'blue');
  
  await checkTableSchemas();
  await checkOrdersTable();
  await checkStripeSessionsTable();
  await checkLicensesTable();
  
  log('\n📋 Diagnosis Summary:', 'bold');
  log('=' .repeat(30), 'blue');
  log('1. Check if orders are being created by Stripe webhook', 'yellow');
  log('2. Verify table schemas match expected format', 'yellow');
  log('3. Check if admin panel is querying the right table', 'yellow');
  log('4. Ensure webhook is processing payments correctly', 'yellow');
}

runDiagnostics().catch(error => {
  log(`💥 Diagnostics failed: ${error.message}`, 'red');
  process.exit(1);
});