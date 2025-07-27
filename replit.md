# LifeSteal Shop - Minecraft Server Store

## Overview

This is a full-stack e-commerce application built for a Minecraft server shop, allowing players to purchase premium ranks and in-game coins. The application features a modern gaming-themed UI with a complete shopping cart system and order management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom gaming theme colors (Minecraft green, neon cyan/magenta)
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **State Management**: React Context for cart state, TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Session Management**: Session-based cart tracking using random UUIDs
- **Error Handling**: Centralized error middleware with proper HTTP status codes

### Data Storage Solutions
- **Database**: MongoDB (configured via Mongoose)
- **ORM**: Mongoose ODM for MongoDB integration
- **Schema Management**: Mongoose schemas with validation
- **Development Storage**: In-memory storage class for development/testing

### UI/UX Design
- **Theme**: Dark gaming theme with Minecraft-inspired color palette
- **Responsive**: Mobile-first design with responsive breakpoints
- **Gaming Elements**: Custom animations, glowing effects, and gaming typography
- **Shopping Experience**: Sidebar cart, product filtering, and smooth scrolling navigation

## Key Components

### Frontend Components
- **Layout Components**: Header with navigation, Hero section, Footer
- **Product Components**: ProductGrid with filtering, ProductCard with theming
- **Cart Components**: CartSidebar with quantity management and checkout
- **UI Components**: Complete Shadcn/ui component library
- **Custom Hooks**: useCart for cart management, useToast for notifications

### Backend Components
- **Route Handlers**: Products API, Cart management API, Orders API
- **Storage Layer**: Abstract storage interface with memory and database implementations
- **Middleware**: Request logging, error handling, and development tools
- **Development Tools**: Vite integration for HMR and static file serving

### Database Schema
- **Products Table**: Name, description, price, category (ranks/coins), images, badges
- **Cart Items Table**: Session-based cart with product references and quantities
- **Orders Table**: Order tracking with session ID, total amount, and status

## Data Flow

1. **Product Browsing**: Client fetches products from `/api/products` with optional category filtering
2. **Cart Management**: Session-based cart operations through `/api/cart` endpoints
3. **Order Processing**: Cart checkout creates orders via `/api/orders` endpoint
4. **State Management**: TanStack Query handles server state with automatic cache invalidation
5. **UI Updates**: React Context provides cart state to all components with real-time updates

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: React 18, React DOM, React Query for state management
- **UI Libraries**: Radix UI primitives, Lucide React icons, Class Variance Authority
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Development**: Vite, TypeScript, ESLint configuration

### Backend Dependencies
- **Server**: Express.js, Node.js built-ins (crypto, path, fs)
- **Database**: Mongoose ODM for MongoDB integration
- **Development**: TSX for TypeScript execution, Vite integration
- **Utilities**: Date-fns for date handling, Zod for validation

### Development Tools
- **Build Tools**: Vite for frontend, ESBuild for backend bundling
- **Development**: Hot Module Replacement, Runtime error overlay
- **Replit Integration**: Cartographer plugin, development banner

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR and proxy to backend
- **Backend**: TSX with auto-restart on file changes
- **Database**: MongoDB with Mongoose ODM for document storage
- **Environment**: Development-specific error handling and logging

### Production Build
- **Frontend**: Vite builds to `dist/public` with optimized assets
- **Backend**: ESBuild bundles server to `dist/index.js` with external packages
- **Static Files**: Express serves built frontend files in production
- **Database**: Production MongoDB database with proper connection management

### Environment Configuration
- **Database**: `MONGODB_URL` environment variable (falls back to local MongoDB)
- **Session Management**: In-memory sessions for development, database-backed for production
- **Asset Serving**: Development uses Vite middleware, production serves static files
- **Error Handling**: Development shows detailed errors, production returns sanitized responses

### Key Architectural Decisions

1. **Multi-Authentication System**: Supports both email/password and Google OAuth authentication with unified session management
2. **Database Storage**: PostgreSQL with Drizzle ORM for persistent user data, orders, and admin management
3. **Admin System**: Whitelist-based admin access control with comprehensive order and user management
4. **Session-based Cart**: Works for both authenticated and anonymous users with seamless login integration
5. **Monorepo Structure**: Shared types and schema between frontend and backend
6. **Gaming Theme**: Custom CSS variables and Tailwind config for consistent theming
7. **Component Library**: Shadcn/ui provides consistent, accessible components
8. **Query Management**: TanStack Query handles caching, loading states, and error management

### Recent Changes

