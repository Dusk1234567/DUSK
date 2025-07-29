import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function Cart() {
  const { items, updateQuantity, removeItem, totalAmount, itemCount } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/orders", {
        items: items.map(item => ({
          productId: item.product?.id || '',
          quantity: item.quantity,
          price: item.product?.price || '0'
        }))
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order placed successfully!",
        description: "Thank you for your purchase. Your order is being processed.",
      });
      // Clear cart after successful order
      items.forEach(item => removeItem(item.id));
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Checkout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to place an order.",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }
    checkoutMutation.mutate();
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-cyan-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
        
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-lg border-green-500/20 shadow-2xl text-center">
          <CardHeader>
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-white">Your Cart is Empty</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link href="/">
              <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-cyan-900 p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
      
      <div className="relative z-10 container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500 hover:text-black">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Shop
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white">
              Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </h1>
          </div>
          {user && (
            <div className="text-green-400 text-sm">
              Welcome, {user.firstName || user.email?.split('@')[0] || 'Player'}!
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="bg-black/40 backdrop-blur-lg border-green-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-green-600/20 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">{item.product?.category === "ranks" ? "👑" : "💰"}</span>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white">{item.product?.name || 'Unknown Product'}</h3>
                      <p className="text-gray-400 text-sm mt-1">{item.product?.description || 'No description'}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className="bg-green-600 text-white">
                          {item.product?.category === "ranks" ? "Rank" : "Coins"}
                        </Badge>
                        <span className="text-green-400 font-bold">₹{item.product?.price || '0'}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-green-500/30 text-green-400 hover:bg-green-500 hover:text-black"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      
                      <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-green-500/30 text-green-400 hover:bg-green-500 hover:text-black"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white ml-4"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <div className="text-white font-bold">
                        ₹{(parseFloat(item.product?.price || '0') * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-black/40 backdrop-blur-lg border-green-500/20 sticky top-4">
              <CardHeader>
                <CardTitle className="text-white">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Processing Fee</span>
                  <span>₹0.00</span>
                </div>
                <div className="border-t border-green-500/20 pt-4">
                  <div className="flex justify-between text-xl font-bold text-white">
                    <span>Total</span>
                    <span className="text-green-400">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                
                <Link href="/checkout">
                  <Button
                    disabled={items.length === 0}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-green-500/25"
                  >
                    Proceed to Checkout
                  </Button>
                </Link>
                
                {!isAuthenticated && (
                  <p className="text-yellow-400 text-sm text-center">
                    Please log in to complete your purchase
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
