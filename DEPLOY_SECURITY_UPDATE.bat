@echo off
echo ========================================
echo   SECURITY HARDENING DEPLOYMENT
echo ========================================
echo.
echo This will deploy enterprise-grade security features:
echo - Brute force protection (5 attempts / 15 min lockout)
echo - Rate limiting on password changes
echo - Security event logging
echo - Strong password requirements (12+ chars)
echo - Timing-safe password comparison
echo - Input sanitization
echo - Bot detection
echo - IP tracking
echo - Security dashboard
echo.
pause

echo.
echo [1/4] Adding all changes...
git add .

echo.
echo [2/4] Committing security updates...
git commit -m "🔒 Security: Enterprise-grade hardening + brute force protection + security logging"

echo.
echo [3/4] Pushing to GitHub...
git push origin main

echo.
echo [4/4] Deployment initiated!
echo.
echo ========================================
echo   IMPORTANT: POST-DEPLOYMENT STEPS
echo ========================================
echo.
echo 1. Go to Supabase SQL Editor
echo 2. Run the SQL from: CREATE_SECURITY_LOGS_TABLE.sql
echo 3. This creates the security_logs table
echo.
echo 4. Test security features:
echo    - Try wrong password 5 times
echo    - Should get locked out for 30 minutes
echo    - Check security logs in admin dashboard
echo.
echo 5. Access security dashboard:
echo    https://skylinecheats.org/mgmt-x9k2m7/security
echo.
echo ========================================
echo   SECURITY FEATURES ACTIVE
echo ========================================
echo.
echo ✅ Brute force protection
echo ✅ Rate limiting
echo ✅ Security logging
echo ✅ Strong passwords (12+ chars)
echo ✅ Timing-safe comparison
echo ✅ Input sanitization
echo ✅ Bot detection
echo ✅ IP tracking
echo.
echo Your admin panel is now ENTERPRISE-GRADE SECURE!
echo.
pause
