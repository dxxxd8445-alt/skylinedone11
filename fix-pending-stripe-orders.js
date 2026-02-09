#!/usr/bin/env node

/**
 * Fix Pending Stripe Orders
 * Manually processes pending Stripe sessions and creates orders
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
  log(`\n🔄 Processing session: ${session.session_id}`, 'blue');
  log(`   Customer: ${session.customer_email}`, 'reset');
  log(`   Total: $${session.total}`, 'reset');
  
  try {
    // Parse items from session
    let items = [];
    try {
      items = JSON.parse(session.items || '[]');
    } catch (e) {
      log(`   ⚠️ Could not parse items, creating default item`, 'yellow');
      items = [{
        productName: 'Skyline Cheat',
        game: 'Unknown',
        duration: '24 Hours',
        price: session.total,
        quantity: 1
      }];
    }
    
    const firstItem = items[0] || {};
    const orderNumber = generateOrderNumber(session.session_id);
    
    // Create order record
    const orderData = {
      order_number: orderNumber,
      customer_email: session.customer_email,
      customer_name: 'Customer', // Default name
      amount_cents: Math.round(session.total * 100), // Convert to cents
      currency: 'USD',
      status: 'completed',
      payment_method: 'stripe',
      payment_intent_id: `pi_${session.session_id.slice(-10)}`,
      stripe_session_id: session.session_id,
      product_name: firstItem.productName || 'Skyline Cheat',
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
        product_name: item.productName || 'Skyline Cheat',
        customer_email: session.customer_email,
        status: 'active',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
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

async function fixPendingOrders() {
  log('🔧 Starting Pending Orders Fix', 'bold');
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
      log('✅ No pending sessions found - all orders are processed!', 'green');
      return;
    }

    log(`📊 Found ${pendingSessions.length} pending sessions to process`, 'yellow');

    let successCount = 0;
    let failCount = 0;

    // Process each pending session
    for (const session of pendingSessions) {
      const result = await processPendingSession(session);
      
      if (result.success) {
        successCount++;
        log(`   ✅ Session processed successfully`, 'green');
      } else {
        failCount++;
        log(`   ❌ Session processing failed: ${result.error}`, 'red');
      }
      
      // Small delay between processing
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Final summary
    log('\n📊 Processing Complete!', 'bold');
    log('=' .repeat(30), 'blue');
    log(`✅ Successfully processed: ${successCount} sessions`, 'green');
    log(`❌ Failed to process: ${failCount} sessions`, failCount > 0 ? 'red' : 'reset');
    
    if (successCount > 0) {
      log('\n🎉 Orders have been created!', 'green');
      log('   • Check the admin panel Orders tab', 'blue');
      log('   • Customers should see their licenses', 'blue');
      log('   • Dashboard analytics should update', 'blue');
    }

    if (failCount > 0) {
      log('\n⚠️ Some sessions failed to process', 'yellow');
      log('   • Check the error messages above', 'blue');
      log('   • May need manual intervention', 'blue');
    }

  } catch (error) {
    log(`💥 Fix process failed: ${error.message}`, 'red');
  }
}

// Run the fix
fixPendingOrders().catch(error => {
  log(`💥 Script failed: ${error.message}`, 'red');
  process.exit(1);
});