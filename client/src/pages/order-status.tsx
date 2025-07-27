import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  Search, 
  Package, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Copy,
  ArrowLeft,
  Eye
} from "lucide-react";

interface OrderData {
  id: string;
  status: string;
  createdAt: string;
  playerName?: string;
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

export default function OrderStatusPage() {
  const [orderId, setOrderId] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);
  const { toast } = useToast();

  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/orders/public", orderId],
    enabled: false, // Only run when manually triggered
    queryFn: async () => {
      const response = await fetch(`/api/orders/public/${orderId.trim()}`);
      if (!response.ok) {
        throw new Error('Order not found');
      }
      return response.json();
    }
  });

  const orderData = order as OrderData | undefined;

  const handleSearch = () => {
    if (!orderId.trim()) {
      toast({
        title: "Order ID Required",
        description: "Please enter an order ID to search",
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
        return 'Your order is pending payment confirmation. Please complete payment to proceed.';
      case 'payment_pending':
        return 'Your payment confirmation is being reviewed by our team. Items will be delivered once confirmed.';
      case 'cancelled':
        return 'Your order has been cancelled. If you have any questions, please contact support.';
      case 'failed':
        return 'Your order failed to process. Please contact support for assistance.';
      default:
        return 'Your order status is being updated. Please check back later.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-cyan-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              Order Status
            </h1>
            <p className="text-gray-300 mt-2">
              Check the status of your order using your Order ID
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
              Enter Order ID
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="orderId" className="text-gray-200">Order ID</Label>
              <Input
                id="orderId"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000"
                className="bg-black/50 border-green-500/30 text-white placeholder:text-gray-400 focus:border-green-400"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <p className="text-xs text-gray-400 mt-1">
                Your Order ID was provided when you completed your purchase.
              </p>
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
                  Check Order Status
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
                    We couldn't find an order with that ID. Please check your Order ID and try again.
                  </p>
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-sm">
                    <div className="text-red-300 font-medium mb-2">Troubleshooting Tips:</div>
                    <div className="text-red-200 space-y-1">
                      <div>• Check your email for the correct Order ID</div>
                      <div>• Make sure you've copied the entire ID</div>
                      <div>• Order IDs are case-sensitive</div>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyOrderId}
                        className="border-green-500/30 text-green-400 hover:bg-green-500 hover:text-black"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy ID
                      </Button>
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
                          <div>
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
                            Complete your payment to proceed with this order.
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
              <CardTitle className="text-white">How to Find Your Order ID</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-green-400 font-medium mb-2">Email Confirmation</h3>
                  <p className="text-gray-300 text-sm">
                    Check your email for an order confirmation. Your Order ID will be at the top of the email.
                  </p>
                </div>
                <div>
                  <h3 className="text-green-400 font-medium mb-2">After Checkout</h3>
                  <p className="text-gray-300 text-sm">
                    Your Order ID was displayed on the confirmation page after completing your purchase.
                  </p>
                </div>
                <div>
                  <h3 className="text-green-400 font-medium mb-2">Order History</h3>
                  <p className="text-gray-300 text-sm">
                    If you have an account, you can view all your orders in your order history.
                  </p>
                </div>
                <div>
                  <h3 className="text-green-400 font-medium mb-2">Contact Support</h3>
                  <p className="text-gray-300 text-sm">
                    Can't find your Order ID? Contact our support team with your email and purchase details.
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