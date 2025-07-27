import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, Shield, CheckCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/use-cart";
import QRPaymentModal from "@/components/qr-payment-modal";
import { CouponInput } from "@/components/coupon-input";

interface CouponValidationResult {
  valid: boolean;
  coupon: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    description?: string;
  };
  discountAmount: number;
  finalAmount: number;
}

export default function Checkout() {
  const [playerName, setPlayerName] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  
  const { items, totalAmount, itemCount, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-cyan-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-lg border-green-500/20 shadow-2xl text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Cart is Empty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">Add some items to your cart before checking out.</p>
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

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      const response = await apiRequest("POST", "/api/orders", {
        playerName: playerName.trim(),
        email: email.trim() || user?.email,
        paymentMethod,
        couponCode: appliedCoupon?.coupon.code,
        items: items.map(item => ({
          productId: item.product?.id || '',
          productName: item.product?.name || '',
          quantity: item.quantity,
          unitPrice: parseFloat(item.product?.price?.toString() || '0'),
          totalPrice: parseFloat((parseFloat(item.product?.price?.toString() || '0') * item.quantity).toFixed(2))
        }))
      });
      return await response.json();
    },
    onSuccess: (order) => {
      setCurrentOrderId(order.id);
      
      if (paymentMethod === "online") {
        // Show QR code modal for online payment
        setShowQRModal(true);
        toast({
          title: "Order Created!",
          description: "Please complete payment using the QR code.",
        });
      } else {
        // For other payment methods, redirect to order page
        toast({
          title: "Order Created Successfully!",
          description: `Order #${order.id.slice(0, 8)} has been created. You'll receive updates via email.`,
        });
        clearCart();
        setLocation(`/order/${order.id}`);
      }
    },
    onError: (error) => {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to create order. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });

  const handleQRPaymentConfirm = async (screenshot: File) => {
    if (!currentOrderId) return;

    try {
      // Create FormData to upload the screenshot
      const formData = new FormData();
      formData.append('screenshot', screenshot);
      formData.append('orderId', currentOrderId);

      const response = await fetch('/api/payment/confirm', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit payment confirmation');
      }

      toast({
        title: "Payment Confirmation Submitted!",
        description: "Your payment proof has been uploaded. We'll verify it within 24 hours.",
      });

      setShowQRModal(false);
      clearCart();
      setLocation(`/order/${currentOrderId}`);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to submit payment confirmation. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your Minecraft username.",
        variant: "destructive",
      });
      return;
    }

    if (!paymentMethod) {
      toast({
        title: "Missing Information", 
        description: "Please select a payment method.",
        variant: "destructive",
      });
      return;
    }

    if (!email.trim() && !user?.email) {
      toast({
        title: "Missing Information",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-cyan-900 p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
      
      <div className="relative z-10 container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/cart">
              <Button variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500 hover:text-black">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cart
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white">Checkout</h1>
          </div>
          <div className="text-green-400 text-sm">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} • ${totalAmount.toFixed(2)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Player Information */}
              <Card className="bg-black/40 backdrop-blur-lg border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Player Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="playerName" className="text-white">Minecraft Username *</Label>
                    <Input
                      id="playerName"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter your Minecraft username"
                      className="bg-black/20 border-green-500/30 text-white placeholder:text-gray-400"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      This is the username we'll use for your rank or coin delivery.
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-white">Email Address *</Label>
                    {user?.email ? (
                      <div className="text-green-400 bg-black/20 border border-green-500/30 rounded-md px-3 py-2">
                        {user.email}
                      </div>
                    ) : (
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="bg-black/20 border-green-500/30 text-white placeholder:text-gray-400"
                        required
                      />
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {user?.email ? 
                        "Using your account email for order updates and lookups." :
                        "Required for order updates and to look up your order later."
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="bg-black/40 backdrop-blur-lg border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
                    <SelectTrigger className="bg-black/20 border-green-500/30 text-white">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="stripe">Credit/Debit Card</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                      <SelectItem value="online">Online Payment (QR Code)</SelectItem>
                      <SelectItem value="manual">Manual Payment (Contact Admin)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-400 mt-2">
                    You'll be redirected to complete payment after order creation.
                  </p>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isProcessing || createOrderMutation.isPending}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 text-lg shadow-lg hover:shadow-green-500/25"
              >
                {isProcessing ? "Creating Order..." : `Create Order - $${appliedCoupon ? appliedCoupon.finalAmount.toFixed(2) : totalAmount.toFixed(2)}`}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-black/40 backdrop-blur-lg border-green-500/20 sticky top-4">
              <CardHeader>
                <CardTitle className="text-white">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start text-sm">
                    <div className="flex-1">
                      <div className="text-white font-medium">{item.product?.name}</div>
                      <div className="text-gray-400">Qty: {item.quantity}</div>
                      <Badge className="mt-1 bg-green-600 text-white text-xs">
                        {item.product?.category === "ranks" ? "Rank" : "Coins"}
                      </Badge>
                    </div>
                    <div className="text-green-400 font-medium">
                      ${(parseFloat(item.product?.price?.toString() || '0') * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-green-500/20 pt-4 space-y-4">
                  {/* Coupon Input */}
                  <CouponInput
                    orderAmount={totalAmount}
                    onCouponApplied={setAppliedCoupon}
                    appliedCoupon={appliedCoupon}
                  />
                  
                  {/* Total Display */}
                  {appliedCoupon ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Subtotal</span>
                        <span>${totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-400">
                        <span>Discount</span>
                        <span>-${appliedCoupon.discountAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xl font-bold text-white">
                        <span>Total</span>
                        <span className="text-green-400">${appliedCoupon.finalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between text-xl font-bold text-white">
                      <span>Total</span>
                      <span className="text-green-400">${totalAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 text-xs text-green-300">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Instant Delivery</span>
                  </div>
                  <ul className="space-y-1 text-green-200">
                    <li>• Ranks activated immediately</li>
                    <li>• Coins delivered to your account</li>
                    <li>• 24/7 support available</li>
                    <li>• Secure payment processing</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* QR Payment Modal */}
      <QRPaymentModal
        isOpen={showQRModal}
        onClose={() => {
          setShowQRModal(false);
          if (currentOrderId) {
            // Cancel the order when QR code is closed without payment
            fetch(`/api/orders/${currentOrderId}/cancel`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: email || user?.email })
            }).then(() => {
              toast({
                title: "Order Cancelled",
                description: "Your order has been cancelled since payment was not completed.",
                variant: "destructive"
              });
            }).catch(() => {
              // If cancellation fails, still redirect but don't show error
              console.log("Failed to cancel order on modal close");
            });
            setLocation('/');
          } else {
            setLocation('/');
          }
        }}
        onPaymentConfirm={handleQRPaymentConfirm}
        orderAmount={appliedCoupon ? appliedCoupon.finalAmount : totalAmount}
        orderId={currentOrderId || undefined}
      />
    </div>
  );
}