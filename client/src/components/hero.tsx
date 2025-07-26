import { Button } from "@/components/ui/button";
import { Crown, Coins, Zap, Shield, Headphones } from "lucide-react";

export default function Hero() {
  const scrollToProducts = () => {
    const element = document.getElementById('products');
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-slate/90 to-light-slate/90 z-10"></div>
        <div className="w-full h-full relative">
          <img 
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080" 
            alt="Gaming setup with RGB lighting" 
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        </div>
      </div>
      
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
        <div className="animate-float">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-minecraft-green to-neon-cyan bg-clip-text text-transparent">
            LIFESTEAL SHOP
          </h1>
        </div>
        
        <p className="text-xl md:text-2xl mb-8 minecraft-gray">
          Upgrade your Minecraft experience with premium ranks and coins
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={scrollToProducts}
            className="bg-minecraft-green hover:bg-minecraft-dark-green text-dark-slate px-8 py-4 text-lg font-bold transition-all duration-300 animate-glow"
          >
            <Crown className="h-5 w-5 mr-2" />
            Browse Ranks
          </Button>
          <Button
            onClick={scrollToProducts}
            variant="outline"
            className="border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-dark-slate px-8 py-4 text-lg font-bold transition-all duration-300"
          >
            <Coins className="h-5 w-5 mr-2" />
            Buy Coins
          </Button>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-light-slate/50 p-6 rounded-lg border border-minecraft-green/20">
            <Zap className="h-12 w-12 neon-cyan mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Instant Delivery</h3>
            <p className="minecraft-gray">Get your purchases instantly after payment</p>
          </div>
          <div className="bg-light-slate/50 p-6 rounded-lg border border-minecraft-green/20">
            <Shield className="h-12 w-12 minecraft-green mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Secure Payment</h3>
            <p className="minecraft-gray">Safe and encrypted payment processing</p>
          </div>
          <div className="bg-light-slate/50 p-6 rounded-lg border border-minecraft-green/20">
            <Headphones className="h-12 w-12 neon-magenta mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">24/7 Support</h3>
            <p className="minecraft-gray">Round-the-clock customer assistance</p>
          </div>
        </div>
      </div>
    </section>
  );
}
