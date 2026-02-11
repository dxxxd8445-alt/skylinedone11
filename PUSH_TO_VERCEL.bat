@echo off
echo ========================================
echo   PUSHING STRIPE MIGRATION TO GITHUB
echo ========================================
echo.

echo Checking git status...
git status
echo.

echo Adding all changes...
git add .
echo.

echo Committing changes...
git commit -m "Migrate to Stripe payments - remove all Storrik/MoneyMotion code"
echo.

echo Pushing to GitHub...
git push origin main
echo.

echo ========================================
echo   PUSH COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Go to Vercel dashboard
echo 2. Add Stripe environment variables:
echo    - STRIPE_SECRET_KEY
echo    - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
echo    - STRIPE_WEBHOOK_SECRET
echo 3. Configure webhook in Stripe dashboard
echo 4. Wait for Vercel to deploy
echo 5. Test checkout flow
echo.
echo See STRIPE_MIGRATION_COMPLETE.md for details
echo.
pause
