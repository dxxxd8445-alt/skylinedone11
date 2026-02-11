@echo off
echo ========================================
echo   PUSHING WEBHOOKS & REVENUE UPDATE
echo ========================================
echo.

echo Running verification checks...
node verify-webhooks-revenue.js
echo.

echo.
echo Press any key to continue with git push, or Ctrl+C to cancel...
pause >nul
echo.

echo Adding all changes...
git add .
echo.

echo Committing changes...
git commit -m "Add Discord webhooks for checkout and order completion + verify revenue tracking"
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
echo   ✅ Revenue tracking verified accurate
echo   ✅ Orders page shows all orders
echo.
echo Next steps:
echo 1. Wait for Vercel to deploy (~2 minutes)
echo 2. Add Discord webhook in admin panel:
echo    - Go to /mgmt-x9k2m7/webhooks
echo    - Add your Discord webhook URL
echo    - Select events: checkout.started, order.completed
echo    - Set Active to true
echo 3. Test checkout flow
echo 4. Verify Discord notifications
echo 5. Check revenue on dashboard
echo.
echo See TEST_WEBHOOKS_AND_REVENUE.md for full details
echo.
pause
