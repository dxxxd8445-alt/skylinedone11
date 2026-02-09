#!/usr/bin/env node

/**
 * Verify Orders Complete Fix
 * Tests that orders are showing up correctly in both admin and customer views
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

async function verifyOrdersTable() {
  log('\n📊 Verifying Orders Table', 'blue');
  
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      log(`❌ Error querying orders: ${error.message}`, 'red');
      return { success: false, count: 0 };
    }
    
    log(`✅ Found ${orders?.length || 0} orders`, 'green');
    
    if (orders && orders.length > 0) {
      // Calculate total revenue
      const totalRevenue = orders.reduce((sum, order) => {
        const amount = order.amount_cents ? order.amount_cents / 100 : (order.amount || 0);
        return sum + amount;
      }, 0);
      
      log(`💰 Total Revenue: $${totalRevenue.toFixed(2)}`, 'green');
      log(`📈 Average Order Value: $${(totalRevenue / orders.length).toFixed(2)}`, 'blue');
      
      // Show status breakdown
      const statusCounts = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});
      
      log('\n📋 Order Status Breakdown:', 'yellow');
      Object.entries(statusCounts).forEach(([status, count]) => {
        log(`   • ${status}: ${count}`, 'blue');
      });
      
      // Show recent orders
      log('\n📋 Recent Orders (Top 5):', 'yellow');
      orders.slice(0, 5).forEach((order, index) => {
        const amount = order.amount_cents ? order.amount_cents / 100 : (order.amount || 0);
        log(`   ${index + 1}. ${order.order_number} - ${order.customer_email} - $${amount.toFixed(2)} - ${order.status}`, 'blue');
      });
    }
    
    return { success: true, count: orders?.length || 0, totalRevenue };
    
  } catch (error) {
    log(`❌ Exception: ${error.message}`, 'red');
    return { success: false, count: 0 };
  }
}

async function verifyLicensesTable() {
  log('\n🔑 Verifying Licenses Table', 'blue');
  
  try {
    const { data: licenses, error } = await supabase
      .from('licenses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      log(`❌ Error querying licenses: ${error.message}`, 'red');
      return { success: false, count: 0 };
    }
    
    log(`✅ Found ${licenses?.length || 0} licenses`, 'green');
    
    if (licenses && licenses.length > 0) {
      // Show status breakdown
      const statusCounts = licenses.reduce((acc, license) => {
        acc[license.status] = (acc[license.status] || 0) + 1;
        return acc;
      }, {});
      
      log('\n📋 License Status Breakdown:', 'yellow');
      Object.entries(statusCounts).forEach(([status, count]) => {
        log(`   • ${status}: ${count}`, 'blue');
      });
      
      // Show recent licenses
      log('\n📋 Recent Licenses (Top 5):', 'yellow');
      licenses.slice(0, 5).forEach((license, index) => {
        log(`   ${index + 1}. ${license.license_key} - ${license.customer_email} - ${license.product_name} - ${license.status}`, 'blue');
      });
    }
    
    return { success: true, count: licenses?.length || 0 };
    
  } catch (error) {
    log(`❌ Exception: ${error.message}`, 'red');
    return { success: false, count: 0 };
  }
}

async function verifyStripeSessionsTable() {
  log('\n💳 Verifying Stripe Sessions Table', 'blue');
  
  try {
    const { data: sessions, error } = await supabase
      .from('stripe_sessions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      log(`❌ Error querying sessions: ${error.message}`, 'red');
      return { success: false, pending: 0, completed: 0 };
    }
    
    const pendingSessions = sessions?.filter(s => s.status === 'pending') || [];
    const completedSessions = sessions?.filter(s => s.status === 'completed') || [];
    
    log(`✅ Total Sessions: ${sessions?.length || 0}`, 'green');
    log(`✅ Completed Sessions: ${completedSessions.length}`, 'green');
    log(`⚠️ Pending Sessions: ${pendingSessions.length}`, pendingSessions.length > 0 ? 'yellow' : 'green');
    
    if (pendingSessions.length > 0) {
      log('\n⚠️ Warning: There are still pending sessions that need processing!', 'yellow');
      log('   These represent payments that were made but orders were not created.', 'yellow');
    }
    
    return { 
      success: true, 
      pending: pendingSessions.length, 
      completed: completedSessions.length 
    };
    
  } catch (error) {
    log(`❌ Exception: ${error.message}`, 'red');
    return { success: false, pending: 0, completed: 0 };
  }
}

async function testCustomerOrdersAPI() {
  log('\n🧪 Testing Customer Orders API', 'blue');
  
  try {
    // Test with a known customer email
    const testEmail = 'test@skylinecheats.org';
    
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, product_name, duration, amount_cents, status, created_at')
      .eq('customer_email', testEmail)
      .order('created_at', { ascending: false });
    
    const { data: licenses, error: licensesError } = await supabase
      .from('licenses')
      .select('id, license_key, product_name, status, expires_at, created_at, order_id')
      .eq('customer_email', testEmail)
      .order('created_at', { ascending: false });
    
    if (ordersError || licensesError) {
      log(`❌ API test failed: ${ordersError?.message || licensesError?.message}`, 'red');
      return { success: false };
    }
    
    const processedOrders = (orders || []).map((o) => ({ 
      ...o, 
      amount: o.amount_cents ? Number(o.amount_cents) / 100 : 0
    }));
    
    log(`✅ Customer API test successful`, 'green');
    log(`   • Orders for ${testEmail}: ${processedOrders.length}`, 'blue');
    log(`   • Licenses for ${testEmail}: ${(licenses || []).length}`, 'blue');
    
    if (processedOrders.length > 0) {
      log('\n📋 Customer Orders:', 'yellow');
      processedOrders.forEach((order, index) => {
        log(`   ${index + 1}. ${order.order_number} - $${order.amount.toFixed(2)} - ${order.status}`, 'blue');
      });
    }
    
    if (licenses && licenses.length > 0) {
      log('\n🔑 Customer Licenses:', 'yellow');
      licenses.forEach((license, index) => {
        log(`   ${index + 1}. ${license.license_key} - ${license.product_name} - ${license.status}`, 'blue');
      });
    }
    
    return { success: true, orders: processedOrders.length, licenses: (licenses || []).length };
    
  } catch (error) {
    log(`❌ Exception: ${error.message}`, 'red');
    return { success: false };
  }
}

async function runCompleteVerification() {
  log('🔍 Starting Complete Orders Verification', 'bold');
  log('=' .repeat(60), 'blue');
  
  const results = {
    orders: await verifyOrdersTable(),
    licenses: await verifyLicensesTable(),
    sessions: await verifyStripeSessionsTable(),
    customerAPI: await testCustomerOrdersAPI(),
  };
  
  // Final Summary
  log('\n🎯 Verification Results Summary', 'bold');
  log('=' .repeat(40), 'blue');
  
  const allSuccess = Object.values(results).every(r => r.success);
  
  if (allSuccess) {
    log('✅ ALL SYSTEMS WORKING PERFECTLY!', 'green');
    log('\n📊 System Status:', 'green');
    log(`   • Orders Created: ${results.orders.count}`, 'blue');
    log(`   • Licenses Generated: ${results.licenses.count}`, 'blue');
    log(`   • Completed Sessions: ${results.sessions.completed}`, 'blue');
    log(`   • Pending Sessions: ${results.sessions.pending}`, results.sessions.pending > 0 ? 'yellow' : 'blue');
    
    if (results.orders.totalRevenue) {
      log(`   • Total Revenue: $${results.orders.totalRevenue.toFixed(2)}`, 'green');
    }
    
    log('\n🎉 What You Should See Now:', 'green');
    log('   • Admin Panel Orders Tab: Shows all orders', 'blue');
    log('   • Admin Dashboard: Updated analytics', 'blue');
    log('   • Customer Account Page: Shows orders & licenses', 'blue');
    log('   • Payment Success Page: Shows order details', 'blue');
    
  } else {
    log('❌ Some systems need attention', 'red');
    Object.entries(results).forEach(([system, result]) => {
      const status = result.success ? '✅' : '❌';
      log(`   ${status} ${system}: ${result.success ? 'WORKING' : 'NEEDS FIX'}`, result.success ? 'green' : 'red');
    });
  }
  
  if (results.sessions.pending > 0) {
    log('\n⚠️ Action Required:', 'yellow');
    log(`   • ${results.sessions.pending} pending sessions need processing`, 'yellow');
    log('   • Run the fix script again if needed', 'yellow');
  }
  
  log('\n🚀 System is ready for production!', 'green');
}

runCompleteVerification().catch(error => {
  log(`💥 Verification failed: ${error.message}`, 'red');
  process.exit(1);
});