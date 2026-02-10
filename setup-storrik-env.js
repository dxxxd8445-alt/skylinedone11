const fs = require('fs');
const path = require('path');

// Storrik API keys
const STORRIK_KEYS = {
  SECRET_KEY: 'sk_live_Ez0SrU3u2qOj6Vviv_ex0LhPp-VeEmum69F-llDi1DU',
  PUBLIC_KEY: 'pk_live_-C5YxyjzMiRNh0n0ECoIBP4rFZMr34Fcpb7mnW5dQ90',
  WEBHOOK_SECRET: 'whsec_NIiLZwWd69gg9m3cn2KadKi0O5LnFX4SOUeEi10Yv9Ef7d2d98c'
};

console.log('🔧 Setting up Storrik environment variables...');

// Create .env.local file
const envPath = path.join(__dirname, '.env.local');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Remove existing Storrik variables
const lines = envContent.split('\n').filter(line => !line.startsWith('STORRIK_'));

// Add Storrik variables
lines.push('# Storrik Payment Processor');
lines.push(`STORRIK_SECRET_KEY="${STORRIK_KEYS.SECRET_KEY}"`);
lines.push(`STORRIK_PUBLIC_KEY="${STORRIK_KEYS.PUBLIC_KEY}"`);
lines.push(`STORRIK_WEBHOOK_SECRET="${STORRIK_KEYS.WEBHOOK_SECRET}"`);
lines.push('');

fs.writeFileSync(envPath, lines.join('\n'), 'utf8');

console.log('✅ Environment variables updated in .env.local');
console.log('');
console.log('📋 Environment variables set:');
console.log(`- STORRIK_SECRET_KEY=${STORRIK_KEYS.SECRET_KEY.substring(0, 15)}...`);
console.log(`- STORRIK_PUBLIC_KEY=${STORRIK_KEYS.PUBLIC_KEY.substring(0, 15)}...`);
console.log(`- STORRIK_WEBHOOK_SECRET=${STORRIK_KEYS.WEBHOOK_SECRET.substring(0, 15)}...`);
console.log('');
console.log('🔄 Please restart your development server to load the new environment variables.');
console.log('');
console.log('🌐 Webhook URL for Storrik dashboard:');
console.log(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/storrik/webhook`);
