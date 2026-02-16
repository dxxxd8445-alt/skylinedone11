const fs = require('fs');
const path = require('path');

// Rebrand configuration
const replacements = [
  // Brand names
  { from: /Ring-0/gi, to: 'Ring-0' },
  { from: /Ring-0/g, to: 'Ring-0' },
  { from: /RING-0/g, to: 'RING-0' },
  { from: /ring-0/g, to: 'ring-0' },
  
  // Domains
  { from: /ring-0cheats\.org/g, to: 'ring-0.xyz' },
  { from: /ring-0done11/g, to: 'ring-0' },
  
  // Discord links
  { from: /discord\.gg\/ring-0ggs/g, to: 'discord.gg/ring-0' },
  { from: /discord\.gg\/ring-0cheats/g, to: 'discord.gg/ring-0' },
  
  // Email
  { from: /noreply@ring-0cheats\.org/g, to: 'noreply@ring-0.xyz' },
  { from: /support@ring-0cheats\.org/g, to: 'support@ring-0.xyz' },
  
  // Blue colors to grey/white
  { from: /#6b7280/g, to: '#6b7280' }, // Blue to grey-500
  { from: /#9ca3af/g, to: '#9ca3af' }, // Blue to grey-400
  { from: /#4b5563/g, to: '#4b5563' }, // Dark blue to grey-600
  { from: /#d1d5db/g, to: '#d1d5db' }, // Light blue to grey-300
  { from: /bg-gray-/g, to: 'bg-gray-' },
  { from: /text-gray-/g, to: 'text-gray-' },
  { from: /border-gray-/g, to: 'border-gray-' },
  { from: /hover:bg-gray-/g, to: 'hover:bg-gray-' },
  { from: /hover:text-gray-/g, to: 'hover:text-gray-' },
  { from: /from-gray-/g, to: 'from-gray-' },
  { from: /to-gray-/g, to: 'to-gray-' },
];

function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    replacements.forEach(({ from, to }) => {
      if (content.match(from)) {
        content = content.replace(from, to);
        modified = true;
      }
    });
    
    if (modified) {
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
      if (['.ts', '.tsx', '.js', '.jsx', '.md', '.html', '.json', '.css', '.sql'].includes(ext)) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

console.log('🔄 Rebranding to Ring-0...\n');

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
console.log(`\n✅ Rebrand to Ring-0 complete!`);
