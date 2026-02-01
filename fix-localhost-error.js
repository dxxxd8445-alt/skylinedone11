const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 FIXING LOCALHOST INTERNAL SERVER ERROR');
console.log('=' .repeat(50));

try {
  console.log('1️⃣  Clearing Next.js cache...');
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
    console.log('✅ .next directory cleared');
  } else {
    console.log('ℹ️  .next directory not found (already clean)');
  }

  console.log('\n2️⃣  Checking node_modules...');
  if (fs.existsSync('node_modules')) {
    console.log('✅ node_modules exists');
  } else {
    console.log('⚠️  node_modules missing - run npm install');
  }

  console.log('\n3️⃣  Checking critical files...');
  const criticalFiles = [
    '.env.local',
    'package.json',
    'next.config.mjs',
    'app/layout.tsx',
    'app/page.tsx'
  ];

  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
    }
  });

  console.log('\n4️⃣  Checking environment file...');
  if (fs.existsSync('.env.local')) {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    requiredVars.forEach(varName => {
      if (envContent.includes(varName)) {
        console.log(`✅ ${varName} found in .env.local`);
      } else {
        console.log(`❌ ${varName} missing from .env.local`);
      }
    });
  }

  console.log('\n🚀 NEXT STEPS TO FIX:');
  console.log('1. Stop your dev server (Ctrl+C in terminal)');
  console.log('2. Run: npm install');
  console.log('3. Run: npm run dev');
  console.log('4. If still broken, check terminal for specific error messages');
  
  console.log('\n💡 COMMON FIXES:');
  console.log('• Database issue: Run the SQL fix in Supabase');
  console.log('• Port issue: Try npm run dev -- --port 3001');
  console.log('• Cache issue: Delete .next folder and restart');
  console.log('• Dependencies: Run npm install --force');

} catch (error) {
  console.error('❌ Fix script error:', error.message);
  console.log('\n🔧 MANUAL STEPS:');
  console.log('1. Delete .next folder manually');
  console.log('2. Run npm install');
  console.log('3. Check .env.local file');
  console.log('4. Run npm run dev');
}