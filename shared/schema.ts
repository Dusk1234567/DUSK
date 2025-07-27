import mongoose, { Schema, Document } from "mongoose";
import { z } from "zod";

// Product interface and schema
export interface IProduct extends Document {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string; // 'ranks' or 'coins'
  imageUrl: string;
  badge?: string; // POPULAR, PREMIUM, etc.
  badgeColor?: string; // Color for the badge
  buttonColor?: string; // Color for the buy button
  featured: boolean;
  coinAmount?: number; // For coin products
  rankLevel?: string; // For rank products
  bonusText?: string; // Bonus information like "+20% Bonus"
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true, maxlength: 50 },
  imageUrl: { type: String, required: true },
  badge: { type: String },
  badgeColor: { type: String },
  buttonColor: { type: String },
  featured: { type: Boolean, default: false },
  coinAmount: { type: Number },
  rankLevel: { type: String },
  bonusText: { type: String },
});

export const Product = mongoose.model<IProduct>("Product", productSchema);

// Cart Item interface and schema
export interface ICartItem extends Document {
  _id: string;
  sessionId: string;
  productId: string;
  quantity: number;
}

const cartItemSchema = new Schema<ICartItem>({
  sessionId: { type: String, required: true },
  productId: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
});

export const CartItem = mongoose.model<ICartItem>("CartItem", cartItemSchema);

// Order interface and schema
export interface IOrder extends Document {
  _id: string;
  sessionId?: string;
  userId?: string; // Link to authenticated users
  totalAmount: number;
  status: string;
  playerName?: string; // Minecraft username
  email: string; // Contact email (required)
  paymentMethod?: string;
  transactionId?: string;
  items: any[]; // Store order items as array
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
  sessionId: { type: String },
  userId: { type: String }, // Link to authenticated users
  totalAmount: { type: Number, required: true },
  status: { type: String, required: true, default: "pending" },
  playerName: { type: String }, // Minecraft username
  email: { type: String, required: true }, // Contact email (required)
  paymentMethod: { type: String, default: "pending" },
  transactionId: { type: String },
  items: { type: [Schema.Types.Mixed], required: true }, // Store order items as array
}, { timestamps: true });

export const Order = mongoose.model<IOrder>("Order", orderSchema);

// Admin whitelist interface and schema
export interface IAdminWhitelist extends Document {
  _id: string;
  email: string;
  role: string; // admin, moderator
  addedBy?: string;
  createdAt: Date;
}

const adminWhitelistSchema = new Schema<IAdminWhitelist>({
  email: { type: String, unique: true, required: true },
  role: { type: String, required: true, default: "admin" },
  addedBy: { type: String },
}, { timestamps: true });

export const AdminWhitelist = mongoose.model<IAdminWhitelist>("AdminWhitelist", adminWhitelistSchema);

