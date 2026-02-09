const fs = require('fs');

// Read the file as binary
const filePath = './magma src/app/mgmt-x9k2m7/team/page.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// Replace common problematic characters
let fixed = content
  .replace(/•/g, '-')  // Replace • with dash
  .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, ''); // Remove control characters

// Write back
fs.writeFileSync(filePath, fixed, 'utf8');

console.log('✅ Fixed UTF-8 encoding issues in team/page.tsx');
