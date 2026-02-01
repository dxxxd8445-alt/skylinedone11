require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

console.log('🔍 DIAGNOSING LOCALHOST INTERNAL SERVER ERROR');
console.log('=' .repeat(60));
console.log('Checking for common issues that cause server errors...\n');

async function diagnoseLiveServerError() {
  try {
    // 1. Check environment variables
    console.log('1️⃣  CHECKING ENVIRONMENT VARIABLES');
    console.log('-'.repeat(40));
    
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];
    
    let envIssues = [];
    
    requiredEnvVars.forEach(envVar => {
      if (process.env[envVar]) {
        console.log(`✅ ${envVar}: Set`);
      } else {
        console.log(`❌ ${envVar}: Missing`);
        envIssues.push(envVar);
      }
    });
    
    if (envIssues.length > 0) {
      console.log(`\n⚠️  Missing environment variables: ${envIssues.join(', ')}`);
      console.log('🔧 Check your .env.local file');
    } else {
      console.log('\n✅ All required environment variables are set');
    }

    // 2. Test Supabase connection
    console.log('\n2️⃣  TESTING SUPABASE CONNECTION');
    console.log('-'.repeat(40));
    
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        // Test basic connection
        const { data, error } = await supabase
          .from('products')
          .select('id')
          .limit(1);
        
        if (error) {
          console.log('❌ Supabase connection failed:', error.message);
          console.log('🔧 Check your Supabase credentials and database setup');
        } else {
          console.log('✅ Supabase connection working');
        }
      } catch (e) {
        console.log('❌ Supabase connection error:', e.message);
      }
    } else {
      console.log('⚠️  Cannot test Supabase - missing credentials');
    }

    // 3. Check for database schema issues
    console.log('\n3️⃣  CHECKING DATABASE SCHEMA');
    console.log('-'.repeat(40));
    
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        // Test orders table schema
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('customer_name, currency')
          .limit(1);
        
        if (ordersError) {
          console.log('❌ Orders table schema issue:', ordersError.message);
          console.log('🔧 Run the SQL fix: ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;');
          console.log('🔧 Run the SQL fix: ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT \'USD\';');
        } else {
          console.log('✅ Orders table schema looks good');
        }
        
        // Test other critical tables
        const tables = ['products', 'licenses', 'coupons'];
        for (const table of tables) {
          const { error } = await supabase.from(table).select('id').limit(1);
          if (error) {
            console.log(`❌ ${table} table issue:`, error.message);
          } else {
            console.log(`✅ ${table} table accessible`);
          }
        }
        
      } catch (e) {
        console.log('❌ Database schema check failed:', e.message);
      }
    }

    // 4. Check for file syntax errors
    console.log('\n4️⃣  CHECKING FOR SYNTAX ERRORS');
    console.log('-'.repeat(40));
    
    const criticalFiles = [
      'app/page.tsx',
      'app/layout.tsx',
      'components/header.tsx',
      'components/terms-popup.tsx',
      'lib/supabase/client.ts',
      'lib/supabase/server.ts'
    ];
    
    let syntaxIssues = [];
    
    criticalFiles.forEach(file => {
      if (fs.existsSync(file)) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          // Basic syntax checks
          if (content.includes('export default') || content.includes('export function')) {
            console.log(`✅ ${file}: Syntax looks good`);
          } else {
            console.log(`⚠️  ${file}: No exports found (might be issue)`);
          }
        } catch (e) {
          console.log(`❌ ${file}: Cannot read file`);
          syntaxIssues.push(file);
        }
      } else {
        console.log(`❌ ${file}: File not found`);
        syntaxIssues.push(file);
      }
    });

    // 5. Check Next.js configuration
    console.log('\n5️⃣  CHECKING NEXT.JS CONFIGURATION');
    console.log('-'.repeat(40));
    
    if (fs.existsSync('next.config.mjs')) {
      console.log('✅ next.config.mjs found');
    } else if (fs.existsSync('next.config.js')) {
      console.log('✅ next.config.js found');
    } else {
      console.log('⚠️  No Next.js config file found');
    }
    
    if (fs.existsSync('package.json')) {
      console.log('✅ package.json found');
      try {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (pkg.scripts && pkg.scripts.dev) {
          console.log('✅ Dev script configured');
        } else {
          console.log('❌ No dev script in package.json');
        }
      } catch (e) {
        console.log('❌ package.json syntax error');
      }
    } else {
      console.log('❌ package.json not found');
    }

    // 6. Provide solutions
    console.log('\n🔧 COMMON SOLUTIONS FOR INTERNAL SERVER ERROR');
    console.log('=' .repeat(60));
    
    console.log('\n📋 STEP-BY-STEP FIX:');
    console.log('1. Stop the development server (Ctrl+C)');
    console.log('2. Run: npm install (to ensure all dependencies)');
    console.log('3. Check .env.local file has correct Supabase credentials');
    console.log('4. Run the database schema fix in Supabase SQL Editor:');
    console.log('   ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;');
    console.log('   ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT \'USD\';');
    console.log('5. Clear Next.js cache: rm -rf .next');
    console.log('6. Restart server: npm run dev');
    
    console.log('\n🚨 IF STILL BROKEN:');
    console.log('1. Check terminal for specific error messages');
    console.log('2. Look at browser console for JavaScript errors');
    console.log('3. Check Supabase dashboard for database issues');
    console.log('4. Verify all environment variables are correct');
    
    console.log('\n📱 QUICK TEST COMMANDS:');
    console.log('• Test database: node test-complete-system-after-fixes.js');
    console.log('• Verify setup: node verify-all-systems-working.js');
    console.log('• Check build: npm run build');

  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
    console.log('\n🔧 MANUAL TROUBLESHOOTING:');
    console.log('1. Check your terminal for error messages');
    console.log('2. Verify .env.local file exists and has correct values');
    console.log('3. Run: npm install && npm run dev');
    console.log('4. Check browser console for JavaScript errors');
  }
}

// Run diagnosis
diagnoseLiveServerError();