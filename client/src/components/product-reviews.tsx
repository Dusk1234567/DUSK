import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, MessageCircle, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Review } from "@shared/schema";

interface ProductReviewsProps {
  productId: number;
  productName: string;
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch reviews for this product
  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews", productId],
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!rating || !comment.trim()) {
        throw new Error("Please provide both a rating and comment");
      }
      
      return await apiRequest("/api/reviews", "POST", {
        productId,
        rating,
        comment: comment.trim(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", productId] });
      setRating(0);
      setComment("");
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    },
  });

  const renderStars = (count: number, interactive: boolean = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= count 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-400"
            } ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          />
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6 border-t border-minecraft-green/20 pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold minecraft-green flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          Reviews
        </h3>
        
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            {renderStars(Math.round(Number(averageRating)))}
            <span className="text-sm text-gray-400">
              {averageRating} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
            </span>
          </div>
        )}
      </div>

      {/* Submit Review Form */}
      {isAuthenticated ? (
        <div className="bg-dark-slate/50 p-6 rounded-lg border border-minecraft-green/20">
          <h4 className="font-bold text-lg mb-4">Leave a Review</h4>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="rating" className="text-sm font-medium">
                Rating
              </Label>
              <div className="mt-2">
                {renderStars(hoverRating || rating, true)}
              </div>
            </div>
            
            <div>
              <Label htmlFor="comment" className="text-sm font-medium">
                Comment
              </Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={`Share your experience with ${productName}...`}
                className="mt-2 bg-light-slate border-minecraft-green/20 focus:border-minecraft-green"
                rows={3}
              />
            </div>
            
            <Button
              onClick={() => submitReviewMutation.mutate()}
              disabled={!rating || !comment.trim() || submitReviewMutation.isPending}
              className="bg-minecraft-green hover:bg-minecraft-dark-green text-dark-slate font-bold transition-all duration-300 hover-lift"
            >
              {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-dark-slate/50 p-6 rounded-lg border border-minecraft-green/20 text-center">
          <p className="text-gray-300 mb-4">Login to leave a review</p>
          <Button
            onClick={() => window.location.href = "/api/login"}
            className="bg-minecraft-green hover:bg-minecraft-dark-green text-dark-slate font-bold"
          >
            Login to Review
          </Button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-light-slate/50 p-4 rounded-lg animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-minecraft-gray/20 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-minecraft-gray/20 rounded mb-1 w-1/4"></div>
                    <div className="h-3 bg-minecraft-gray/20 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-minecraft-gray/20 rounded"></div>
                  <div className="h-3 bg-minecraft-gray/20 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <div 
              key={review.id} 
              className="bg-light-slate/50 p-4 rounded-lg border border-minecraft-green/10 hover:border-minecraft-green/20 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-minecraft-green/20 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 minecraft-green" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">
                      {review.user?.firstName || "Anonymous"} {review.user?.lastName?.[0] || ""}
                    </span>
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">{review.comment}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400">No reviews yet. Be the first to review {productName}!</p>
          </div>
        )}
      </div>
    </div>
  );
}