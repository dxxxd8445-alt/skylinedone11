@echo off
cd /d "%~dp0"
echo Creating production branch...
git checkout -b production
echo.
echo Pushing to production branch...
git push origin production --force
echo.
echo Done! Now go to Vercel dashboard and:
echo 1. Go to Project Settings
echo 2. Go to Git
echo 3. Change Production Branch from "main" to "production"
echo 4. It will auto-deploy
pause
