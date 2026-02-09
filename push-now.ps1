# Navigate to script directory
Set-Location $PSScriptRoot

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  PUSHING ALL CHANGES TO GITHUB" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Configure git user
Write-Host "[0/4] Configuring git..." -ForegroundColor Yellow
git config user.email "skyline@skylinecheats.org"
git config user.name "Skyline Cheats"
Write-Host "      Done!" -ForegroundColor Green
Write-Host ""

# Add all changes
Write-Host "[1/4] Adding all changes..." -ForegroundColor Yellow
git add -A
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to add files" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "      Done!" -ForegroundColor Green
Write-Host ""

# Create commit
Write-Host "[2/4] Creating commit..." -ForegroundColor Yellow
git commit -m "Complete Stripe removal and Storrik card payment integration - Custom backend checkout system"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to create commit (or no changes to commit)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "      Done!" -ForegroundColor Green
Write-Host ""

# Check remote
Write-Host "[3/4] Checking remote..." -ForegroundColor Yellow
$remote = git remote -v
Write-Host $remote
Write-Host ""

# Push to GitHub
Write-Host "[4/4] Pushing to GitHub..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "Trying 'master' branch..." -ForegroundColor Yellow
    git push origin master
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to push to GitHub" -ForegroundColor Red
        Write-Host "Please check your GitHub credentials and remote URL" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}
Write-Host "      Done!" -ForegroundColor Green
Write-Host ""

Write-Host "============================================================" -ForegroundColor Green
Write-Host "  SUCCESS! All changes pushed to GitHub" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Changes pushed:" -ForegroundColor Cyan
Write-Host "  [+] Removed ALL Stripe dependencies and code" -ForegroundColor White
Write-Host "  [+] Custom backend checkout system (no embeds)" -ForegroundColor White
Write-Host "  [+] Storrik card payments only (no crypto)" -ForegroundColor White
Write-Host "  [+] Order creation API at /api/storrik/create-checkout" -ForegroundColor White
Write-Host "  [+] Payment form at /payment/checkout" -ForegroundColor White
Write-Host "  [+] Payment processing at /api/payment/process" -ForegroundColor White
Write-Host "  [+] Success page at /payment/success" -ForegroundColor White
Write-Host "  [+] Database fixes (optional columns, disabled RLS)" -ForegroundColor White
Write-Host "  [+] Works for ALL products without Storrik product IDs" -ForegroundColor White
Write-Host ""
Write-Host "Your site will auto-deploy on Vercel in 2-3 minutes!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Wait for Vercel deployment" -ForegroundColor White
Write-Host "  2. Test checkout on https://skylinecheats.org" -ForegroundColor White
Write-Host "  3. Add to cart -> Checkout -> Enter email -> Complete Payment" -ForegroundColor White
Write-Host "  4. Verify order creation and license key generation" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"
