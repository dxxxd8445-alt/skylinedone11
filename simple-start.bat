@echo off
echo ========================================
echo    Komerza Payment Processor
echo ========================================
echo.

cd /d "c:\Users\op\Desktop\magma src (1)\magma src"

echo Checking if Next.js is installed...
where next >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Next.js not found in PATH
    echo Please install Node.js and npm first
    pause
    exit /b 1
)

echo.
echo Starting development server...
echo Server will be available at: http://localhost:3000
echo.
echo ========================================

call npx next dev
