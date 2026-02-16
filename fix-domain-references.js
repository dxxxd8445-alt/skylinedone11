const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    // Replace ring-0cheats.org with ring-0.xyz
    content = content.replace(/ring-0cheats\.org/g, 'ring-0.xyz');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function walkDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', '.next'].includes(file)) {
        walkDirectory(filePath, fileList);
      }
    } else {
      const ext = path.extname(file);
      if (['.ts', '.tsx', '.js', '.jsx', '.md', '.html', '.json', '.sql'].includes(ext)) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

console.log('🔄 Fixing domain references...\n');

const files = walkDirectory('.');
let filesUpdated = 0;

files.forEach(file => {
  if (replaceInFile(file)) {
    filesUpdated++;
    console.log(`✅ Updated: ${file}`);
  }
});

console.log(`\n📊 Summary:`);
console.log(`Files updated: ${filesUpdated}`);
console.log(`\n✅ All domain references fixed!`);
