const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = content.replace(/discord\.gg\/ring-0cheats/g, 'discord.gg/ring-0');
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
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
      // Skip node_modules, .git, .next
      if (!['node_modules', '.git', '.next'].includes(file)) {
        walkDirectory(filePath, fileList);
      }
    } else {
      // Process text files
      const ext = path.extname(file);
      if (['.ts', '.tsx', '.js', '.jsx', '.md', '.html', '.json', '.sql'].includes(ext)) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

console.log('🔄 Reverting Discord links from ring-0cheats to ring-0ggs...\n');

const files = walkDirectory('.');
let filesUpdated = 0;
let totalReplacements = 0;

files.forEach(file => {
  if (replaceInFile(file)) {
    filesUpdated++;
    console.log(`✅ Updated: ${file}`);
  }
});

console.log(`\n📊 Summary:`);
console.log(`Files updated: ${filesUpdated}`);
console.log(`\n✅ All Discord links reverted to discord.gg/ring-0`);
