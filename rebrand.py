import os
import re

# Define replacements
replacements = {
    'magma-logo.png': 'skyline-logo.png',
    'magma-flame.png': 'skyline-icon.png',
    'Magma Cheats': 'Skyline Cheats',
    'Magma Cheat': 'Skyline Cheat',
    'Magma Store': 'Skyline Store',
    'Magma <': 'Skyline <',
    'magmacheats.com': 'skylinecheats.org',
    'magmacheats.cc': 'skylinecheats.org',
    'discord.gg/magmacheats': 'discord.gg/skylineeggs',
    '@magmacheats': '@skylinecheats',
    '@magma.local': '@skyline.local',
    "provider: 'Magma'": "provider: 'Skyline'",
    "Provider='Magma'": "Provider='Skyline'",
    "site_name='Magma": "site_name='Skyline",
    '#dc2626': '#2563eb',
    '#ef4444': '#3b82f6',
    '#991b1b': '#1e40af',
    'red-600': 'blue-600',
    'red-700': 'blue-700',
    'red-800': 'blue-800',
    'red-500': 'blue-500',
    'red-400': 'blue-400',
}

# File extensions to process
extensions = ('.tsx', '.ts', '.jsx', '.js', '.json', '.md', '.sql', '.txt', '.html', '.css')

# Process files
count = 0
for root, dirs, files in os.walk('.'):
    # Skip node_modules and .git
    dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '.next']]
    
    for file in files:
        if file.endswith(extensions):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                for old, new in replacements.items():
                    content = content.replace(old, new)
                
                if content != original_content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    count += 1
                    print(f'Updated: {filepath}')
            except Exception as e:
                print(f'Error processing {filepath}: {e}')

print(f'\nTotal files updated: {count}')
