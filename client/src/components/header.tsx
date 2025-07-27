import { useState } from "react";
import { Search, ShoppingCart, Menu, X, User, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { itemCount, setIsOpen } = useCart();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-gray-900 border-b border-green-500/20 sticky top-0 z-40 animate-slide-up">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-green-400 animate-scale-in hover-glow transition-all duration-300 cursor-pointer" style={{color: '#4ade80'}}>
              <span className="text-2xl" style={{color: '#4ade80'}}>⚔️</span>
              <span className="ml-2 font-extrabold tracking-wider" style={{color: '#4ade80'}}>LIFESTEAL</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('home')}
              className="font-medium transition-all duration-300 hover-scale animate-slide-in-left stagger-1"
              style={{color: 'white'}}
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('products')}
              className="font-medium transition-all duration-300 hover-scale animate-slide-in-left stagger-2"
              style={{color: 'white'}}
            >
              Products
            </button>
            <Link href="/whitelist">
              <button 
                className="font-medium transition-all duration-300 hover-scale animate-slide-in-left stagger-3 border border-green-500 px-3 py-1 rounded bg-green-500/20"
                style={{color: 'white', borderColor: '#22c55e'}}
              >
                Whitelist
              </button>
            </Link>
            <Link href="/order-status">
              <button 
                className="font-medium transition-all duration-300 hover-scale animate-slide-in-left stagger-3.5 border border-cyan-500 px-3 py-1 rounded bg-cyan-500/20"
                style={{color: 'white', borderColor: '#06b6d4'}}
              >
                Order Status
              </button>
            </Link>
            <button 
              onClick={() => scrollToSection('testimonials')}
              className="font-medium transition-all duration-300 hover-scale animate-slide-in-left stagger-4"
              style={{color: 'white'}}
            >
              Reviews
            </button>
            <button 
              onClick={() => scrollToSection('footer')}
              className="font-medium transition-all duration-300 hover-scale animate-slide-in-left stagger-5"
              style={{color: 'white'}}
            >
              Support
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="relative hidden sm:block">
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-dark-slate border-minecraft-gray/30 pl-10 text-sm focus:border-minecraft-green"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-minecraft-gray" />
            </div>
            
            <Link href="/cart">
              <Button className="relative bg-gradient-to-r from-minecraft-green to-green-600 hover:from-green-600 hover:to-green-700 text-dark-slate transition-all duration-300 hover-lift animate-slide-in-right stagger-5 shadow-lg hover:shadow-green-500/25 border border-green-400/50">
                <ShoppingCart className="h-5 w-5 hover-rotate transition-transform duration-300" />
                <span className="ml-2 font-bold">View Cart</span>
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-neon-magenta to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse font-bold shadow-lg">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Authentication buttons */}
            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-minecraft-green text-sm hidden md:inline">
                      Welcome, {user.firstName || user.email}!
                    </span>
                    {user.isAdmin && (
                      <Link href="/admin">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-dark-slate"
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Admin</span>
                        </Button>
                      </Link>
                    )}
                    <Button
                      onClick={() => logoutMutation.mutate()}
                      variant="outline"
                      size="sm"
                      className="border-minecraft-green/30 text-minecraft-green hover:bg-minecraft-green hover:text-dark-slate"
                      disabled={logoutMutation.isPending}
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Logout</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link href="/login">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-minecraft-green/30 text-minecraft-green hover:bg-minecraft-green hover:text-dark-slate"
                      >
                        <User className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Login</span>
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button
                        size="sm"
                        className="bg-minecraft-green hover:bg-minecraft-dark-green text-dark-slate"
                      >
                        <span className="hidden sm:inline">Sign Up</span>
                        <span className="sm:hidden">+</span>
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-minecraft-green/20 pt-4">
            <nav className="flex flex-col space-y-4">
              <button 
                onClick={() => scrollToSection('home')}
                className="text-left transition-colors duration-300 font-medium"
                style={{color: 'white'}}
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('products')}
                className="text-left transition-colors duration-300 font-medium"
                style={{color: 'white'}}
              >
                Products
              </button>
              <Link href="/whitelist">
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-left transition-colors duration-300 w-full font-medium border px-3 py-2 rounded"
                  style={{color: 'white', borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.2)'}}
                >
                  Whitelist
                </button>
              </Link>
              <Link href="/order-status">
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-left transition-colors duration-300 w-full font-medium border px-3 py-2 rounded"
                  style={{color: 'white', borderColor: '#06b6d4', backgroundColor: 'rgba(6, 182, 212, 0.2)'}}
                >
                  Order Status
                </button>
              </Link>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="text-left transition-colors duration-300 font-medium"
                style={{color: 'white'}}
              >
                Reviews
              </button>
              <button 
                onClick={() => scrollToSection('footer')}
                className="text-left transition-colors duration-300 font-medium"
                style={{color: 'white'}}
              >
                Support
              </button>
              <Link href="/cart">
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-left transition-colors duration-300 w-full font-medium border px-3 py-2 rounded flex items-center gap-2"
                  style={{color: '#4ade80', borderColor: '#4ade80', backgroundColor: 'rgba(74, 222, 128, 0.2)'}}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Cart {itemCount > 0 && `(${itemCount})`}
                </button>
              </Link>
            </nav>
            <div className="mt-4">
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-dark-slate border-minecraft-gray/30 focus:border-minecraft-green"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