- **July 27, 2025**: Successfully migrated database from PostgreSQL to MongoDB
  - Replaced Drizzle ORM with Mongoose ODM for better NoSQL document management
  - Updated all database schemas to use MongoDB document structure with proper TypeScript interfaces
  - Converted storage layer to work with MongoDB collections and Mongoose methods
  - Maintained backward compatibility with existing API endpoints and frontend code
  - Database setup now uses MongoDB with default database name "DUSK"
  - Updated environment configuration to use MONGODB_URL instead of DATABASE_URL
  - Created comprehensive localhost setup guide with MongoDB configuration instructions
  - Added support for local MongoDB, Docker MongoDB, and MongoDB Atlas cloud options
  - Implemented automatic memory storage fallback when MongoDB is unavailable
  - Fixed server startup issues with non-blocking database connections and shorter timeouts
  - Application now works seamlessly in both MongoDB and memory storage modes
  - Fixed Windows NODE_ENV compatibility issues with cross-env package installation
  - Made Replit authentication conditional to work in local development environments
  - Created Windows-specific setup guide with comprehensive troubleshooting

- **July 27, 2025**: Fixed critical orderData.items.map runtime error
  - Issue: Order items were stored as JSON strings but frontend expected arrays
  - Solution: Added JSON parsing in all order retrieval endpoints
  - Fixed endpoints: individual orders, order lookup, admin orders, and user orders
  - Added proper error handling for malformed JSON data
  - All order pages now display items correctly without runtime errors

- **July 27, 2025**: Successfully implemented comprehensive email notification system
  - ✓ Created professional email service using free Gmail SMTP with HTML templates
  - ✓ Fixed EMAIL_APP_PASSWORD secret configuration issue - emails now working perfectly
  - ✓ Automatic order confirmation emails sent immediately upon order creation
  - ✓ Order status update emails when admins change order status
  - ✓ Fixed order tracking functionality with proper query parameter handling
  - ✓ Created detailed EMAIL_SETUP.md guide with Gmail App Password instructions
  - ✓ Email system gracefully handles missing credentials and provides detailed logging
  - ✓ Professional branded emails include order details, tracking links, and responsive design
  - ✓ Fixed data type issues preventing email delivery (.toFixed() errors resolved)
  - ✓ Fixed unique order ID generation to prevent duplicate IDs on server restarts
  - ✓ Verified successful email delivery with message IDs and SMTP debugging
  - ✓ Email system now fully operational for both order confirmations and status updates

- **July 27, 2025**: System status verification and admin access confirmation
  - ✓ Email notifications working perfectly with Gmail SMTP and professional templates
  - ✓ Order tracking system functional with proper JSON parsing of order items
  - ✓ Admin user chiraggupta0223360@gmail.com confirmed with full dashboard access
  - ✓ Unique order ID generation implemented in memory storage for better tracking
  - ✓ System using memory storage as fallback when MongoDB unavailable
  - ✓ All core functionalities operational: authentication, cart, orders, email notifications
  - ✓ Previous orders successfully created with proper email confirmations sent

- **July 27, 2025**: Fixed order tracking system duplicate route issue
  - ✓ Removed duplicate route definition causing tracking conflicts
  - ✓ Order tracking now working perfectly with unique timestamp-based IDs
  - ✓ Verified order MDLXAYHR-2XNKP0 retrievable with full details
  - ✓ Public order tracking endpoint functional for customer self-service
  - ✓ System successfully generates and tracks orders with proper unique identifiers

- **July 27, 2025**: Added comprehensive order management system
  - Created separate order lookup page requiring email verification for security
  - Added order cancellation functionality for pending and payment-pending orders
  - Updated checkout to require email for all orders (authenticated users use account email)
  - QR code payment cancellation automatically cancels orders to prevent orphaned pending orders
  - Email field is now required in database schema for proper order tracking
  - Users can cancel orders through the order lookup page or when closing QR payment modals

- **July 27, 2025**: Google OAuth temporarily disabled
  - Google OAuth setup was completed but disabled per user request
  - Frontend shows "Google Login Temporarily Disabled" message
  - Email authentication remains fully functional
  - Google OAuth can be re-enabled by uncommenting setupGoogleAuth(app) in routes.ts

- **July 27, 2025**: Successfully implemented Minecraft server whitelist system
  - Created comprehensive whitelist request page for users to submit Minecraft usernames
  - Added whitelist requests database table with status tracking (pending, approved, rejected)
  - Implemented whitelist management in admin dashboard with approval/rejection functionality
  - Added navigation link to whitelist page in main header
  - Users can optionally provide email and Discord for contact
  - Admin can add reasons for rejections and track processing history
  - Support for both authenticated and anonymous whitelist requests

- **July 26, 2025**: Successfully implemented comprehensive authentication system
  - Added email registration and login with password hashing
  - Integrated Google OAuth with proper session handling
  - Created admin dashboard with user management and order tracking
  - Fixed cart functionality to work seamlessly with authenticated users
  - Updated routing to make authentication pages accessible
  - Database schema includes user profiles, orders, cart items, and admin whitelist