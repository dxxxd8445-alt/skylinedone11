@echo off
echo Pushing Storrik Payment Processor Updates to GitHub...
echo.

cd /d "c:\Users\op\Desktop\magma src (1)\magma src"

echo Checking git status...
git status

echo.
echo Adding all changes...
git add .

echo.
echo Committing changes...
git commit -m "Replace MoneyMotion with Storrik payment processor

- Add Storrik API library with payment intent creation
- Create Storrik checkout API endpoint 
- Update checkout flow to use Storrik instead of MoneyMotion
- Add Storrik webhook handler for payment notifications
- Update environment configuration for Storrik keys
- Add test page for Storrik payment integration

Features:
- Complete Storrik payment processor implementation
- Webhook signature verification
- Order status management
- Compatible with existing checkout flow
- Test interface for validation

API Keys:
- Secret: sk_live_Ez0SrU3u2qOj6Vviv_ex0LhPp-VeEmum69F-llDi1DU
- Public: pk_live_-C5YxyjzMiRNh0n0ECoIBP4rFZMr34Fcpb7mnW5dQ90
- Webhook: whsec_NIiLZwWd69gg9m3cn2KadKi0O5LnFX4SOUeEi10Yv9Ef7d2d98c"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ✅ Storrik update pushed successfully!
echo.
echo 📝 Don't forget to add these environment variables to Vercel:
echo    STORRIK_SECRET_KEY=sk_live_Ez0SrU3u2qOj6Vviv_ex0LhPp-VeEmum69F-llDi1DU
echo    STORRIK_PUBLIC_KEY=pk_live_-C5YxyjzMiRNh0n0ECoIBP4rFZMr34Fcpb7mnW5dQ90
echo    STORRIK_WEBHOOK_SECRET=whsec_NIiLZwWd69gg9m3cn2KadKi0O5LnFX4SOUeEi10Yv9Ef7d2d98c
echo.
echo 🌐 Configure webhook in Storrik dashboard: https://yourdomain.com/api/storrik/webhook
echo.

pause
