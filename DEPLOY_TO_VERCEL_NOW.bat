@echo off
echo ========================================
echo DEPLOYING MONEYMOTION INTEGRATION
echo ========================================
echo.

cd "magma src"

echo [1/3] Adding all changes...
git add .

echo [2/3] Committing changes...
git commit -m "Complete MoneyMotion integration - Fixed amount_cents field"

echo [3/3] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Vercel will auto-deploy from GitHub
echo 2. Wait 2-3 minutes for deployment
echo 3. Test checkout at https://skylinecheats.org
echo 4. Orders will process through MoneyMotion
echo.
pause
