import { db } from "./db";
import { products } from "@shared/schema";

export async function seedDatabase() {
  // Check if products already exist
  const existingProducts = await db.select().from(products).limit(1);
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

  await db.insert(products).values(sampleProducts);
  console.log("Database seeded successfully!");
}