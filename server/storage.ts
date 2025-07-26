import { type Product, type InsertProduct, type CartItem, type InsertCartItem, type Order, type InsertOrder } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  
  // Cart
  getCartItems(sessionId: string): Promise<CartItem[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  clearCart(sessionId: string): Promise<boolean>;
  
  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private cartItems: Map<string, CartItem>;
  private orders: Map<string, Order>;

  constructor() {
    this.products = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    
    // Initialize with sample products
    this.initializeProducts();
  }

  private initializeProducts() {
    const sampleProducts: Product[] = [
      {
        id: randomUUID(),
        name: "VIP Rank",
        description: "Access to exclusive areas, special commands, and VIP perks. Perfect for casual players.",
        price: "9.99",
        category: "ranks",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        badge: "POPULAR",
        badgeColor: "neon-magenta",
        buttonColor: "minecraft-green",
        featured: true,
        rankLevel: "VIP",
        bonusText: null,
        coinAmount: null
      },
      {
        id: randomUUID(),
        name: "MVP Rank",
        description: "Ultimate rank with all permissions, custom tags, and exclusive cosmetics. For the dedicated player.",
        price: "24.99",
        category: "ranks",
        imageUrl: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        badge: "PREMIUM",
        badgeColor: "neon-cyan",
        buttonColor: "neon-cyan",
        featured: true,
        rankLevel: "MVP",
        bonusText: null,
        coinAmount: null
      },
      {
        id: randomUUID(),
        name: "ELITE Rank",
        description: "Advanced rank with special abilities, priority support, and exclusive server access.",
        price: "16.99",
        category: "ranks",
        imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        badge: "ELITE",
        badgeColor: "yellow-400",
        buttonColor: "yellow-500",
        featured: false,
        rankLevel: "ELITE",
        bonusText: null,
        coinAmount: null
      },
      {
        id: randomUUID(),
        name: "LEGEND Rank",
        description: "Legendary status with unique abilities, custom particles, and lifetime benefits. Very exclusive.",
        price: "99.99",
        category: "ranks",
        imageUrl: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        badge: "LIMITED",
        badgeColor: "orange-400",
        buttonColor: "orange-500",
        featured: false,
        rankLevel: "LEGEND",
        bonusText: null,
        coinAmount: null
      },
      {
        id: randomUUID(),
        name: "1,000 Coins",
        description: "Perfect starter pack for new players. Buy items, upgrades, and cosmetics in-game.",
        price: "4.99",
        category: "coins",
        imageUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        badge: "STARTER",
        badgeColor: "minecraft-green",
        buttonColor: "minecraft-green",
        featured: false,
        coinAmount: 1000,
        rankLevel: null,
        bonusText: "Best Value"
      },
      {
        id: randomUUID(),
        name: "5,000 Coins",
        description: "Popular choice for active players. Enough coins for major purchases and upgrades.",
        price: "19.99",
        category: "coins",
        imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        badge: "POPULAR",
        badgeColor: "neon-cyan",
        buttonColor: "neon-cyan",
        featured: true,
        coinAmount: 5000,
        rankLevel: null,
        bonusText: "+20% Bonus"
      },
      {
        id: randomUUID(),
        name: "15,000 Coins",
        description: "Ultimate coin package for serious players. Includes exclusive bonus coins and special perks.",
        price: "49.99",
        category: "coins",
        imageUrl: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        badge: "MEGA",
        badgeColor: "yellow-400",
        buttonColor: "yellow-500",
        featured: true,
        coinAmount: 15000,
        rankLevel: null,
        bonusText: "+50% Bonus"
      }
    ];

    sampleProducts.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.category === category);
  }

  async getCartItems(sessionId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(item => item.sessionId === sessionId);
  }

  async addToCart(insertItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.sessionId === insertItem.sessionId && item.productId === insertItem.productId
    );

    if (existingItem) {
      // Update quantity instead of adding new item
      existingItem.quantity += insertItem.quantity || 1;
      this.cartItems.set(existingItem.id, existingItem);
      return existingItem;
    }

    const id = randomUUID();
    const cartItem: CartItem = { 
      ...insertItem, 
      id,
      quantity: insertItem.quantity || 1
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
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

  async clearCart(sessionId: string): Promise<boolean> {
    const itemsToDelete = Array.from(this.cartItems.entries())
      .filter(([, item]) => item.sessionId === sessionId)
      .map(([id]) => id);
    
    itemsToDelete.forEach(id => this.cartItems.delete(id));
    return true;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = { 
      ...insertOrder, 
      id, 
      status: insertOrder.status || "pending",
      createdAt: new Date().toISOString()
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }
}

export const storage = new MemStorage();
