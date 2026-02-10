const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Komerza Payment Processor Server...');
console.log('📁 Directory:', __dirname);

// Find npx and next commands
const npxPath = 'npx.cmd';
const nextPath = 'next.cmd';

// Try to find npx in common locations
const possiblePaths = [
  path.join(__dirname, 'node_modules', '.bin', 'npx.cmd'),
  'C:\\Program Files\\nodejs\\npx.cmd',
  'C:\\Program Files (x86)\\nodejs\\npx.cmd'
];

let npxFullPath = npxPath;
for (const possiblePath of possiblePaths) {
  if (fs.existsSync(possiblePath)) {
    npxFullPath = possiblePath;
    break;
  }
}

console.log('🔍 Using npx path:', npxFullPath);

// Start Next.js development server
let devServer;
try {
  devServer = spawn(npxFullPath, ['next', 'dev'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: false,
    env: { ...process.env }
  });
} catch (error) {
  console.error('❌ Failed to spawn npx:', error.message);
  console.log('💡 Trying direct next command...');
  
  // Fallback to direct next command
  try {
    devServer = spawn('next', ['dev'], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: false,
      env: { ...process.env }
    });
  } catch (fallbackError) {
    console.error('❌ Failed to start server:', fallbackError.message);
    process.exit(1);
  }
}

if (devServer) {
  devServer.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  devServer.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  devServer.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Development server started successfully');
      console.log('🌐 Open http://localhost:3000 in your browser');
      console.log('🧪 Test Komerza at: http://localhost:3000/test-komerza');
    } else {
      console.error(`❌ Development server exited with code ${code}`);
    }
  });

  devServer.on('error', (error) => {
    console.error('❌ Failed to start development server:', error);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping development server...');
    if (devServer) {
      devServer.kill('SIGINT');
    }
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Stopping development server...');
    if (devServer) {
      devServer.kill('SIGTERM');
    }
  });
}