// Order items interface and schema
export interface IOrderItem extends Document {
  _id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

const orderItemSchema = new Schema<IOrderItem>({
  orderId: { type: String, required: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
});

export const OrderItem = mongoose.model<IOrderItem>("OrderItem", orderItemSchema);

// Session interface and schema
export interface ISession extends Document {
  _id: string;
  sid: string;
  sess: any;
  expire: Date;
}

const sessionSchema = new Schema<ISession>({
  sid: { type: String, required: true, unique: true },
  sess: { type: Schema.Types.Mixed, required: true },
  expire: { type: Date, required: true, index: true },
});

export const Session = mongoose.model<ISession>("Session", sessionSchema);

// Payment confirmations interface and schema
export interface IPaymentConfirmation extends Document {
  _id: string;
  orderId: string;
  screenshotPath: string;
  status: string; // pending, approved, rejected
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string; // Admin user ID who reviewed
  rejectionReason?: string;
}

const paymentConfirmationSchema = new Schema<IPaymentConfirmation>({
  orderId: { type: String, required: true },
  screenshotPath: { type: String, required: true },
  status: { type: String, required: true, default: "pending" },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewedBy: { type: String }, // Admin user ID who reviewed
  rejectionReason: { type: String },
});

export const PaymentConfirmation = mongoose.model<IPaymentConfirmation>("PaymentConfirmation", paymentConfirmationSchema);

// User interface and schema
export interface IUser extends Document {
  _id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  passwordHash?: string; // For email/password auth
  googleId?: string; // For Google OAuth
  minecraftUsername?: string; // Minecraft player name
  isAdmin: boolean;
  totalSpent: number;
  orderCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: { type: String, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  profileImageUrl: { type: String },
  passwordHash: { type: String }, // For email/password auth
  googleId: { type: String, unique: true }, // For Google OAuth
  minecraftUsername: { type: String }, // Minecraft player name
  isAdmin: { type: Boolean, default: false },
  totalSpent: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 },
}, { timestamps: true });

export const User = mongoose.model<IUser>("User", userSchema);

// Reviews interface and schema
export interface IReview extends Document {
  _id: string;
  userId: string;
  productId: string;
  rating: number; // 1-5 stars
  comment: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>({
  userId: { type: String, required: true },
  productId: { type: String, required: true },
  rating: { type: Number, required: true }, // 1-5 stars
  comment: { type: String, required: true },
}, { timestamps: true });

export const Review = mongoose.model<IReview>("Review", reviewSchema);

// Minecraft whitelist requests interface and schema
export interface IWhitelistRequest extends Document {
  _id: string;
  minecraftUsername: string;
  email?: string;
  discordUsername?: string;
  userId?: string; // Link to authenticated users
  status: string; // pending, approved, rejected
  reason?: string; // Reason for rejection or admin notes
  submittedAt: Date;
  processedAt?: Date;
  processedBy?: string; // Admin who processed the request
}

const whitelistRequestSchema = new Schema<IWhitelistRequest>({
  minecraftUsername: { type: String, required: true },
  email: { type: String },
  discordUsername: { type: String },
  userId: { type: String }, // Link to authenticated users
  status: { type: String, required: true, default: "pending" },
  reason: { type: String }, // Reason for rejection or admin notes
  submittedAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
  processedBy: { type: String }, // Admin who processed the request
});

export const WhitelistRequest = mongoose.model<IWhitelistRequest>("WhitelistRequest", whitelistRequestSchema);

// Zod schemas for validation
export const insertProductSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  category: z.string().max(50),
  imageUrl: z.string(),
  badge: z.string().optional(),
  badgeColor: z.string().optional(),
  buttonColor: z.string().optional(),
  featured: z.boolean().default(false),
  coinAmount: z.number().optional(),
  rankLevel: z.string().optional(),
  bonusText: z.string().optional(),
});

export const insertCartItemSchema = z.object({
  sessionId: z.string(),
  productId: z.string(),
  quantity: z.number().default(1),
});

export const insertOrderSchema = z.object({
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  totalAmount: z.number(),
  status: z.string().default("pending"),
  playerName: z.string().optional(),
  email: z.string(),
  paymentMethod: z.string().default("pending"),
  transactionId: z.string().optional(),
  items: z.array(z.any()),
});

export const insertOrderItemSchema = z.object({
  orderId: z.string(),
  productId: z.string(),
  productName: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  totalPrice: z.number(),
});

export const insertAdminWhitelistSchema = z.object({
  email: z.string().email(),
  role: z.string().default("admin"),
  addedBy: z.string().optional(),
});

export const upsertUserSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImageUrl: z.string().optional(),
  passwordHash: z.string().optional(),
  googleId: z.string().optional(),
  minecraftUsername: z.string().optional(),
  isAdmin: z.boolean().default(false),
  totalSpent: z.number().default(0),
  orderCount: z.number().default(0),
});

export const insertReviewSchema = z.object({
  userId: z.string(),
  productId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(500),
});

export const insertWhitelistRequestSchema = z.object({
  minecraftUsername: z.string().min(3).max(16).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email().optional(),
  discordUsername: z.string().max(32).optional(),
  userId: z.string().optional(),
  status: z.string().default("pending"),
  reason: z.string().optional(),
});

export const insertPaymentConfirmationSchema = z.object({
  orderId: z.string(),
  screenshotPath: z.string(),
  status: z.string().default("pending"),
  reviewedBy: z.string().optional(),
  rejectionReason: z.string().optional(),
});

// Type exports
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type InsertAdminWhitelist = z.infer<typeof insertAdminWhitelistSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertWhitelistRequest = z.infer<typeof insertWhitelistRequestSchema>;
export type InsertPaymentConfirmation = z.infer<typeof insertPaymentConfirmationSchema>;

// Export document types for backward compatibility
export type Product = IProduct;
export type CartItem = ICartItem;
export type Order = IOrder;
export type OrderItem = IOrderItem;
export type AdminWhitelist = IAdminWhitelist;
export type User = IUser;
export type Review = IReview;
export type WhitelistRequest = IWhitelistRequest;
export type PaymentConfirmation = IPaymentConfirmation;