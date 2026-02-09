const fs = require('fs');
const path = require('path');

function walkDirectory(dir, extensions) {
  let filesFixed = 0;
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .next, .git
      if (file === 'node_modules' || file === '.next' || file === '.git') {
        continue;
      }
      filesFixed += walkDirectory(filePath, extensions);
    } else if (stat.isFile()) {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Replace problematic UTF-8 characters
          let fixed = content
            .replace(/•/g, '•')  // Replace • with bullet point
            .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, ''); // Remove control characters
          
          if (content !== fixed) {
            fs.writeFileSync(filePath, fixed, 'utf8');
            console.log(`✅ Fixed ${filePath}`);
            filesFixed++;
          }
        } catch (error) {
          console.error(`❌ Error processing ${filePath}:`, error.message);
        }
      }
    }
  }
  
  return filesFixed;
}

console.log('🔄 Scanning for UTF-8 encoding issues...\n');

const extensions = ['.tsx', '.ts', '.js', '.jsx'];
const filesFixed = walkDirectory('.', extensions);

console.log(`\n🎉 Complete! Fixed ${filesFixed} file(s)`);
