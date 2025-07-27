import mongoose, { Schema, Document } from 'mongoose';
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
import { connectToDatabase } from "./db";
import { memoryStorage } from "./memoryStorage";

// MongoDB Document interfaces
interface ProductDocument extends IProduct, Document {}
interface CartItemDocument extends ICartItem, Document {}
interface OrderDocument extends IOrder, Document {}
interface OrderItemDocument extends IOrderItem, Document {}
interface AdminWhitelistDocument extends IAdminWhitelist, Document {}
interface UserDocument extends IUser, Document {}
interface ReviewDocument extends IReview, Document {}
interface WhitelistRequestDocument extends IWhitelistRequest, Document {}
interface PaymentConfirmationDocument extends IPaymentConfirmation, Document {}
interface CouponDocument extends ICoupon, Document {}

// Mongoose Schemas
const ProductSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, required: true },
  badge: { type: String },
  badgeColor: { type: String },
  buttonColor: { type: String },
  featured: { type: Boolean, default: false },
  coinAmount: { type: Number },
  rankLevel: { type: String },
  bonusText: { type: String },
});

const CartItemSchema = new Schema({
  sessionId: { type: String, required: true },
  productId: { type: String, required: true },
  quantity: { type: Number, default: 1 },
});

const OrderSchema = new Schema({
  sessionId: { type: String },
  userId: { type: String },
  totalAmount: { type: Number, required: true },
  originalAmount: { type: Number },
  discountAmount: { type: Number, default: 0 },
  couponCode: { type: String },
  status: { type: String, default: "pending" },
  playerName: { type: String },
  email: { type: String, required: true },
  paymentMethod: { type: String, default: "pending" },
  transactionId: { type: String },
  items: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const CouponSchema = new Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  minimumOrderAmount: { type: Number, default: 0 },
  maxUsages: { type: Number },
  currentUsages: { type: Number, default: 0 },
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const OrderItemSchema = new Schema({
  orderId: { type: String, required: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
});

const AdminWhitelistSchema = new Schema({
  email: { type: String, required: true, unique: true },
  role: { type: String, default: "admin" },
  addedBy: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const UserSchema = new Schema({
  email: { type: String, unique: true, sparse: true },
  firstName: { type: String },
  lastName: { type: String },
  profileImageUrl: { type: String },
  passwordHash: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  minecraftUsername: { type: String },
  isAdmin: { type: Boolean, default: false },
  totalSpent: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ReviewSchema = new Schema({
  userId: { type: String, required: true },
  productId: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const WhitelistRequestSchema = new Schema({
  minecraftUsername: { type: String, required: true },
  email: { type: String },
  discordUsername: { type: String },
  userId: { type: String },
  status: { type: String, default: "pending" },
  reason: { type: String },
  submittedAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
  processedBy: { type: String },
});

const PaymentConfirmationSchema = new Schema({
  orderId: { type: String, required: true },
  screenshotPath: { type: String, required: true },
  status: { type: String, default: "pending" },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewedBy: { type: String },
  rejectionReason: { type: String },
});

// Models
const ProductModel = mongoose.model<ProductDocument>('Product', ProductSchema);
const CartItemModel = mongoose.model<CartItemDocument>('CartItem', CartItemSchema);
const OrderModel = mongoose.model<OrderDocument>('Order', OrderSchema);
const OrderItemModel = mongoose.model<OrderItemDocument>('OrderItem', OrderItemSchema);
const AdminWhitelistModel = mongoose.model<AdminWhitelistDocument>('AdminWhitelist', AdminWhitelistSchema);
const UserModel = mongoose.model<UserDocument>('User', UserSchema);
const ReviewModel = mongoose.model<ReviewDocument>('Review', ReviewSchema);
const WhitelistRequestModel = mongoose.model<WhitelistRequestDocument>('WhitelistRequest', WhitelistRequestSchema);
const PaymentConfirmationModel = mongoose.model<PaymentConfirmationDocument>('PaymentConfirmation', PaymentConfirmationSchema);
const CouponModel = mongoose.model<CouponDocument>('Coupon', CouponSchema);

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
  getOrdersByEmail(email: string): Promise<IOrder[]>;
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
  addReview(review: InsertReview): Promise<IReview>;
  deleteReview(reviewId: string): Promise<boolean>;

  // Whitelist operations
  addWhitelistRequest(request: InsertWhitelistRequest): Promise<IWhitelistRequest>;
  getWhitelistRequests(): Promise<IWhitelistRequest[]>;
  updateWhitelistRequest(id: string, status: string, processedBy?: string): Promise<IWhitelistRequest | undefined>;

  // Payment confirmation operations
  addPaymentConfirmation(confirmation: InsertPaymentConfirmation): Promise<IPaymentConfirmation>;
  getPaymentConfirmationsByOrder(orderId: string): Promise<IPaymentConfirmation[]>;
  getAllPaymentConfirmations(): Promise<IPaymentConfirmation[]>;
  updatePaymentConfirmation(id: string, status: string, reviewedBy?: string, rejectionReason?: string): Promise<IPaymentConfirmation | undefined>;
  
  // Coupon operations
  createCoupon(coupon: InsertCoupon): Promise<ICoupon>;
  getCouponByCode(code: string): Promise<ICoupon | undefined>;
  getAllCoupons(): Promise<ICoupon[]>;
  updateCouponUsage(code: string): Promise<ICoupon | undefined>;
  deleteCoupon(id: string): Promise<boolean>;
}

// Helper function to convert MongoDB document to interface
function toPlainObject<T>(doc: any): T {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : doc;
  if (obj._id) {
    obj.id = obj._id.toString();
  }
  return obj;
}

class MongoStorage implements IStorage {
  async getProducts(): Promise<IProduct[]> {
    try {
      await connectToDatabase();
      const products = await ProductModel.find({});
      return products.map(toPlainObject);
    } catch (error) {
      console.log('MongoDB unavailable, using memory storage');
      return memoryStorage.getProducts();
    }
  }

  async getProductById(id: string): Promise<IProduct | undefined> {
    try {
      await connectToDatabase();
      // Check if ID is a valid MongoDB ObjectId (24 character hex string)
      if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        console.log('Invalid ObjectId format, using memory storage');
        return memoryStorage.getProductById(id);
      }
      const product = await ProductModel.findById(id);
      return product ? toPlainObject(product) : undefined;
    } catch (error) {
      console.log('MongoDB unavailable, using memory storage');
      return memoryStorage.getProductById(id);
    }
  }

  async getProductsByCategory(category: string): Promise<IProduct[]> {
    try {
      await connectToDatabase();
      const products = await ProductModel.find({ category });
      return products.map(toPlainObject);
    } catch (error) {
      console.log('MongoDB unavailable, using memory storage');
      return memoryStorage.getProductsByCategory(category);
    }
  }

  async createProduct(product: InsertProduct): Promise<IProduct> {
    try {
      await connectToDatabase();
      const newProduct = new ProductModel(product);
      const saved = await newProduct.save();
      return toPlainObject(saved);
    } catch (error) {
      console.log('MongoDB unavailable, using memory storage');
      return memoryStorage.createProduct(product);
    }
  }

  async getCartItems(sessionId: string): Promise<ICartItem[]> {
    try {
      await connectToDatabase();
      const items = await CartItemModel.find({ sessionId });
      return items.map(toPlainObject);
    } catch (error) {
      console.log('MongoDB unavailable, using memory storage');
      return memoryStorage.getCartItems(sessionId);
    }
  }

  async addToCart(cartItem: InsertCartItem): Promise<ICartItem> {
    try {
      await connectToDatabase();
      const existingItem = await CartItemModel.findOne({
        sessionId: cartItem.sessionId,
        productId: cartItem.productId
      });

      if (existingItem) {
        existingItem.quantity += cartItem.quantity;
        const updated = await existingItem.save();
        return toPlainObject(updated);
      } else {
        const newItem = new CartItemModel(cartItem);
        const saved = await newItem.save();
        return toPlainObject(saved);
      }
    } catch (error) {
      console.log('MongoDB unavailable, using memory storage');
      return memoryStorage.addToCart(cartItem);
    }
  }

  async updateCartItem(id: string, quantity: number): Promise<ICartItem | undefined> {
    try {
      await connectToDatabase();
      const updated = await CartItemModel.findByIdAndUpdate(
        id,
        { quantity },
        { new: true }
      );
      return updated ? toPlainObject(updated) : undefined;
    } catch (error) {
      console.log('MongoDB unavailable, using memory storage');
      return memoryStorage.updateCartItem(id, quantity);
    }
  }

  async removeFromCart(id: string): Promise<boolean> {
    try {
      await connectToDatabase();
      const result = await CartItemModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      console.log('MongoDB unavailable, using memory storage');
      return memoryStorage.removeFromCart(id);
    }
  }

  async clearCart(sessionId: string): Promise<void> {
    try {
      await connectToDatabase();
      await CartItemModel.deleteMany({ sessionId });
    } catch (error) {
      console.log('MongoDB unavailable, using memory storage');
      return memoryStorage.clearCart(sessionId);
    }
  }

  async createOrder(order: InsertOrder): Promise<IOrder> {
    try {
      await connectToDatabase();
      const newOrder = new OrderModel({
        ...order,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      const saved = await newOrder.save();
      return toPlainObject(saved);
    } catch (error) {
      console.log('MongoDB unavailable, using memory storage');
      return memoryStorage.createOrder(order);
    }
  }

  async createOrderWithItems(order: InsertOrder, items: InsertOrderItem[]): Promise<IOrder> {
    try {
      await connectToDatabase();
      const newOrder = new OrderModel({
        ...order,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      const savedOrder = await newOrder.save();
      
      // Create order items
      const orderItems = items.map(item => ({
        ...item,
        orderId: savedOrder._id.toString()
      }));
      await OrderItemModel.insertMany(orderItems);
      
      return toPlainObject(savedOrder);
    } catch (error) {
      console.log('MongoDB unavailable, using memory storage');
      return memoryStorage.createOrderWithItems(order, items);
    }
  }

  async getOrder(id: string): Promise<IOrder | undefined> {
    try {
      await connectToDatabase();
      const order = await OrderModel.findById(id);
      return order ? toPlainObject(order) : undefined;
    } catch (error) {
      console.log('MongoDB unavailable, using memory storage');
      return memoryStorage.getOrder(id);
    }
  }

  async getOrdersByUser(userId: string): Promise<IOrder[]> {
    await connectToDatabase();
    const orders = await OrderModel.find({ userId }).sort({ createdAt: -1 });
    return orders.map(toPlainObject);
  }

  async getOrdersByEmail(email: string): Promise<IOrder[]> {
    await connectToDatabase();
    const orders = await OrderModel.find({ email }).sort({ createdAt: -1 });
    return orders.map(toPlainObject);
  }

  async getAllOrders(): Promise<IOrder[]> {
    await connectToDatabase();
    const orders = await OrderModel.find({}).sort({ createdAt: -1 });
    return orders.map(toPlainObject);
  }

  async updateOrderStatus(id: string, status: string): Promise<IOrder | undefined> {
    await connectToDatabase();
    const updated = await OrderModel.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );
    return updated ? toPlainObject(updated) : undefined;
  }

  async getOrderItems(orderId: string): Promise<IOrderItem[]> {
    await connectToDatabase();
    const items = await OrderItemModel.find({ orderId });
    return items.map(toPlainObject);
  }

  async isUserAdmin(userId: string): Promise<boolean> {
    await connectToDatabase();
    const user = await UserModel.findById(userId);
    return user?.isAdmin || false;
  }

  async addToAdminWhitelist(admin: InsertAdminWhitelist): Promise<IAdminWhitelist> {
    await connectToDatabase();
    const newAdmin = new AdminWhitelistModel({
      ...admin,
      createdAt: new Date()
    });
    const saved = await newAdmin.save();
    return toPlainObject(saved);
  }

  async removeFromAdminWhitelist(email: string): Promise<boolean> {
    await connectToDatabase();
    const result = await AdminWhitelistModel.findOneAndDelete({ email });
    return result !== null;
  }

  async getAdminWhitelist(): Promise<IAdminWhitelist[]> {
    await connectToDatabase();
    const admins = await AdminWhitelistModel.find({});
    return admins.map(toPlainObject);
  }

  async getUserStats(): Promise<{ totalUsers: number; totalOrders: number; totalRevenue: string }> {
    await connectToDatabase();
    const totalUsers = await UserModel.countDocuments();
    const totalOrders = await OrderModel.countDocuments();
    const revenueResult = await OrderModel.aggregate([
      { $match: { status: { $in: ['completed', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total.toString() : '0';
    
    return { totalUsers, totalOrders, totalRevenue };
  }

  async updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<IUser> {
    try {
      await connectToDatabase();
      // Check if ID is a valid MongoDB ObjectId
      if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
        console.log('Invalid ObjectId format, using memory storage');
        return memoryStorage.updateUserAdminStatus(userId, isAdmin);
      }
      const updated = await UserModel.findByIdAndUpdate(
        userId,
        { isAdmin, updatedAt: new Date() },
        { new: true }
      );
      if (!updated) {
        throw new Error('User not found');
      }
      return toPlainObject(updated);
    } catch (error) {
      console.log('MongoDB unavailable, using memory storage');
      return memoryStorage.updateUserAdminStatus(userId, isAdmin);
    }
  }

  async getAllUsers(): Promise<IUser[]> {
    try {
      await connectToDatabase();
      const users = await UserModel.find({});
      return users.map(toPlainObject);
    } catch (error) {
      console.log('MongoDB unavailable, using memory storage');
      return memoryStorage.getAllUsers();
    }
  }

  async getUser(id: string): Promise<IUser | undefined> {
    try {
      await connectToDatabase();
      // Check if ID is a valid MongoDB ObjectId (24 character hex string)
      if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        console.log('Invalid ObjectId format, using memory storage');
        return memoryStorage.getUser(id);
      }
      const user = await UserModel.findById(id);
      return user ? toPlainObject(user) : undefined;
    } catch (error) {
      console.log('MongoDB unavailable, using memory storage');
      return memoryStorage.getUser(id);
    }
  }

  async getUserByEmail(email: string): Promise<IUser | undefined> {
    try {
      await connectToDatabase();
      const user = await UserModel.findOne({ email });
      return user ? toPlainObject(user) : undefined;
    } catch (error) {
      console.log('MongoDB unavailable, using memory storage');
      return memoryStorage.getUserByEmail(email);
    }
  }

  async getUserByGoogleId(googleId: string): Promise<IUser | undefined> {
    try {
      await connectToDatabase();
      const user = await UserModel.findOne({ googleId });
      return user ? toPlainObject(user) : undefined;
    } catch (error) {
      console.log('MongoDB unavailable, using memory storage');
      return memoryStorage.getUserByGoogleId(googleId);
    }
  }

  async updateUserGoogleId(userId: string, googleId: string): Promise<IUser> {
    try {
      await connectToDatabase();
      // Check if ID is a valid MongoDB ObjectId
      if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
        console.log('Invalid ObjectId format, using memory storage');
        return memoryStorage.updateUserGoogleId(userId, googleId);
      }
      const updated = await UserModel.findByIdAndUpdate(
        userId,
        { googleId, updatedAt: new Date() },
        { new: true }
      );
      if (!updated) {
        throw new Error('User not found');
      }
      return toPlainObject(updated);
    } catch (error) {
      console.log('MongoDB unavailable, using memory storage');
      return memoryStorage.updateUserGoogleId(userId, googleId);
    }
  }

  async upsertUser(user: UpsertUser): Promise<IUser> {
    try {
      await connectToDatabase();
      
      if (user.email) {
        const existing = await UserModel.findOne({ email: user.email });
        if (existing) {
          // Update existing user
          Object.assign(existing, { ...user, updatedAt: new Date() });
          const updated = await existing.save();
          return toPlainObject(updated);
        }
      }

      // Create new user
      const newUser = new UserModel({
        ...user,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      const saved = await newUser.save();
      return toPlainObject(saved);
    } catch (error) {
      console.log('MongoDB unavailable, using memory storage');
      return memoryStorage.upsertUser(user);
    }
  }

  async getReviewsByProduct(productId: string): Promise<IReview[]> {
    await connectToDatabase();
    const reviews = await ReviewModel.find({ productId }).sort({ createdAt: -1 });
    return reviews.map(toPlainObject);
  }

  async addReview(review: InsertReview): Promise<IReview> {
    await connectToDatabase();
    const newReview = new ReviewModel({
      ...review,
      createdAt: new Date()
    });
    const saved = await newReview.save();
    return toPlainObject(saved);
  }

  async deleteReview(reviewId: string): Promise<boolean> {
    await connectToDatabase();
    const result = await ReviewModel.findByIdAndDelete(reviewId);
    return result !== null;
  }

  async addWhitelistRequest(request: InsertWhitelistRequest): Promise<IWhitelistRequest> {
    await connectToDatabase();
    const newRequest = new WhitelistRequestModel({
      ...request,
      submittedAt: new Date()
    });
    const saved = await newRequest.save();
    return toPlainObject(saved);
  }

  async getWhitelistRequests(): Promise<IWhitelistRequest[]> {
    await connectToDatabase();
    const requests = await WhitelistRequestModel.find({}).sort({ submittedAt: -1 });
    return requests.map(toPlainObject);
  }

  async updateWhitelistRequest(id: string, status: string, processedBy?: string): Promise<IWhitelistRequest | undefined> {
    await connectToDatabase();
    const updated = await WhitelistRequestModel.findByIdAndUpdate(
      id,
      { 
        status, 
        processedBy, 
        processedAt: new Date() 
      },
      { new: true }
    );
    return updated ? toPlainObject(updated) : undefined;
  }

  async addPaymentConfirmation(confirmation: InsertPaymentConfirmation): Promise<IPaymentConfirmation> {
    await connectToDatabase();
    const newConfirmation = new PaymentConfirmationModel({
      ...confirmation,
      submittedAt: new Date()
    });
    const saved = await newConfirmation.save();
    return toPlainObject(saved);
  }

  async getPaymentConfirmationsByOrder(orderId: string): Promise<IPaymentConfirmation[]> {
    await connectToDatabase();
    const confirmations = await PaymentConfirmationModel.find({ orderId });
    return confirmations.map(toPlainObject);
  }

  async getAllPaymentConfirmations(): Promise<IPaymentConfirmation[]> {
    await connectToDatabase();
    const confirmations = await PaymentConfirmationModel.find({}).sort({ submittedAt: -1 });
    return confirmations.map(toPlainObject);
  }

  async updatePaymentConfirmation(id: string, status: string, reviewedBy?: string, rejectionReason?: string): Promise<IPaymentConfirmation | undefined> {
    await connectToDatabase();
    const updated = await PaymentConfirmationModel.findByIdAndUpdate(
      id,
      { 
        status, 
        reviewedBy, 
        rejectionReason,
        reviewedAt: new Date() 
      },
      { new: true }
    );
    return updated ? toPlainObject(updated) : undefined;
  }

  // Coupon operations
  async createCoupon(coupon: InsertCoupon): Promise<ICoupon> {
    try {
      await connectToDatabase();
      const newCoupon = new CouponModel({
        ...coupon,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      const saved = await newCoupon.save();
      return toPlainObject(saved);
    } catch (error) {
      console.log('MongoDB unavailable, using memory storage');
      return memoryStorage.createCoupon(coupon);
    }
  }

  async getCouponByCode(code: string): Promise<ICoupon | undefined> {
    try {
      await connectToDatabase();
      const coupon = await CouponModel.findOne({ code });
      return coupon ? toPlainObject(coupon) : undefined;
    } catch (error) {
      console.log('MongoDB unavailable, using memory storage');
      return memoryStorage.getCouponByCode(code);
    }
  }

  async getAllCoupons(): Promise<ICoupon[]> {
    try {
      await connectToDatabase();
      const coupons = await CouponModel.find({}).sort({ createdAt: -1 });
      return coupons.map(toPlainObject);
    } catch (error) {
      console.log('MongoDB unavailable, using memory storage');
      return memoryStorage.getAllCoupons();
    }
  }

  async updateCouponUsage(code: string): Promise<ICoupon | undefined> {
    try {
      await connectToDatabase();
      const updated = await CouponModel.findOneAndUpdate(
        { code },
        { 
          $inc: { currentUsages: 1 },
          updatedAt: new Date()
        },
        { new: true }
      );
      return updated ? toPlainObject(updated) : undefined;
    } catch (error) {
      console.log('MongoDB unavailable, using memory storage');
      return memoryStorage.updateCouponUsage(code);
    }
  }

  async deleteCoupon(id: string): Promise<boolean> {
    try {
      await connectToDatabase();
      const result = await CouponModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      console.log('MongoDB unavailable, using memory storage');
      return memoryStorage.deleteCoupon(id);
    }
  }
}

export const storage = new MongoStorage();