@echo off
echo Starting Komerza Payment Processor Development Server...
echo.

cd /d "c:\Users\op\Desktop\magma src (1)\magma src"

echo Installing dependencies...
call npm install

echo.
echo Starting development server...
npm run dev

pause
