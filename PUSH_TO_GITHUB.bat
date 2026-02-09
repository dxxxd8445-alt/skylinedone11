@echo off
cls
echo ============================================================
echo   PUSHING ALL UPDATES TO GITHUB
echo ============================================================
echo.
echo Changes being pushed:
echo   [+] Live sales notifications with real products
echo   [+] Dynamic online counter (50-100)
echo   [+] Removed 'Write a Review' button
echo   [+] Complete Storrik payment integration
echo   [+] Admin dashboard API key configuration
echo   [+] Test page at /test-storrik
echo   [+] Comprehensive documentation
echo.
echo ============================================================
echo.

git add -A
git commit -m "Major update: Storrik payment integration, live sales notifications, dynamic stats - Added live sales notifications showing real products with images - Dynamic online counter cycling 50-100 users - Removed Write a Review button from product pages - Complete Storrik payment processor integration - Admin dashboard configuration for Storrik API key - Created /test-storrik page for verification - Added comprehensive documentation and checklists - Updated layout with Storrik script and provider - Created webhook handler for Storrik payments - All payment processing now through Storrik"
git push origin main

echo.
echo ============================================================
echo   PUSH COMPLETE!
echo ============================================================
echo.
echo Next steps:
echo   1. Go to /mgmt-x9k2m7/settings
echo   2. Enter your Storrik API key (PK_xxx)
echo   3. Save settings
echo   4. Test at /test-storrik
echo.
pause
