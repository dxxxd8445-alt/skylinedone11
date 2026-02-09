@echo off
cls
echo ============================================================
echo   PUSHING ALL CHANGES TO GITHUB
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/3] Adding all changes...
git add -A
if errorlevel 1 (
    echo ERROR: Failed to add files
    pause
    exit /b 1
)
echo       Done!
echo.

echo [2/3] Creating commit...
git commit -m "Complete Stripe removal and Storrik card payment integration - Custom backend checkout system"
if errorlevel 1 (
    echo ERROR: Failed to create commit
    pause
    exit /b 1
)
echo       Done!
echo.

echo [3/3] Pushing to GitHub...
git push origin main
if errorlevel 1 (
    echo ERROR: Failed to push to GitHub
    pause
    exit /b 1
)
echo       Done!
echo.

echo ============================================================
echo   SUCCESS! All changes pushed to GitHub
echo ============================================================
echo.
echo Changes pushed:
echo   [+] Removed ALL Stripe dependencies and code
echo   [+] Custom backend checkout system (no embeds)
echo   [+] Storrik card payments only (no crypto)
echo   [+] Order creation API at /api/storrik/create-checkout
echo   [+] Payment form at /payment/checkout
echo   [+] Payment processing at /api/payment/process
echo   [+] Success page at /payment/success
echo   [+] Database fixes (optional columns, disabled RLS)
echo   [+] Works for ALL products without Storrik product IDs
echo.
echo Your site will auto-deploy on Vercel in 2-3 minutes!
echo.
echo Next steps:
echo   1. Wait for Vercel deployment
echo   2. Test checkout on https://skylinecheats.org
echo   3. Add to cart -> Checkout -> Enter email -> Complete Payment
echo   4. Verify order creation and license key generation
echo.
pause
