import { X, Crown, Coins, CreditCard, Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CartSidebar() {
  const { items, isOpen, setIsOpen, totalAmount, updateQuantity, removeItem, clearCart } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/orders", {});
      return response.json();
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      setIsOpen(false);
      toast({
        title: "Order Created",
        description: `Order #${order.id.slice(0, 8)} has been created successfully!`,
      });
    },
    onError: () => {
      toast({
        title: "Checkout Failed",
        description: "Failed to process your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCheckout = () => {
    checkoutMutation.mutate();
  };

  const handleQuantityChange = (itemId: string, currentQuantity: number, change: number) => {
    const newQuantity = Math.max(1, currentQuantity + change);
    updateQuantity(itemId, newQuantity);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-96 max-w-[90vw] bg-light-slate border-l border-minecraft-green/20 transform transition-all duration-300 z-50 ${
        isOpen ? "translate-x-0 animate-slide-in-right" : "translate-x-full"
      }`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6 animate-fade-in">
            <h3 className="text-xl font-bold minecraft-green animate-scale-in">Shopping Cart</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="minecraft-gray hover:text-white hover-rotate transition-all duration-300"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <p className="minecraft-gray">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                {items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="flex items-center space-x-4 p-4 bg-dark-slate rounded-lg hover-lift transition-all duration-300 animate-slide-in-left"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-16 h-16 bg-minecraft-green/20 rounded-lg flex items-center justify-center animate-pulse-slow hover-scale transition-transform duration-300">
                      {item.product?.category === "ranks" ? (
                        <Crown className="h-6 w-6 minecraft-green hover-rotate transition-transform duration-300" />
                      ) : (
                        <Coins className="h-6 w-6 neon-cyan hover-rotate transition-transform duration-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold">{item.product?.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 minecraft-gray hover:text-white"
                          onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="minecraft-gray text-sm">Qty: {item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 minecraft-gray hover:text-white"
                          onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="minecraft-green font-bold">
                        ${item.product ? (parseFloat(item.product.price) * item.quantity).toFixed(2) : "0.00"}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-400 hover:text-red-300 mt-1"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {items.length > 0 && (
            <div className="border-t border-minecraft-green/20 pt-4">
              <div className="flex justify-between text-lg font-bold mb-6">
                <span>Total:</span>
                <span className="minecraft-green">${totalAmount.toFixed(2)}</span>
              </div>
              
              <Button
                onClick={handleCheckout}
                disabled={checkoutMutation.isPending}
                className="w-full bg-minecraft-green hover:bg-minecraft-dark-green text-dark-slate font-bold py-3 mb-4 transition-all duration-300 hover-lift animate-glow"
              >
                <CreditCard className="h-4 w-4 mr-2 hover-rotate transition-transform duration-300" />
                {checkoutMutation.isPending ? "Processing..." : "Proceed to Checkout"}
              </Button>
              
              <Button
                onClick={clearCart}
                variant="outline"
                className="w-full border-minecraft-gray/30 minecraft-gray hover:text-white hover:border-white py-3 transition-all duration-300 hover-lift"
              >
                Clear Cart
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
