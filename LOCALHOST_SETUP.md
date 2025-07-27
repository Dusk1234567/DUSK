# Localhost Setup Guide for Minecraft Lifesteal E-commerce Platform

This guide will help you set up and run the Minecraft Lifesteal e-commerce platform on your local computer.

## Prerequisites

Before you begin, make sure you have the following installed on your computer:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **MongoDB** (version 4.4 or higher)
   - Download from: https://www.mongodb.com/try/download/community
   - Or use Docker: `docker run --name mongo -p 27017:27017 -d mongo:latest`

3. **Git** (for cloning the repository)
   - Download from: https://git-scm.com/

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
   cp .env.example .env
   ```

2. Edit the `.env` file with your settings:
   ```bash
   # Required Database Configuration
   MONGODB_URL=mongodb://localhost:27017/DUSK
   
   # Required Session Secret (use a random string)
   SESSION_SECRET=your-very-secure-random-secret-key-here
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
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

1. **Database Connection Error**
   - Check if MongoDB is running: `mongosh` or `mongo` (command line)
   - On Windows: Check Services for "MongoDB Server"
   - On macOS: `brew services list | grep mongodb`
   - On Linux: `sudo systemctl status mongod`
   - Verify database URL in `.env` file

2. **Port Already in Use**
   - Change the PORT in `.env` file to a different number (e.g., 3000, 8000)
   - Or kill the process using port 5000: `lsof -ti:5000 | xargs kill -9`

3. **Node Modules Issues**
   - Clear cache and reinstall: `rm -rf node_modules package-lock.json && npm install`

4. **Permission Errors**
   - On Linux/macOS, you might need to use `sudo` for global npm installs
   - Create uploads directory: `mkdir -p uploads`

### Development Commands

```bash
# Start development server with auto-reload
npm run dev

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

## Features Available

- 🛍️ Product browsing and cart management
- 👤 User authentication (email + optional Google OAuth)
- 📦 Order management and tracking
- 💳 Payment confirmation system
- 🎮 Minecraft player management
- 👑 Admin panel for order management
- 📱 Mobile-responsive design
- 🌙 Dark/light mode support

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