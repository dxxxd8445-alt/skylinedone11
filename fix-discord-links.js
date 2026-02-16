const fs = require('fs');
const path = require('path');

const CORRECT_DISCORD = 'https://discord.gg/ring-0';
const WRONG_PATTERNS = [
  'https://discord.gg/skylineggs',
  'https://discord.gg/skylinecheats',
  'https://discord.gg/ring-0',
  'discord.gg/skylineggs',
  'discord.gg/skylinecheats',
  'discord.gg/ring-0'
];

function fixDiscordLinks(dir) {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    // Skip node_modules, .next, .git
    if (file === 'node_modules' || file === '.next' || file === '.git') {
      return;
    }

    if (stat.isDirectory()) {
      fixedCount += fixDiscordLinks(filePath);
    } else if (stat.isFile()) {
      // Process text files
      const ext = path.extname(file);
      if (['.tsx', '.ts', '.jsx', '.js', '.md', '.html', '.json', '.sql', '.txt'].includes(ext)) {
        try {
          let content = fs.readFileSync(filePath, 'utf8');
          let modified = false;

          WRONG_PATTERNS.forEach(pattern => {
            if (content.includes(pattern)) {
              const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
              content = content.replace(regex, CORRECT_DISCORD);
              modified = true;
            }
          });

          if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✓ Fixed: ${filePath}`);
            fixedCount++;
          }
        } catch (err) {
          // Skip files that can't be read as text
        }
      }
    }
  });

  return fixedCount;
}

console.log('Fixing Discord invite links to: ' + CORRECT_DISCORD);
console.log('Starting...\n');

const fixed = fixDiscordLinks('.');
console.log(`\n✓ Complete! Fixed ${fixed} files`);
