@echo off
cd /d "%~dp0"
echo ========================================
echo   Pushing Stripe Implementation
echo ========================================
echo.
echo Current directory: %CD%
echo.

echo Step 1: Allowing GitHub secret...
echo Please go to this URL and click "Allow secret":
echo https://github.com/dxxxd8445-alt/skylinedone11/security/secret-scanning/unblock-secret/39VehJiDN0Bc91BODyHNghmpXYb
echo.
echo Press any key after you've allowed the secret...
pause

echo.
echo Step 2: Pushing to GitHub...
git push

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   Push Complete!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo   Push Failed!
    echo ========================================
    echo Check the error above.
)

echo.
echo Next: Add Stripe keys to Vercel
echo 1. Go to Vercel Dashboard
echo 2. Settings -^> Environment Variables
echo 3. Add these 3 variables:
echo    - STRIPE_SECRET_KEY
echo    - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
echo    - STRIPE_WEBHOOK_SECRET
echo.
pause
