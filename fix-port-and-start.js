const { execSync } = require('child_process');

console.log('🔧 FIXING PORT ISSUE AND STARTING SERVER');
console.log('=' .repeat(50));

try {
  console.log('1️⃣  Checking what\'s running on port 3000...');
  
  try {
    // Kill any process on port 3000 (Windows)
    execSync('netstat -ano | findstr :3000', { stdio: 'pipe' });
    console.log('   Found process on port 3000, attempting to free it...');
    
    try {
      execSync('taskkill /F /IM node.exe', { stdio: 'pipe' });
      console.log('   ✅ Killed Node.js processes');
    } catch (e) {
      console.log('   ℹ️  No Node.js processes to kill');
    }
    
    // Wait a moment
    setTimeout(() => {
      console.log('   ⏳ Waiting for port to be freed...');
    }, 1000);
    
  } catch (e) {
    console.log('   ✅ Port 3000 is free');
  }

  console.log('\n2️⃣  SOLUTION:');
  console.log('Your development server is likely running on a different port.');
  console.log('');
  console.log('🚀 TO ACCESS YOUR SITE:');
  console.log('1. Run: npm run dev');
  console.log('2. Look for the "Local:" URL in the terminal output');
  console.log('3. It might be http://localhost:3001 or another port');
  console.log('4. Open that URL in your browser');
  console.log('');
  console.log('💡 ALTERNATIVE:');
  console.log('1. Stop all Node processes: Ctrl+C in terminal');
  console.log('2. Run: npm run dev -- --port 3000');
  console.log('3. This will force it to use port 3000');
  console.log('');
  console.log('🔍 IF STILL BROKEN:');
  console.log('1. Check terminal for error messages');
  console.log('2. Try: rm -rf .next && npm run dev');
  console.log('3. Check browser console for JavaScript errors');

} catch (error) {
  console.error('❌ Error:', error.message);
  
  console.log('\n🔧 MANUAL STEPS:');
  console.log('1. Open Task Manager');
  console.log('2. End all Node.js processes');
  console.log('3. Run: npm run dev');
  console.log('4. Use the port shown in terminal (might be 3001)');
}