@echo off
echo ========================================
echo FINAL RELEASE DEPLOYMENT
echo ========================================
echo.
echo Changes included:
echo - MoneyMotion payment integration
echo - Crypto payments (BTC/LTC)
echo - Revenue calculation fixes
echo - Mobile optimization
echo - Live sales notifications with swipe
echo - Improved admin dashboard charts
echo.

cd "magma src"

echo [1/3] Staging all changes...
git add .

echo [2/3] Committing...
git commit -m "Final release: MoneyMotion integration, crypto payments, mobile optimization, revenue fixes"

echo [3/3] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Vercel will auto-deploy in 2-3 minutes
echo.
echo Monitor deployment at:
echo https://vercel.com/dashboard
echo.
echo Site will be live at:
echo https://skylinecheats.org
echo.
pause
