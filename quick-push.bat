@echo off
cd /d "%~dp0"
echo Adding changes...
git add -A
echo.
echo Committing...
git commit -m "Complete Stripe removal and Storrik card payment integration - Secrets removed"
echo.
echo Pushing to GitHub...
git push origin main
echo.
echo Done!
pause
