@echo off
cls
echo ============================================================
echo   PUSHING ALL CHANGES TO GITHUB
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/3] Adding all changes...
git add -A
if errorlevel 1 (
    echo ERROR: Failed to add files
    pause
    exit /b 1
)
echo       Done!
echo.

echo [2/3] Creating commit...
git commit -m "Add Loaders tab to customer dashboard with download link"
if errorlevel 1 (
    echo ERROR: Failed to create commit
    pause
    exit /b 1
)
echo       Done!
echo.

echo [3/3] Pushing to GitHub...
git push origin main
if errorlevel 1 (
    echo ERROR: Failed to push to GitHub
    pause
    exit /b 1
)
echo       Done!
echo.

echo ============================================================
echo   SUCCESS! All changes pushed to GitHub
echo ============================================================
echo.
echo Changes pushed:
echo   [+] Added "Loaders" tab to customer dashboard
echo   [+] Beautiful download page with instructions
echo   [+] Loader download link included
echo   [+] Discord support link added
echo   [+] Step-by-step usage guide
echo   [+] Modern gradient design
echo.
echo Your site will auto-deploy on Vercel in 2-3 minutes!
echo.
echo What customers will see:
echo   1. New "Loaders" tab in account sidebar
echo   2. Download button for loader_1.exe
echo   3. 4-step usage instructions
echo   4. Discord support link
echo   5. Version badges and info
echo.
pause
