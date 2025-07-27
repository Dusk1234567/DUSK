import {
  products,
  cartItems,
  orders,
  orderItems,
  adminWhitelist,
  users,
  reviews,
  whitelistRequests,
  paymentConfirmations,
  type Product,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type AdminWhitelist,
  type InsertAdminWhitelist,
  type User,
  type UpsertUser,
  type Review,
  type InsertReview,
  type WhitelistRequest,
  type InsertWhitelistRequest,
  type PaymentConfirmation,
  type InsertPaymentConfirmation,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Product operations
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Cart operations
  getCartItems(sessionId: string): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  clearCart(sessionId: string): Promise<void>;

  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderWithItems(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  
  // Order items operations
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  
  // Admin operations
  isUserAdmin(userId: string): Promise<boolean>;
  addToAdminWhitelist(admin: InsertAdminWhitelist): Promise<AdminWhitelist>;
  removeFromAdminWhitelist(email: string): Promise<boolean>;
  getAdminWhitelist(): Promise<AdminWhitelist[]>;
  getUserStats(): Promise<{ totalUsers: number; totalOrders: number; totalRevenue: string }>;
  updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  updateUserGoogleId(userId: string, googleId: string): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Review operations
  getReviewsByProduct(productId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByUser(userId: string): Promise<Review[]>;

  // Whitelist request operations
  createWhitelistRequest(request: InsertWhitelistRequest): Promise<WhitelistRequest>;
  getWhitelistRequests(): Promise<WhitelistRequest[]>;
  getWhitelistRequestsByUser(userId: string): Promise<WhitelistRequest[]>;
  updateWhitelistRequestStatus(id: string, status: string, reason?: string, processedBy?: string): Promise<WhitelistRequest | undefined>;
  getWhitelistRequestByUsername(username: string): Promise<WhitelistRequest | undefined>;

  // Payment confirmation operations
  createPaymentConfirmation(confirmation: InsertPaymentConfirmation): Promise<PaymentConfirmation>;
  getPaymentConfirmationsByOrder(orderId: string): Promise<PaymentConfirmation[]>;
  updatePaymentConfirmationStatus(id: string, status: string, reviewedBy?: string, reason?: string): Promise<PaymentConfirmation | undefined>;
  getAllPaymentConfirmations(): Promise<PaymentConfirmation[]>;
}

export class DatabaseStorage implements IStorage {
  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.category, category));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  // Cart operations
  async getCartItems(sessionId: string): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.sessionId, cartItem.sessionId), eq(cartItems.productId, cartItem.productId)));

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + (cartItem.quantity || 1) })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    }

    // Create new item
    const [newItem] = await db.insert(cartItems).values(cartItem).returning();
    return newItem;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem || undefined;
  }

  async removeFromCart(id: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return (result.rowCount || 0) > 0;
  }

  async clearCart(sessionId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async createOrderWithItems(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    return await db.transaction(async (tx) => {
      const [newOrder] = await tx.insert(orders).values(order).returning();
      
      if (items.length > 0) {
        const orderItemsWithOrderId = items.map(item => ({
          ...item,
          orderId: newOrder.id
        }));
        await tx.insert(orderItems).values(orderItemsWithOrderId);
      }

      // Update user stats if order has userId
      if (order.userId) {
        await tx
          .update(users)
          .set({
            totalSpent: sql`${users.totalSpent} + ${order.totalAmount}`,
            orderCount: sql`${users.orderCount} + 1`,
            updatedAt: new Date()
          })
          .where(eq(users.id, order.userId));
      }

      return newOrder;
    });
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder || undefined;
  }

  // Order items operations
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user || undefined;
  }

  async updateUserGoogleId(userId: string, googleId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ googleId, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Review operations
  async getReviewsByProduct(productId: string): Promise<Review[]> {
    return await db
      .select({
        id: reviews.id,
        productId: reviews.productId,
        userId: reviews.userId,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.createdAt));
  }

  // Admin operations
  async isUserAdmin(userId: string): Promise<boolean> {
    const [user] = await db.select({ isAdmin: users.isAdmin }).from(users).where(eq(users.id, userId));
    return user?.isAdmin || false;
  }

  async addToAdminWhitelist(admin: InsertAdminWhitelist): Promise<AdminWhitelist> {
    const [newAdmin] = await db.insert(adminWhitelist).values(admin).returning();
    
    // Update user admin status if they exist
    await db
      .update(users)
      .set({ isAdmin: true, updatedAt: new Date() })
      .where(eq(users.email, admin.email));
    
    return newAdmin;
  }

  async removeFromAdminWhitelist(email: string): Promise<boolean> {
    const result = await db.delete(adminWhitelist).where(eq(adminWhitelist.email, email));
    
    // Update user admin status
    await db
      .update(users)
      .set({ isAdmin: false, updatedAt: new Date() })
      .where(eq(users.email, email));
    
    return (result.rowCount || 0) > 0;
  }

  async getAdminWhitelist(): Promise<AdminWhitelist[]> {
    return await db.select().from(adminWhitelist).orderBy(desc(adminWhitelist.createdAt));
  }

  async getUserStats(): Promise<{ totalUsers: number; totalOrders: number; totalRevenue: string }> {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [orderCount] = await db.select({ count: sql<number>`count(*)` }).from(orders);
    const [revenueSum] = await db.select({ 
      total: sql<string>`coalesce(sum(${orders.totalAmount}), 0)` 
    }).from(orders).where(eq(orders.status, 'completed'));

    return {
      totalUsers: userCount.count,
      totalOrders: orderCount.count,
      totalRevenue: revenueSum.total || '0'
    };
  }

  async updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isAdmin, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Whitelist request operations
  async createWhitelistRequest(request: InsertWhitelistRequest): Promise<WhitelistRequest> {
    const [newRequest] = await db.insert(whitelistRequests).values(request).returning();
    return newRequest;
  }

  async getWhitelistRequests(): Promise<WhitelistRequest[]> {
    return await db.select().from(whitelistRequests).orderBy(desc(whitelistRequests.submittedAt));
  }

  async getWhitelistRequestsByUser(userId: string): Promise<WhitelistRequest[]> {
    return await db
      .select()
      .from(whitelistRequests)
      .where(eq(whitelistRequests.userId, userId))
      .orderBy(desc(whitelistRequests.submittedAt));
  }

  async updateWhitelistRequestStatus(id: string, status: string, reason?: string, processedBy?: string): Promise<WhitelistRequest | undefined> {
    const [updated] = await db
      .update(whitelistRequests)
      .set({ 
        status, 
        reason,
        processedBy,
        processedAt: new Date()
      })
      .where(eq(whitelistRequests.id, id))
      .returning();
    return updated;
  }

  async getWhitelistRequestByUsername(username: string): Promise<WhitelistRequest | undefined> {
    const [request] = await db
      .select()
      .from(whitelistRequests)
      .where(eq(whitelistRequests.minecraftUsername, username))
      .orderBy(desc(whitelistRequests.submittedAt))
      .limit(1);
    return request;
  }

  // Payment confirmation operations
  async createPaymentConfirmation(confirmation: InsertPaymentConfirmation): Promise<PaymentConfirmation> {
    const [newConfirmation] = await db.insert(paymentConfirmations).values(confirmation).returning();
    return newConfirmation;
  }

  async getPaymentConfirmationsByOrder(orderId: string): Promise<PaymentConfirmation[]> {
    return await db.select().from(paymentConfirmations).where(eq(paymentConfirmations.orderId, orderId));
  }

  async updatePaymentConfirmationStatus(id: string, status: string, reviewedBy?: string, reason?: string): Promise<PaymentConfirmation | undefined> {
    const [updated] = await db
      .update(paymentConfirmations)
      .set({ 
        status, 
        reviewedBy,
        rejectionReason: reason,
        reviewedAt: new Date()
      })
      .where(eq(paymentConfirmations.id, id))
      .returning();
    return updated;
  }

  async getAllPaymentConfirmations(): Promise<PaymentConfirmation[]> {
    return await db.select().from(paymentConfirmations).orderBy(desc(paymentConfirmations.submittedAt));
  }
}

export const storage = new DatabaseStorage();