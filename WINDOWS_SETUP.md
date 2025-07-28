# Windows Setup Guide for LifeSteal Shop

This guide provides Windows-specific instructions for setting up the LifeSteal Minecraft e-commerce platform on Windows systems.

## Prerequisites for Windows

### Required Software
1. **Node.js 18+**: Download from https://nodejs.org/
   - Choose "Windows Installer (.msi)" for your system (32-bit or 64-bit)
   - During installation, check "Add to PATH" option
   - Restart Command Prompt after installation

2. **MongoDB** (Choose one option):
   - **Option A**: MongoDB Community Server
     - Download from https://www.mongodb.com/try/download/community
     - Choose "Windows" platform and "msi" package
     - Install with default settings
     - MongoDB will run as a Windows service automatically
   
   - **Option B**: Docker Desktop
     - Install Docker Desktop from https://docker.com/products/docker-desktop
     - Run: `docker run --name lifesteal-mongo -p 27017:27017 -d mongo:latest`
   
   - **Option C**: MongoDB Atlas (Cloud)
     - Create free account at https://mongodb.com/atlas
     - Create cluster and get connection string

3. **Git** (Optional): Download from https://git-scm.com/download/win

## Quick Setup with Batch Script

1. **Download/Clone the project**
2. **Run the automated setup**:
   ```cmd
   setup-local.bat
   ```
3. **Follow the prompts** and edit the created .env file

## Manual Setup Instructions

### Step 1: Install Dependencies
```cmd
npm install
```

### Step 2: Environment Configuration
1. **Copy environment template**:
   ```cmd
   copy .env.local.example .env
   ```

2. **Edit .env file** with your text editor (Notepad, VS Code, etc.):
   ```bash
   # Database Configuration
   MONGODB_URL=mongodb://localhost:27017/DUSK
   
   # Session Security (IMPORTANT: Change this!)
   SESSION_SECRET=your-very-secure-random-secret-key-here-change-this-immediately
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5000
   
   # Email Configuration (see EMAIL_SETUP.md)
   EMAIL_APP_PASSWORD=your-gmail-app-password
   ```

### Step 3: Start Development Server

**Option 1: Standard method** (may not work on all Windows versions):
```cmd
npm run dev
```

**Option 2: If you get "NODE_ENV is not recognized" error**:
```cmd
npx cross-env NODE_ENV=development tsx server/index.ts
```

**Option 3: Command Prompt method**:
```cmd
set NODE_ENV=development && tsx server/index.ts
```

**Option 4: PowerShell method**:
```powershell
$env:NODE_ENV="development"; tsx server/index.ts
```

### Step 4: Create Admin User
1. **Make sure the server is running** (from Step 3)
2. **Open a new Command Prompt window**
3. **Run the admin creation script**:
   ```cmd
   create-admin.bat
   ```
   
   Or manually:
   ```cmd
   curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"admin@lifesteal.com\",\"password\":\"admin123\",\"firstName\":\"Admin\",\"lastName\":\"User\"}"
   
   curl -X POST http://localhost:5000/api/debug/make-admin -H "Content-Type: application/json" -d "{\"email\":\"admin@lifesteal.com\"}"
   ```

## Windows-Specific Troubleshooting

### NODE_ENV Issues
**Problem**: `'NODE_ENV' is not recognized as an internal or external command`

**Solutions**:
1. **Install cross-env globally** (Recommended):
   ```cmd
   npm install -g cross-env
   ```
   Then use: `npm run dev`

2. **Use npx**:
   ```cmd
   npx cross-env NODE_ENV=development tsx server/index.ts
   ```

3. **Set variable manually**:
   ```cmd
   set NODE_ENV=development
   tsx server/index.ts
   ```

4. **PowerShell method**:
   ```powershell
   $env:NODE_ENV="development"
   tsx server/index.ts
   ```

### MongoDB Issues

#### MongoDB Service Not Starting
1. **Check Windows Services**:
   - Press `Win + R`, type `services.msc`
   - Look for "MongoDB Server" service
   - Right-click and select "Start" if stopped

2. **Check if MongoDB is running**:
   ```cmd
   mongosh
   ```
   Or the older client:
   ```cmd
   mongo
   ```

