@echo off
REM Local Development Setup Script for LifeSteal Shop (Windows)
REM Run with: setup-local.bat

echo 🎮 LifeSteal Shop - Local Development Setup (Windows)
echo ====================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📁 Creating .env file from template...
    if exist .env.local.example (
        copy .env.local.example .env
        echo ✅ Created .env file. Please edit it with your settings.
    ) else (
        echo ❌ .env.local.example not found. Creating basic .env...
        (
            echo # Database Configuration
            echo MONGODB_URL=mongodb://localhost:27017/DUSK
            echo.
            echo # Session Security ^(CHANGE THIS!^)
            echo SESSION_SECRET=your-very-secure-random-secret-key-here-change-this-immediately
            echo.
            echo # Server Configuration
            echo PORT=5000
            echo NODE_ENV=development
            echo FRONTEND_URL=http://localhost:5000
            echo.
            echo # Email Configuration ^(Optional - see EMAIL_SETUP.md^)
            echo EMAIL_APP_PASSWORD=
            echo.
            echo # File Upload Configuration
            echo UPLOAD_DIR=./uploads
            echo MAX_FILE_SIZE=5242880
        ) > .env
    )
) else (
    echo ✅ .env file already exists
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Create uploads directory
echo 📁 Creating uploads directory...
if not exist uploads mkdir uploads
if not exist uploads\payment-screenshots mkdir uploads\payment-screenshots

echo.
echo 🚀 Setup Complete! Next steps:
echo 1. Edit .env file with your settings ^(especially SESSION_SECRET^)
echo 2. Configure email: See EMAIL_SETUP.md for Gmail setup
echo 3. Start development server: npm run dev
echo    ^(If you get NODE_ENV error, use: npx cross-env NODE_ENV=development tsx server/index.ts^)
echo 4. Open: http://localhost:5000
echo.
echo 📚 Documentation:
echo - LOCALHOST_SETUP.md - Complete setup guide
echo - EMAIL_SETUP.md - Email configuration
echo - ADMIN_GUIDE.md - Admin dashboard usage
echo.
echo MongoDB Setup Options:
echo - Option 1: Install MongoDB Community Server
echo - Option 2: Use Docker: docker run --name lifesteal-mongo -p 27017:27017 -d mongo:latest
echo - Option 3: Use MongoDB Atlas ^(cloud^)
echo - Note: App works with memory storage if MongoDB unavailable
echo.
pause