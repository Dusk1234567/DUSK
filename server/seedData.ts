import { storage } from "./storage";

export async function seedDatabase() {
  // Check if products already exist
  const existingProducts = await storage.getProducts();
  if (existingProducts.length > 0) {
    console.log("Database already seeded");
    return;
  }

  console.log("Seeding database with sample products...");

  const sampleProducts = [
    {
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

  // Convert price strings to numbers and handle null values
  const productsToInsert = sampleProducts.map(product => ({
    ...product,
    price: parseFloat(product.price),
    badge: product.badge || undefined,
    badgeColor: product.badgeColor || undefined,
    buttonColor: product.buttonColor || undefined,
    rankLevel: product.rankLevel || undefined,
    bonusText: product.bonusText || undefined,
    coinAmount: product.coinAmount || undefined,
  }));

  // Insert products using storage interface
  for (const product of productsToInsert) {
    await storage.createProduct(product);
  }
  // Seed sample coupons with enhanced features
  const sampleCoupons = [
    {
      code: "SAVE20",
      discountType: "percentage" as const,
      discountValue: 20,
      minimumOrderAmount: 15,
      maxUsages: 100,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isActive: true,
      description: "20% off all orders over $15"
    },
    {
      code: "RANKSONLY",
      discountType: "percentage" as const,
      discountValue: 25,
      minimumOrderAmount: 10,
      maximumOrderAmount: 100,
      maxUsages: 50,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      isActive: true,
      description: "25% off rank purchases only - Limited time!",
      applicableCategories: ["ranks"]
    },
    {
      code: "COINSBONUS",
      discountType: "fixed" as const,
      discountValue: 5,
      minimumOrderAmount: 20,
      maxUsages: 75,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      isActive: true,
      description: "Get $5 off coin packages",
      applicableCategories: ["coins"]
    },
    {
      code: "PREMIUM30",
      discountType: "percentage" as const,
      discountValue: 30,
      minimumOrderAmount: 50,
      maxUsages: 20,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      isActive: false, // Disabled by default to test toggle functionality
      description: "30% off premium orders - VIP weekend special"
    }
  ];

  for (const coupon of sampleCoupons) {
    try {
      await storage.createCoupon(coupon);
    } catch (error) {
      console.error(`Error creating coupon ${coupon.code}:`, error);
    }
  }

  console.log("Database seeded successfully!");
}