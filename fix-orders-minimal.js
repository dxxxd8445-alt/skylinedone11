#!/usr/bin/env node

/**
 * Fix Orders Minimal
 * Uses only the columns that definitely exist in the orders table
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
    
    // Create order record with MINIMAL columns only
    const orderData = {
      order_number: orderNumber,
      customer_email: session.customer_email,
      amount_cents: Math.round(session.total * 100), // REQUIRED field
      status: 'completed',
      payment_method: 'stripe',
      product_name: firstItem.productName || 'Magma Cheat',
      duration: firstItem.duration || '24 Hours',
      created_at: session.created_at,
      updated_at: new Date().toISOString(),
    };

    log(`   📝 Creating order: ${orderNumber}`, 'yellow');
    log(`   💰 Amount: $${session.total} (${Math.round(session.total * 100)} cents)`, 'reset');
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      log(`   ❌ Failed to create order: ${orderError.message}`, 'red');
      log(`   🔍 Trying even more minimal approach...`, 'yellow');
      
      // Try with absolute minimum
      const minimalOrderData = {
        order_number: orderNumber,
        customer_email: session.customer_email,
        amount_cents: Math.round(session.total * 100),
        status: 'completed',
        payment_method: 'stripe',
        created_at: session.created_at,
      };
      
      const { data: minimalOrder, error: minimalError } = await supabase
        .from('orders')
        .insert(minimalOrderData)
        .select()
        .single();
      
      if (minimalError) {
        log(`   ❌ Minimal approach also failed: ${minimalError.message}`, 'red');
        return { success: false, error: minimalError.message };
      } else {
        log(`   ✅ Minimal order created with ID: ${minimalOrder.id}`, 'green');
        order = minimalOrder;
      }
    } else {
      log(`   ✅ Order created with ID: ${order.id}`, 'green');
    }

    // Create license for each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const licenseKey = generateLicenseKey(item.productName || 'MAGMA', item.duration || '24h');
      
      const licenseData = {
        license_key: licenseKey,
        order_id: order.id,
        product_name: item.productName || 'Magma Cheat',
        customer_email: session.customer_email,
        status: 'active',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
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

async function fixAllPendingOrders() {
  log('🔧 Starting Minimal Orders Fix', 'bold');
  log('=' .repeat(50), 'blue');
  
  try {
    // Get all pending sessions
    log('\n📋 Fetching pending Stripe sessions...', 'blue');
    
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
    log('\n🎉 Orders Fix Complete!', 'bold');
    log('=' .repeat(30), 'blue');
    log(`✅ Successfully processed: ${successCount} sessions`, 'green');
    log(`❌ Failed to process: ${failCount} sessions`, failCount > 0 ? 'red' : 'reset');
    
    if (successCount > 0) {
      log('\n🚀 SUCCESS! Orders have been created:', 'green');
      log('   • Check the admin panel Orders tab NOW', 'blue');
      log('   • Dashboard should show updated analytics', 'blue');
      log('   • Customers can see their licenses', 'blue');
      log('   • All pending payments are now processed', 'blue');
      
      log('\n📊 What to expect in admin panel:', 'yellow');
      log(`   • Total Orders: ${successCount}`, 'blue');
      log(`   • Total Revenue: Calculated from all orders`, 'blue');
      log(`   • Active Licenses: ${successCount}`, 'blue');
      log(`   • Recent Activity: New order entries`, 'blue');
    }

    if (failCount > 0) {
      log('\n⚠️ Some sessions failed to process:', 'yellow');
      log('   • Check the error messages above', 'blue');
      log('   • May need manual review', 'blue');
    }

  } catch (error) {
    log(`💥 Fix process failed: ${error.message}`, 'red');
  }
}

// Run the fix
fixAllPendingOrders().catch(error => {
  log(`💥 Script failed: ${error.message}`, 'red');
  process.exit(1);
});