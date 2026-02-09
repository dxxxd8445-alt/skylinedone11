@echo off
cls
echo ============================================================
echo   PUSHING TO NEW GITHUB REPOSITORY
echo   Repository: skylinedone11
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/4] Removing old remote (if exists)...
git remote remove origin 2>nul
echo       Done!
echo.

echo [2/4] Adding new remote repository...
git remote add origin https://github.com/dxxxd8445-alt/skylinedone11.git
if errorlevel 1 (
    echo ERROR: Failed to add remote
    pause
    exit /b 1
)
echo       Done!
echo.

echo [3/4] Setting branch to main...
git branch -M main
if errorlevel 1 (
    echo ERROR: Failed to set branch
    pause
    exit /b 1
)
echo       Done!
echo.

echo [4/4] Pushing to GitHub...
git push -u origin main --force
if errorlevel 1 (
    echo ERROR: Failed to push to GitHub
    echo.
    echo This might be because:
    echo   - Repository doesn't exist on GitHub
    echo   - You need to authenticate
    echo   - Network issues
    echo.
    pause
    exit /b 1
)
echo       Done!
echo.

echo ============================================================
echo   SUCCESS! Code pushed to new repository
echo ============================================================
echo.
echo Repository: https://github.com/dxxxd8445-alt/skylinedone11
echo.
echo Next steps:
echo   1. Go to Vercel dashboard
echo   2. Create new project
echo   3. Import from GitHub: skylinedone11
echo   4. Deploy!
echo.
pause
