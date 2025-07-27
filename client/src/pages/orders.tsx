import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Clock, CheckCircle, XCircle, AlertCircle, Eye } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Orders() {
  const { user, isAuthenticated } = useAuth();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/user/orders"],
    enabled: isAuthenticated,
  });

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
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
        return <Clock className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'cancelled':
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-cyan-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-lg border-green-500/20 text-center">
          <CardHeader>
            <CardTitle className="text-white">Login Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">Please log in to view your orders.</p>
            <Link href="/login">
              <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
                Login
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
      
      <div className="relative z-10 container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Orders</h1>
          <p className="text-gray-400">Track your purchases and delivery status</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <Card className="bg-black/40 backdrop-blur-lg border-green-500/20 text-center py-12">
            <CardContent>
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Orders Yet</h3>
              <p className="text-gray-400 mb-6">You haven't made any purchases yet. Start shopping to see your orders here!</p>
              <Link href="/">
                <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <Card key={order.id} className="bg-black/40 backdrop-blur-lg border-green-500/20 hover:border-green-500/40 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold text-white">
                        Order #{order.id.slice(0, 8)}
                      </div>
                      <Badge className={getStatusColor(order.status)} variant="secondary">
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {order.status.toUpperCase()}
                        </span>
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">${order.totalAmount}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-400">Player:</span>
                      <div className="text-white">{order.playerName || 'Not specified'}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Payment:</span>
                      <div className="text-white capitalize">{order.paymentMethod || 'Pending'}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Items:</span>
                      <div className="text-white">{order.items?.length || 0} item(s)</div>
                    </div>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm text-gray-400 mb-2">Items:</div>
                      <div className="flex flex-wrap gap-2">
                        {order.items.slice(0, 3).map((item: any, index: number) => (
                          <Badge key={index} variant="outline" className="border-green-500/30 text-green-400">
                            {item.productName} x{item.quantity}
                          </Badge>
                        ))}
                        {order.items.length > 3 && (
                          <Badge variant="outline" className="border-gray-500/30 text-gray-400">
                            +{order.items.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Link href={`/order/${order.id}`}>
                      <Button variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500 hover:text-black">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}