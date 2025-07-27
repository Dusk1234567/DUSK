import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCartItemSchema, insertOrderSchema, insertReviewSchema, insertAdminWhitelistSchema, insertWhitelistRequestSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupGoogleAuth } from "./googleAuth";
import { setupEmailAuth } from "./emailAuth";
import { randomUUID } from "crypto";

declare module 'express-session' {
  interface SessionData {
    id?: string;
    userId?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication systems
  await setupAuth(app);
  setupGoogleAuth(app);
  setupEmailAuth(app);

  // Get session ID or create one
  function getSessionId(req: Request): string {
    if (!req.session.id) {
      req.session.id = randomUUID();
    }
    return req.session.id;
  }

  // Unified authentication middleware that supports both session and Replit auth
  const isAuthenticatedUser = async (req: any, res: any, next: any) => {
    try {
      let userId: string | undefined;
      
      // Check for session-based auth first (email/Google)
      if (req.session?.userId) {
        userId = req.session.userId;
        req.userId = userId; // Set userId for easy access
        return next();
      }
      // Check for Replit auth
      else if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
        userId = req.user.claims.sub;
        req.userId = userId; // Set userId for easy access
        return next();
      }
      
      return res.status(401).json({ message: "Unauthorized" });
    } catch (error) {
      console.error("Authentication error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  };

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category } = req.query;
      let products;
      
      if (category && typeof category === 'string') {
        products = await storage.getProductsByCategory(category);
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const cartItems = await storage.getCartItems(sessionId);
      
      // Get product details for each cart item
      const cartWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProductById(item.productId);
          return {
            ...item,
            product
          };
        })
      );
      
