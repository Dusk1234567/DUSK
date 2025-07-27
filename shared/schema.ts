import { z } from "zod";

// MongoDB document interfaces

// Product interface
export interface IProduct {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  badge?: string;
  badgeColor?: string;
  buttonColor?: string;
  featured: boolean;
  coinAmount?: number;
  rankLevel?: string;
  bonusText?: string;
}

// Cart Item interface
export interface ICartItem {
  _id?: string;
  id?: string;
  sessionId: string;
  productId: string;
  quantity: number;
}

// Order interface
export interface IOrder {
  _id?: string;
  id?: string;
  sessionId?: string;
  userId?: string;
  totalAmount: number;
  originalAmount?: number;
  discountAmount?: number;
  couponCode?: string;
  status: string;
  playerName?: string;
  email: string;
  paymentMethod?: string;
  transactionId?: string;
  items: string; // JSON string of order items
  createdAt: Date;
  updatedAt: Date;
}

// User interface
export interface IUser {
  _id?: string;
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  passwordHash?: string;
  googleId?: string;
  minecraftUsername?: string;
  isAdmin: boolean;
  totalSpent: number;
  orderCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Admin Whitelist interface
export interface IAdminWhitelist {
  _id?: string;
  id?: string;
  email: string;
  role: string;
  addedBy?: string;
  createdAt: Date;
}

// Order Item interface
export interface IOrderItem {
  _id?: string;
  id?: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Session interface
export interface ISession {
  _id?: string;
  id?: string;
  sid: string;
  sess: string; // JSON string
  expire: Date;
}

// Payment Confirmation interface
export interface IPaymentConfirmation {
  _id?: string;
  id?: string;
  orderId: string;
  screenshotPath: string;
  status: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
}

// Review interface
export interface IReview {
  _id?: string;
  id?: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

// Whitelist Request interface
export interface IWhitelistRequest {
  _id?: string;
  id?: string;
  minecraftUsername: string;
  email?: string;
  discordUsername?: string;
  userId?: string;
  status: string;
  reason?: string;
  submittedAt: Date;
  processedAt?: Date;
  processedBy?: string;
}

// Coupon interface
export interface ICoupon {
  _id?: string;
  id?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderAmount?: number;
  maxUsages?: number;
  currentUsages: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Zod validation schemas
export const insertProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  category: z.string().min(1),
  imageUrl: z.string().url(),
  badge: z.string().optional(),
  badgeColor: z.string().optional(),
  buttonColor: z.string().optional(),
  featured: z.boolean().default(false),
  coinAmount: z.number().optional(),
  rankLevel: z.string().optional(),
  bonusText: z.string().optional(),
});

export const insertCartItemSchema = z.object({
  sessionId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
});

export const insertOrderSchema = z.object({
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  totalAmount: z.number().positive(),
  originalAmount: z.number().positive().optional(),
  discountAmount: z.number().min(0).optional(),
  couponCode: z.string().optional(),
  status: z.string().default("pending"),
  playerName: z.string().optional(),
  email: z.string().email(),
  paymentMethod: z.string().default("pending"),
  transactionId: z.string().optional(),
  items: z.string().min(1),
});

export const insertOrderItemSchema = z.object({
  orderId: z.string().min(1),
  productId: z.string().min(1),
  productName: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().positive(),
  totalPrice: z.number().positive(),
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
  profileImageUrl: z.string().url().optional(),
  passwordHash: z.string().optional(),
  googleId: z.string().optional(),
  minecraftUsername: z.string().optional(),
  isAdmin: z.boolean().default(false),
  totalSpent: z.number().default(0),
  orderCount: z.number().int().default(0),
});

export const insertReviewSchema = z.object({
  userId: z.string().min(1),
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1),
});

export const insertWhitelistRequestSchema = z.object({
  minecraftUsername: z.string().min(1),
  email: z.string().email().optional(),
  discordUsername: z.string().optional(),
  userId: z.string().optional(),
  status: z.string().default("pending"),
  reason: z.string().optional(),
});

export const insertPaymentConfirmationSchema = z.object({
  orderId: z.string().min(1),
  screenshotPath: z.string().min(1),
  status: z.string().default("pending"),
  reviewedBy: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export const insertCouponSchema = z.object({
  code: z.string().min(1).max(50),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive(),
  minimumOrderAmount: z.number().min(0).optional(),
  maxUsages: z.number().int().positive().optional(),
  currentUsages: z.number().int().min(0).default(0),
  validFrom: z.date(),
  validUntil: z.date(),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1),
  orderAmount: z.number().positive(),
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
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type ValidateCoupon = z.infer<typeof validateCouponSchema>;

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
export type Coupon = ICoupon;