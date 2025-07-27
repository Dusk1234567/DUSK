import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { 
  Search, 
  Package, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Copy,
  ArrowLeft,
  Eye,
  X,
  Mail,
  User
} from "lucide-react";

interface OrderData {
  id: string;
  status: string;
  createdAt: string;
  playerName?: string;
  email?: string;
  paymentMethod?: string;
  totalAmount: string;
  transactionId?: string;
  items?: Array<{
    productName: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
  }>;
}

export default function OrderLookupPage() {
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/orders/lookup", { email, orderId }],
    enabled: false, // Only run when manually triggered
  });

  const orderData = order as OrderData | undefined;

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return apiRequest(`/api/orders/${orderId}/cancel`, "PUT", {
        email: email,
      });
    },
    onSuccess: () => {
      toast({
        title: "Order Canceled",
        description: "Your order has been successfully canceled.",
      });
      refetch(); // Refresh order data
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel order. Please contact support.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }
    if (!orderId.trim()) {
      toast({
        title: "Order ID Required",
        description: "Please enter your order ID",
        variant: "destructive"
      });
      return;
    }
    setSearchTriggered(true);
    refetch();
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    toast({
      title: "Copied!",
      description: "Order ID copied to clipboard.",
    });
  };

  const handleCancelOrder = () => {
    if (orderData && window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      cancelOrderMutation.mutate(orderData.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-600 text-white';
      case 'processing':
        return 'bg-blue-600 text-white';
      case 'pending':
      case 'payment_pending':
        return 'bg-yellow-600 text-black';
      case 'cancelled':
      case 'canceled':
        return 'bg-red-600 text-white';
      case 'failed':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'processing':
        return <Clock className="w-5 h-5" />;
      case 'pending':
      case 'payment_pending':
        return <AlertCircle className="w-5 h-5" />;
      case 'cancelled':
      case 'canceled':
      case 'failed':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'Your order has been completed successfully! All items have been delivered to your account.';
      case 'processing':
        return 'Your order is being processed. Items will be delivered to your account soon.';
      case 'pending':
        return 'Your order is pending payment confirmation. Complete payment to proceed or cancel if needed.';
      case 'payment_pending':
        return 'Your payment confirmation is being reviewed by our team. Items will be delivered once confirmed.';
      case 'cancelled':
      case 'canceled':
        return 'Your order has been cancelled. If you have any questions, please contact support.';
      case 'failed':
        return 'Your order failed to process. Please contact support for assistance.';
      default:
        return 'Your order status is being updated. Please check back later.';
    }
  };

  const canCancelOrder = (status: string) => {
    return ['pending', 'payment_pending'].includes(status.toLowerCase());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-cyan-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              Order Lookup
            </h1>
            <p className="text-gray-300 mt-2">
              Find your order using your email and Order ID
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500 hover:text-black">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shop
            </Button>
          </Link>
        </div>

        {/* Search Form */}
        <Card className="bg-black/40 backdrop-blur-lg border-green-500/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="w-5 h-5" />
              Find Your Order
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="text-gray-200 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="bg-black/50 border-green-500/30 text-white placeholder:text-gray-400 focus:border-green-400"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Enter the email used when placing the order.
                </p>
              </div>
              <div>
                <Label htmlFor="orderId" className="text-gray-200 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Order ID *
                </Label>
                <Input
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000"
                  className="bg-black/50 border-green-500/30 text-white placeholder:text-gray-400 focus:border-green-400"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Your Order ID was provided in your confirmation email.
                </p>
              </div>
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
            >
              {isLoading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Find My Order
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Order Results */}
        {searchTriggered && (
          <>
            {error || (searchTriggered && !orderData) ? (
              <Card className="bg-black/40 backdrop-blur-lg border-red-500/20">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <XCircle className="w-6 h-6" />
                    Order Not Found
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4">
                    We couldn't find an order with that email and Order ID combination. Please check your information and try again.
                  </p>
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-sm">
                    <div className="text-red-300 font-medium mb-2">Troubleshooting Tips:</div>
                    <div className="text-red-200 space-y-1">
                      <div>• Make sure you're using the exact email from your order</div>
                      <div>• Check your email for the correct Order ID</div>
                      <div>• Make sure you've copied the entire Order ID</div>
                      <div>• Contact support if you still can't find your order</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : orderData ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order Details */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-black/40 backdrop-blur-lg border-green-500/20">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          {getStatusIcon(orderData.status)}
                          Order Details
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={`${getStatusColor(orderData.status)} font-medium`}>
                            {orderData.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-gray-400 text-sm">
                            {new Date(orderData.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyOrderId}
                          className="border-green-500/30 text-green-400 hover:bg-green-500 hover:text-black"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy ID
                        </Button>
                        {canCancelOrder(orderData.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelOrder}
                            disabled={cancelOrderMutation.isPending}
                            className="border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel Order
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-slate-800/40 rounded-lg p-4">
                        <p className="text-gray-300">{getStatusMessage(orderData.status)}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Order ID:</span>
                          <div className="text-white font-mono text-xs break-all">{orderData.id}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Email:</span>
                          <div className="text-white">{orderData.email}</div>
                        </div>
                        {orderData.playerName && (
                          <div>
                            <span className="text-gray-400">Minecraft Player:</span>
                            <div className="text-white">{orderData.playerName}</div>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-400">Payment Method:</span>
                          <div className="text-white capitalize">{orderData.paymentMethod || 'Pending'}</div>
                        </div>
                        {orderData.transactionId && (
                          <div className="md:col-span-2">
                            <span className="text-gray-400">Transaction ID:</span>
                            <div className="text-white font-mono text-xs break-all">{orderData.transactionId}</div>
                          </div>
                        )}
                      </div>

                      {/* Order Items */}
                      {orderData.items && orderData.items.length > 0 && (
                        <div>
                          <h3 className="text-white font-medium mb-3">Items Ordered:</h3>
                          <div className="space-y-2">
                            {orderData.items.map((item, index) => (
                              <div key={index} className="flex justify-between items-center bg-slate-800/40 rounded-lg p-3">
                                <div>
                                  <div className="text-white font-medium">{item.productName}</div>
                                  <div className="text-gray-400 text-sm">Quantity: {item.quantity}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-white font-medium">${item.totalPrice}</div>
                                  <div className="text-gray-400 text-sm">${item.unitPrice} each</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end pt-4">
                        <Link href={`/order/${orderData.id}`}>
                          <Button variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500 hover:text-black">
                            <Eye className="w-4 h-4 mr-2" />
                            View Full Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <Card className="bg-black/40 backdrop-blur-lg border-green-500/20 sticky top-4">
                    <CardHeader>
                      <CardTitle className="text-white">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-gray-300">
                        <span>Total Amount</span>
                        <span className="text-white font-bold text-lg">${orderData.totalAmount}</span>
                      </div>

                      {orderData.status === 'pending' && (
                        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 text-xs">
                          <div className="text-yellow-300 font-medium mb-2">Payment Required</div>
                          <div className="text-yellow-200">
                            Complete your payment to proceed with this order, or cancel if you no longer want it.
                          </div>
                        </div>
                      )}

                      {orderData.status === 'payment_pending' && (
                        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 text-xs">
                          <div className="text-blue-300 font-medium mb-2">Payment Under Review</div>
                          <div className="text-blue-200">
                            Your payment confirmation is being reviewed by our team.
                          </div>
                        </div>
                      )}

                      {orderData.status === 'completed' && (
                        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 text-xs">
                          <div className="text-green-300 font-medium mb-2">Order Complete!</div>
                          <div className="text-green-200">
                            All items have been delivered to your account.
                          </div>
                        </div>
                      )}

                      {(orderData.status === 'cancelled' || orderData.status === 'canceled') && (
                        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-xs">
                          <div className="text-red-300 font-medium mb-2">Order Cancelled</div>
                          <div className="text-red-200">
                            This order has been cancelled. No payment was processed.
                          </div>
                        </div>
                      )}

                      <div className="bg-slate-800/40 rounded-lg p-3 text-xs">
                        <div className="text-gray-300 font-medium mb-2">Need Help?</div>
                        <div className="text-gray-400 space-y-1">
                          <div>• Contact support with your Order ID</div>
                          <div>• Join our Discord for quick help</div>
                          <div>• Check your email for updates</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : null}
          </>
        )}

        {/* Help Section */}
        {!searchTriggered && (
          <Card className="bg-black/40 backdrop-blur-lg border-green-500/20">
            <CardHeader>
              <CardTitle className="text-white">How to Find Your Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-green-400 font-medium mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Use the same email address you provided when placing the order. This is required for security.
                  </p>
                </div>
                <div>
                  <h3 className="text-green-400 font-medium mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Order ID
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Your Order ID was sent to your email and shown on the confirmation page after checkout.
                  </p>
                </div>
                <div>
                  <h3 className="text-green-400 font-medium mb-2 flex items-center gap-2">
                    <X className="w-4 h-4" />
                    Cancel Orders
                  </h3>
                  <p className="text-gray-300 text-sm">
                    You can cancel pending or payment-pending orders. Completed orders cannot be cancelled.
                  </p>
                </div>
                <div>
                  <h3 className="text-green-400 font-medium mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Contact Support
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Need help? Contact our support team with your email and Order ID for assistance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}