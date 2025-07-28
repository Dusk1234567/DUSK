# Localhost Setup Guide for Minecraft Lifesteal E-commerce Platform

This comprehensive guide will help you set up and run the complete Minecraft Lifesteal e-commerce platform on your local computer with all features including email notifications, order management, and admin functionality.

## Prerequisites

Before you begin, make sure you have the following installed on your computer:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`
   - **Required**: The application uses modern ES modules and TypeScript

2. **MongoDB** (version 4.4 or higher) - Choose one option:
   - **Option A**: Local installation from https://www.mongodb.com/try/download/community
   - **Option B**: Docker: `docker run --name lifesteal-mongo -p 27017:27017 -d mongo:latest`
   - **Option C**: MongoDB Atlas (cloud) - Free tier available

3. **Git** (for cloning the repository)
   - Download from: https://git-scm.com/

4. **Gmail Account** (for email notifications)
   - Required for order confirmations and status updates
   - See EMAIL_SETUP.md for configuration

## Quick Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository (if from git)
git clone <your-repo-url>
cd lifesteal-ecommerce

# Install dependencies
npm install
```

### 2. Database Setup

#### Option A: Local MongoDB
1. Start MongoDB service on your computer
2. MongoDB will automatically create the database when first used
3. Default connection: `mongodb://localhost:27017/DUSK`

#### Option B: Using Docker
```bash
# Start MongoDB in Docker
docker run --name lifesteal-mongo \
  -p 27017:27017 \
  -d mongo:latest
```

#### Option C: MongoDB Atlas (Cloud)
1. Sign up at https://www.mongodb.com/atlas
2. Create a free cluster
3. Get your connection string
4. Update MONGODB_URL in your .env file

### 3. Environment Configuration

1. Copy the example environment file:
   ```bash
   # Copy the local development example
   cp .env.local.example .env
   ```

2. **Required Configuration**: Edit the `.env` file with these essential settings:
   ```bash
   # Database (REQUIRED)
   MONGODB_URL=mongodb://localhost:27017/DUSK
   
   # Session Security (REQUIRED) - Generate a long random string
   SESSION_SECRET=your-very-secure-random-secret-key-here-change-this-immediately
   
   # Server Settings (REQUIRED)
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5000
   ```

3. **Email Configuration** (HIGHLY RECOMMENDED for full functionality):
   ```bash
   # Gmail App Password for order notifications
   EMAIL_APP_PASSWORD=your-16-character-gmail-app-password
   ```
   
   **📧 To setup email notifications:**
   - See `EMAIL_SETUP.md` for detailed Gmail configuration
   - Without this, order confirmations won't be sent (but app still works)

4. **Optional Features**:
   ```bash
   # Google OAuth Login (optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # File Upload Settings (optional - defaults work fine)
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE=5242880
   ```

### 4. Run the Application

```bash
# Start the development server
npm run dev
```

The application will be available at: http://localhost:5000

## Complete Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB connection string | `mongodb://localhost:27017/DUSK` |
| `SESSION_SECRET` | Secret key for session encryption | `a-very-long-random-string-here` |
| `PORT` | Server port (default: 5000) | `5000` |
| `NODE_ENV` | Environment mode | `development` |

### Optional Variables

| Variable | Description | Example | Notes |
|----------|-------------|---------|-------|
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `123456789.apps.googleusercontent.com` | Only if using Google login |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | `GOCSPX-abcdef123456` | Only if using Google login |
| `SMTP_HOST` | Email server host | `smtp.gmail.com` | For email features |
| `SMTP_PORT` | Email server port | `587` | For email features |
| `SMTP_USER` | Email username | `your-email@gmail.com` | For email features |
| `SMTP_PASS` | Email password/app password | `your-app-password` | For email features |
| `UPLOAD_DIR` | File upload directory | `./uploads` | Default: ./uploads |
| `MAX_FILE_SIZE` | Max file size in bytes | `5242880` | Default: 5MB |

## Setting Up Google OAuth (Optional)

