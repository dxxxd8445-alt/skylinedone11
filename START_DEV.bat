@echo off
cd /d "%~dp0"
echo.
echo ========================================
echo   Starting Skyline Cheats Dev Server
echo ========================================
echo.
echo Installing dependencies...
call npm install
echo.
echo Starting server on http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
call npm run dev
pause
