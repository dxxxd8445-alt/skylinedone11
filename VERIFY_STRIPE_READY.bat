@echo off
echo ========================================
echo   STRIPE MIGRATION VERIFICATION
echo ========================================
echo.

echo Checking for Storrik/MoneyMotion references...
echo.

findstr /S /I /C:"storrik" /C:"moneymotion" "app\**\*.ts" "app\**\*.tsx" "lib\**\*.ts" "components\**\*.tsx" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [WARNING] Found references to old payment processors
    echo Please review the files above
) else (
    echo [OK] No Storrik/MoneyMotion references found in code
)
echo.

echo Checking Stripe files exist...
if exist "lib\stripe.ts" (
    echo [OK] lib\stripe.ts exists
) else (
    echo [ERROR] lib\stripe.ts missing!
)

if exist "app\api\stripe\create-checkout\route.ts" (
    echo [OK] app\api\stripe\create-checkout\route.ts exists
) else (
    echo [ERROR] Stripe checkout API missing!
)

if exist "app\api\webhooks\stripe\route.ts" (
    echo [OK] app\api\webhooks\stripe\route.ts exists
) else (
    echo [ERROR] Stripe webhook API missing!
)
echo.

echo Checking environment variables...
findstr /C:"STRIPE_SECRET_KEY" ".env.local" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] STRIPE_SECRET_KEY found in .env.local
) else (
    echo [ERROR] STRIPE_SECRET_KEY missing from .env.local!
)

findstr /C:"NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" ".env.local" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY found in .env.local
) else (
    echo [ERROR] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY missing from .env.local!
)

findstr /C:"STRIPE_WEBHOOK_SECRET" ".env.local" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] STRIPE_WEBHOOK_SECRET found in .env.local
) else (
    echo [ERROR] STRIPE_WEBHOOK_SECRET missing from .env.local!
)
echo.

echo ========================================
echo   VERIFICATION COMPLETE
echo ========================================
echo.
echo If all checks passed, you're ready to:
echo 1. Run PUSH_TO_VERCEL.bat to deploy
echo 2. Add Stripe env vars to Vercel dashboard
echo 3. Configure Stripe webhook
echo 4. Test checkout flow
echo.
echo See STRIPE_MIGRATION_COMPLETE.md for details
echo.
pause
