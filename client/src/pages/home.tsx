import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { User, LogOut, Crown } from "lucide-react";
import Hero from "@/components/hero";
import ProductGrid from "@/components/product-grid";
import CartSidebar from "@/components/cart-sidebar";
import Testimonials from "@/components/testimonials";
import Footer from "@/components/footer";
import FloatingParticles from "@/components/floating-particles";

function AuthenticatedHeader() {
  const { user } = useAuth();

  return (
    <header className="border-b border-minecraft-green/20 bg-light-slate/50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Crown className="h-8 w-8 minecraft-green" />
          <span className="text-2xl font-bold minecraft-green">LifeSteal Shop</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-2 bg-dark-slate/50 px-3 py-2 rounded-lg hover-lift transition-all duration-300">
              <User className="h-5 w-5 neon-cyan" />
              <span className="text-sm">
                Welcome, {user.firstName || user.email?.split('@')[0] || 'Player'}!
              </span>
            </div>
          )}
          <Button
            onClick={() => window.location.href = "/api/logout"}
            variant="outline"
            className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white transition-all duration-300 hover-lift"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-dark-slate text-white relative overflow-hidden">
      <FloatingParticles />
      <div className="relative z-10">
        <AuthenticatedHeader />
        <Hero />
        <ProductGrid />
        <Testimonials />
        <Footer />
        <CartSidebar />
      </div>
    </div>
  );
}
