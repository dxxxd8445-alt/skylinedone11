@echo off
cd /d "%~dp0"
echo Adding Storrik real API integration...
git add -A
echo.
echo Committing...
git commit -m "Integrate Storrik real payment API - Backend checkout with hosted payment page"
echo.
echo Pushing to GitHub...
git push origin main
echo.
echo Done! Now follow STORRIK_REAL_API_SETUP.md for configuration.
pause
