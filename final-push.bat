@echo off
cd /d "%~dp0"
git add DEPLOYMENT_SUCCESS.md
git commit -m "Add deployment success documentation"
git push origin main
echo Done!
pause
