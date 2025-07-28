import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCartItemSchema, insertOrderSchema, insertReviewSchema, insertAdminWhitelistSchema, insertWhitelistRequestSchema, insertPaymentConfirmationSchema, validateCouponSchema, insertCouponSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupGoogleAuth } from "./googleAuth";
import { setupEmailAuth } from "./emailAuth";
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from "./emailService.js";
import { upload } from "./upload";
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
  // setupGoogleAuth(app); // Disabled per user request
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
      const { playerName, email, paymentMethod, items, couponCode } = req.body;
      
      const cartItems = await storage.getCartItems(sessionId);
      console.log('Retrieved cart items for session', sessionId, ':', cartItems.length, 'items');
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Calculate total amount from cart items
      let originalAmount = 0;
      const orderItems = [];
      
      for (const item of cartItems) {
        const product = await storage.getProductById(item.productId);
        if (product) {
          const itemTotal = parseFloat(product.price.toString()) * item.quantity;
          originalAmount += itemTotal;
          
          orderItems.push({
            productId: product.id,
            productName: product.name,
            quantity: item.quantity,
            unitPrice: product.price,
            totalPrice: itemTotal.toFixed(2)
          });
        }
      }

      // Handle coupon discount
      let discountAmount = 0;
      let finalAmount = originalAmount;
      let appliedCouponCode: string | undefined;

      if (couponCode && couponCode.trim()) {
        const coupon = await storage.getCouponByCode(couponCode.trim());
        
        if (coupon && coupon.isActive) {
          const now = new Date();
          const validFrom = new Date(coupon.validFrom);
          const validUntil = new Date(coupon.validUntil);
          
          // Validate coupon
          if (now >= validFrom && now <= validUntil) {
            if (!coupon.minimumOrderAmount || originalAmount >= coupon.minimumOrderAmount) {
              if (!coupon.maxUsages || coupon.currentUsages < coupon.maxUsages) {
                // Apply discount
                if (coupon.discountType === 'percentage') {
                  discountAmount = (originalAmount * coupon.discountValue) / 100;
                } else {
                  discountAmount = Math.min(coupon.discountValue, originalAmount);
                }
                
                finalAmount = Math.max(0, originalAmount - discountAmount);
                appliedCouponCode = coupon.code;
                
                // Update coupon usage
                await storage.updateCouponUsage(coupon.code);
              }
            }
          }
        }
      }

      // Get user ID if authenticated
      let userId: string | undefined;
      if (req.session?.userId) {
        userId = req.session.userId;
      } else if (req.isAuthenticated && req.isAuthenticated() && (req.user as any)?.id) {
        userId = (req.user as any).id;
      }

      const orderData = insertOrderSchema.parse({
        sessionId,
        userId,
        totalAmount: parseFloat(finalAmount.toFixed(2)),
        originalAmount: parseFloat(originalAmount.toFixed(2)),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        couponCode: appliedCouponCode,
        status: "pending",
        playerName: playerName?.trim(),
        email: email?.trim(),
        paymentMethod: paymentMethod || "pending",
        items: JSON.stringify(orderItems)
      });

      const order = await storage.createOrder(orderData);
      
      // Clear cart after creating order
      await storage.clearCart(sessionId);
      
      // Send order confirmation email
      try {
        console.log('Preparing to send confirmation email for order:', order.id || order._id?.toString());
        const emailResult = await sendOrderConfirmationEmail(
          orderData.email,
          order.id || order._id?.toString() || 'unknown',
          {
            playerName: orderData.playerName,
            totalAmount: orderData.totalAmount,
            items: orderItems,
            status: orderData.status
          }
        );
        console.log('Email sending result:', emailResult);
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        console.error('Email error details:', emailError instanceof Error ? emailError.message : emailError);
        // Don't fail the order creation if email fails
      }
      
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
      } else if (req.isAuthenticated && req.isAuthenticated() && (req.user as any)?.id) {
        userId = (req.user as any).id;
      }
      
      // Allow access if it's the user's order (by session or user ID)
      if (order.sessionId !== sessionId && order.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Parse items JSON string back to array for frontend
      const parsedOrder = {
        ...order,
        items: order.items ? JSON.parse(order.items) : []
      };
      
      res.json(parsedOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Public order tracking endpoint - allows anyone to view order details by order ID
  app.get("/api/orders/public/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        // In development with memory storage, orders are lost on server restart
        const allOrders = await storage.getAllOrders();
        if (allOrders.length === 0) {
          return res.status(404).json({ 
            message: "Order not found", 
            note: "Memory storage mode: Orders are cleared on server restart. Please place a new order to test tracking."
          });
        }
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Parse items JSON string back to array for frontend
      const parsedOrder = {
        ...order,
        items: order.items ? JSON.parse(order.items) : []
      };
      
      res.json(parsedOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });



  // Cancel order
  app.put("/api/orders/:id/cancel", async (req, res) => {
    try {
      const { id } = req.params;
      const { email } = req.body;
      
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check permissions (either email matches or user owns the order)
      const sessionId = getSessionId(req);
      let userId: string | undefined;
      
      if (req.session?.userId) {
        userId = req.session.userId;
      } else if (req.isAuthenticated && req.isAuthenticated() && (req.user as any)?.id) {
        userId = (req.user as any).id;
      }
      
      const hasEmailAccess = email && order.email === email;
      const hasSessionAccess = order.sessionId === sessionId || order.userId === userId;
      
      if (!hasEmailAccess && !hasSessionAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Only allow cancellation of pending or payment_pending orders
      if (!['pending', 'payment_pending'].includes(order.status)) {
        return res.status(400).json({ message: "Order cannot be cancelled" });
      }
      
      // Update order status to cancelled
      await storage.updateOrderStatus(id, 'cancelled');
      
      res.json({ message: "Order cancelled successfully" });
    } catch (error) {
      console.error("Order cancellation error:", error);
      res.status(500).json({ message: "Failed to cancel order" });
    }
  });

  // Get user's orders
  app.get("/api/user/orders", isAuthenticatedUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      const orders = await storage.getOrdersByUser(userId);
      
      // Parse items JSON string back to array for frontend
      const parsedOrders = orders.map(order => ({
        ...order,
        items: order.items ? JSON.parse(order.items) : []
      }));
      
      res.json(parsedOrders);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Payment confirmation routes
  app.post("/api/payment/confirm", upload.single('screenshot'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Screenshot is required" });
      }

      const { orderId } = req.body;
      if (!orderId) {
        return res.status(400).json({ message: "Order ID is required" });
      }

      // Verify order exists
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const paymentConfirmation = insertPaymentConfirmationSchema.parse({
        orderId,
        screenshotPath: req.file.path,
        status: "pending"
      });

      const confirmation = await storage.addPaymentConfirmation(paymentConfirmation);
      
      // Update order status to indicate payment confirmation received
      await storage.updateOrderStatus(orderId, "payment_pending");
      
      res.json({ 
        message: "Payment confirmation submitted successfully",
        confirmationId: confirmation.id
      });
    } catch (error) {
      console.error("Payment confirmation error:", error);
      res.status(500).json({ message: "Failed to submit payment confirmation" });
    }
  });

  // Coupon validation endpoint
  app.post("/api/coupons/validate", async (req, res) => {
    try {
      const { code, orderAmount } = validateCouponSchema.parse(req.body);
      
      const coupon = await storage.getCouponByCode(code);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      
      // Check if coupon is active
      if (!coupon.isActive) {
        return res.status(400).json({ message: "Coupon is not active" });
      }
      
      // Check if coupon is within valid date range
      const now = new Date();
      if (now < new Date(coupon.validFrom) || now > new Date(coupon.validUntil)) {
        return res.status(400).json({ message: "Coupon has expired or is not yet valid" });
      }
      
      // Check minimum order amount
      if (coupon.minimumOrderAmount && orderAmount < coupon.minimumOrderAmount) {
        return res.status(400).json({ 
          message: `Minimum order amount of $${coupon.minimumOrderAmount.toFixed(2)} required` 
        });
      }
      
      // Check usage limit
      if (coupon.maxUsages && coupon.currentUsages >= coupon.maxUsages) {
        return res.status(400).json({ message: "Coupon usage limit reached" });
      }
      
      // Calculate discount
      let discountAmount = 0;
      if (coupon.discountType === 'percentage') {
        discountAmount = (orderAmount * coupon.discountValue) / 100;
      } else {
        discountAmount = Math.min(coupon.discountValue, orderAmount);
      }
      
      const finalAmount = Math.max(0, orderAmount - discountAmount);
      
      res.json({
        valid: true,
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          description: coupon.description
        },
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        finalAmount: parseFloat(finalAmount.toFixed(2))
      });
    } catch (error) {
      console.error("Coupon validation error:", error);
      res.status(400).json({ message: "Invalid coupon validation request" });
    }
  });

  // Admin coupon management routes
  app.post("/api/admin/coupons", isAuthenticatedUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      const isAdmin = await storage.isUserAdmin(userId);
      
      if (!isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      // Transform date strings to Date objects
      const requestData = {
        ...req.body,
        validFrom: new Date(req.body.validFrom),
        validUntil: new Date(req.body.validUntil)
      };
      
      const couponData = insertCouponSchema.parse(requestData);
      const coupon = await storage.createCoupon(couponData);
      
      res.json(coupon);
    } catch (error) {
      console.error("Create coupon error:", error);
      res.status(400).json({ message: "Failed to create coupon" });
    }
  });

  app.get("/api/admin/coupons", isAuthenticatedUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      const isAdmin = await storage.isUserAdmin(userId);
      
      if (!isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const coupons = await storage.getAllCoupons();
      res.json(coupons);
    } catch (error) {
      console.error("Get coupons error:", error);
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });

  app.put("/api/admin/coupons/:id", isAuthenticatedUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      const isAdmin = await storage.isUserAdmin(userId);
      
      if (!isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { id } = req.params;
      const updatedCoupon = await storage.updateCoupon(id, req.body);
      
      if (updatedCoupon) {
        res.json(updatedCoupon);
      } else {
        res.status(404).json({ message: "Coupon not found" });
      }
    } catch (error) {
      console.error("Update coupon error:", error);
      res.status(500).json({ message: "Failed to update coupon" });
    }
  });

  app.patch("/api/admin/coupons/:id/toggle", isAuthenticatedUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      const isAdmin = await storage.isUserAdmin(userId);
      
      if (!isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { id } = req.params;
      const updatedCoupon = await storage.toggleCouponStatus(id);
      
      if (updatedCoupon) {
        res.json(updatedCoupon);
      } else {
        res.status(404).json({ message: "Coupon not found" });
      }
    } catch (error) {
      console.error("Toggle coupon error:", error);
      res.status(500).json({ message: "Failed to toggle coupon status" });
    }
  });

  app.delete("/api/admin/coupons/:id", isAuthenticatedUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      const isAdmin = await storage.isUserAdmin(userId);
      
      if (!isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { id } = req.params;
      const deleted = await storage.deleteCoupon(id);
      
      if (deleted) {
        res.json({ message: "Coupon deleted successfully" });
      } else {
        res.status(404).json({ message: "Coupon not found" });
      }
    } catch (error) {
      console.error("Delete coupon error:", error);
      res.status(500).json({ message: "Failed to delete coupon" });
    }
  });

  // Debug endpoint to see orders in memory (development only)
  if (process.env.NODE_ENV === 'development') {
    app.get("/api/debug/orders", async (req, res) => {
      try {
        const orders = await storage.getAllOrders();
        res.json({
          total: orders.length,
          orders: orders.length > 0 ? orders.slice(0, 10).map(order => ({
            id: order.id,
            email: order.email,
            playerName: order.playerName,
            status: order.status,
            totalAmount: order.totalAmount
          })) : []
        });
      } catch (error) {
        console.error("Debug endpoint error:", error);
        res.json({ message: "Debug error", total: 0, orders: [] });
      }
    });

    // Debug endpoint to make user admin
    app.post("/api/debug/make-admin", async (req, res) => {
      try {
        const { email } = req.body;
        if (!email) {
          return res.status(400).json({ message: "Email is required" });
        }

        const user = await storage.getUserByEmail(email);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        const updatedUser = await storage.updateUserAdminStatus(user.id || user._id?.toString() || '', true);
        res.json({ 
          message: "User made admin successfully", 
          user: { email: updatedUser.email, isAdmin: updatedUser.isAdmin }
        });
      } catch (error) {
        console.error("Make admin error:", error);
        res.status(500).json({ message: "Failed to make user admin" });
      }
    });
  }

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

  // Logout routes - support both POST and GET
  const handleLogout = async (req: any, res: any) => {
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
      
      // For GET requests, redirect to home page
      if (req.method === 'GET') {
        res.redirect('/');
      } else {
        res.json({ message: "Logged out successfully" });
      }
    } catch (error) {
      console.error("Error during logout:", error);
      if (req.method === 'GET') {
        res.redirect('/');
      } else {
        res.status(500).json({ message: "Failed to logout" });
      }
    }
  };

  app.post('/api/auth/logout', handleLogout);
  app.get('/api/logout', handleLogout);

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

      const review = await storage.addReview(reviewData);
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

      const review = await storage.addReview(reviewData);
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
      // Note: getReviewsByUser method needs to be implemented in storage
      const reviews = []; // Temporary empty array until method is implemented
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
      
      // Parse items JSON string back to array for frontend
      const parsedOrders = orders.map(order => ({
        ...order,
        items: order.items ? JSON.parse(order.items) : []
      }));
      
      res.json(parsedOrders);
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
      
      // Send status update email if email exists
      if (updatedOrder.email) {
        try {
          await sendOrderStatusUpdateEmail(
            updatedOrder.email,
            updatedOrder.id || updatedOrder._id?.toString() || req.params.id,
            status,
            updatedOrder.playerName
          );
          console.log('Order status update email sent successfully');
        } catch (emailError) {
          console.error('Failed to send status update email:', emailError);
        }
      }
      
      // Parse items JSON string back to array for frontend
      const parsedOrder = {
        ...updatedOrder,
        items: updatedOrder.items ? JSON.parse(updatedOrder.items) : []
      };
      
      res.json(parsedOrder);
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
      const allRequests = await storage.getWhitelistRequests();
      const existingRequest = allRequests.find(r => r.minecraftUsername === requestData.minecraftUsername && r.status === 'pending');
      if (existingRequest) {
        return res.status(400).json({ message: "A whitelist request for this username is already pending" });
      }

      const request = await storage.addWhitelistRequest(requestData);
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
        const allRequests = await storage.getWhitelistRequests();
        requests = allRequests.filter(r => r.userId === userId);
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

      const updatedRequest = await storage.updateWhitelistRequest(
        req.params.id, 
        status, 
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
