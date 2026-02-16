const fs = require('fs');
const path = require('path');

// Correct Discord link (with ZERO not O)
const CORRECT_DISCORD = 'https://discord.gg/ring-0';

// Wrong patterns to fix
const WRONG_PATTERNS = [
  /https:\/\/discord\.gg\/ring-0ggs/g,
  /discord\.gg\/ring-0ggs/g,
  /https:\/\/disocord\.gg\/ring-0/g,  // typo: disocord
  /disocord\.gg\/ring-0/g,
];

// File extensions to process
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.md', '.html', '.sql', '.txt', '.json'];

function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  return EXTENSIONS.includes(ext);
}

function fixDiscordLinks(directory) {
  let totalReplacements = 0;
  let filesModified = 0;

  function processDirectory(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      // Skip node_modules, .next, .git
      if (stat.isDirectory()) {
        if (!['node_modules', '.next', '.git'].includes(item)) {
          processDirectory(fullPath);
        }
        continue;
      }

      if (!shouldProcessFile(fullPath)) continue;

      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        let modified = false;
        let fileReplacements = 0;

        // Apply all wrong patterns
        WRONG_PATTERNS.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            fileReplacements += matches.length;
            modified = true;
            // Replace with correct link (preserve https:// if present)
            if (pattern.source.includes('https')) {
              content = content.replace(pattern, CORRECT_DISCORD);
            } else {
              content = content.replace(pattern, 'discord.gg/ring-0');
            }
          }
        });

        if (modified) {
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`✅ Fixed ${fileReplacements} link(s) in: ${fullPath}`);
          totalReplacements += fileReplacements;
          filesModified++;
        }
      } catch (err) {
        console.error(`❌ Error processing ${fullPath}:`, err.message);
      }
    }
  }

  processDirectory(directory);

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Discord Link Fix Complete!`);
  console.log(`   Files Modified: ${filesModified}`);
  console.log(`   Total Replacements: ${totalReplacements}`);
  console.log(`   Correct Link: ${CORRECT_DISCORD}`);
  console.log('='.repeat(60));
}

// Run from current directory
fixDiscordLinks('.');
