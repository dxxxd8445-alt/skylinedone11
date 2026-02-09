const fs = require('fs');
const path = require('path');

// Files that need UTF-8 fixing
const filesToFix = [
  './magma src/app/mgmt-x9k2m7/team/page.tsx',
  './magma src/lib/discord-webhook.ts',
];

let totalFixed = 0;

filesToFix.forEach(filePath => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    // Replace common problematic characters
    let fixed = content
      .replace(/•/g, '-')  // Replace • with dash
      .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, ''); // Remove control characters
    
    if (content !== fixed) {
      fs.writeFileSync(filePath, fixed, 'utf8');
      console.log(`✅ Fixed UTF-8 encoding in ${filePath}`);
      totalFixed++;
    } else {
      console.log(`✓  No issues found in ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Complete! Fixed ${totalFixed} file(s)`);
