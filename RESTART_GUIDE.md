# How to Restart the App Locally

## Quick Restart Methods

### Option 1: Using npm (Recommended)
```bash
# Stop the current process with Ctrl+C (if running)
# Then start the app
npm run dev
```

### Option 2: Using the Replit Interface
1. **Stop Current Process**: Click the "Stop" button in the console/terminal
2. **Restart Workflow**: Click "Run" button or press Ctrl+Enter
3. **Alternative**: Use the workflow panel to restart "Start application"

## Data Persistence Issue Explained

### Why Data is Lost on Restart
- The app uses **memory storage** as a fallback when MongoDB is unavailable
- Memory storage is cleared every time the app restarts
- This is normal behavior for development environments

### MongoDB vs Memory Storage
- **MongoDB**: Data persists between restarts (requires database setup)
- **Memory Storage**: Data is temporary and lost on restart (current setup)

## Making Data Persistent

### Current Setup
Your app is configured to use MongoDB but falls back to memory storage when the database is unavailable. To make data persistent, you need to set up MongoDB.

### MongoDB Setup Options

#### Option 1: MongoDB Atlas (Cloud - Recommended)
1. Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Set the `MONGODB_URL` environment variable:
   ```bash
   MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/lifesteal-shop
   ```

#### Option 2: Local MongoDB Installation
```bash
# On macOS with Homebrew
brew install mongodb/brew/mongodb-community
brew services start mongodb/brew/mongodb-community

# On Ubuntu/Debian
sudo apt update
sudo apt install -y mongodb
sudo systemctl start mongodb

# On Windows - Download MongoDB installer from official website
```

Then set:
```bash
MONGODB_URL=mongodb://localhost:27017/lifesteal-shop
```

#### Option 3: Docker MongoDB (Quick Setup)
```bash
# Run MongoDB in Docker
docker run --name mongodb -p 27017:27017 -d mongo:latest

# Set environment variable
MONGODB_URL=mongodb://localhost:27017/lifesteal-shop
```

## Current Admin Status

Your user (chiraggupta0223360@gmail.com) was made admin, but this data is stored in **memory storage** and will be lost on restart.

### To Restore Admin Status After Restart:
```bash
# Method 1: Use the make-admin endpoint
curl -X POST http://localhost:5000/api/debug/make-admin \
  -H "Content-Type: application/json" \
  -d '{"email": "chiraggupta0223360@gmail.com"}'

# Method 2: If you have the scripts available
./create-admin.sh  # Linux/macOS
./create-admin.bat # Windows
```

## Troubleshooting Restart Issues

### Common Issues and Solutions

1. **Port Already in Use**
   ```bash
   # Kill process using port 5000
   npx kill-port 5000
   # Or on Linux/macOS
   lsof -ti:5000 | xargs kill
   ```

2. **MongoDB Connection Issues**
   - Check if MongoDB is running
   - Verify connection string in environment variables
   - App will automatically fall back to memory storage

3. **Node Modules Issues**
   ```bash
   # Clear and reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Typescript Compilation Errors**
   ```bash
   # Clear TypeScript cache
   npm run build
   ```

## Environment Variables

Create a `.env` file in your project root:
```env
# Database (required for persistent data)
MONGODB_URL=mongodb://localhost:27017/lifesteal-shop

# Email notifications (optional)
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password

# Node environment
NODE_ENV=development
```

## Development Workflow

### Typical Development Cycle:
1. **Start**: `npm run dev`
2. **Make Changes**: Edit code files
3. **Auto-Restart**: Vite automatically reloads frontend
4. **Backend Changes**: Server restarts automatically
5. **Data Reset**: Memory data is cleared on server restart

### For Persistent Development:
1. Set up MongoDB (see options above)
2. Set `MONGODB_URL` environment variable
3. Restart app: `npm run dev`
4. Data will now persist between restarts

## Quick Reference Commands

```bash
# Start the application
npm run dev

# Stop the application
# Press Ctrl+C in terminal

# Kill process if stuck
npx kill-port 5000

# Reinstall dependencies
npm install

# Check if MongoDB is running (local)
mongo --eval "db.stats()"

# Make user admin after restart
curl -X POST http://localhost:5000/api/debug/make-admin \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

## Summary

- **Memory Storage**: Data lost on restart (current behavior)
- **MongoDB**: Data persists between restarts (requires setup)
- **Admin Status**: Must be restored after each restart in memory mode
- **Restart Command**: `npm run dev` or use Replit's Run button