import { Button } from "@/components/ui/button";
import { ShoppingCart, Star } from "lucide-react";
import { Product } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";

interface ProductCardProps {
  product: Product;
  animationDelay?: number;
}

export default function ProductCard({ product, animationDelay = 0 }: ProductCardProps) {
  const { addToCart } = useCart();

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
    <div 
      className="bg-light-slate rounded-xl overflow-hidden border border-minecraft-green/20 hover:border-minecraft-green transition-all duration-300 hover:shadow-2xl hover:shadow-minecraft-green/30 group hover-lift animate-scale-in"
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <img 
        src={product.imageUrl} 
        alt={product.name}
        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
      />
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getBadgeColorClass(product.badgeColor)}`}>
            {product.category.toUpperCase()}
          </span>
          {product.badge && (
            <span className={`font-bold ${product.badgeColor === 'neon-cyan' ? 'neon-cyan' : product.badgeColor === 'yellow-400' ? 'text-yellow-400' : product.badgeColor === 'orange-400' ? 'text-orange-400' : 'minecraft-green'}`}>
              {product.badge}
            </span>
          )}
        </div>
        
        <h3 className={`text-xl font-bold mb-2 ${product.badgeColor === 'neon-cyan' ? 'neon-cyan' : product.badgeColor === 'yellow-400' ? 'text-yellow-400' : product.badgeColor === 'orange-400' ? 'text-orange-400' : 'minecraft-green'}`}>
          {product.name}
        </h3>
        
        <p className="minecraft-gray mb-4 text-sm">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-white">
            ${product.price}
          </div>
          {product.bonusText ? (
            <div className={`font-bold ${product.badgeColor === 'neon-cyan' ? 'neon-cyan' : product.badgeColor === 'yellow-400' ? 'text-yellow-400' : 'minecraft-green'}`}>
              {product.bonusText}
            </div>
          ) : (
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
          )}
        </div>
        
        <Button
          onClick={handleAddToCart}
          className={`w-full font-bold py-3 transition-all duration-300 hover:shadow-lg hover-lift click-effect ${getButtonColorClass(product.buttonColor)}`}
        >
          <ShoppingCart className="h-4 w-4 mr-2 hover-rotate transition-transform duration-300" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
