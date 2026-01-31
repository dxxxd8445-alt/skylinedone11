const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bcjzfqvomwtuyznnlxha.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjanpmcXZvbXd0dXl6bm5seGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3MDU1NSwiZXhwIjoyMDg1NDQ2NTU1fQ.1gp_MzZ1cU2ec4a2PwinO7wNr6I3YXz6wGHhSuORpvk';

const supabase = createClient(supabaseUrl, serviceKey);

async function checkProductTables() {
  console.log('🔍 Checking Product-Related Tables...\n');

  try {
    // Check if products table exists
    console.log('1. Checking products table...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (productsError) {
      console.error('❌ Products table error:', productsError.message);
    } else {
      console.log('✅ Products table exists');
    }

    // Check if product_pricing table exists
    console.log('\n2. Checking product_pricing table...');
    const { data: pricing, error: pricingError } = await supabase
      .from('product_pricing')
      .select('*')
      .limit(1);

    if (pricingError) {
      console.error('❌ Product_pricing table error:', pricingError.message);
      console.log('   This table needs to be created for variants to work');
    } else {
      console.log('✅ Product_pricing table exists');
    }

    // Check if product_variants table exists (alternative name)
    console.log('\n3. Checking product_variants table...');
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('*')
      .limit(1);

    if (variantsError) {
      console.error('❌ Product_variants table error:', variantsError.message);
    } else {
      console.log('✅ Product_variants table exists');
    }

    // List all tables to see what's available
    console.log('\n4. Attempting to list all tables...');
    
    // Try to get table information from information_schema
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_names')
      .catch(() => ({ data: null, error: { message: 'RPC not available' } }));

    if (tablesError) {
      console.log('❌ Could not list tables:', tablesError.message);
    } else {
      console.log('✅ Available tables:', tables);
    }

    console.log('\n📋 DIAGNOSIS:');
    console.log('   The variant functionality requires a product_pricing table');
    console.log('   This table stores duration and price information for each product');
    console.log('   Without this table, the "Add variant" button will not work');

  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

checkProductTables();