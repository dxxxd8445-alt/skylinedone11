const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = content.replace(/discord\.gg\/skylineggsu/g, 'discord.gg/skylineggs');
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      const count = (content.match(/discord\.gg\/skylineggsu/g) || []).length;
      console.log(`✅ Updated ${filePath} (${count} replacements)`);
      return count;
    }
    return 0;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

function walkDirectory(dir, extensions) {
  let filesUpdated = 0;
  let totalReplacements = 0;
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .next, .git
      if (file === 'node_modules' || file === '.next' || file === '.git') {
        continue;
      }
      const result = walkDirectory(filePath, extensions);
      filesUpdated += result.filesUpdated;
      totalReplacements += result.totalReplacements;
    } else if (stat.isFile()) {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        const count = replaceInFile(filePath);
        if (count > 0) {
          filesUpdated++;
          totalReplacements += count;
        }
      }
    }
  }
  
  return { filesUpdated, totalReplacements };
}

console.log('🔄 Updating Discord links from skylineggsu to skylineggs...\n');

const extensions = ['.tsx', '.ts', '.js', '.jsx', '.md'];
const result = walkDirectory('.', extensions);

console.log(`\n🎉 Complete!`);
console.log(`Files updated: ${result.filesUpdated}`);
console.log(`Total replacements: ${result.totalReplacements}`);
console.log(`\n✅ All Discord links updated to discord.gg/skylineggs`);