If you want to enable Google login:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`
5. Add the credentials to your `.env` file:
   ```bash
   GOOGLE_CLIENT_ID=your-client-id-here
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   ```

## Database Migration

The application automatically creates tables and seeds initial data when it starts. If you need to reset the database:

```bash
# MongoDB doesn't require schema migrations
# Collections and indexes are created automatically
```

## Troubleshooting

### Common Issues

1. **Windows NODE_ENV Error** (`'NODE_ENV' is not recognized`)
   - **Solution 1**: Use cross-env: `npx cross-env NODE_ENV=development tsx server/index.ts`
   - **Solution 2**: Command Prompt: `set NODE_ENV=development && tsx server/index.ts`
   - **Solution 3**: PowerShell: `$env:NODE_ENV="development"; tsx server/index.ts`
   - **Solution 4**: Install cross-env globally: `npm install -g cross-env`

2. **Database Connection Error**
   - Check if MongoDB is running: `mongosh` or `mongo` (command line)
   - On Windows: Check Services for "MongoDB Server"
   - On macOS: `brew services list | grep mongodb`
   - On Linux: `sudo systemctl status mongod`
   - Verify database URL in `.env` file
   - **Note**: App will automatically use memory storage if MongoDB is unavailable

3. **Port Already in Use**
   - Change the PORT in `.env` file to a different number (e.g., 3000, 8000)
   - Windows: `netstat -ano | findstr :5000` then `taskkill /PID <pid> /F`
   - macOS/Linux: `lsof -ti:5000 | xargs kill -9`

4. **Node Modules Issues**
   - Clear cache and reinstall: `rm -rf node_modules package-lock.json && npm install`
   - Windows: `rmdir /s node_modules && del package-lock.json && npm install`

5. **Permission Errors**
   - On Linux/macOS, you might need to use `sudo` for global npm installs
   - Create uploads directory: `mkdir -p uploads` (Linux/macOS) or `mkdir uploads` (Windows)

### Development Commands

```bash
# Start development server with auto-reload
npm run dev

# Windows users: If you get "'NODE_ENV' is not recognized" error:
# Option 1: Use cross-env (recommended)
npx cross-env NODE_ENV=development tsx server/index.ts

# Option 2: Set variable separately
set NODE_ENV=development && tsx server/index.ts

# Option 3: Use PowerShell
$env:NODE_ENV="development"; tsx server/index.ts

# Build for production
npm run build

# Start production server
npm run start

# Check TypeScript types
npm run check

# MongoDB doesn't require schema migrations
# Collections and indexes are created automatically
```

## Project Structure

```
lifesteal-ecommerce/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # React pages
│   │   ├── components/    # Reusable components
│   │   └── lib/          # Utilities and hooks
├── server/                # Backend Express server
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── db.ts            # Database connection
│   └── auth/            # Authentication modules
├── shared/               # Shared types and schemas
│   └── schema.ts        # Database schema definitions
├── uploads/             # File uploads (created automatically)
├── .env                 # Environment variables (create from .env.example)
└── package.json         # Dependencies and scripts
```

## Complete Feature Set

### Customer Features
- 🛍️ **Product Catalog**: Browse premium Minecraft ranks and coin packages
- 🛒 **Shopping Cart**: Add/remove items with real-time cart updates
- 👤 **User Authentication**: Email/password registration + optional Google OAuth
- 📦 **Order Tracking**: Public order status lookup with detailed tracking
- 💳 **Payment System**: QR code payment with screenshot upload confirmation
- 📧 **Email Notifications**: Automated order confirmations and status updates
- 📱 **Responsive Design**: Full mobile and desktop compatibility
- 🎮 **Minecraft Integration**: Player name validation and whitelist requests

### Admin Features
- 👑 **Admin Dashboard**: Complete order and user management system
- 📊 **Order Management**: View, update status, and track all customer orders
- 🎫 **Coupon System**: Create and manage discount codes and promotions
- 👥 **User Management**: View registered users and admin privileges
- 🎮 **Whitelist Management**: Approve/reject Minecraft server whitelist requests
- 📈 **Analytics**: Order tracking and sales overview

### Technical Features
- 🔒 **Secure Sessions**: JWT-based authentication with session management
- 🛡️ **Data Protection**: Bcrypt password hashing and secure file uploads
- 📱 **Real-time Updates**: Live cart updates and order status changes
- 🌙 **Dark Mode**: Gaming-themed UI with Minecraft-inspired design
- ⚡ **Performance**: Optimized MongoDB queries with memory storage fallback
- 🚀 **Development Ready**: Hot reload, TypeScript, and comprehensive error handling

## Production Deployment

When ready to deploy to production:

1. Set `NODE_ENV=production` in your environment
2. Use a production MongoDB database (MongoDB Atlas recommended)
3. Set strong, unique values for all secrets
4. Configure proper HTTPS and domain settings
5. Set up proper file upload handling and backup systems

## Need Help?

- Check the console logs for detailed error messages
- Ensure all required environment variables are set
- Verify database connectivity
- Make sure all dependencies are properly installed

The application includes comprehensive error logging and will guide you through any setup issues.