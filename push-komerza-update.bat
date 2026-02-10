@echo off
echo Pushing Komerza Payment Processor Implementation to GitHub...
echo.

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
- Komerza API key for configuration: eyJhbGciOiJFUzI1NiIsImtpZCI6Ijc3ZDFiNDBkLWE2NzYtNGI1MS1hNTg3LWZiZDE4OGI5YmZkZiIsInR5cCI6IkpXVCJ9...

Implementation:
- Uses Komerza Embed SDK for checkout
- Supports multiple items and variants
- Handles order creation and webhook processing
- Maintains existing cart and user experience"
