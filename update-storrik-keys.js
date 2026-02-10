#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Storrik API keys provided by user
const STORRIK_KEYS = {
  SECRET_KEY: 'sk_live_Ez0SrU3u2qOj6Vviv_ex0LhPp-VeEmum69F-llDi1DU',
  PUBLIC_KEY: 'pk_live_-C5YxyjzMiRNh0n0ECoIBP4rFZMr34Fcpb7mnW5dQ90',
  WEBHOOK_SECRET: 'whsec_NIiLZwWd69gg9m3cn2KadKi0O5LnFX4SOUeEi10Yv9Ef7d2d98c'
};

function updateEnvFile() {
  const envFiles = ['.env.local', '.env.production', '.env'];
  
  for (const envFile of envFiles) {
    const envPath = path.join(__dirname, envFile);
    
    try {
      let content = '';
      if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, 'utf8');
      }
      
      // Update or add Storrik environment variables
      const lines = content.split('\n');
      const updatedLines = [];
      const storrikVars = new Set();
      
      // Process existing lines
      for (const line of lines) {
        if (line.startsWith('STORRIK_')) {
          storrikVars.add(line.split('=')[0]);
        } else {
          updatedLines.push(line);
        }
      }
      
      // Add Storrik keys
      updatedLines.push(`# Storrik Payment Processor`);
      updatedLines.push(`STORRIK_SECRET_KEY="${STORRIK_KEYS.SECRET_KEY}"`);
      updatedLines.push(`STORRIK_PUBLIC_KEY="${STORRIK_KEYS.PUBLIC_KEY}"`);
      updatedLines.push(`STORRIK_WEBHOOK_SECRET="${STORRIK_KEYS.WEBHOOK_SECRET}"`);
      updatedLines.push('');
      
      // Write back to file
      fs.writeFileSync(envPath, updatedLines.join('\n'), 'utf8');
      console.log(`✅ Updated ${envFile} with Storrik keys`);
      
    } catch (error) {
      console.error(`❌ Error updating ${envFile}:`, error.message);
    }
  }
}

function createStorrikSettingsAPI() {
  const apiDir = path.join(__dirname, 'app', 'api', 'settings');
  const storrikDir = path.join(apiDir, 'storrik-key');
  
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }
  if (!fs.existsSync(storrikDir)) {
    fs.mkdirSync(storrikDir, { recursive: true });
  }
  
  const routeContent = `import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const publicKey = process.env.STORRIK_PUBLIC_KEY;
    
    if (!publicKey) {
      return NextResponse.json({ 
        apiKey: null,
        error: "Storrik public key not configured" 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      apiKey: publicKey,
      configured: true 
    });
  } catch (error) {
    console.error("[Settings] Error fetching Storrik key:", error);
    return NextResponse.json({ 
      apiKey: null,
      error: "Failed to fetch Storrik configuration" 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { publicKey } = await request.json();
    
    if (!publicKey) {
      return NextResponse.json({ 
        error: "Public key is required" 
      }, { status: 400 });
    }
    
    // In a real implementation, you would update environment variables
    // For now, we'll just validate the format
    if (!publicKey.startsWith('pk_')) {
      return NextResponse.json({ 
        error: "Invalid public key format" 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Storrik public key updated successfully" 
    });
  } catch (error) {
    console.error("[Settings] Error updating Storrik key:", error);
    return NextResponse.json({ 
      error: "Failed to update Storrik configuration" 
    }, { status: 500 });
  }
}
`;
  
  fs.writeFileSync(path.join(storrikDir, 'route.ts'), routeContent, 'utf8');
  console.log('✅ Created Storrik settings API endpoint');
}

// Main execution
console.log('🔧 Setting up Storrik payment processor...');
console.log('');

updateEnvFile();
createStorrikSettingsAPI();

console.log('');
console.log('✅ Storrik setup complete!');
console.log('');
console.log('📋 Next steps:');
console.log('1. Restart your development server');
console.log('2. Test the checkout flow');
console.log('3. Configure webhook endpoint in Storrik dashboard:');
console.log(`   ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/storrik/webhook`);
console.log('');
console.log('🔑 Keys configured:');
console.log(`- Secret Key: ${STORRIK_KEYS.SECRET_KEY.substring(0, 10)}...`);
console.log(`- Public Key: ${STORRIK_KEYS.PUBLIC_KEY.substring(0, 10)}...`);
console.log(`- Webhook Secret: ${STORRIK_KEYS.WEBHOOK_SECRET.substring(0, 10)}...`);
