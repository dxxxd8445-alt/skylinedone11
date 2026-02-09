@echo off
echo ========================================
echo Pushing Storrik Integration to GitHub
echo ========================================
echo.

git add -A
git commit -m "Replace MoneyMotion with Storrik payment processor - Complete integration with admin configuration"
git push origin main

echo.
echo ========================================
echo Done! Changes pushed to GitHub
echo ========================================
echo.
echo Next steps:
echo 1. Run ADD_STORRIK_PAYMENT.sql in Supabase
echo 2. Configure Storrik API key in admin dashboard
echo 3. Set up webhook in Storrik dashboard
echo.
pause
