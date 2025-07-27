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
  type InsertProduct,
  type InsertCartItem,
  type InsertOrder,
  type InsertOrderItem,
  type InsertAdminWhitelist,
  type UpsertUser,
  type InsertReview,
  type InsertWhitelistRequest,
  type InsertPaymentConfirmation,
  type IProduct,
  type ICartItem,
  type IOrder,
  type IOrderItem,
  type IAdminWhitelist,
  type IUser,
  type IReview,
  type IWhitelistRequest,
  type IPaymentConfirmation,
} from "@shared/schema";
import { connectToDatabase, db } from "./db";
import { eq, desc, sum } from "drizzle-orm";

export interface IStorage {
  // Product operations
  getProducts(): Promise<IProduct[]>;
  getProductById(id: string): Promise<IProduct | undefined>;
  getProductsByCategory(category: string): Promise<IProduct[]>;
  createProduct(product: InsertProduct): Promise<IProduct>;

  // Cart operations
  getCartItems(sessionId: string): Promise<ICartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<ICartItem>;
  updateCartItem(id: string, quantity: number): Promise<ICartItem | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  clearCart(sessionId: string): Promise<void>;

  // Order operations
  createOrder(order: InsertOrder): Promise<IOrder>;
  createOrderWithItems(order: InsertOrder, items: InsertOrderItem[]): Promise<IOrder>;
  getOrder(id: string): Promise<IOrder | undefined>;
  getOrdersByUser(userId: string): Promise<IOrder[]>;
  getAllOrders(): Promise<IOrder[]>;
  updateOrderStatus(id: string, status: string): Promise<IOrder | undefined>;
  
  // Order items operations
  getOrderItems(orderId: string): Promise<IOrderItem[]>;
  
  // Admin operations
  isUserAdmin(userId: string): Promise<boolean>;
  addToAdminWhitelist(admin: InsertAdminWhitelist): Promise<IAdminWhitelist>;
  removeFromAdminWhitelist(email: string): Promise<boolean>;
  getAdminWhitelist(): Promise<IAdminWhitelist[]>;
  getUserStats(): Promise<{ totalUsers: number; totalOrders: number; totalRevenue: string }>;
  updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<IUser>;
  getAllUsers(): Promise<IUser[]>;

  // User operations
  getUser(id: string): Promise<IUser | undefined>;
  getUserByEmail(email: string): Promise<IUser | undefined>;
  getUserByGoogleId(googleId: string): Promise<IUser | undefined>;
  updateUserGoogleId(userId: string, googleId: string): Promise<IUser>;
  upsertUser(user: UpsertUser): Promise<IUser>;

  // Review operations
  getReviewsByProduct(productId: string): Promise<IReview[]>;
  createReview(review: InsertReview): Promise<IReview>;
  getReviewsByUser(userId: string): Promise<IReview[]>;

  // Whitelist request operations
  createWhitelistRequest(request: InsertWhitelistRequest): Promise<IWhitelistRequest>;
  getWhitelistRequests(): Promise<IWhitelistRequest[]>;
  getWhitelistRequestsByUser(userId: string): Promise<IWhitelistRequest[]>;
  updateWhitelistRequestStatus(id: string, status: string, reason?: string, processedBy?: string): Promise<IWhitelistRequest | undefined>;
  getWhitelistRequestByUsername(username: string): Promise<IWhitelistRequest | undefined>;

