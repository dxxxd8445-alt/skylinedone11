import os
import re

def replace_discord_links(directory):
    """Replace discord.gg/skylineggsu with discord.gg/skylineggs in all files"""
    
    # File extensions to process
    extensions = ['.tsx', '.ts', '.js', '.jsx', '.md']
    
    files_updated = 0
    total_replacements = 0
    
    for root, dirs, files in os.walk(directory):
        # Skip node_modules and .next directories
        if 'node_modules' in root or '.next' in root or '.git' in root:
            continue
            
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                file_path = os.path.join(root, file)
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Replace the Discord link
                    new_content = content.replace('discord.gg/skylineggsu', 'discord.gg/skylineggs')
                    
                    # Count replacements in this file
                    replacements = content.count('discord.gg/skylineggsu')
                    
                    if replacements > 0:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        
                        files_updated += 1
                        total_replacements += replacements
                        print(f"✅ Updated {file_path} ({replacements} replacements)")
                
                except Exception as e:
                    print(f"❌ Error processing {file_path}: {e}")
    
    print(f"\n🎉 Complete!")
    print(f"Files updated: {files_updated}")
    print(f"Total replacements: {total_replacements}")

if __name__ == "__main__":
    # Run from the magma src directory
    replace_discord_links(".")
    print("\n✅ All Discord links updated to discord.gg/skylineggs")
