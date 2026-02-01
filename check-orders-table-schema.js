#!/usr/bin/env node

/**
 * Check Orders Table Schema
 * Inspects the actual structure of the orders table
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

async function checkTableSchema() {
  log('🔍 Checking Orders Table Schema', 'bold');
  log('=' .repeat(50), 'blue');
  
  try {
    // Try to get a sample record to see the actual structure
    log('\n📋 Fetching sample order record...', 'blue');
    
    const { data: sampleOrder, error: sampleError } = await supabase
      .from('orders')
      .select('*')
      .limit(1)
      .single();
    
    if (sampleError && sampleError.code !== 'PGRST116') { // PGRST116 = no rows found
      log(`❌ Error fetching sample: ${sampleError.message}`, 'red');
    } else if (sampleOrder) {
      log('✅ Found sample order record:', 'green');
      log('📋 Available columns:', 'yellow');
      Object.keys(sampleOrder).forEach(key => {
        log(`   • ${key}: ${typeof sampleOrder[key]} = ${sampleOrder[key]}`, 'blue');
      });
    } else {
      log('⚠️ No existing orders found', 'yellow');
    }
    
    // Try to insert a test record to see what columns are expected
    log('\n🧪 Testing insert to discover required columns...', 'blue');
    
    const testOrder = {
      order_number: 'TEST-2026-SCHEMA',
      customer_email: 'test@schema.com',
      product_name: 'Test Product',
      duration: '24 Hours',
      status: 'pending',
      payment_method: 'test',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('orders')
      .insert(testOrder)
      .select()
      .single();
    
    if (insertError) {
      log(`❌ Insert failed: ${insertError.message}`, 'red');
      log('📋 This tells us about missing required columns', 'yellow');
    } else {
      log('✅ Test insert successful!', 'green');
      log('📋 Inserted record structure:', 'yellow');
      Object.keys(insertResult).forEach(key => {
        log(`   • ${key}: ${typeof insertResult[key]} = ${insertResult[key]}`, 'blue');
      });
      
      // Clean up test record
      await supabase
        .from('orders')
        .delete()
        .eq('order_number', 'TEST-2026-SCHEMA');
      log('🧹 Test record cleaned up', 'reset');
    }
    
  } catch (error) {
    log(`💥 Schema check failed: ${error.message}`, 'red');
  }
}

async function checkLicensesSchema() {
  log('\n🔍 Checking Licenses Table Schema', 'bold');
  log('=' .repeat(50), 'blue');
  
  try {
    // Try to get a sample record
    const { data: sampleLicense, error: sampleError } = await supabase
      .from('licenses')
      .select('*')
      .limit(1)
      .single();
    
    if (sampleError && sampleError.code !== 'PGRST116') {
      log(`❌ Error fetching sample: ${sampleError.message}`, 'red');
    } else if (sampleLicense) {
      log('✅ Found sample license record:', 'green');
      log('📋 Available columns:', 'yellow');
      Object.keys(sampleLicense).forEach(key => {
        log(`   • ${key}: ${typeof sampleLicense[key]} = ${sampleLicense[key]}`, 'blue');
      });
    } else {
      log('⚠️ No existing licenses found', 'yellow');
    }
    
    // Test insert
    const testLicense = {
      license_key: 'TEST-SCHEMA-KEY',
      product_name: 'Test Product',
      customer_email: 'test@schema.com',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('licenses')
      .insert(testLicense)
      .select()
      .single();
    
    if (insertError) {
      log(`❌ Insert failed: ${insertError.message}`, 'red');
    } else {
      log('✅ Test insert successful!', 'green');
      log('📋 Inserted record structure:', 'yellow');
      Object.keys(insertResult).forEach(key => {
        log(`   • ${key}: ${typeof insertResult[key]} = ${insertResult[key]}`, 'blue');
      });
      
      // Clean up
      await supabase
        .from('licenses')
        .delete()
        .eq('license_key', 'TEST-SCHEMA-KEY');
      log('🧹 Test record cleaned up', 'reset');
    }
    
  } catch (error) {
    log(`💥 Licenses schema check failed: ${error.message}`, 'red');
  }
}

async function runSchemaCheck() {
  await checkTableSchema();
  await checkLicensesSchema();
  
  log('\n📋 Schema Analysis Complete', 'bold');
  log('=' .repeat(40), 'blue');
  log('Now we know exactly what columns exist and can create orders properly!', 'green');
}

runSchemaCheck().catch(error => {
  log(`💥 Schema check failed: ${error.message}`, 'red');
  process.exit(1);
});