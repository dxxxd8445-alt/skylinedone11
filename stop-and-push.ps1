# Stop all Node.js processes (this will stop the dev server)
Write-Host "Stopping Node.js processes..."
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Push to GitHub
Write-Host "Pushing to GitHub..."
git add .
git commit -m "Add live sales notifications with real products and dynamic online counter (50-100)"
git push origin main

Write-Host "Done! Dev server stopped and changes pushed to GitHub."
