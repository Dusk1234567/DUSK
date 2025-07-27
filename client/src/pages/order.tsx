import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, AlertCircle, Copy } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface OrderPageProps {
  orderId: string;
}

export default function OrderPage({ orderId }: OrderPageProps) {
  const { toast } = useToast();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["/api/orders", orderId],
  });

  // Type assertion for order object
  const orderData = order as {
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
  } | undefined;

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
      case 'cancelled':
        return 'Your order has been cancelled. If you have any questions, please contact support.';
      case 'failed':
        return 'Your order failed to process. Please contact support for assistance.';
      default:
        return 'Your order status is being updated. Please check back later.';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-cyan-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-lg border-green-500/20 text-center">
          <CardContent className="p-6">
            <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white">Loading order details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-cyan-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-lg border-red-500/20 text-center">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center justify-center gap-2">
              <XCircle className="w-6 h-6" />
              Order Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">
              The order you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link href="/">
              <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Shop
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
            <h1 className="text-3xl font-bold text-white">Order Details</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Status */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-black/40 backdrop-blur-lg border-green-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    {getStatusIcon(orderData.status)}
                    Order Status
                  </CardTitle>
                  <Badge className={getStatusColor(orderData.status)}>
                    {orderData.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">{getStatusMessage(orderData.status)}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Order ID:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-white font-mono">{orderId}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyOrderId}
                        className="h-6 w-6 p-0 text-green-400 hover:text-green-300"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-400">Order Date:</span>
                    <div className="text-white mt-1">
                      {new Date(orderData.createdAt).toLocaleString()}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-400">Player Name:</span>
                    <div className="text-white mt-1">{orderData.playerName || 'Not specified'}</div>
                  </div>
                  
                  <div>
                    <span className="text-gray-400">Payment Method:</span>
                    <div className="text-white mt-1 capitalize">{orderData.paymentMethod || 'Pending'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="bg-black/40 backdrop-blur-lg border-green-500/20">
              <CardHeader>
                <CardTitle className="text-white">Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderData.items && orderData.items.map((item, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-green-500/10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                          <span className="text-xl">
                            {item.productName?.toLowerCase().includes('rank') ? '👑' : '💰'}
                          </span>
                        </div>
                        <div>
                          <div className="text-white font-medium">{item.productName}</div>
                          <div className="text-gray-400 text-sm">Quantity: {item.quantity}</div>
                          <div className="text-green-400 text-sm">${item.unitPrice} each</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">${item.totalPrice}</div>
                      </div>
                    </div>
                  ))}
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
                  <span className="text-white font-bold">${orderData.totalAmount}</span>
                </div>
                
                {orderData.transactionId && (
                  <div className="text-xs">
                    <span className="text-gray-400">Transaction ID:</span>
                    <div className="text-white font-mono break-all">{orderData.transactionId}</div>
                  </div>
                )}

                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 text-xs">
                  <div className="text-green-300 font-medium mb-2">Need Help?</div>
                  <div className="text-green-200 space-y-1">
                    <div>• Contact support with your Order ID</div>
                    <div>• Join our Discord for quick help</div>
                    <div>• Check your email for updates</div>
                  </div>
                </div>

                {orderData.status === 'pending' && (
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 text-xs">
                    <div className="text-yellow-300 font-medium mb-2">Payment Required</div>
                    <div className="text-yellow-200">
                      Complete your payment to proceed with this order.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}