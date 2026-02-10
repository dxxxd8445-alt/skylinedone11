@echo off
cd /d "%~dp0"
echo ========================================
echo   PUSHING ALL CHANGES TO PRODUCTION
echo ========================================
echo.
echo Current directory: %CD%
echo.
echo This will:
echo - Add all changes to git
echo - Commit with message
echo - Push to GitHub
echo - Vercel will auto-deploy
echo.
pause

echo.
echo [1/3] Adding all changes...
git add -A
if errorlevel 1 (
    echo ERROR: Failed to add changes. Make sure you're in the git repository.
    pause
    exit /b 1
)

echo.
echo [2/3] Committing changes...
git commit -m "🚀 Production Release: All updates deployed"
if errorlevel 1 (
    echo Note: No changes to commit or commit failed
)

echo.
echo [3/3] Pushing to GitHub...
git push origin main
if errorlevel 1 (
    echo ERROR: Failed to push to GitHub
    pause
    exit /b 1
)

echo.
echo ========================================
echo   SUCCESS! DEPLOYMENT IN PROGRESS
echo ========================================
echo.
echo Your changes are now being deployed to:
echo https://skylinecheats.org
echo.
echo Vercel will automatically deploy in 2-3 minutes.
echo.
echo IMPORTANT: SQL migration already completed!
echo Security logs table is active.
echo.
pause
