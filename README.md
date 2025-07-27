# Minecraft Lifesteal E-commerce Platform

A comprehensive e-commerce platform specifically designed for Minecraft Lifesteal servers, featuring advanced order management, user authentication, and payment processing capabilities.

## 🚀 Quick Start

### For Local Development

1. **Prerequisites**
   - Node.js 18+ 
   - MongoDB (local or cloud)
   - Git

2. **Installation**
   ```bash
   git clone <repository-url>
   cd lifesteal-ecommerce
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URL and other settings
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   Visit: http://localhost:5000

## 📚 Documentation

- [Complete Localhost Setup Guide](./LOCALHOST_SETUP.md) - Detailed instructions for running locally
- [Environment Variables Guide](./.env.example) - All configuration options

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Session-based + Optional Google OAuth
- **Build Tool**: Vite
- **UI Components**: Shadcn/ui + Radix UI

### Database Design
- **MongoDB Collections**: Products, Orders, Users, Cart Items, Reviews, Payment Confirmations
- **Fallback**: Automatic in-memory storage when MongoDB is unavailable
- **Schema Validation**: Zod schemas for type safety

## 🌟 Features

- 🛍️ **Product Management**: Browse products by category with advanced filtering
- 🛒 **Shopping Cart**: Session-based cart with real-time updates
- 👤 **Authentication**: Email/password + optional Google OAuth
- 📦 **Order System**: Complete order lifecycle management
- 💳 **Payment Processing**: Screenshot-based payment confirmation
- 🎮 **Minecraft Integration**: Player name validation and server whitelist management
- 👑 **Admin Panel**: Order management, user administration, analytics
- 📱 **Responsive Design**: Mobile-first UI with dark/light mode
- 🔒 **Security**: Input validation, SQL injection prevention, secure sessions

## 🔧 Environment Variables

### Required
- `MONGODB_URL`: MongoDB connection string
- `SESSION_SECRET`: Session encryption key
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode

### Optional
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth secret
- `SMTP_*`: Email configuration
- `UPLOAD_DIR`: File upload directory

See [.env.example](./.env.example) for complete list.

## 🗄️ Database Options

### Local MongoDB
```bash
# Install MongoDB locally
brew install mongodb/brew/mongodb-community  # macOS
# or download from mongodb.com

# Start MongoDB
brew services start mongodb-community  # macOS
```

### Docker MongoDB
```bash
docker run --name mongo -p 27017:27017 -d mongo:latest
```

### MongoDB Atlas (Cloud)
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URL` in `.env`

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Use production MongoDB database
3. Configure secure session secrets
4. Set up HTTPS and domain
5. Configure file upload storage

### Build Commands
```bash
npm run build    # Build for production
npm run start    # Start production server
npm run check    # TypeScript type checking
```

## 🛠️ Development

### Project Structure
```
lifesteal-ecommerce/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Route components
│   │   ├── components/    # Reusable UI components
│   │   └── lib/          # Utilities and hooks
├── server/                # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API endpoints
│   ├── storage.ts        # Database operations
│   └── auth/             # Authentication modules
├── shared/               # Shared TypeScript types
│   └── schema.ts         # Database schemas & validation
└── uploads/              # File storage (auto-created)
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking

### API Endpoints
- `GET /api/products` - List products
- `POST /api/cart` - Add to cart
- `POST /api/orders` - Create order
- `GET /api/auth/user` - Get current user
- `POST /api/reviews` - Add product review
- `GET /api/admin/*` - Admin endpoints

## 🔐 Authentication

### Email Authentication
- User registration with email/password
- Secure password hashing with bcrypt
- Session-based authentication

### Google OAuth (Optional)
1. Create Google Cloud Console project
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Set redirect URI: `http://localhost:5000/api/auth/google/callback`
5. Add credentials to `.env`

## 📝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## 🆘 Troubleshooting

### Common Issues
- **MongoDB Connection**: Check if MongoDB is running
- **Port Conflicts**: Change PORT in `.env`
- **Build Errors**: Clear `node_modules` and reinstall
- **TypeScript Errors**: Run `npm run check`

### Debug Mode
```bash
NODE_ENV=development npm run dev
```

## 📜 License

MIT License - see LICENSE file for details.

## 🤝 Support

- Check [LOCALHOST_SETUP.md](./LOCALHOST_SETUP.md) for detailed setup help
- Review environment variables in [.env.example](./.env.example)
- Ensure MongoDB is properly configured and running
- Verify all required dependencies are installed

---

Built with ❤️ for Minecraft Lifesteal communities