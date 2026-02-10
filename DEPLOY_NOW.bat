@echo off
cls
echo.
echo ========================================
echo   SKYLINE CHEATS - FINAL DEPLOYMENT
echo ========================================
echo.
echo Features Added:
echo [+] Admin password change in settings
echo [+] Content protection (images + code)
echo [+] Right-click disabled
echo [+] Developer tools blocked
echo [+] Image drag-and-drop disabled
echo [+] MoneyMotion payments
echo [+] Crypto payments (BTC/LTC)
echo [+] Mobile optimization
echo [+] Revenue tracking fixed
echo.
echo ========================================
echo.

cd "magma src"

echo [1/3] Staging changes...
git add .

echo [2/3] Committing...
git commit -m "🔒 Final Release: Admin password change + content protection + all features"

echo [3/3] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Vercel will deploy in 2-3 minutes
echo.
echo Site: https://skylinecheats.org
echo Admin: https://skylinecheats.org/mgmt-x9k2m7
echo.
echo Security Features Active:
echo - Right-click disabled
echo - F12 blocked
echo - Image protection enabled
echo - Admin password changeable
echo.
pause
