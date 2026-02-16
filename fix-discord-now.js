const fs = require('fs');

// Fix guides-data.ts
console.log('Fixing lib/guides-data.ts...');
let guidesData = fs.readFileSync('lib/guides-data.ts', 'utf8');
guidesData = guidesData.replace(/https:\/\/discord\.gg\/ring-0ggs/g, 'https://discord.gg/ring-0');
guidesData = guidesData.replace(/discord\.gg\/ring-0ggs/g, 'discord.gg/ring-0');
fs.writeFileSync('lib/guides-data.ts', guidesData, 'utf8');
console.log('✓ Fixed lib/guides-data.ts');

// Fix components/faq.tsx
console.log('Fixing components/faq.tsx...');
let faq = fs.readFileSync('components/faq.tsx', 'utf8');
faq = faq.replace(/https:\/\/discord\.gg\/ring-0ggs/g, 'https://discord.gg/ring-0');
fs.writeFileSync('components/faq.tsx', faq, 'utf8');
console.log('✓ Fixed components/faq.tsx');

// Fix components/crypto-payment-modal.tsx
console.log('Fixing components/crypto-payment-modal.tsx...');
let crypto = fs.readFileSync('components/crypto-payment-modal.tsx', 'utf8');
crypto = crypto.replace(/https:\/\/discord\.gg\/ring-0ggs/g, 'https://discord.gg/ring-0');
fs.writeFileSync('components/crypto-payment-modal.tsx', crypto, 'utf8');
console.log('✓ Fixed components/crypto-payment-modal.tsx');

// Fix components/header-fixed.tsx
console.log('Fixing components/header-fixed.tsx...');
let headerFixed = fs.readFileSync('components/header-fixed.tsx', 'utf8');
headerFixed = headerFixed.replace(/https:\/\/discord\.gg\/ring-0ggs/g, 'https://discord.gg/ring-0');
fs.writeFileSync('components/header-fixed.tsx', headerFixed, 'utf8');
console.log('✓ Fixed components/header-fixed.tsx');

// Fix components/header.tsx
console.log('Fixing components/header.tsx...');
let header = fs.readFileSync('components/header.tsx', 'utf8');
header = header.replace(/https:\/\/discord\.gg\/ring-0ggs/g, 'https://discord.gg/ring-0');
fs.writeFileSync('components/header.tsx', header, 'utf8');
console.log('✓ Fixed components/header.tsx');

// Fix components/footer.tsx
console.log('Fixing components/footer.tsx...');
let footer = fs.readFileSync('components/footer.tsx', 'utf8');
footer = footer.replace(/https:\/\/discord\.gg\/ring-0ggs/g, 'https://discord.gg/ring-0');
fs.writeFileSync('components/footer.tsx', footer, 'utf8');
console.log('✓ Fixed components/footer.tsx');

// Fix app/status/page.tsx
console.log('Fixing app/status/page.tsx...');
let status = fs.readFileSync('app/status/page.tsx', 'utf8');
status = status.replace(/https:\/\/discord\.gg\/ring-0ggs/g, 'https://discord.gg/ring-0');
fs.writeFileSync('app/status/page.tsx', status, 'utf8');
console.log('✓ Fixed app/status/page.tsx');

// Fix app/mobile-auth/page.tsx
console.log('Fixing app/mobile-auth/page.tsx...');
let mobileAuth = fs.readFileSync('app/mobile-auth/page.tsx', 'utf8');
mobileAuth = mobileAuth.replace(/https:\/\/discord\.gg\/ring-0ggs/g, 'https://discord.gg/ring-0');
fs.writeFileSync('app/mobile-auth/page.tsx', mobileAuth, 'utf8');
console.log('✓ Fixed app/mobile-auth/page.tsx');

// Fix MANUAL_EMAIL_TEMPLATE.html
console.log('Fixing MANUAL_EMAIL_TEMPLATE.html...');
let emailTemplate = fs.readFileSync('MANUAL_EMAIL_TEMPLATE.html', 'utf8');
emailTemplate = emailTemplate.replace(/https:\/\/discord\.gg\/ring-0ggs/g, 'https://discord.gg/ring-0');
fs.writeFileSync('MANUAL_EMAIL_TEMPLATE.html', emailTemplate, 'utf8');
console.log('✓ Fixed MANUAL_EMAIL_TEMPLATE.html');

console.log('\n✅ All Discord links fixed to https://discord.gg/ring-0');
