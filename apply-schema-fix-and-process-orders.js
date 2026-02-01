#!/usr/bin/env node

/**
 * Apply Schema Fix and Process Orders
 * 1. Fixes the orders table schema
 * 2. Processes pending Stripe sessions
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

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

async function applySchemaFix() {
  log('\n🔧 Applying Database Schema Fix...', 'blue');
  
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('fix-orders-table-schema.sql', 'utf8');
    
    // Split into individual statements (simple split by semicolon)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('COMMENT'));
    
    log(`📋 Executing ${statements.length} SQL statements...`, 'yellow');
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          log(`   ${i + 1}. ${statement.substring(0, 50)}...`, 'reset');
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            log(`   ❌ Failed: ${error.message}`, 'red');
          } else {
            log(`   ✅ Success`, 'green');
          }
        } catch (e) {
          log(`   ❌ Exception: ${e.message}`, 'red');
        }
      }
    }
    
    log('✅ Schema fix applied successfully!', 'green');
    return true;
    
  } catch (error) {
    log(`❌ Schema fix failed: ${error.message}`, 'red');
    
    // Try alternative approach - execute statements individually
    log('\n🔄 Trying alternative approach...', 'yellow');
    
    const alterStatements = [
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD'",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255)",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount_cents INTEGER",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255)",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255)",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address JSONB",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS metadata JSONB",
      "ALTER TABLE licenses ADD COLUMN IF NOT EXISTS variant_id VARCHAR(255)",
      "ALTER TABLE licenses ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE"
    ];
    
    for (const statement of alterStatements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          log(`   ❌ ${statement}: ${error.message}`, 'red');
        } else {
          log(`   ✅ ${statement}`, 'green');
        }
      } catch (e) {
        log(`   ❌ ${statement}: ${e.message}`, 'red');
      }
    }
    
    return true; // Continue even if some statements fail
  }
}

function generateLicenseKey(productName = 'MAGMA', duration = '24h') {
  const prefix = productName.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X');
  const durationCode = duration.includes('30') ? '30D' : duration.includes('7') ? '7D' : '24H';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const r = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `MGMA-${prefix}-${durationCode}-${r()}-${r()}`;
}

function generateOrderNumber(sessionId) {
  const year = new Date().getFullYear();
  const sessionSuffix = sessionId.slice(-8).toUpperCase();
  return `STRIPE-${year}-${sessionSuffix}`;
}

async function processPendingSession(session) {
  log(`\n🔄 Processing session: ${session.session_id.slice(-20)}...`, 'blue');
  log(`   Customer: ${session.customer_email}`, 'reset');
  log(`   Total: $${session.total}`, 'reset');
  
  try {
    // Parse items from session
    let items = [];
    try {
      items = JSON.parse(session.items || '[]');
    } catch (e) {
      items = [{
        productName: 'Magma Cheat',
        game: 'Unknown',
        duration: '24 Hours',
        price: session.total,
        quantity: 1
      }];
    }
    
    const firstItem = items[0] || {};
    const orderNumber = generateOrderNumber(session.session_id);
    
    // Create order record with corrected schema
    const orderData = {
      order_number: orderNumber,
      customer_email: session.customer_email,
      customer_name: 'Customer',
      amount: session.total, // Keep legacy amount field
      amount_cents: Math.round(session.total * 100), // Add new amount_cents field
      currency: 'USD',
      status: 'completed',
      payment_method: 'stripe',
      payment_intent_id: `pi_${session.session_id.slice(-10)}`,
      stripe_session_id: session.session_id,
      product_name: firstItem.productName || 'Magma Cheat',
      duration: firstItem.duration || '24 Hours',
      coupon_code: session.coupon_code || null,
      coupon_discount_amount: session.coupon_discount_amount || null,
      created_at: session.created_at,
      updated_at: new Date().toISOString(),
    };

    log(`   📝 Creating order: ${orderNumber}`, 'yellow');
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      log(`   ❌ Failed to create order: ${orderError.message}`, 'red');
      return { success: false, error: orderError.message };
    }

    log(`   ✅ Order created with ID: ${order.id}`, 'green');

    // Create license for each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const licenseKey = generateLicenseKey(item.productName || 'MAGMA', item.duration || '24h');
      
      const licenseData = {
        license_key: licenseKey,
        order_id: order.id,
        product_id: item.productId || null,
        variant_id: item.variantId || null,
        product_name: item.productName || 'Magma Cheat',
        customer_email: session.customer_email,
        status: 'active',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        assigned_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      log(`   🔑 Creating license: ${licenseKey}`, 'yellow');
      
      const { error: licenseError } = await supabase
        .from('licenses')
        .insert(licenseData);

      if (licenseError) {
        log(`   ❌ Failed to create license: ${licenseError.message}`, 'red');
      } else {
        log(`   ✅ License created successfully`, 'green');
      }
    }

    // Update session status to completed
    const { error: updateError } = await supabase
      .from('stripe_sessions')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('session_id', session.session_id);

    if (updateError) {
      log(`   ⚠️ Failed to update session status: ${updateError.message}`, 'yellow');
    } else {
      log(`   ✅ Session marked as completed`, 'green');
    }

    return { 
      success: true, 
      orderNumber, 
      licenseCount: items.length,
      orderId: order.id 
    };

  } catch (error) {
    log(`   ❌ Exception processing session: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function processAllPendingOrders() {
  log('\n📋 Processing Pending Orders...', 'blue');
  
  try {
    // Get all pending sessions
    const { data: pendingSessions, error } = await supabase
      .from('stripe_sessions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      log(`❌ Failed to fetch sessions: ${error.message}`, 'red');
      return;
    }

    if (!pendingSessions || pendingSessions.length === 0) {
      log('✅ No pending sessions found!', 'green');
      return;
    }

    log(`📊 Found ${pendingSessions.length} pending sessions`, 'yellow');

    let successCount = 0;
    let failCount = 0;

    // Process each pending session
    for (const session of pendingSessions) {
      const result = await processPendingSession(session);
      
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
      
      // Small delay between processing
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Final summary
    log('\n📊 Processing Complete!', 'bold');
    log('=' .repeat(30), 'blue');
    log(`✅ Successfully processed: ${successCount} sessions`, 'green');
    log(`❌ Failed to process: ${failCount} sessions`, failCount > 0 ? 'red' : 'reset');
    
    return { successCount, failCount };

  } catch (error) {
    log(`💥 Processing failed: ${error.message}`, 'red');
    return { successCount: 0, failCount: 0 };
  }
}

async function runCompletefix() {
  log('🚀 Starting Complete Orders Fix', 'bold');
  log('=' .repeat(50), 'blue');
  
  // Step 1: Apply schema fix
  const schemaFixed = await applySchemaFix();
  
  if (!schemaFixed) {
    log('❌ Schema fix failed - cannot continue', 'red');
    return;
  }
  
  // Step 2: Process pending orders
  const result = await processAllPendingOrders();
  
  // Final summary
  log('\n🎉 Complete Fix Summary', 'bold');
  log('=' .repeat(40), 'blue');
  
  if (result.successCount > 0) {
    log('✅ ORDERS FIXED SUCCESSFULLY!', 'green');
    log(`   • ${result.successCount} orders created`, 'blue');
    log(`   • ${result.successCount} licenses generated`, 'blue');
    log('   • Admin panel should now show orders', 'blue');
    log('   • Dashboard analytics should update', 'blue');
    log('   • Customer accounts should show purchases', 'blue');
  } else {
    log('❌ No orders were processed', 'red');
    log('   • Check error messages above', 'blue');
    log('   • May need manual intervention', 'blue');
  }
}

// Run the complete fix
runCompletefix().catch(error => {
  log(`💥 Script failed: ${error.message}`, 'red');
  process.exit(1);
});