      res.json(cartWithProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      console.log("Session ID:", sessionId);
      console.log("Request body:", req.body);
      
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        sessionId
      });
      console.log("Parsed cart item data:", cartItemData);

      const cartItem = await storage.addToCart(cartItemData);
      const product = await storage.getProductById(cartItem.productId);
      
      res.json({
        ...cartItem,
        product
      });
    } catch (error) {
      console.error("Cart error:", error);
      res.status(400).json({ 
        message: "Failed to add item to cart",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const { quantity } = req.body;
      if (typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      const updatedItem = await storage.updateCartItem(req.params.id, quantity);
      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      const product = await storage.getProductById(updatedItem.productId);
      res.json({
        ...updatedItem,
        product
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const success = await storage.removeFromCart(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      await storage.clearCart(sessionId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Orders routes
  app.post("/api/orders", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const { playerName, email, paymentMethod, items } = req.body;
      
      const cartItems = await storage.getCartItems(sessionId);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Calculate total amount from cart items
      let totalAmount = 0;
      const orderItems = [];
      
      for (const item of cartItems) {
        const product = await storage.getProductById(item.productId);
        if (product) {
          const itemTotal = parseFloat(product.price) * item.quantity;
          totalAmount += itemTotal;
          
          orderItems.push({
            productId: product.id,
            productName: product.name,
            quantity: item.quantity,
            unitPrice: product.price,
            totalPrice: itemTotal.toFixed(2)
          });
        }
      }

      // Get user ID if authenticated
      let userId: string | undefined;
      if (req.session?.userId) {
        userId = req.session.userId;
      } else if (req.isAuthenticated && req.isAuthenticated() && req.user?.id) {
        userId = req.user.id;
      }

      const orderData = insertOrderSchema.parse({
        sessionId,
        userId,
        totalAmount: totalAmount.toFixed(2),
        status: "pending",
        playerName: playerName?.trim(),
        email: email?.trim(),
        paymentMethod: paymentMethod || "pending",
        items: orderItems
      });

      const order = await storage.createOrder(orderData);
      
      // Clear cart after creating order
      await storage.clearCart(sessionId);
      
      res.json(order);
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user has permission to view this order
      const sessionId = getSessionId(req);
      let userId: string | undefined;
      
      if (req.session?.userId) {
        userId = req.session.userId;
      } else if (req.isAuthenticated && req.isAuthenticated() && req.user?.id) {
        userId = req.user.id;
      }
      
      // Allow access if it's the user's order (by session or user ID)
      if (order.sessionId !== sessionId && order.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Get user's orders
  app.get("/api/user/orders", isAuthenticatedUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      const orders = await storage.getOrdersByUser(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Auth routes - support both session and Replit auth
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      let userId: string | undefined;
      
      // Check for session-based auth first (email/Google)
      if (req.session?.userId) {
        userId = req.session.userId;
      }
      // Check for Replit auth
      else if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      }
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Logout route
  app.post('/api/auth/logout', async (req: any, res) => {
    try {
      // Clear session for email/Google auth
      if (req.session) {
        req.session.destroy((err: any) => {
          if (err) {
            console.error("Session destroy error:", err);
          }
        });
      }
      
      // Handle Replit auth logout
      if (req.logout) {
        req.logout(() => {});
      }
      
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ message: "Failed to logout" });
    }
  });

  // Reviews routes
  app.get('/api/reviews/:productId', async (req, res) => {
    try {
      const reviews = await storage.getReviewsByProduct(req.params.productId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.get('/api/products/:productId/reviews', async (req, res) => {
    try {
      const reviews = await storage.getReviewsByProduct(req.params.productId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/reviews', isAuthenticatedUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId
      });

      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(400).json({ 
        message: "Failed to create review",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post('/api/products/:productId/reviews', isAuthenticatedUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId,
        productId: req.params.productId
      });

      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(400).json({ 
        message: "Failed to create review",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get('/api/user/reviews', isAuthenticatedUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      const reviews = await storage.getReviewsByUser(userId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      res.status(500).json({ message: "Failed to fetch user reviews" });
    }
  });

  // Admin routes - require admin authentication
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      let userId: string | undefined;
      
      // Check for session-based auth first (email/Google)
      if (req.session.userId) {
        userId = req.session.userId;
      }
      // Check for Replit auth
      else if (req.isAuthenticated() && req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      }
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const isUserAdmin = await storage.isUserAdmin(userId);
      if (!isUserAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: "Failed to verify admin status" });
    }
  };

  app.get('/api/admin/stats', isAdmin, async (req, res) => {
    try {
      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get('/api/admin/orders', isAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/whitelist', isAdmin, async (req, res) => {
    try {
      const whitelist = await storage.getAdminWhitelist();
      res.json(whitelist);
    } catch (error) {
      console.error("Error fetching admin whitelist:", error);
      res.status(500).json({ message: "Failed to fetch admin whitelist" });
    }
  });

  app.post('/api/admin/whitelist', isAdmin, async (req: any, res) => {
    try {
      const adminData = insertAdminWhitelistSchema.parse(req.body);
      const admin = await storage.addToAdminWhitelist(adminData);
      res.json(admin);
    } catch (error) {
      console.error("Error adding admin:", error);
      res.status(400).json({ 
        message: "Failed to add admin",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.delete('/api/admin/whitelist/:email', isAdmin, async (req, res) => {
    try {
      const email = decodeURIComponent(req.params.email);
      const success = await storage.removeFromAdminWhitelist(email);
      if (!success) {
        return res.status(404).json({ message: "Admin not found" });
      }
      res.json({ message: "Admin removed successfully" });
    } catch (error) {
      console.error("Error removing admin:", error);
      res.status(500).json({ message: "Failed to remove admin" });
    }
  });

  app.put('/api/admin/orders/:id/status', isAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const updatedOrder = await storage.updateOrderStatus(req.params.id, status);
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Whitelist request routes
  app.post('/api/whitelist', async (req: any, res) => {
    try {
      // Check if user is authenticated to link request to user account
      let userId: string | undefined;
      if (req.session.userId) {
        userId = req.session.userId;
      } else if (req.isAuthenticated() && req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      }

      const requestData = insertWhitelistRequestSchema.parse({
        ...req.body,
        userId
      });

      // Check if username is already requested
      const existingRequest = await storage.getWhitelistRequestByUsername(requestData.minecraftUsername);
      if (existingRequest && existingRequest.status === 'pending') {
        return res.status(400).json({ message: "A whitelist request for this username is already pending" });
      }

      const request = await storage.createWhitelistRequest(requestData);
      res.json(request);
    } catch (error) {
      console.error("Error creating whitelist request:", error);
      res.status(400).json({ 
        message: "Failed to create whitelist request",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get('/api/whitelist', async (req: any, res) => {
    try {
      let requests;
      // If user is authenticated, get their requests
      if (req.session.userId || (req.isAuthenticated() && req.user?.claims?.sub)) {
        const userId = req.session.userId || req.user.claims.sub;
        requests = await storage.getWhitelistRequestsByUser(userId);
      } else {
        // For anonymous users, return empty array or error
        return res.status(401).json({ message: "Authentication required to view whitelist requests" });
      }
      
      res.json(requests);
    } catch (error) {
      console.error("Error fetching whitelist requests:", error);
      res.status(500).json({ message: "Failed to fetch whitelist requests" });
    }
  });

  // Admin whitelist management routes
  app.get('/api/admin/whitelist-requests', isAdmin, async (req, res) => {
    try {
      const requests = await storage.getWhitelistRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching whitelist requests:", error);
      res.status(500).json({ message: "Failed to fetch whitelist requests" });
    }
  });

  app.put('/api/admin/whitelist-requests/:id', isAdmin, async (req: any, res) => {
    try {
      const { status, reason } = req.body;
      let processedBy: string | undefined;
      
      if (req.session.userId) {
        processedBy = req.session.userId;
      } else if (req.isAuthenticated() && req.user?.claims?.sub) {
        processedBy = req.user.claims.sub;
      }

      const updatedRequest = await storage.updateWhitelistRequestStatus(
        req.params.id, 
        status, 
        reason, 
        processedBy
      );
      
      if (!updatedRequest) {
        return res.status(404).json({ message: "Whitelist request not found" });
      }
      
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating whitelist request:", error);
      res.status(500).json({ message: "Failed to update whitelist request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
