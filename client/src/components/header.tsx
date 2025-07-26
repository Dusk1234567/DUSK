import { useState } from "react";
import { Search, ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { itemCount, setIsOpen } = useCart();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-light-slate border-b border-minecraft-green/20 sticky top-0 z-40 animate-slide-up">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold minecraft-green animate-scale-in hover-glow transition-all duration-300 cursor-pointer">
              <i className="fas fa-cube mr-2 animate-wiggle"></i>
              LifeSteal Shop
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('home')}
              className="hover:text-minecraft-green transition-all duration-300 hover-scale animate-slide-in-left stagger-1"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('products')}
              className="hover:text-minecraft-green transition-all duration-300 hover-scale animate-slide-in-left stagger-2"
            >
              Products
            </button>
            <button 
              onClick={() => scrollToSection('testimonials')}
              className="hover:text-minecraft-green transition-all duration-300 hover-scale animate-slide-in-left stagger-3"
            >
              Reviews
            </button>
            <button 
              onClick={() => scrollToSection('footer')}
              className="hover:text-minecraft-green transition-all duration-300 hover-scale animate-slide-in-left stagger-4"
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
            
            <Button
              onClick={() => setIsOpen(true)}
              className="relative bg-minecraft-green hover:bg-minecraft-dark-green text-dark-slate transition-all duration-300 hover-lift animate-slide-in-right stagger-5"
            >
              <ShoppingCart className="h-4 w-4 hover-rotate transition-transform duration-300" />
              <span className="ml-2 hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-neon-magenta text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce-slow">
                  {itemCount}
                </span>
              )}
            </Button>

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
                className="text-left hover:text-minecraft-green transition-colors duration-300"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('products')}
                className="text-left hover:text-minecraft-green transition-colors duration-300"
              >
                Products
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="text-left hover:text-minecraft-green transition-colors duration-300"
              >
                Reviews
              </button>
              <button 
                onClick={() => scrollToSection('footer')}
                className="text-left hover:text-minecraft-green transition-colors duration-300"
              >
                Support
              </button>
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
