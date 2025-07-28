@echo off
REM Script to create admin user for LifeSteal Shop (Windows)
REM Make sure the server is running first: npm run dev

echo 🔧 Creating Admin User for LifeSteal Shop
echo ========================================

REM Check if curl is available
curl --version >nul 2>&1
if errorlevel 1 (
    echo ❌ curl is not available. Please install curl or use PowerShell/WSL
    echo Alternative: Use the commands from ADMIN_GUIDE.md manually
    pause
    exit /b 1
)

echo 📝 Creating admin user account...

REM Create admin user
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@lifesteal.com\",\"password\":\"admin123\",\"firstName\":\"Admin\",\"lastName\":\"User\"}"

REM Wait a moment for the registration to complete
timeout /t 2 >nul

echo.
echo 👑 Granting admin privileges...

REM Make user admin
curl -X POST http://localhost:5000/api/debug/make-admin ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@lifesteal.com\"}"

echo.
echo.
echo ✅ Admin user created successfully!
echo.
echo Login Details:
echo Email: admin@lifesteal.com
echo Password: admin123
echo.
echo Next Steps:
echo 1. Go to http://localhost:5000/login
echo 2. Login with the above credentials
echo 3. Look for the 'Admin' button in the navigation
echo 4. Access the admin dashboard at http://localhost:5000/admin
echo.
echo ⚠️  Security Note:
echo Change the admin password after first login for production use!
echo.
pause