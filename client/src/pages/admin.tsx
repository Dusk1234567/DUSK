import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, ShoppingBag, DollarSign, Shield, UserCheck, Trash2 } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: string;
}

interface Order {
  id: string;
  userId?: string;
  sessionId?: string;
  playerName?: string;
  email?: string;
  totalAmount: string;
  status: string;
  paymentMethod?: string;
  items: any[];
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  minecraftUsername?: string;
  isAdmin: boolean;
  totalSpent: string;
  orderCount: number;
  createdAt: string;
}

interface AdminWhitelistItem {
  id: string;
  email: string;
  role: string;
  addedBy?: string;
  createdAt: string;
}

interface WhitelistRequest {
  id: string;
  minecraftUsername: string;
  email?: string;
  discordUsername?: string;
  userId?: string;
  status: "pending" | "approved" | "rejected";
  reason?: string;
  submittedAt: string;
  processedAt?: string;
  processedBy?: string;
}

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newAdminEmail, setNewAdminEmail] = useState("");

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.isAdmin)) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [isAuthenticated, user, isLoading, toast, setLocation]);

  // Fetch admin data
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: user?.isAdmin,
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    enabled: user?.isAdmin,
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: user?.isAdmin,
  });

  const { data: whitelist = [] } = useQuery<AdminWhitelistItem[]>({
    queryKey: ["/api/admin/whitelist"],
    enabled: user?.isAdmin,
  });

  const { data: whitelistRequests = [] } = useQuery<WhitelistRequest[]>({
    queryKey: ["/api/admin/whitelist-requests"],
    enabled: user?.isAdmin,
  });

  // Mutations
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update order status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Order status updated successfully" });
    },
  });

  const addAdminMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch("/api/admin/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: "admin", addedBy: user?.id }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add admin");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whitelist"] });
      setNewAdminEmail("");
      toast({ title: "Admin added successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to add admin", description: error.message, variant: "destructive" });
    },
  });

  const removeAdminMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch(`/api/admin/whitelist/${encodeURIComponent(email)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to remove admin");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whitelist"] });
      toast({ title: "Admin removed successfully" });
    },
  });

  const updateWhitelistRequestMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      const response = await fetch(`/api/admin/whitelist-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason }),
      });
      if (!response.ok) throw new Error("Failed to update whitelist request");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whitelist-requests"] });
      toast({ title: "Whitelist request updated successfully" });
    },
  });

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user?.isAdmin) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "cancelled": return "bg-red-500";
      case "processing": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-cyan-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-black/40 backdrop-blur-lg border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
                <Users className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-lg border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalOrders}</div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-lg border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">${stats.totalRevenue}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-black/40 border-green-500/20">
            <TabsTrigger value="orders" className="data-[state=active]:bg-green-600">Orders</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-green-600">Users</TabsTrigger>
            <TabsTrigger value="whitelist" className="data-[state=active]:bg-green-600">Whitelist Requests</TabsTrigger>
            <TabsTrigger value="admins" className="data-[state=active]:bg-green-600">Admin Whitelist</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="bg-black/40 backdrop-blur-lg border-green-500/20">
              <CardHeader>
                <CardTitle className="text-white">Order Management</CardTitle>
                <CardDescription className="text-gray-300">
                  Manage and track all customer orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-green-500/20">
                      <TableHead className="text-gray-300">Order ID</TableHead>
                      <TableHead className="text-gray-300">Customer</TableHead>
                      <TableHead className="text-gray-300">Amount</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} className="border-green-500/20">
                        <TableCell className="text-white font-mono">{order.id.slice(0, 8)}...</TableCell>
                        <TableCell className="text-white">
                          {order.playerName || order.email || "Guest"}
                        </TableCell>
                        <TableCell className="text-white">${order.totalAmount}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(order.status)} text-white`}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(status) =>
                              updateOrderStatusMutation.mutate({ orderId: order.id, status })
                            }
                          >
                            <SelectTrigger className="w-32 bg-black/50 border-green-500/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-black/40 backdrop-blur-lg border-green-500/20">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
                <CardDescription className="text-gray-300">
                  View and manage registered users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-green-500/20">
                      <TableHead className="text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-300">Email</TableHead>
                      <TableHead className="text-gray-300">Minecraft Username</TableHead>
                      <TableHead className="text-gray-300">Orders</TableHead>
                      <TableHead className="text-gray-300">Total Spent</TableHead>
                      <TableHead className="text-gray-300">Admin</TableHead>
                      <TableHead className="text-gray-300">Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="border-green-500/20">
                        <TableCell className="text-white">
                          {user.firstName || user.lastName
                            ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-white">{user.email}</TableCell>
                        <TableCell className="text-white">{user.minecraftUsername || "N/A"}</TableCell>
                        <TableCell className="text-white">{user.orderCount}</TableCell>
                        <TableCell className="text-white">${user.totalSpent}</TableCell>
                        <TableCell>
                          {user.isAdmin && (
                            <Badge className="bg-green-600 text-white">
                              <Shield className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-white">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Whitelist Requests Tab */}
          <TabsContent value="whitelist">
            <Card className="bg-black/40 backdrop-blur-lg border-green-500/20">
              <CardHeader>
                <CardTitle className="text-white">Whitelist Request Management</CardTitle>
                <CardDescription className="text-gray-300">
                  Review and manage Minecraft server whitelist requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-green-500/20">
                      <TableHead className="text-gray-300">Username</TableHead>
                      <TableHead className="text-gray-300">Contact</TableHead>
                      <TableHead className="text-gray-300">Discord</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Submitted</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {whitelistRequests.map((request) => (
                      <TableRow key={request.id} className="border-green-500/20">
                        <TableCell className="text-white font-mono">{request.minecraftUsername}</TableCell>
                        <TableCell className="text-white">{request.email || "No email"}</TableCell>
                        <TableCell className="text-white">{request.discordUsername || "No Discord"}</TableCell>
                        <TableCell>
                          <Badge 
                            className={`${
                              request.status === "approved" ? "bg-green-600" :
                              request.status === "rejected" ? "bg-red-600" :
                              "bg-yellow-600"
                            } text-white`}
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">
                          {new Date(request.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {request.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => updateWhitelistRequestMutation.mutate({
                                  id: request.id,
                                  status: "approved"
                                })}
                                disabled={updateWhitelistRequestMutation.isPending}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  const reason = prompt("Reason for rejection (optional):");
                                  updateWhitelistRequestMutation.mutate({
                                    id: request.id,
                                    status: "rejected",
                                    reason: reason || undefined
                                  });
                                }}
                                disabled={updateWhitelistRequestMutation.isPending}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                          {request.status !== "pending" && request.reason && (
                            <div className="text-sm text-gray-400 max-w-32 truncate" title={request.reason}>
                              {request.reason}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {whitelistRequests.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No whitelist requests found.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Whitelist Tab */}
          <TabsContent value="admins">
            <Card className="bg-black/40 backdrop-blur-lg border-green-500/20">
              <CardHeader>
                <CardTitle className="text-white">Admin Whitelist</CardTitle>
                <CardDescription className="text-gray-300">
                  Manage administrator access permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Admin Form */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter email address"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="bg-black/50 border-green-500/30 text-white placeholder:text-gray-400"
                  />
                  <Button
                    onClick={() => addAdminMutation.mutate(newAdminEmail)}
                    disabled={!newAdminEmail || addAdminMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Add Admin
                  </Button>
                </div>

                {/* Admin List */}
                <Table>
                  <TableHeader>
                    <TableRow className="border-green-500/20">
                      <TableHead className="text-gray-300">Email</TableHead>
                      <TableHead className="text-gray-300">Role</TableHead>
                      <TableHead className="text-gray-300">Added</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {whitelist.map((admin) => (
                      <TableRow key={admin.id} className="border-green-500/20">
                        <TableCell className="text-white">{admin.email}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-600 text-white">{admin.role}</Badge>
                        </TableCell>
                        <TableCell className="text-white">
                          {new Date(admin.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeAdminMutation.mutate(admin.email)}
                            disabled={removeAdminMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}