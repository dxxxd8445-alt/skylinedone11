@echo off
cd /d "%~dp0"
echo Pushing Storrik integration attempt...
git add -A
git commit -m "Storrik integration - API not working, needs embeds or different processor"
git push origin main
echo.
echo Done! Read STORRIK_SITUATION_AND_NEXT_STEPS.md for options.
pause
