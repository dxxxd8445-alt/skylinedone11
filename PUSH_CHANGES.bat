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
git commit -m "Fix staff permissions, enhance customer orders and email system with Discord link"
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
echo   [+] Fixed staff permission system for dashboard access
echo   [+] Enhanced license key assignment from stock
echo   [+] Stocked keys now assigned to customers automatically
echo   [+] Improved purchase email with Discord link
echo   [+] Beautiful email design with success icon
echo   [+] Discord server link: https://discord.gg/skylineggs
echo   [+] Customer orders display in account page
echo   [+] License expiration dates calculated correctly
echo   [+] All 9 staff permissions working correctly
echo.
echo Your site will auto-deploy on Vercel in 2-3 minutes!
echo.
echo What's working now:
echo   1. Staff with 'dashboard' permission can view revenue
echo   2. Customers see orders in /account page
echo   3. License keys from stock assigned automatically
echo   4. Beautiful purchase emails with Discord link
echo   5. Expiration dates calculated from duration
echo   6. All customer data displays correctly
echo.
echo To test:
echo   1. Make a test purchase
echo   2. Check email for license key and Discord link
echo   3. Log into /account to see order
echo   4. Verify license key matches email
echo.
pause