  // Payment confirmation operations
  createPaymentConfirmation(confirmation: InsertPaymentConfirmation): Promise<IPaymentConfirmation>;
  getPaymentConfirmationsByOrder(orderId: string): Promise<IPaymentConfirmation[]>;
  updatePaymentConfirmationStatus(id: string, status: string, reviewedBy?: string, reason?: string): Promise<IPaymentConfirmation | undefined>;
  getAllPaymentConfirmations(): Promise<IPaymentConfirmation[]>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Ensure database connection on initialization
    connectToDatabase().catch(console.error);
  }

  // Product operations
  async getProducts(): Promise<IProduct[]> {
    await connectToDatabase();
    return await db.select().from(products);
  }

  async getProductById(id: string): Promise<IProduct | undefined> {
    await connectToDatabase();
    const result = await db.select().from(products).where(eq(products.id, parseInt(id)));
    return result[0] || undefined;
  }

  async getProductsByCategory(category: string): Promise<IProduct[]> {
    await connectToDatabase();
    return await db.select().from(products).where(eq(products.category, category));
  }

  async createProduct(product: InsertProduct): Promise<IProduct> {
    await connectToDatabase();
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  // Cart operations
  async getCartItems(sessionId: string): Promise<ICartItem[]> {
    await connectToDatabase();
    return await db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  async addToCart(cartItem: InsertCartItem): Promise<ICartItem> {
    await connectToDatabase();
    // Check if item already exists
    const existingItems = await db.select().from(cartItems)
      .where(eq(cartItems.sessionId, cartItem.sessionId))
      .where(eq(cartItems.productId, cartItem.productId));

    if (existingItems.length > 0) {
      // Update quantity
      const existingItem = existingItems[0];
      const updatedItems = await db.update(cartItems)
        .set({ quantity: existingItem.quantity + cartItem.quantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItems[0];
    } else {
      // Create new cart item
      const newItems = await db.insert(cartItems).values(cartItem).returning();
      return newItems[0];
    }
  }

  async updateCartItem(id: string, quantity: number): Promise<ICartItem | undefined> {
    await connectToDatabase();
    const updatedItems = await db.update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, parseInt(id)))
      .returning();
    return updatedItems[0] || undefined;
  }

  async removeFromCart(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await db.delete(cartItems).where(eq(cartItems.id, parseInt(id)));
    return result.rowCount > 0;
  }

  async clearCart(sessionId: string): Promise<void> {
    await connectToDatabase();
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<IOrder> {
    await connectToDatabase();
    const newOrders = await db.insert(orders).values(order).returning();
    return newOrders[0];
  }

  async createOrderWithItems(order: InsertOrder, items: InsertOrderItem[]): Promise<IOrder> {
    await connectToDatabase();
    // Create order first
    const newOrders = await db.insert(orders).values(order).returning();
    const newOrder = newOrders[0];

    // Create order items
    const orderItemsWithOrderId = items.map(item => ({
      ...item,
      orderId: newOrder.id
    }));

    await db.insert(orderItems).values(orderItemsWithOrderId);

    return newOrder;
  }

  async getOrder(id: string): Promise<IOrder | undefined> {
    await connectToDatabase();
    const result = await db.select().from(orders).where(eq(orders.id, parseInt(id)));
    return result[0] || undefined;
  }

  async getOrdersByUser(userId: string): Promise<IOrder[]> {
    await connectToDatabase();
    return await db.select().from(orders)
      .where(eq(orders.userId, parseInt(userId)))
      .orderBy(desc(orders.createdAt));
  }

  async getAllOrders(): Promise<IOrder[]> {
    await connectToDatabase();
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(id: string, status: string): Promise<IOrder | undefined> {
    await connectToDatabase();
    const updatedOrders = await db.update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, parseInt(id)))
      .returning();
    return updatedOrders[0] || undefined;
  }

  // Order items operations
  async getOrderItems(orderId: string): Promise<IOrderItem[]> {
    await connectToDatabase();
    return await db.select().from(orderItems).where(eq(orderItems.orderId, parseInt(orderId)));
  }

  // Admin operations
  async isUserAdmin(userId: string): Promise<boolean> {
    await connectToDatabase();
    const user = await User.findById(userId);
    return user?.isAdmin || false;
  }

  async addToAdminWhitelist(admin: InsertAdminWhitelist): Promise<IAdminWhitelist> {
    await connectToDatabase();
    const newAdmin = new AdminWhitelist(admin);
    await newAdmin.save();
    return newAdmin.toObject();
  }

  async removeFromAdminWhitelist(email: string): Promise<boolean> {
    await connectToDatabase();
    const result = await AdminWhitelist.findOneAndDelete({ email });
    return !!result;
  }

  async getAdminWhitelist(): Promise<IAdminWhitelist[]> {
    await connectToDatabase();
    return await AdminWhitelist.find().lean();
  }

  async getUserStats(): Promise<{ totalUsers: number; totalOrders: number; totalRevenue: string }> {
    await connectToDatabase();
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    const revenueResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    
    const totalRevenue = revenueResult[0]?.total || 0;
    
    return {
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue.toString()
    };
  }

  async updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<IUser> {
    await connectToDatabase();
    const user = await User.findByIdAndUpdate(
      userId,
      { isAdmin, updatedAt: new Date() },
      { new: true }
    );
    if (!user) {
      throw new Error("User not found");
    }
    return user.toObject();
  }

  async getAllUsers(): Promise<IUser[]> {
    await connectToDatabase();
    return await User.find().sort({ createdAt: -1 }).lean();
  }

  // User operations
  async getUser(id: string): Promise<IUser | undefined> {
    await connectToDatabase();
    const user = await User.findById(id).lean();
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<IUser | undefined> {
    await connectToDatabase();
    const user = await User.findOne({ email }).lean();
    return user || undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<IUser | undefined> {
    await connectToDatabase();
    const user = await User.findOne({ googleId }).lean();
    return user || undefined;
  }

  async updateUserGoogleId(userId: string, googleId: string): Promise<IUser> {
    await connectToDatabase();
    const user = await User.findByIdAndUpdate(
      userId,
      { googleId, updatedAt: new Date() },
      { new: true }
    );
    if (!user) {
      throw new Error("User not found");
    }
    return user.toObject();
  }

  async upsertUser(user: UpsertUser): Promise<IUser> {
    await connectToDatabase();
    if (user.email) {
      const existingUser = await User.findOneAndUpdate(
        { email: user.email },
        { ...user, updatedAt: new Date() },
        { new: true, upsert: true }
      );
      return existingUser.toObject();
    } else if (user.googleId) {
      const existingUser = await User.findOneAndUpdate(
        { googleId: user.googleId },
        { ...user, updatedAt: new Date() },
        { new: true, upsert: true }
      );
      return existingUser.toObject();
    } else {
      const newUser = new User({ ...user, createdAt: new Date(), updatedAt: new Date() });
      await newUser.save();
      return newUser.toObject();
    }
  }

  // Review operations
  async getReviewsByProduct(productId: string): Promise<IReview[]> {
    await connectToDatabase();
    return await Review.find({ productId }).sort({ createdAt: -1 }).lean();
  }

  async createReview(review: InsertReview): Promise<IReview> {
    await connectToDatabase();
    const newReview = new Review(review);
    await newReview.save();
    return newReview.toObject();
  }

  async getReviewsByUser(userId: string): Promise<IReview[]> {
    await connectToDatabase();
    return await Review.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  // Whitelist request operations
  async createWhitelistRequest(request: InsertWhitelistRequest): Promise<IWhitelistRequest> {
    await connectToDatabase();
    const newRequest = new WhitelistRequest(request);
    await newRequest.save();
    return newRequest.toObject();
  }

  async getWhitelistRequests(): Promise<IWhitelistRequest[]> {
    await connectToDatabase();
    return await WhitelistRequest.find().sort({ submittedAt: -1 }).lean();
  }

  async getWhitelistRequestsByUser(userId: string): Promise<IWhitelistRequest[]> {
    await connectToDatabase();
    return await WhitelistRequest.find({ userId }).sort({ submittedAt: -1 }).lean();
  }

  async updateWhitelistRequestStatus(id: string, status: string, reason?: string, processedBy?: string): Promise<IWhitelistRequest | undefined> {
    await connectToDatabase();
    const request = await WhitelistRequest.findByIdAndUpdate(
      id,
      { 
        status, 
        reason,
        processedBy,
        processedAt: new Date()
      },
      { new: true }
    );
    return request?.toObject();
  }

  async getWhitelistRequestByUsername(username: string): Promise<IWhitelistRequest | undefined> {
    await connectToDatabase();
    const request = await WhitelistRequest.findOne({ minecraftUsername: username }).lean();
    return request || undefined;
  }

  // Payment confirmation operations
  async createPaymentConfirmation(confirmation: InsertPaymentConfirmation): Promise<IPaymentConfirmation> {
    await connectToDatabase();
    const newConfirmation = new PaymentConfirmation(confirmation);
    await newConfirmation.save();
    return newConfirmation.toObject();
  }

  async getPaymentConfirmationsByOrder(orderId: string): Promise<IPaymentConfirmation[]> {
    await connectToDatabase();
    return await PaymentConfirmation.find({ orderId }).sort({ submittedAt: -1 }).lean();
  }

  async updatePaymentConfirmationStatus(id: string, status: string, reviewedBy?: string, reason?: string): Promise<IPaymentConfirmation | undefined> {
    await connectToDatabase();
    const confirmation = await PaymentConfirmation.findByIdAndUpdate(
      id,
      {
        status,
        reviewedBy,
        rejectionReason: reason,
        reviewedAt: new Date()
      },
      { new: true }
    );
    return confirmation?.toObject();
  }

  async getAllPaymentConfirmations(): Promise<IPaymentConfirmation[]> {
    await connectToDatabase();
    return await PaymentConfirmation.find().sort({ submittedAt: -1 }).lean();
  }
}

// In-memory storage implementation for development/testing
export class MemStorage implements IStorage {
  private products: IProduct[] = [];
  private cartItems: ICartItem[] = [];
  private orders: IOrder[] = [];
  private orderItems: IOrderItem[] = [];
  private adminWhitelist: IAdminWhitelist[] = [];
  private users: IUser[] = [];
  private reviews: IReview[] = [];
  private whitelistRequests: IWhitelistRequest[] = [];
  private paymentConfirmations: IPaymentConfirmation[] = [];

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Product operations
  async getProducts(): Promise<IProduct[]> {
    return [...this.products];
  }

  async getProductById(id: string): Promise<IProduct | undefined> {
    return this.products.find(p => p._id === id);
  }

  async getProductsByCategory(category: string): Promise<IProduct[]> {
    return this.products.filter(p => p.category === category);
  }

  async createProduct(product: InsertProduct): Promise<IProduct> {
    const newProduct: IProduct = {
      _id: this.generateId(),
      ...product,
    } as IProduct;
    this.products.push(newProduct);
    return newProduct;
  }

  // Cart operations
  async getCartItems(sessionId: string): Promise<ICartItem[]> {
    return this.cartItems.filter(item => item.sessionId === sessionId);
  }

  async addToCart(cartItem: InsertCartItem): Promise<ICartItem> {
    const existingItem = this.cartItems.find(
      item => item.sessionId === cartItem.sessionId && item.productId === cartItem.productId
    );

    if (existingItem) {
      existingItem.quantity += cartItem.quantity;
      return existingItem;
    } else {
      const newCartItem: ICartItem = {
        _id: this.generateId(),
        ...cartItem,
      } as ICartItem;
      this.cartItems.push(newCartItem);
      return newCartItem;
    }
  }

  async updateCartItem(id: string, quantity: number): Promise<ICartItem | undefined> {
    const item = this.cartItems.find(item => item._id === id);
    if (item) {
      item.quantity = quantity;
    }
    return item;
  }

  async removeFromCart(id: string): Promise<boolean> {
    const index = this.cartItems.findIndex(item => item._id === id);
    if (index > -1) {
      this.cartItems.splice(index, 1);
      return true;
    }
    return false;
  }

  async clearCart(sessionId: string): Promise<void> {
    this.cartItems = this.cartItems.filter(item => item.sessionId !== sessionId);
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<IOrder> {
    const newOrder: IOrder = {
      _id: this.generateId(),
      ...order,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as IOrder;
    this.orders.push(newOrder);
    return newOrder;
  }

  async createOrderWithItems(order: InsertOrder, items: InsertOrderItem[]): Promise<IOrder> {
    const newOrder = await this.createOrder(order);
    
    for (const item of items) {
      const orderItem: IOrderItem = {
        _id: this.generateId(),
        orderId: newOrder._id,
        ...item,
      } as IOrderItem;
      this.orderItems.push(orderItem);
    }

    return newOrder;
  }

  async getOrder(id: string): Promise<IOrder | undefined> {
    return this.orders.find(order => order._id === id);
  }

  async getOrdersByUser(userId: string): Promise<IOrder[]> {
    return this.orders.filter(order => order.userId === userId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getAllOrders(): Promise<IOrder[]> {
    return [...this.orders].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateOrderStatus(id: string, status: string): Promise<IOrder | undefined> {
    const order = this.orders.find(order => order._id === id);
    if (order) {
      order.status = status;
      order.updatedAt = new Date();
    }
    return order;
  }

  // Order items operations
  async getOrderItems(orderId: string): Promise<IOrderItem[]> {
    return this.orderItems.filter(item => item.orderId === orderId);
  }

  // Admin operations
  async isUserAdmin(userId: string): Promise<boolean> {
    const user = this.users.find(u => u._id === userId);
    return user?.isAdmin || false;
  }

  async addToAdminWhitelist(admin: InsertAdminWhitelist): Promise<IAdminWhitelist> {
    const newAdmin: IAdminWhitelist = {
      _id: this.generateId(),
      ...admin,
      createdAt: new Date(),
    } as IAdminWhitelist;
    this.adminWhitelist.push(newAdmin);
    return newAdmin;
  }

  async removeFromAdminWhitelist(email: string): Promise<boolean> {
    const index = this.adminWhitelist.findIndex(admin => admin.email === email);
    if (index > -1) {
      this.adminWhitelist.splice(index, 1);
      return true;
    }
    return false;
  }

  async getAdminWhitelist(): Promise<IAdminWhitelist[]> {
    return [...this.adminWhitelist];
  }

  async getUserStats(): Promise<{ totalUsers: number; totalOrders: number; totalRevenue: string }> {
    const totalUsers = this.users.length;
    const totalOrders = this.orders.length;
    const totalRevenue = this.orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    return {
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue.toString()
    };
  }

  async updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<IUser> {
    const user = this.users.find(u => u._id === userId);
    if (!user) {
      throw new Error("User not found");
    }
    user.isAdmin = isAdmin;
    user.updatedAt = new Date();
    return user;
  }

  async getAllUsers(): Promise<IUser[]> {
    return [...this.users].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // User operations
  async getUser(id: string): Promise<IUser | undefined> {
    return this.users.find(user => user._id === id);
  }

  async getUserByEmail(email: string): Promise<IUser | undefined> {
    return this.users.find(user => user.email === email);
  }

  async getUserByGoogleId(googleId: string): Promise<IUser | undefined> {
    return this.users.find(user => user.googleId === googleId);
  }

  async updateUserGoogleId(userId: string, googleId: string): Promise<IUser> {
    const user = this.users.find(u => u._id === userId);
    if (!user) {
      throw new Error("User not found");
    }
    user.googleId = googleId;
    user.updatedAt = new Date();
    return user;
  }

  async upsertUser(user: UpsertUser): Promise<IUser> {
    let existingUser: IUser | undefined;
    
    if (user.email) {
      existingUser = this.users.find(u => u.email === user.email);
    } else if (user.googleId) {
      existingUser = this.users.find(u => u.googleId === user.googleId);
    }

    if (existingUser) {
      Object.assign(existingUser, user, { updatedAt: new Date() });
      return existingUser;
    } else {
      const newUser: IUser = {
        _id: this.generateId(),
        ...user,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as IUser;
      this.users.push(newUser);
      return newUser;
    }
  }

  // Review operations
  async getReviewsByProduct(productId: string): Promise<IReview[]> {
    return this.reviews.filter(review => review.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createReview(review: InsertReview): Promise<IReview> {
    const newReview: IReview = {
      _id: this.generateId(),
      ...review,
      createdAt: new Date(),
    } as IReview;
    this.reviews.push(newReview);
    return newReview;
  }

  async getReviewsByUser(userId: string): Promise<IReview[]> {
    return this.reviews.filter(review => review.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Whitelist request operations
  async createWhitelistRequest(request: InsertWhitelistRequest): Promise<IWhitelistRequest> {
    const newRequest: IWhitelistRequest = {
      _id: this.generateId(),
      ...request,
      submittedAt: new Date(),
    } as IWhitelistRequest;
    this.whitelistRequests.push(newRequest);
    return newRequest;
  }

  async getWhitelistRequests(): Promise<IWhitelistRequest[]> {
    return [...this.whitelistRequests].sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }

  async getWhitelistRequestsByUser(userId: string): Promise<IWhitelistRequest[]> {
    return this.whitelistRequests.filter(request => request.userId === userId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  async updateWhitelistRequestStatus(id: string, status: string, reason?: string, processedBy?: string): Promise<IWhitelistRequest | undefined> {
    const request = this.whitelistRequests.find(r => r._id === id);
    if (request) {
      request.status = status;
      request.reason = reason;
      request.processedBy = processedBy;
      request.processedAt = new Date();
    }
    return request;
  }

  async getWhitelistRequestByUsername(username: string): Promise<IWhitelistRequest | undefined> {
    return this.whitelistRequests.find(request => request.minecraftUsername === username);
  }

  // Payment confirmation operations
  async createPaymentConfirmation(confirmation: InsertPaymentConfirmation): Promise<IPaymentConfirmation> {
    const newConfirmation: IPaymentConfirmation = {
      _id: this.generateId(),
      ...confirmation,
      submittedAt: new Date(),
    } as IPaymentConfirmation;
    this.paymentConfirmations.push(newConfirmation);
    return newConfirmation;
  }

  async getPaymentConfirmationsByOrder(orderId: string): Promise<IPaymentConfirmation[]> {
    return this.paymentConfirmations.filter(confirmation => confirmation.orderId === orderId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  async updatePaymentConfirmationStatus(id: string, status: string, reviewedBy?: string, reason?: string): Promise<IPaymentConfirmation | undefined> {
    const confirmation = this.paymentConfirmations.find(c => c._id === id);
    if (confirmation) {
      confirmation.status = status;
      confirmation.reviewedBy = reviewedBy;
      confirmation.rejectionReason = reason;
      confirmation.reviewedAt = new Date();
    }
    return confirmation;
  }

  async getAllPaymentConfirmations(): Promise<IPaymentConfirmation[]> {
    return [...this.paymentConfirmations].sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }
}

// Export the storage instance - use PostgreSQL database storage
export const storage: IStorage = new DatabaseStorage();