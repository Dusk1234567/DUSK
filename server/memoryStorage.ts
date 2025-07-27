import {
  type InsertProduct,
  type InsertCartItem,
  type InsertOrder,
  type InsertOrderItem,
  type InsertAdminWhitelist,
  type UpsertUser,
  type InsertReview,
  type InsertWhitelistRequest,
  type InsertPaymentConfirmation,
  type InsertCoupon,
  type IProduct,
  type ICartItem,
  type IOrder,
  type IOrderItem,
  type IAdminWhitelist,
  type IUser,
  type IReview,
  type IWhitelistRequest,
  type IPaymentConfirmation,
  type ICoupon,
} from "@shared/schema";
import { IStorage } from "./storage";

// In-memory storage for development when MongoDB is not available
class MemoryStorage implements IStorage {
  private products: Map<string, IProduct> = new Map();
  private cartItems: Map<string, ICartItem> = new Map();
  private orders: Map<string, IOrder> = new Map();
  private orderItems: Map<string, IOrderItem> = new Map();
  private adminWhitelist: Map<string, IAdminWhitelist> = new Map();
  private users: Map<string, IUser> = new Map();
  private reviews: Map<string, IReview> = new Map();
  private whitelistRequests: Map<string, IWhitelistRequest> = new Map();
  private paymentConfirmations: Map<string, IPaymentConfirmation> = new Map();
  private coupons: Map<string, ICoupon> = new Map();
  private idCounter = 1;

  private generateId(): string {
    // Use simple incremental IDs for better user experience
    // Note: These will reset on server restart in memory mode
    return (this.idCounter++).toString();
  }

  async getProducts(): Promise<IProduct[]> {
    return Array.from(this.products.values());
  }

  async getProductById(id: string): Promise<IProduct | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(category: string): Promise<IProduct[]> {
    return Array.from(this.products.values()).filter(p => p.category === category);
  }

