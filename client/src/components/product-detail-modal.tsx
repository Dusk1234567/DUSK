import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, Crown, Coins } from "lucide-react";
import { Product } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import ProductReviews from "./product-reviews";

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const { addToCart } = useCart();

  if (!product) return null;

  const getBadgeColorClass = (color: string | null) => {
    if (!color) return "bg-minecraft-green/20 text-minecraft-green";
    
    switch (color) {
      case "neon-magenta":
        return "bg-neon-magenta/20 text-neon-magenta";
      case "neon-cyan":
        return "bg-neon-cyan/20 text-neon-cyan";
      case "yellow-400":
        return "bg-yellow-500/20 text-yellow-400";
      case "orange-400":
        return "bg-orange-500/20 text-orange-400";
      default:
        return "bg-minecraft-green/20 text-minecraft-green";
    }
  };

  const getButtonColorClass = (color: string | null) => {
    if (!color) return "bg-minecraft-green hover:bg-minecraft-dark-green text-dark-slate";
    
    switch (color) {
      case "neon-cyan":
        return "bg-neon-cyan hover:bg-neon-cyan/80 text-dark-slate hover:shadow-neon-cyan/50";
      case "yellow-500":
        return "bg-yellow-500 hover:bg-yellow-600 text-dark-slate hover:shadow-yellow-500/50";
      case "orange-500":
        return "bg-orange-500 hover:bg-orange-600 text-dark-slate hover:shadow-orange-500/50";
      default:
        return "bg-minecraft-green hover:bg-minecraft-dark-green text-dark-slate hover:shadow-minecraft-green/50";
    }
  };

  const handleAddToCart = async () => {
    await addToCart(product.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-light-slate border border-minecraft-green/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold minecraft-green flex items-center gap-2">
            {product.category === "ranks" ? (
              <Crown className="h-6 w-6" />
            ) : (
              <Coins className="h-6 w-6" />
            )}
            {product.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image and Info */}
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-64 object-cover rounded-lg"
              />
              {product.badge && (
                <div className={`absolute top-3 left-3 px-3 py-1 text-xs font-bold rounded-full ${getBadgeColorClass(product.badgeColor)}`}>
                  {product.badge}
                </div>
              )}
              {product.featured && (
                <div className="absolute top-3 right-3 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400" />
                  FEATURED
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <p className="text-gray-300 leading-relaxed">{product.description}</p>
              
              <div className="space-y-2">
                {product.category === "ranks" && product.rankLevel && (
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 minecraft-green" />
                    <span className="font-medium">Rank Level: <span className="minecraft-green">{product.rankLevel}</span></span>
                  </div>
                )}
                
                {product.category === "coins" && product.coinAmount && (
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 neon-cyan" />
                    <span className="font-medium">Coins: <span className="neon-cyan">{product.coinAmount.toLocaleString()}</span></span>
                  </div>
                )}
                
                {product.bonusText && (
                  <div className="text-sm neon-magenta font-medium">
                    ✨ {product.bonusText}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Purchase Section */}
          <div className="space-y-6">
            <div className="bg-dark-slate/50 p-6 rounded-lg border border-minecraft-green/20">
              <div className="text-3xl font-bold mb-4">
                <span className="text-gray-400 text-lg">$</span>
                <span className="minecraft-green">{product.price}</span>
              </div>
              
              <Button
                onClick={handleAddToCart}
                className={`w-full py-4 text-lg font-bold transition-all duration-300 hover-lift animate-glow shadow-lg ${getButtonColorClass(product.buttonColor)}`}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              
              <div className="mt-4 text-xs text-gray-400 text-center">
                🔒 Secure checkout • ⚡ Instant delivery
              </div>
            </div>
            
            {/* Quick Features */}
            <div className="space-y-3">
              <h4 className="font-bold text-lg">What's Included:</h4>
              <div className="space-y-2 text-sm">
                {product.category === "ranks" ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-minecraft-green rounded-full"></div>
                      <span>Exclusive {product.rankLevel} permissions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-minecraft-green rounded-full"></div>
                      <span>Special chat prefix and colors</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-minecraft-green rounded-full"></div>
                      <span>Priority server access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-minecraft-green rounded-full"></div>
                      <span>Exclusive cosmetics and particles</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>
                      <span>{product.coinAmount?.toLocaleString()} in-game coins</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>
                      <span>Buy items, upgrades, and cosmetics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>
                      <span>Trade with other players</span>
                    </div>
                    {product.bonusText && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-neon-magenta rounded-full"></div>
                        <span className="neon-magenta">{product.bonusText}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Reviews Section */}
        <ProductReviews productId={product.id} productName={product.name} />
      </DialogContent>
    </Dialog>
  );
}