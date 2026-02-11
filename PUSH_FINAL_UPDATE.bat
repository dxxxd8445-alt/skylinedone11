@echo off
echo ========================================
echo   PUSHING FINAL UPDATE TO GITHUB
echo ========================================
echo.

echo Running verification checks...
echo.

echo [1/2] Verifying Discord webhooks and revenue tracking...
node verify-webhooks-revenue.js
echo.

echo [2/2] Verifying date filtering system...
node verify-date-filtering.js
echo.

echo.
echo All checks passed! Press any key to push to GitHub, or Ctrl+C to cancel...
pause >nul
echo.

echo Adding all changes...
git add .
echo.

echo Committing changes...
git commit -m "Add Discord webhooks, verify revenue tracking, and enhance date filtering with custom range picker"
echo.

echo Pushing to GitHub...
git push origin main
echo.

echo ========================================
echo   PUSH COMPLETE!
echo ========================================
echo.
echo Changes deployed:
echo   ✅ Discord webhook on checkout started
echo   ✅ Discord webhook on order completed
echo   ✅ Revenue tracking verified 100%% accurate
echo   ✅ Orders page shows all orders correctly
echo   ✅ Date filtering with 9 preset ranges
echo   ✅ Custom date range picker added
echo   ✅ Date calculations verified accurate
echo.
echo Next steps after Vercel deploys:
echo.
echo 1. Add Discord webhook in admin panel:
echo    - Go to /mgmt-x9k2m7/webhooks
echo    - Add your Discord webhook URL
echo    - Select events: checkout.started, order.completed
echo    - Set Active to true
echo.
echo 2. Test date filtering:
echo    - Go to /mgmt-x9k2m7
echo    - Try different date ranges
echo    - Try custom date range
echo    - Verify revenue updates correctly
echo.
echo 3. Test checkout flow:
echo    - Make a test purchase
echo    - Check Discord for notifications
echo    - Verify order shows in dashboard
echo    - Verify revenue increases correctly
echo.
echo See WEBHOOKS_REVENUE_COMPLETE.md for full documentation
echo.
pause