  async createProduct(product: InsertProduct): Promise<IProduct> {
    const id = this.generateId();
    const newProduct: IProduct = {
      ...product,
      id,
      featured: product.featured || false
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async getCartItems(sessionId: string): Promise<ICartItem[]> {
    return Array.from(this.cartItems.values()).filter(item => item.sessionId === sessionId);
  }

  async addToCart(cartItem: InsertCartItem): Promise<ICartItem> {
    const existing = Array.from(this.cartItems.values()).find(
      item => item.sessionId === cartItem.sessionId && item.productId === cartItem.productId
    );

    if (existing) {
      existing.quantity += cartItem.quantity;
      this.cartItems.set(existing.id!, existing);
      return existing;
    }

    const id = this.generateId();
    const newItem: ICartItem = { ...cartItem, id };
    this.cartItems.set(id, newItem);
    return newItem;
  }

  async updateCartItem(id: string, quantity: number): Promise<ICartItem | undefined> {
    const item = this.cartItems.get(id);
    if (item) {
      item.quantity = quantity;
      this.cartItems.set(id, item);
      return item;
    }
    return undefined;
  }

  async removeFromCart(id: string): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(sessionId: string): Promise<void> {
    const itemsToDelete = Array.from(this.cartItems.entries())
      .filter(([_, item]) => item.sessionId === sessionId)
      .map(([id]) => id);
    
    itemsToDelete.forEach(id => this.cartItems.delete(id));
  }

  async createOrder(order: InsertOrder): Promise<IOrder> {
    const id = this.generateUniqueOrderId();
    const newOrder: IOrder = {
      ...order,
      id,
      status: order.status || "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  private generateUniqueOrderId(): string {
    // Generate a unique order ID with timestamp and random components
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`.toUpperCase();
  }

  async createOrderWithItems(order: InsertOrder, items: InsertOrderItem[]): Promise<IOrder> {
    const newOrder = await this.createOrder(order);
    
    for (const item of items) {
      const orderItemId = this.generateId();
      const orderItem: IOrderItem = {
        ...item,
        id: orderItemId,
        orderId: newOrder.id!
      };
      this.orderItems.set(orderItemId, orderItem);
    }
    
    return newOrder;
  }

  async getOrder(id: string): Promise<IOrder | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByUser(userId: string): Promise<IOrder[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getOrdersByEmail(email: string): Promise<IOrder[]> {
    return Array.from(this.orders.values())
      .filter(order => order.email === email)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllOrders(): Promise<IOrder[]> {
    return Array.from(this.orders.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateOrderStatus(id: string, status: string): Promise<IOrder | undefined> {
    const order = this.orders.get(id);
    if (order) {
      order.status = status;
      order.updatedAt = new Date();
      this.orders.set(id, order);
      return order;
    }
    return undefined;
  }

  async getOrderItems(orderId: string): Promise<IOrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  async isUserAdmin(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    return user?.isAdmin || false;
  }

  async addToAdminWhitelist(admin: InsertAdminWhitelist): Promise<IAdminWhitelist> {
    const id = this.generateId();
    const newAdmin: IAdminWhitelist = {
      ...admin,
      id,
      role: admin.role || "admin",
      createdAt: new Date()
    };
    this.adminWhitelist.set(id, newAdmin);
    return newAdmin;
  }

  async removeFromAdminWhitelist(email: string): Promise<boolean> {
    const entry = Array.from(this.adminWhitelist.entries()).find(([_, admin]) => admin.email === email);
    if (entry) {
      return this.adminWhitelist.delete(entry[0]);
    }
    return false;
  }

  async getAdminWhitelist(): Promise<IAdminWhitelist[]> {
    return Array.from(this.adminWhitelist.values());
  }

  async getUserStats(): Promise<{ totalUsers: number; totalOrders: number; totalRevenue: string }> {
    const totalUsers = this.users.size;
    const totalOrders = this.orders.size;
    const totalRevenue = Array.from(this.orders.values())
      .filter(order => order.status === 'completed' || order.status === 'delivered')
      .reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0)
      .toString();
    
    return { totalUsers, totalOrders, totalRevenue };
  }

  async updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<IUser> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }
    user.isAdmin = isAdmin;
    user.updatedAt = new Date();
    this.users.set(userId, user);
    return user;
  }

  async getAllUsers(): Promise<IUser[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: string): Promise<IUser | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<IUser | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByGoogleId(googleId: string): Promise<IUser | undefined> {
    return Array.from(this.users.values()).find(user => user.googleId === googleId);
  }

  async updateUserGoogleId(userId: string, googleId: string): Promise<IUser> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }
    user.googleId = googleId;
    user.updatedAt = new Date();
    this.users.set(userId, user);
    return user;
  }

  async upsertUser(user: UpsertUser): Promise<IUser> {
    if (user.email) {
      const existing = await this.getUserByEmail(user.email);
      if (existing) {
        Object.assign(existing, user, { updatedAt: new Date() });
        this.users.set(existing.id!, existing);
        return existing;
      }
    }

    const id = this.generateId();
    const newUser: IUser = {
      ...user,
      id,
      isAdmin: user.isAdmin || false,
      totalSpent: user.totalSpent || 0,
      orderCount: user.orderCount || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async getReviewsByProduct(productId: string): Promise<IReview[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async addReview(review: InsertReview): Promise<IReview> {
    const id = this.generateId();
    const newReview: IReview = {
      ...review,
      id,
      createdAt: new Date()
    };
    this.reviews.set(id, newReview);
    return newReview;
  }

  async deleteReview(reviewId: string): Promise<boolean> {
    return this.reviews.delete(reviewId);
  }

  async addWhitelistRequest(request: InsertWhitelistRequest): Promise<IWhitelistRequest> {
    const id = this.generateId();
    const newRequest: IWhitelistRequest = {
      ...request,
      id,
      status: request.status || "pending",
      submittedAt: new Date()
    };
    this.whitelistRequests.set(id, newRequest);
    return newRequest;
  }

  async getWhitelistRequests(): Promise<IWhitelistRequest[]> {
    return Array.from(this.whitelistRequests.values())
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  async updateWhitelistRequest(id: string, status: string, processedBy?: string): Promise<IWhitelistRequest | undefined> {
    const request = this.whitelistRequests.get(id);
    if (request) {
      request.status = status;
      request.processedBy = processedBy;
      request.processedAt = new Date();
      this.whitelistRequests.set(id, request);
      return request;
    }
    return undefined;
  }

  async addPaymentConfirmation(confirmation: InsertPaymentConfirmation): Promise<IPaymentConfirmation> {
    const id = this.generateId();
    const newConfirmation: IPaymentConfirmation = {
      ...confirmation,
      id,
      status: confirmation.status || "pending",
      submittedAt: new Date()
    };
    this.paymentConfirmations.set(id, newConfirmation);
    return newConfirmation;
  }

  async getPaymentConfirmationsByOrder(orderId: string): Promise<IPaymentConfirmation[]> {
    return Array.from(this.paymentConfirmations.values()).filter(conf => conf.orderId === orderId);
  }

  async getAllPaymentConfirmations(): Promise<IPaymentConfirmation[]> {
    return Array.from(this.paymentConfirmations.values())
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  async updatePaymentConfirmation(id: string, status: string, reviewedBy?: string, rejectionReason?: string): Promise<IPaymentConfirmation | undefined> {
    const confirmation = this.paymentConfirmations.get(id);
    if (confirmation) {
      confirmation.status = status;
      confirmation.reviewedBy = reviewedBy;
      confirmation.rejectionReason = rejectionReason;
      confirmation.reviewedAt = new Date();
      this.paymentConfirmations.set(id, confirmation);
      return confirmation;
    }
    return undefined;
  }

  // Coupon operations
  async createCoupon(coupon: InsertCoupon): Promise<ICoupon> {
    const id = this.generateId();
    const newCoupon: ICoupon = {
      ...coupon,
      id,
      currentUsages: coupon.currentUsages || 0,
      isActive: coupon.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.coupons.set(id, newCoupon);
    return newCoupon;
  }

  async getCouponByCode(code: string): Promise<ICoupon | undefined> {
    return Array.from(this.coupons.values()).find(coupon => coupon.code === code);
  }

  async getAllCoupons(): Promise<ICoupon[]> {
    return Array.from(this.coupons.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateCouponUsage(code: string): Promise<ICoupon | undefined> {
    const coupon = Array.from(this.coupons.values()).find(c => c.code === code);
    if (coupon) {
      coupon.currentUsages = (coupon.currentUsages || 0) + 1;
      coupon.updatedAt = new Date();
      this.coupons.set(coupon.id, coupon);
      return coupon;
    }
    return undefined;
  }

  async deleteCoupon(id: string): Promise<boolean> {
    return this.coupons.delete(id);
  }

  async updateCoupon(id: string, updates: Partial<ICoupon>): Promise<ICoupon | null> {
    const coupon = this.coupons.get(id);
    if (!coupon) return null;
    
    Object.assign(coupon, updates, { updatedAt: new Date() });
    this.coupons.set(id, coupon);
    return coupon;
  }

  async toggleCouponStatus(id: string): Promise<ICoupon | null> {
    const coupon = this.coupons.get(id);
    if (!coupon) return null;
    
    coupon.isActive = !coupon.isActive;
    coupon.updatedAt = new Date();
    this.coupons.set(id, coupon);
    return coupon;
  }
}

export const memoryStorage = new MemoryStorage();