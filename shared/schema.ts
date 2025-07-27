import { pgTable, text, integer, boolean, timestamp, varchar, serial, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Product table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  imageUrl: text("image_url").notNull(),
  badge: text("badge"),
  badgeColor: text("badge_color"),
  buttonColor: text("button_color"),
  featured: boolean("featured").default(false).notNull(),
  coinAmount: integer("coin_amount"),
  rankLevel: text("rank_level"),
  bonusText: text("bonus_text"),
});

export type IProduct = typeof products.$inferSelect;

// Cart Items table
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").default(1).notNull(),
});

export type ICartItem = typeof cartItems.$inferSelect;

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id"),
  userId: integer("user_id").references(() => users.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending").notNull(),
  playerName: text("player_name"),
  email: text("email").notNull(),
  paymentMethod: text("payment_method").default("pending"),
  transactionId: text("transaction_id"),
  items: text("items").notNull(), // JSON string of order items
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type IOrder = typeof orders.$inferSelect;

// Users table (needs to be defined before orders reference)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  passwordHash: text("password_hash"),
  googleId: text("google_id").unique(),
  minecraftUsername: text("minecraft_username"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0").notNull(),
  orderCount: integer("order_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type IUser = typeof users.$inferSelect;

// Admin whitelist table
export const adminWhitelist = pgTable("admin_whitelist", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  role: text("role").default("admin").notNull(),
  addedBy: text("added_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type IAdminWhitelist = typeof adminWhitelist.$inferSelect;

// Order items table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

export type IOrderItem = typeof orderItems.$inferSelect;

// Sessions table (for express-session)
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  sid: text("sid").unique().notNull(),
  sess: text("sess").notNull(), // JSON string
  expire: timestamp("expire").notNull(),
});

export type ISession = typeof sessions.$inferSelect;

// Payment confirmations table
export const paymentConfirmations = pgTable("payment_confirmations", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  screenshotPath: text("screenshot_path").notNull(),
  status: text("status").default("pending").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: text("reviewed_by"),
  rejectionReason: text("rejection_reason"),
});

export type IPaymentConfirmation = typeof paymentConfirmations.$inferSelect;

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type IReview = typeof reviews.$inferSelect;

// Whitelist requests table
export const whitelistRequests = pgTable("whitelist_requests", {
  id: serial("id").primaryKey(),
  minecraftUsername: text("minecraft_username").notNull(),
  email: text("email"),
  discordUsername: text("discord_username"),
  userId: integer("user_id").references(() => users.id),
  status: text("status").default("pending").notNull(),
  reason: text("reason"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
  processedBy: text("processed_by"),
});

export type IWhitelistRequest = typeof whitelistRequests.$inferSelect;

// Database schema and relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  reviews: many(reviews),
  whitelistRequests: many(whitelistRequests),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
  paymentConfirmations: many(paymentConfirmations),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
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

export const paymentConfirmationsRelations = relations(paymentConfirmations, ({ one }) => ({
  order: one(orders, {
    fields: [paymentConfirmations.orderId],
    references: [orders.id],
  }),
}));

export const whitelistRequestsRelations = relations(whitelistRequests, ({ one }) => ({
  user: one(users, {
    fields: [whitelistRequests.userId],
    references: [users.id],
  }),
}));

// Zod schemas using createInsertSchema from drizzle-zod
export const insertProductSchema = createInsertSchema(products);
export const insertCartItemSchema = createInsertSchema(cartItems);
export const insertOrderSchema = createInsertSchema(orders);
export const insertOrderItemSchema = createInsertSchema(orderItems);
export const insertAdminWhitelistSchema = createInsertSchema(adminWhitelist);
export const upsertUserSchema = createInsertSchema(users);
export const insertReviewSchema = createInsertSchema(reviews);
export const insertWhitelistRequestSchema = createInsertSchema(whitelistRequests);
export const insertPaymentConfirmationSchema = createInsertSchema(paymentConfirmations);

// Type exports
export type InsertProduct = typeof insertProductSchema._type;
export type InsertCartItem = typeof insertCartItemSchema._type;
export type InsertOrder = typeof insertOrderSchema._type;
export type InsertOrderItem = typeof insertOrderItemSchema._type;
export type InsertAdminWhitelist = typeof insertAdminWhitelistSchema._type;
export type UpsertUser = typeof upsertUserSchema._type;
export type InsertReview = typeof insertReviewSchema._type;
export type InsertWhitelistRequest = typeof insertWhitelistRequestSchema._type;
export type InsertPaymentConfirmation = typeof insertPaymentConfirmationSchema._type;

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