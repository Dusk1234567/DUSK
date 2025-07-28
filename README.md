# LifeSteal Shop - Complete Minecraft E-commerce Platform

A comprehensive e-commerce platform built specifically for Minecraft servers, featuring product sales, user authentication, order management, coupon system, whitelist management, and a complete admin dashboard with email notifications.

## 🚀 Quick Start (Local Development)

### Automated Setup

**Linux/macOS:**
```bash
bash setup-local.sh
```

**Windows:**
```batch
setup-local.bat
```

### Manual Setup

1. **Install Node.js 18+** from https://nodejs.org/
2. **Setup MongoDB** (choose one):
   - Local: Install from https://mongodb.com/try/download/community
   - Docker: `docker run --name lifesteal-mongo -p 27017:27017 -d mongo:latest`
   - Cloud: Use MongoDB Atlas (free tier)
3. **Configure Environment**:
   ```bash
   cp .env.local.example .env
   # Edit .env with your settings
   ```
4. **Install Dependencies**: `npm install`
5. **Start Development**: `npm run dev`
6. **Visit**: http://localhost:5000

### Create Admin User
```bash
# Linux/macOS
bash create-admin.sh

# Windows
create-admin.bat

# Manual (server must be running)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lifesteal.com","password":"admin123","firstName":"Admin","lastName":"User"}'

curl -X POST http://localhost:5000/api/debug/make-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lifesteal.com"}'
```

## 📖 Complete Documentation

| Guide | Description |
|-------|-------------|
| **[LOCALHOST_SETUP.md](LOCALHOST_SETUP.md)** | Comprehensive local development setup |
| **[EMAIL_SETUP.md](EMAIL_SETUP.md)** | Email notifications configuration |
| **[ADMIN_GUIDE.md](ADMIN_GUIDE.md)** | Admin dashboard usage and management |
| **[WINDOWS_SETUP.md](WINDOWS_SETUP.md)** | Windows-specific setup instructions |

## 🎮 Features

### Customer Experience
- 🛍️ **Product Catalog**: Premium Minecraft ranks and coin packages
- 🛒 **Shopping Cart**: Real-time cart with quantity management
- 👤 **Authentication**: Email/password + optional Google OAuth
- 📦 **Order Tracking**: Public order status lookup with detailed history
- 💳 **Payment System**: QR code payment with screenshot upload
- 📧 **Email Notifications**: Automated order confirmations and updates
- 🎮 **Minecraft Integration**: Player name validation and server whitelist
- 📱 **Responsive Design**: Optimized for mobile and desktop

### Admin Management
- 👑 **Admin Dashboard**: Complete order and user management
- 📊 **Order Processing**: Status updates with automatic email notifications
- 🎫 **Coupon System**: Create discount codes with flexible rules
- 👥 **User Management**: View users and grant admin privileges
- 🎮 **Whitelist Management**: Approve/reject Minecraft server access
- 📈 **Analytics**: Order tracking and sales overview
- 🔧 **System Tools**: Debug endpoints and administrative controls

### Technical Features
- 🔒 **Secure Authentication**: JWT tokens with bcrypt password hashing
- 🛡️ **Data Protection**: Session management and secure file uploads
- ⚡ **Performance**: MongoDB with memory storage fallback
- 🌙 **Gaming Theme**: Minecraft-inspired UI with dark mode
- 🔄 **Real-time Updates**: Live cart updates and order status changes
- 📱 **Cross-platform**: Works on Windows, macOS, and Linux

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **TanStack Query** for state management
- **Wouter** for routing
- **Vite** for development and building

### Backend
- **Node.js** with Express
- **TypeScript** with ES modules
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **Multer** for file uploads
- **Nodemailer** for email notifications

### Database
- **MongoDB** for primary storage
- **Memory Storage** fallback for development
- **Automatic Schema Creation** with validation

## 🔧 Development Commands

```bash
# Development
npm run dev                    # Start development server
npm run check                  # TypeScript type checking

# Production
npm run build                  # Build for production
npm run start                  # Start production server

# Cross-platform support
npx cross-env NODE_ENV=development tsx server/index.ts    # Windows compatible
```

## 📁 Project Structure

```
lifesteal-ecommerce/
├── client/                    # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Application pages/routes
│   │   ├── hooks/            # Custom React hooks
│   │   └── lib/              # Utilities and configurations
├── server/                    # Express backend server
│   ├── routes.ts             # API endpoints
│   ├── storage.ts            # Database abstraction layer
│   ├── emailService.ts       # Email notification system
│   └── auth/                 # Authentication modules
├── shared/                    # Shared TypeScript types and schemas
├── uploads/                   # File upload storage
├── setup-local.sh             # Automated setup script (Linux/macOS)
├── setup-local.bat            # Automated setup script (Windows)
├── create-admin.sh            # Admin user creation (Linux/macOS)
├── create-admin.bat           # Admin user creation (Windows)
└── .env.local.example         # Environment configuration template
```

## 🌐 Environment Configuration

### Required Settings
```bash
# Database (MongoDB)
MONGODB_URL=mongodb://localhost:27017/DUSK

# Security (IMPORTANT: Change this!)
SESSION_SECRET=your-very-secure-random-secret-key-here

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5000
```

### Optional Features
```bash
# Email Notifications (Highly Recommended)
EMAIL_APP_PASSWORD=your-16-character-gmail-app-password

# Google OAuth Login
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# File Upload Settings
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

## 🔐 Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **Session Management**: Secure session tokens with expiration
- **File Upload Security**: Type validation and size limits
- **Admin Controls**: Role-based access control
- **CSRF Protection**: Built-in session protection
- **Input Validation**: Zod schema validation on all endpoints

## 🚀 Deployment Options

### Local Development
- Memory storage fallback when MongoDB unavailable
- Hot reload with TypeScript support
- Comprehensive error logging and debugging

### Production Deployment
- MongoDB Atlas or self-hosted MongoDB
- Environment-specific configurations
- Email notifications for customer engagement
- Admin dashboard for complete control

## 💡 Common Use Cases

1. **Minecraft Server Owners**: Sell ranks, coins, and perks
2. **Gaming Communities**: Manage whitelist and user access
3. **E-commerce**: Product catalog with payment processing
4. **Admin Management**: Complete order and user administration
5. **Customer Service**: Automated emails and order tracking

## 🐛 Troubleshooting

### Windows Users
If you encounter `'NODE_ENV' is not recognized`:
```bash
npx cross-env NODE_ENV=development tsx server/index.ts
```

### Database Issues
- App automatically uses memory storage if MongoDB unavailable
- Check MongoDB service status: `brew services list | grep mongodb` (macOS)
- Docker MongoDB: `docker ps` to check if container is running

### Email Not Working
- Verify Gmail App Password setup (see EMAIL_SETUP.md)
- Check server logs for detailed error messages
- Test with different email addresses

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🤝 Support

- Check the documentation guides for detailed setup instructions
- Review server console logs for error details
- Verify environment configuration matches examples
- Test with the provided admin account for debugging

---

**Ready to start?** Run `bash setup-local.sh` (Linux/macOS) or `setup-local.bat` (Windows) for automatic setup!