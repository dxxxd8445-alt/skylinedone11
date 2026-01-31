const http = require('http');

console.log('🧪 Testing Authentication System...\n');

// Test data
const testUser = {
  email: 'testuser@example.com',
  username: 'testuser123',
  password: 'password123'
};

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAuthSystem() {
  console.log('🔍 Testing Authentication APIs:\n');

  try {
    // Test 1: Sign Up
    console.log('1️⃣ Testing Sign Up...');
    const signupResult = await makeRequest('/api/store-auth/signup', 'POST', testUser);
    console.log(`   Status: ${signupResult.status}`);
    console.log(`   Response: ${JSON.stringify(signupResult.data, null, 2)}`);
    
    if (signupResult.status === 200) {
      console.log('   ✅ Sign up successful!');
    } else if (signupResult.status === 409) {
      console.log('   ℹ️ User already exists, continuing with sign in test...');
    } else {
      console.log('   ❌ Sign up failed');
    }
    console.log('');

    // Test 2: Sign In
    console.log('2️⃣ Testing Sign In...');
    const signinResult = await makeRequest('/api/store-auth/signin', 'POST', {
      email: testUser.email,
      password: testUser.password
    });
    console.log(`   Status: ${signinResult.status}`);
    console.log(`   Response: ${JSON.stringify(signinResult.data, null, 2)}`);
    
    if (signinResult.status === 200) {
      console.log('   ✅ Sign in successful!');
    } else {
      console.log('   ❌ Sign in failed');
    }
    console.log('');

    // Test 3: Get User Profile (requires authentication)
    console.log('3️⃣ Testing User Profile...');
    const profileResult = await makeRequest('/api/store-auth/me', 'GET');
    console.log(`   Status: ${profileResult.status}`);
    console.log(`   Response: ${JSON.stringify(profileResult.data, null, 2)}`);
    
    if (profileResult.status === 200) {
      console.log('   ✅ Profile retrieval successful!');
    } else {
      console.log('   ℹ️ Profile requires authentication (expected if not signed in)');
    }
    console.log('');

    // Test 4: Test Database Connection
    console.log('4️⃣ Testing Database Connection...');
    const dbResult = await makeRequest('/api/test-connection', 'GET');
    console.log(`   Status: ${dbResult.status}`);
    console.log(`   Response: ${JSON.stringify(dbResult.data, null, 2)}`);
    
    if (dbResult.status === 200) {
      console.log('   ✅ Database connection successful!');
    } else {
      console.log('   ❌ Database connection failed');
    }
    console.log('');

    // Test 5: Admin Setup Verification
    console.log('5️⃣ Testing Admin Setup...');
    const adminResult = await makeRequest('/api/admin/verify-setup', 'GET');
    console.log(`   Status: ${adminResult.status}`);
    console.log(`   Response: ${JSON.stringify(adminResult.data, null, 2)}`);
    
    if (adminResult.status === 200) {
      console.log('   ✅ Admin setup verified!');
    } else {
      console.log('   ❌ Admin setup verification failed');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Authentication System Tests...\n');
  
  await testAuthSystem();
  
  console.log('\n📋 Test Summary:');
  console.log('   • Sign Up API tested');
  console.log('   • Sign In API tested');
  console.log('   • User Profile API tested');
  console.log('   • Database connection tested');
  console.log('   • Admin setup verified');
  console.log('\n💡 Next Steps:');
  console.log('   1. Run the FIX_AUTHENTICATION_DATABASE.sql script in Supabase');
  console.log('   2. Check the results above for any failures');
  console.log('   3. Test the sign up/sign in forms on the website');
  console.log('   4. Verify admin dashboard access');
}

runTests().catch(console.error);