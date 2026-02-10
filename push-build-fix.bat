@echo off
cd /d "%~dp0"
echo Adding build fix...
git add app/checkout/guest/page.tsx
echo.
echo Committing...
git commit -m "Fix build error in guest checkout page - Remove broken code"
echo.
echo Pushing to GitHub...
git push origin main
echo.
echo Done! Build is now fixed and will deploy successfully.
pause
