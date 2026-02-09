@echo off
cls
echo ============================================================
echo   STOPPING DEV SERVER AND PUSHING TO GITHUB
echo ============================================================
echo.

echo [1/4] Stopping Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo       Done!
echo.

echo [2/4] Adding all changes...
git add -A
echo       Done!
echo.

echo [3/4] Creating commit...
git commit -m "Major update: Storrik payment integration, live sales notifications, dynamic stats - Added live sales notifications showing real products with images - Dynamic online counter cycling 50-100 users - Removed Write a Review button from product pages - Complete Storrik payment processor integration - Admin dashboard configuration for Storrik API key - Created /test-storrik page for verification - Added comprehensive documentation and checklists - Updated layout with Storrik script and provider - Created webhook handler for Storrik payments - All payment processing now through Storrik"
echo       Done!
echo.

echo [4/4] Pushing to GitHub...
git push origin main
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
echo Next steps:
echo   1. Go to /mgmt-x9k2m7/settings
echo   2. Enter your Storrik API key (PK_xxx)
echo   3. Save settings
echo   4. Test at /test-storrik
echo.
pause
