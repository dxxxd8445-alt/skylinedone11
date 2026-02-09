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
git commit -m "Major update: Storrik payment integration, live sales notifications, dynamic stats"
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
echo   [+] Live sales notifications with real products
echo   [+] Dynamic online counter (50-100)
echo   [+] Removed 'Write a Review' button
echo   [+] Complete Storrik payment integration
echo   [+] Admin dashboard API key configuration
echo   [+] Test page at /test-storrik
echo   [+] Comprehensive documentation
echo.
echo Your site will auto-deploy on Vercel!
echo.
echo Next steps:
echo   1. Wait for Vercel deployment (2-3 minutes)
echo   2. Go to https://your-domain.com/mgmt-x9k2m7/settings
echo   3. Enter your Storrik API key (PK_xxx)
echo   4. Save settings
echo   5. Test at https://your-domain.com/test-storrik
echo.
pause
