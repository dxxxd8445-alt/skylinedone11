Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOYING MONEYMOTION INTEGRATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Adding all changes..." -ForegroundColor Yellow
git add .

Write-Host "[2/3] Committing changes..." -ForegroundColor Yellow
git commit -m "Complete MoneyMotion integration - Fixed amount_cents field"

Write-Host "[3/3] Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Vercel will auto-deploy from GitHub" -ForegroundColor White
Write-Host "2. Wait 2-3 minutes for deployment" -ForegroundColor White
Write-Host "3. Test checkout at https://skylinecheats.org" -ForegroundColor White
Write-Host "4. Orders will process through MoneyMotion" -ForegroundColor White
Write-Host ""
