import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  GamepadIcon, 
  UserPlus, 
  Shield,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";

const whitelistSchema = z.object({
  minecraftUsername: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(16, "Username must be at most 16 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  discordUsername: z.string().max(32, "Discord username too long").optional().or(z.literal(""))
});

type WhitelistFormData = z.infer<typeof whitelistSchema>;

interface WhitelistRequest {
  id: string;
  minecraftUsername: string;
  email?: string;
  discordUsername?: string;
  status: "pending" | "approved" | "rejected";
  reason?: string;
  submittedAt: string;
  processedAt?: string;
}

export default function Whitelist() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(true);

  const form = useForm<WhitelistFormData>({
    resolver: zodResolver(whitelistSchema),
    defaultValues: {
      minecraftUsername: "",
      email: "",
      discordUsername: ""
    }
  });

  // Fetch user's whitelist requests if authenticated
  const { data: userRequests = [], isLoading: requestsLoading } = useQuery<WhitelistRequest[]>({
    queryKey: ["/api/whitelist"],
    enabled: isAuthenticated,
    retry: false
  });

  const createRequest = useMutation({
    mutationFn: async (data: WhitelistFormData) => {
      const response = await fetch("/api/whitelist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit request");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Whitelist request submitted!",
        description: "Your request has been submitted for review. You'll be contacted when it's processed."
      });
      form.reset();
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/whitelist"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit request",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: WhitelistFormData) => {
    createRequest.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const hasPendingRequest = userRequests.some((req: WhitelistRequest) => req.status === "pending");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwZjQ5NGYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJtMzYgMzQgaC0ydjEyaDJ2LTEyem0tMTYgMGgtMnYxMmgydi0xMnptOC0xNmgtMnYxMmgydi0xMnptLTgtMTZoLTJ2MTJoMnYtMTJ6bTE2IDBwLTJ2MTJoMnYtMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
      
      <div className="relative z-10 container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-green-400 hover:text-green-300 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-green-400" />
            <h1 className="text-4xl font-bold text-white">Server Whitelist</h1>
            <GamepadIcon className="w-8 h-8 text-green-400" />
          </div>
          
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Join our exclusive Minecraft LifeSteal server! Submit your username to get whitelisted and start your adventure.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Whitelist Form */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-green-400" />
                Request Whitelist Access
              </CardTitle>
              <CardDescription className="text-gray-400">
                Fill out the form below to request access to our server
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showForm && !hasPendingRequest ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="minecraftUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Minecraft Username</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter your Minecraft username"
                              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              maxLength={16}
                            />
                          </FormControl>
                          <FormDescription className="text-gray-400">
                            Your exact Minecraft Java Edition username (3-16 characters)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Email (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="your.email@example.com"
                              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            />
                          </FormControl>
                          <FormDescription className="text-gray-400">
                            We'll notify you when your request is processed
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discordUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Discord Username (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="username#1234"
                              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              maxLength={32}
                            />
                          </FormControl>
                          <FormDescription className="text-gray-400">
                            For server updates and community access
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={createRequest.isPending}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                    >
                      {createRequest.isPending ? "Submitting..." : "Submit Whitelist Request"}
                    </Button>
                  </form>
                </Form>
              ) : hasPendingRequest ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-white text-lg font-semibold mb-2">Request Already Submitted</h3>
                  <p className="text-gray-400 mb-4">
                    You already have a pending whitelist request. Please wait for it to be processed.
                  </p>
                  <Button
                    onClick={() => setShowForm(true)}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Submit Another Request
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-white text-lg font-semibold mb-2">Request Submitted!</h3>
                  <p className="text-gray-400 mb-4">
                    Your whitelist request has been submitted successfully. Check your requests below.
                  </p>
                  <Button
                    onClick={() => setShowForm(true)}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Submit Another Request
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Server Info */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                Server Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">What is LifeSteal?</h4>
                <p className="text-gray-400 text-sm">
                  LifeSteal is a unique Minecraft SMP where you can steal hearts from other players when you kill them, 
                  making PvP intense and strategic.
                </p>
              </div>

              <Separator className="bg-gray-700" />

              <div>
                <h4 className="text-white font-semibold mb-2">Server Features</h4>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• Heart stealing mechanics</li>
                  <li>• Custom enchantments</li>
                  <li>• Economy system</li>
                  <li>• Protected spawn area</li>
                  <li>• Regular events & competitions</li>
                </ul>
              </div>

              <Separator className="bg-gray-700" />

              <div>
                <h4 className="text-white font-semibold mb-2">Requirements</h4>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• Minecraft Java Edition</li>
                  <li>• Version 1.20.1 or later</li>
                  <li>• Must follow server rules</li>
                  <li>• Be respectful to other players</li>
                </ul>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-yellow-400 font-semibold text-sm">Important</h4>
                    <p className="text-yellow-200 text-sm">
                      Whitelist requests are manually reviewed. Processing may take 24-48 hours.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User's Requests */}
        {isAuthenticated && (
          <Card className="mt-8 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Your Whitelist Requests</CardTitle>
              <CardDescription className="text-gray-400">
                Track the status of your submitted requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Loading your requests...</p>
                </div>
              ) : userRequests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No whitelist requests found. Submit one above to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userRequests.map((request: WhitelistRequest) => (
                    <div key={request.id} className="border border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-white font-semibold">{request.minecraftUsername}</h4>
                          <p className="text-gray-400 text-sm">Submitted {formatDate(request.submittedAt)}</p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                      
                      {request.email && (
                        <p className="text-gray-400 text-sm">Email: {request.email}</p>
                      )}
                      
                      {request.discordUsername && (
                        <p className="text-gray-400 text-sm">Discord: {request.discordUsername}</p>
                      )}
                      
                      {request.reason && (
                        <div className="mt-3 p-3 bg-gray-700 rounded">
                          <p className="text-gray-300 text-sm font-medium">Admin Note:</p>
                          <p className="text-gray-400 text-sm">{request.reason}</p>
                        </div>
                      )}

                      {request.processedAt && (
                        <p className="text-gray-500 text-xs mt-2">
                          Processed {formatDate(request.processedAt)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!isAuthenticated && (
          <Card className="mt-8 bg-blue-900/20 border-blue-600/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-blue-200 mb-4">
                  Want to track your whitelist requests? Sign in to view your submission history.
                </p>
                <div className="space-x-4">
                  <Link href="/login">
                    <Button variant="outline" className="border-blue-600 text-blue-300 hover:bg-blue-800">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Create Account
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}