3. **If MongoDB isn't installed properly**:
   - Reinstall MongoDB Community Server
   - Make sure to install as a Windows service
   - Check that the MongoDB bin folder is in your PATH

#### Docker MongoDB
If using Docker:
```cmd
# Check if Docker is running
docker ps

# Start MongoDB container
docker run --name lifesteal-mongo -p 27017:27017 -d mongo:latest

# Check container status
docker ps -a
```

### Port Issues
**Problem**: Port 5000 already in use

**Solutions**:
1. **Change port in .env file**:
   ```
   PORT=3000
   ```

2. **Find what's using port 5000**:
   ```cmd
   netstat -ano | findstr :5000
   ```

3. **Kill the process** (replace PID with actual process ID):
   ```cmd
   taskkill /PID <PID> /F
   ```

### Permission Issues
**Problem**: Access denied errors

**Solutions**:
1. **Run Command Prompt as Administrator**:
   - Right-click Command Prompt
   - Select "Run as administrator"

2. **Check antivirus software**:
   - Some antivirus may block file operations
   - Add project folder to exclusions

### File Path Issues
**Problem**: Long file paths or special characters

**Solutions**:
1. **Keep project in simple path**:
   - Use `C:\lifesteal-shop\` instead of long nested paths
   - Avoid spaces and special characters in folder names

2. **Enable long path support** (Windows 10/11):
   ```cmd
   # Run as Administrator
   reg add HKLM\SYSTEM\CurrentControlSet\Control\FileSystem /v LongPathsEnabled /t REG_DWORD /d 1
   ```

### curl Command Issues
**Problem**: curl command not found

**Solutions**:
1. **Windows 10/11**: curl is included by default
2. **Older Windows**: Install Git for Windows (includes curl)
3. **Alternative**: Use PowerShell's Invoke-RestMethod:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:5000/api/products" -Method GET
   ```

## Development Workflow for Windows

### Daily Development
1. **Start MongoDB** (if using local MongoDB):
   - Should start automatically with Windows
   - Check in Windows Services if needed

2. **Start development server**:
   ```cmd
   npx cross-env NODE_ENV=development tsx server/index.ts
   ```

3. **Open application**: http://localhost:5000

### Email Setup for Windows
1. **Follow EMAIL_SETUP.md** for Gmail configuration
2. **Add EMAIL_APP_PASSWORD to .env file**
3. **Restart the development server**

### Production Build on Windows
```cmd
# Build the application
npm run build

# Start production server
set NODE_ENV=production && node dist/index.js
```

## Recommended Windows Tools

### Code Editors
- **Visual Studio Code**: Free, excellent TypeScript support
- **WebStorm**: Full-featured IDE for JavaScript/TypeScript
- **Sublime Text**: Lightweight editor

### Terminal Alternatives
- **Windows Terminal**: Modern terminal with tabs and themes
- **PowerShell 7**: Cross-platform PowerShell
- **Git Bash**: Unix-like terminal (comes with Git for Windows)

### Database Tools
- **MongoDB Compass**: Official GUI for MongoDB
- **Robo 3T**: Lightweight MongoDB client
- **mongosh**: Modern MongoDB shell

## Performance Tips for Windows

1. **Exclude project folder from Windows Defender**:
   - Windows Security → Virus & threat protection
   - Manage settings → Add exclusion
   - Add your project folder

2. **Use SSD storage** for better file I/O performance

3. **Close unnecessary programs** during development

4. **Consider WSL2** for Linux-like development environment:
   ```cmd
   wsl --install
   ```

## Getting Help

### Common Issues
- **Check Windows Event Viewer** for system-level errors
- **Use Windows Task Manager** to check resource usage
- **Check Windows Firewall** if having network issues

### Useful Commands
```cmd
# Check Node.js version
node --version

# Check npm version
npm --version

# Check if MongoDB is running
mongosh --eval "db.runCommand('ping')"

# Check what's running on port 5000
netstat -ano | findstr :5000

# Clear npm cache
npm cache clean --force
```

### Support Resources
- [Node.js Windows Documentation](https://nodejs.org/en/download/package-manager/#windows)
- [MongoDB Windows Installation](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/)
- [npm Windows Troubleshooting](https://docs.npmjs.com/troubleshooting)

The LifeSteal Shop is designed to work seamlessly on Windows with proper setup. Follow this guide for the best experience on Windows systems.