# Windows Setup Guide for Minecraft Lifesteal E-commerce

This guide specifically addresses Windows-specific setup issues and solutions.

## Quick Fix for NODE_ENV Error

If you get `'NODE_ENV' is not recognized as an internal or external command`, here are your options:

### Option 1: Use npx cross-env (Recommended)
```cmd
npx cross-env NODE_ENV=development tsx server/index.ts
```

### Option 2: Command Prompt
```cmd
set NODE_ENV=development && tsx server/index.ts
```

### Option 3: PowerShell
```powershell
$env:NODE_ENV="development"; tsx server/index.ts
```

### Option 4: Install cross-env globally
```cmd
npm install -g cross-env
cross-env NODE_ENV=development tsx server/index.ts
```

## Windows-Specific Installation Steps

### 1. Prerequisites
- **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
- **Git**: Download from [git-scm.com](https://git-scm.com/)
- **MongoDB**: One of the following options:

#### MongoDB Options for Windows

**Option A: MongoDB Community Server (Local)**
1. Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Install with default settings
3. MongoDB will run as a Windows service automatically
4. Verify: Open Command Prompt and type `mongosh`

**Option B: MongoDB with Docker Desktop**
1. Install [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
2. Run: `docker run --name mongo -p 27017:27017 -d mongo:latest`
3. MongoDB will be available at `mongodb://localhost:27017/DUSK`

**Option C: MongoDB Atlas (Cloud)**
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get connection string and update `.env` file

### 2. Project Setup

```cmd
# Clone and setup
git clone <repository-url>
cd lifesteal-ecommerce
npm install

# Copy environment file
copy .env.example .env

# Edit .env file with Notepad or VS Code
notepad .env
```

### 3. Environment Configuration (.env file)

```env
# Required Database Configuration
MONGODB_URL=mongodb://localhost:27017/DUSK

# Required Session Secret (generate a random string)
SESSION_SECRET=your-very-secure-random-secret-key-here

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 4. Starting the Application

```cmd
# Method 1: Using npx cross-env (recommended)
npx cross-env NODE_ENV=development tsx server/index.ts

# Method 2: Using Command Prompt
set NODE_ENV=development && tsx server/index.ts

# Method 3: Using PowerShell
$env:NODE_ENV="development"; tsx server/index.ts
```

Visit: http://localhost:5000

## Windows-Specific Troubleshooting

### MongoDB Service Issues

**Check if MongoDB is running:**
```cmd
# Open Services (Win + R, type 'services.msc')
# Look for 'MongoDB Server' - it should be 'Running'
```

**Start MongoDB manually:**
```cmd
# If installed as service
net start MongoDB

# If installed manually
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db"
```

### Port Issues

**Check what's using port 5000:**
```cmd
netstat -ano | findstr :5000
```

**Kill process using port:**
```cmd
taskkill /PID <process_id> /F
```

### File Permission Issues

**Run Command Prompt as Administrator:**
1. Press Win + X
2. Select "Command Prompt (Admin)" or "PowerShell (Admin)"
3. Navigate to your project folder
4. Run the installation commands

### Node.js Path Issues

**Verify Node.js installation:**
```cmd
node --version
npm --version
npx --version
```

**If commands not found:**
1. Reinstall Node.js from [nodejs.org](https://nodejs.org/)
2. Make sure to check "Add to PATH" during installation
3. Restart Command Prompt

### Creating Directories

```cmd
# Create uploads directory
mkdir uploads

# Create uploads subdirectories
mkdir uploads\payment-screenshots
```

## Development Workflow for Windows

### Daily Development
```cmd
# 1. Start MongoDB (if not running as service)
net start MongoDB

# 2. Navigate to project
cd path\to\lifesteal-ecommerce

# 3. Start development server
npx cross-env NODE_ENV=development tsx server/index.ts

# 4. Open browser to http://localhost:5000
```

### Building for Production
```cmd
# Build the application
npm run build

# Start production server
npx cross-env NODE_ENV=production node dist/index.js
```

## IDE Setup (Visual Studio Code)

### Recommended Extensions
- **MongoDB for VS Code**: MongoDB support
- **Thunder Client**: API testing
- **Prettier**: Code formatting
- **ESLint**: Code linting

### VS Code Settings
Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

## Common Windows Error Solutions

### 1. "tsx is not recognized"
```cmd
# Install tsx globally
npm install -g tsx

# Or use npx
npx tsx server/index.ts
```

### 2. "Permission denied" during npm install
```cmd
# Run as administrator or use:
npm install --no-optional
```

### 3. "ENOENT: no such file or directory"
```cmd
# Make sure you're in the project directory
cd lifesteal-ecommerce

# Check if package.json exists
dir package.json
```

### 4. MongoDB Connection Failed
- Verify MongoDB service is running: `services.msc`
- Check firewall isn't blocking port 27017
- Try connection string: `mongodb://127.0.0.1:27017/DUSK`

## Performance Tips for Windows

1. **Exclude from Windows Defender**: Add project folder to exclusions
2. **Use SSD**: Store project on SSD for better performance
3. **Close unnecessary programs**: Free up RAM and CPU
4. **Use Windows Terminal**: Better than Command Prompt

## Getting Help

If you encounter issues:
1. Check this guide first
2. Verify all prerequisites are installed
3. Check the main [LOCALHOST_SETUP.md](./LOCALHOST_SETUP.md)
4. Look at the [.env.example](./.env.example) for configuration

## Alternative Setup Methods

### Using Windows Subsystem for Linux (WSL)
If you prefer a Linux-like environment:
1. Install WSL2
2. Install Ubuntu from Microsoft Store
3. Follow Linux setup instructions instead

### Using GitHub Codespaces
For cloud development:
1. Fork the repository on GitHub
2. Click "Code" → "Create codespace"
3. Everything will be pre-configured