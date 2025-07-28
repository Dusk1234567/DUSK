import { pgTable, serial, text, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  passwordHash: text("password_hash"),
  googleId: text("google_id").unique(),
  minecraftUsername: text("minecraft_username"),
  isAdmin: boolean("is_admin").default(false),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0"),
  orderCount: integer("order_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  badge: text("badge"),
  badgeColor: text("badge_color"),
  buttonColor: text("button_color"),
  featured: boolean("featured").default(false),
  coinAmount: integer("coin_amount"),
  rankLevel: text("rank_level"),
  bonusText: text("bonus_text"),
});

// Cart items table
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: text("product_id").notNull(),
  quantity: integer("quantity").default(1),
});

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  sessionId: text("session_id"),
  userId: integer("user_id").references(() => users.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  originalAmount: decimal("original_amount", { precision: 10, scale: 2 }),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  couponCode: text("coupon_code"),
  status: text("status").default("pending"),
  playerName: text("player_name"),
  email: text("email").notNull(),
  paymentMethod: text("payment_method").default("pending"),
  transactionId: text("transaction_id"),
  items: json("items").$type<Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Coupons table
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull(), // 'percentage' | 'fixed'
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minimumOrderAmount: decimal("minimum_order_amount", { precision: 10, scale: 2 }).default("0"),
  maximumOrderAmount: decimal("maximum_order_amount", { precision: 10, scale: 2 }),
  maxUsages: integer("max_usages"),
  currentUsages: integer("current_usages").default(0),
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  isActive: boolean("is_active").default(true),
  description: text("description"),
  applicableProducts: text("applicable_products").array(),
  applicableCategories: text("applicable_categories").array(),
  excludedProducts: text("excluded_products").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Whitelist requests table
export const whitelistRequests = pgTable("whitelist_requests", {
  id: serial("id").primaryKey(),
  minecraftUsername: text("minecraft_username").notNull(),
  email: text("email"),
  discordUsername: text("discord_username"),
  userId: integer("user_id").references(() => users.id),
  status: text("status").default("pending"), // 'pending' | 'approved' | 'rejected'
  reason: text("reason"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  processedBy: integer("processed_by").references(() => users.id),
});

// Admin whitelist table
export const adminWhitelist = pgTable("admin_whitelist", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  role: text("role").default("admin"),
  addedBy: integer("added_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment confirmations table
export const paymentConfirmations = pgTable("payment_confirmations", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  screenshotPath: text("screenshot_path").notNull(),
  status: text("status").default("pending"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  rejectionReason: text("rejection_reason"),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  whitelistRequests: many(whitelistRequests),
  reviews: many(reviews),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  paymentConfirmations: many(paymentConfirmations),
}));

export const productsRelations = relations(products, ({ many }) => ({
  reviews: many(reviews),
}));

export const whitelistRequestsRelations = relations(whitelistRequests, ({ one }) => ({
  user: one(users, {
    fields: [whitelistRequests.userId],
    references: [users.id],
  }),
  processedByUser: one(users, {
    fields: [whitelistRequests.processedBy],
    references: [users.id],
  }),
}));

export const paymentConfirmationsRelations = relations(paymentConfirmations, ({ one }) => ({
  order: one(orders, {
    fields: [paymentConfirmations.orderId],
    references: [orders.id],
  }),
  reviewedByUser: one(users, {
    fields: [paymentConfirmations.reviewedBy],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWhitelistRequestSchema = createInsertSchema(whitelistRequests).omit({
  id: true,
  submittedAt: true,
});

export const insertAdminWhitelistSchema = createInsertSchema(adminWhitelist).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentConfirmationSchema = createInsertSchema(paymentConfirmations).omit({
  id: true,
  submittedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = InsertUser;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;

export type WhitelistRequest = typeof whitelistRequests.$inferSelect;
export type InsertWhitelistRequest = z.infer<typeof insertWhitelistRequestSchema>;

export type AdminWhitelist = typeof adminWhitelist.$inferSelect;
export type InsertAdminWhitelist = z.infer<typeof insertAdminWhitelistSchema>;

export type PaymentConfirmation = typeof paymentConfirmations.$inferSelect;
export type InsertPaymentConfirmation = z.infer<typeof insertPaymentConfirmationSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// Legacy interfaces for compatibility (deprecated, use types above)
export interface IUser extends User {}
export interface IProduct extends Omit<Product, 'price'> { price: number; }
export interface ICartItem extends CartItem {}
export interface IOrder extends Omit<Order, 'totalAmount' | 'originalAmount' | 'discountAmount'> { 
  totalAmount: number; 
  originalAmount?: number; 
  discountAmount?: number;
  items: string; // JSON string compatibility
}
export interface ICoupon extends Omit<Coupon, 'discountValue' | 'minimumOrderAmount' | 'maximumOrderAmount'> {
  discountValue: number;
  minimumOrderAmount?: number;
  maximumOrderAmount?: number;
}
export interface IWhitelistRequest extends WhitelistRequest {}
export interface IAdminWhitelist extends AdminWhitelist {}
export interface IPaymentConfirmation extends PaymentConfirmation {}
export interface IReview extends Review {}
export interface IOrderItem {
  id?: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
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
  maximumOrderAmount?: number;
  maxUsages?: number;
  currentUsages: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  description?: string;
  applicableProducts?: string[]; // Array of product IDs
  applicableCategories?: string[]; // Array of categories ('ranks', 'coins')
  excludedProducts?: string[]; // Array of product IDs to exclude
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
  maximumOrderAmount: z.number().min(0).optional(),
  maxUsages: z.number().int().positive().optional(),
  currentUsages: z.number().int().min(0).default(0),
  validFrom: z.date(),
  validUntil: z.date(),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
  applicableProducts: z.array(z.string()).optional(),
  applicableCategories: z.array(z.string()).optional(),
  excludedProducts: z.array(z.string()).optional(),
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