#!/bin/bash
# Local Development Setup Script for LifeSteal Shop
# Run with: bash setup-local.sh

echo "🎮 LifeSteal Shop - Local Development Setup"
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check if MongoDB is running
if ! command -v mongosh &> /dev/null && ! command -v mongo &> /dev/null; then
    echo "⚠️  MongoDB CLI not found. Install MongoDB or use Docker:"
    echo "   Option 1: Download from https://www.mongodb.com/try/download/community"
    echo "   Option 2: Run with Docker: docker run --name lifesteal-mongo -p 27017:27017 -d mongo:latest"
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📁 Creating .env file from template..."
    if [ -f .env.local.example ]; then
        cp .env.local.example .env
        echo "✅ Created .env file. Please edit it with your settings."
    else
        echo "❌ .env.local.example not found. Creating basic .env..."
        cat > .env << EOF
# Database Configuration
MONGODB_URL=mongodb://localhost:27017/DUSK

# Session Security (CHANGE THIS!)
SESSION_SECRET=your-very-secure-random-secret-key-here-change-this-immediately

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5000

# Email Configuration (Optional - see EMAIL_SETUP.md)
EMAIL_APP_PASSWORD=

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
EOF
    fi
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads/payment-screenshots

# Check if MongoDB is running
echo "🔍 Checking MongoDB connection..."
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.runCommand('ping')" --quiet 2>/dev/null; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running. Start it or the app will use memory storage."
    fi
elif command -v mongo &> /dev/null; then
    if mongo --eval "db.runCommand('ping')" --quiet 2>/dev/null; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running. Start it or the app will use memory storage."
    fi
else
    echo "⚠️  MongoDB CLI not installed. App will use memory storage fallback."
fi

echo ""
echo "🚀 Setup Complete! Next steps:"
echo "1. Edit .env file with your settings (especially SESSION_SECRET)"
echo "2. Configure email: See EMAIL_SETUP.md for Gmail setup"
echo "3. Start development server: npm run dev"
echo "4. Open: http://localhost:5000"
echo ""
echo "📚 Documentation:"
echo "- LOCALHOST_SETUP.md - Complete setup guide"
echo "- EMAIL_SETUP.md - Email configuration"
echo "- ADMIN_GUIDE.md - Admin dashboard usage"
echo ""
echo "🛠️  For Windows users:"
echo "- If you get 'NODE_ENV not recognized' error:"
echo "  Use: npx cross-env NODE_ENV=development tsx server/index.ts"