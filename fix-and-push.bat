@echo off
cd /d "%~dp0"
echo Resetting last 2 commits to remove secrets...
git reset --soft HEAD~2
echo.
echo Re-adding all changes...
git add -A
echo.
echo Creating new clean commit...
git commit -m "Complete Stripe removal and Storrik card payment integration - Custom backend checkout"
echo.
echo Pushing to GitHub (force)...
git push origin main --force
echo.
echo Done!
pause
