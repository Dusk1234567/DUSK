import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { User, LogOut, Crown, Shield } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import Hero from "@/components/hero";
import ProductGrid from "@/components/product-grid";
import CartSidebar from "@/components/cart-sidebar";
import Testimonials from "@/components/testimonials";
import Footer from "@/components/footer";
import FloatingParticles from "@/components/floating-particles";

function AuthenticatedHeader() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Logout failed");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Logged out successfully",
        description: "Come back soon!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="border-b border-minecraft-green/20 bg-light-slate/50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Crown className="h-8 w-8 minecraft-green" />
          <span className="text-2xl font-bold text-green-400">RAZOR CLOUD</span>
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
          <a href="/order-status">
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold transition-all duration-300 hover-lift shadow-lg hover:shadow-orange-500/25"
            >
              <Shield className="h-4 w-4 mr-2" />
              Order Status
            </Button>
          </a>
          <a href="/whitelist">
            <Button
              variant="outline"
              className="border-minecraft-green/30 text-[#f02929] hover:bg-minecraft-green hover:text-white transition-all duration-300 hover-lift"
            >
              Whitelist
            </Button>
          </a>
          <Button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            variant="outline"
            className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white transition-all duration-300 hover-lift"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
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
