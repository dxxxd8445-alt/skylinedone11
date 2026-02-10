@echo off
echo Pushing Komerza Payment Processor to GitHub...
echo ========================================

cd /d "c:\Users\op\Desktop\magma src (1)\magma src"

echo Creating commit message file...
echo Replace Storrik with Komerza payment processor> commit_msg.txt
echo.>>commit_msg.txt.
echo.
echo - Add Komerza API library with product management>>commit_msg.txt
echo - Create Komerza checkout API endpoint>>commit_msg.txt
echo - Create Komerza webhook handler for payment notifications>>commit_msg.txt
echo - Add Komerza settings API for API key management>>commit_msg.txt
echo - Update checkout flow to use Komerza embed SDK>>commit_msg.txt
echo - Create dedicated Komerza checkout page with embed integration>>commit_msg.txt
echo - Remove Storrik dependencies and update payment methods>>commit_msg.txt
echo.
echo.>>commit_msg.txt
echo Features:>>commit_msg.txt
echo - Complete Komerza payment processor implementation>>commit_msg.txt
echo - Embed SDK integration for seamless checkout>>commit_msg.txt
echo - Webhook signature verification and order processing>>commit_msg.txt
echo - Compatible with existing cart and order system>>commit_msg.txt
echo - TypeScript support with proper type definitions>>commit_msg.txt
echo - Error handling and fallback mechanisms>>commit_msg.txt
echo.
echo.>>commit_msg.txt
echo API Key:>>commit_msg.txt
echo - Komerza API key configured for embed integration>>commit_msg.txt

echo Checking git status...
git status

echo.
echo Adding all changes...
git add .

echo.
echo Committing changes...
git commit -F commit_msg.txt

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo Cleaning up...
del commit_msg.txt

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
