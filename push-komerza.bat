@echo off
echo Pushing Komerza Payment Processor to GitHub...
echo ========================================

cd /d "c:\Users\op\Desktop\magma src (1)\magma src"

echo Checking git status...
git status

echo.
echo Adding all changes...
git add .

echo.
echo Committing changes...
git commit -m "Replace Storrik with Komerza payment processor

- Add Komerza API library with product management
- Create Komerza checkout API endpoint 
- Create Komerza webhook handler for payment notifications
- Add Komerza settings API for API key management
- Update checkout flow to use Komerza embed SDK
- Create dedicated Komerza checkout page with embed integration
- Remove Storrik dependencies and update payment methods

Features:
- Complete Komerza payment processor implementation
- Embed SDK integration for seamless checkout
- Webhook signature verification and order processing
- Compatible with existing cart and order system
- TypeScript support with proper type definitions
- Error handling and fallback mechanisms

API Key:
- Komerza API key configured for embed integration"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
if %ERRORLEVEL% EQU 0 (
    echo ✅ Komerza update pushed successfully!
    echo.
    echo 🌐 Your site will be updated on next deployment
    echo 🧪 Komerza payment processor is ready for production
    echo.
    echo 📝 Don't forget to configure webhook in Komerza dashboard:
    echo    Webhook URL: https://yourdomain.com/api/komerza/webhook
) else (
    echo ❌ Failed to push changes
    echo Please check the error messages above
)

echo.
echo ========================================
pause
