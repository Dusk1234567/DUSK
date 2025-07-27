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
- **Database**: PostgreSQL (configured via Drizzle)
- **ORM**: Drizzle ORM with Neon database connector
- **Schema Management**: Drizzle Kit for migrations and schema updates
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
- **Database**: Drizzle ORM, Neon serverless connector, connect-pg-simple
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
- **Database**: Neon serverless PostgreSQL with connection pooling
- **Environment**: Development-specific error handling and logging

### Production Build
- **Frontend**: Vite builds to `dist/public` with optimized assets
- **Backend**: ESBuild bundles server to `dist/index.js` with external packages
- **Static Files**: Express serves built frontend files in production
- **Database**: Production Neon database with proper connection management

### Environment Configuration
- **Database**: `DATABASE_URL` environment variable required
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

- **July 27, 2025**: Successfully activated Google OAuth authentication
  - Configured Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
  - Updated frontend login and register pages to enable working Google OAuth buttons
  - Google authentication fully integrated with existing user system
  - Users can now sign in with Google accounts seamlessly
  - Google OAuth automatically links accounts with existing email users

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