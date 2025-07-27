import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, boolean, timestamp, index, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // 'ranks' or 'coins'
  imageUrl: text("image_url").notNull(),
  badge: text("badge"), // POPULAR, PREMIUM, etc.
  badgeColor: text("badge_color"), // Color for the badge
  buttonColor: text("button_color"), // Color for the buy button
  featured: boolean("featured").default(false),
  coinAmount: integer("coin_amount"), // For coin products
  rankLevel: text("rank_level"), // For rank products
  bonusText: text("bonus_text"), // Bonus information like "+20% Bonus"
});

export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  productId: text("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id"),
  userId: varchar("user_id"), // Link to authenticated users
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  playerName: varchar("player_name"), // Minecraft username
  email: varchar("email"), // Contact email
  paymentMethod: varchar("payment_method").default("pending"),
  transactionId: varchar("transaction_id"),
  items: jsonb("items").notNull(), // Store order items as JSON
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin whitelist table
export const adminWhitelist = pgTable("admin_whitelist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  role: varchar("role", { length: 50 }).notNull().default("admin"), // admin, moderator
  addedBy: varchar("added_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Order items table for detailed tracking
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull(),
  productId: varchar("product_id").notNull(),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Payment confirmations table for QR payments
export const paymentConfirmations = pgTable("payment_confirmations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull(),
  screenshotPath: text("screenshot_path").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, approved, rejected
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by"), // Admin user ID who reviewed
  rejectionReason: text("rejection_reason"),
});

// User table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  passwordHash: varchar("password_hash"), // For email/password auth
  googleId: varchar("google_id").unique(), // For Google OAuth
  minecraftUsername: varchar("minecraft_username"), // Minecraft player name
  isAdmin: boolean("is_admin").default(false),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0.00"),
  orderCount: integer("order_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  productId: varchar("product_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Minecraft whitelist requests table
export const whitelistRequests = pgTable("whitelist_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  minecraftUsername: varchar("minecraft_username").notNull(),
  email: varchar("email"),
  discordUsername: varchar("discord_username"),
  userId: varchar("user_id"), // Link to authenticated users
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, approved, rejected
  reason: text("reason"), // Reason for rejection or admin notes
  submittedAt: timestamp("submitted_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  processedBy: varchar("processed_by"), // Admin who processed the request
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  reviews: many(reviews),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
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

export const productsRelations = relations(products, ({ many }) => ({
  reviews: many(reviews),
  orderItems: many(orderItems),
}));

export const adminWhitelistRelations = relations(adminWhitelist, ({ one }) => ({
  addedByUser: one(users, {
    fields: [adminWhitelist.addedBy],
    references: [users.id],
  }),
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

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const insertAdminWhitelistSchema = createInsertSchema(adminWhitelist).omit({
  id: true,
  createdAt: true,
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
}).extend({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(500),
});

export const insertWhitelistRequestSchema = createInsertSchema(whitelistRequests).omit({
  id: true,
  submittedAt: true,
  processedAt: true,
}).extend({
  minecraftUsername: z.string().min(3).max(16).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email().optional(),
  discordUsername: z.string().max(32).optional(),
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertAdminWhitelist = z.infer<typeof insertAdminWhitelistSchema>;
export type AdminWhitelist = typeof adminWhitelist.$inferSelect;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertWhitelistRequest = z.infer<typeof insertWhitelistRequestSchema>;
export type WhitelistRequest = typeof whitelistRequests.$inferSelect;

// Payment confirmation schemas
export const insertPaymentConfirmationSchema = createInsertSchema(paymentConfirmations).omit({
  id: true,
  submittedAt: true,
  reviewedAt: true,
});
export type InsertPaymentConfirmation = z.infer<typeof insertPaymentConfirmationSchema>;
export type PaymentConfirmation = typeof paymentConfirmations.$inferSelect;
