@echo off
echo Starting Komerza Payment Processor Server...
echo.

cd /d "c:\Users\op\Desktop\magma src (1)\magma src"

echo Using Node.js directly to bypass PowerShell restrictions...
node start-server.js

pause
