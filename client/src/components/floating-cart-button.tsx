import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { Link } from "wouter";

export default function FloatingCartButton() {
  const { itemCount } = useCart();

  // Only show floating button when there are items in cart
  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-scale-in">
      <Link href="/cart">
        <Button className="relative bg-gradient-to-r from-minecraft-green to-green-600 hover:from-green-600 hover:to-green-700 text-dark-slate transition-all duration-300 hover-lift shadow-2xl hover:shadow-green-500/50 border border-green-400/50 rounded-full w-16 h-16 p-0">
          <ShoppingCart className="h-6 w-6" />
          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-neon-magenta to-pink-500 text-white text-sm rounded-full h-8 w-8 flex items-center justify-center animate-pulse font-bold shadow-lg">
            {itemCount}
          </span>
        </Button>
      </Link>
    </div>
  );
}