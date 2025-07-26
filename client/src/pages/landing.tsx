import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Crown, Coins, Shield, Zap, Headphones } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-slate">
      {/* Header */}
      <header className="border-b border-minecraft-green/20 bg-light-slate/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Crown className="h-8 w-8 minecraft-green" />
            <span className="text-2xl font-bold minecraft-green">LifeSteal Shop</span>
          </div>
          <Button
            onClick={() => window.location.href = "/api/login"}
            className="bg-minecraft-green hover:bg-minecraft-dark-green text-dark-slate font-bold transition-all duration-300 hover-lift"
          >
            Login to Continue
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-minecraft-green/10 via-transparent to-neon-cyan/10"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-minecraft-green/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
        
        <div className="relative z-20 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-minecraft-green to-neon-cyan bg-clip-text text-transparent">
            LIFESTEAL SHOP
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 minecraft-gray">
            Upgrade your Minecraft experience with premium ranks and coins
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              onClick={() => window.location.href = "/api/login"}
              className="bg-minecraft-green hover:bg-minecraft-dark-green text-dark-slate px-8 py-4 text-lg font-bold transition-all duration-300 hover-lift"
            >
              <Crown className="h-5 w-5 mr-2" />
              Login to Browse Ranks
            </Button>
            <Button
              onClick={() => window.location.href = "/api/login"}
              variant="outline"
              className="border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 px-8 py-4 text-lg font-bold transition-all duration-300 hover-lift shadow-lg shadow-cyan-400/20 hover:shadow-cyan-400/40"
              style={{
                borderColor: 'var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)'
              }}
            >
              <Coins className="h-5 w-5 mr-2" />
              Login to Buy Coins
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-light-slate/50 p-6 border border-minecraft-green/20 hover-lift transition-all duration-300">
              <Zap className="h-12 w-12 neon-cyan mx-auto mb-4 animate-pulse-slow" />
              <h3 className="text-xl font-bold mb-2">Instant Delivery</h3>
              <p className="minecraft-gray">Get your purchases instantly after payment</p>
            </Card>
            <Card className="bg-light-slate/50 p-6 border border-minecraft-green/20 hover-lift transition-all duration-300">
              <Shield className="h-12 w-12 minecraft-green mx-auto mb-4 animate-pulse-slow" />
              <h3 className="text-xl font-bold mb-2">Secure Payment</h3>
              <p className="minecraft-gray">Safe and encrypted payment processing</p>
            </Card>
            <Card className="bg-light-slate/50 p-6 border border-minecraft-green/20 hover-lift transition-all duration-300">
              <Headphones className="h-12 w-12 neon-magenta mx-auto mb-4 animate-pulse-slow" />
              <h3 className="text-xl font-bold mb-2">24/7 Support</h3>
              <p className="minecraft-gray">Round-the-clock customer assistance</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-minecraft-green/20 bg-light-slate/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="minecraft-gray">
            Join thousands of players who have upgraded their Minecraft experience
          </p>
          <p className="minecraft-gray mt-2">
            Login with your Replit account to get started
          </p>
        </div>
      </footer>
    </div>
  );
}