import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, X, Tag } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

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

interface CouponInputProps {
  orderAmount: number;
  onCouponApplied: (coupon: CouponValidationResult | null) => void;
  appliedCoupon: CouponValidationResult | null;
}

export function CouponInput({ orderAmount, onCouponApplied, appliedCoupon }: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    
    try {
      const response = await apiRequest('POST', '/api/coupons/validate', { 
        code: couponCode.trim(),
        orderAmount 
      });

      if (response.ok) {
        const result: CouponValidationResult = await response.json();
        onCouponApplied(result);
        toast({
          title: "Coupon Applied!",
          description: `${result.coupon.discountType === 'percentage' 
            ? `${result.coupon.discountValue}% discount` 
            : `$${result.coupon.discountValue} discount`} applied successfully`,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Invalid Coupon",
          description: error.message || "Coupon code is not valid",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      toast({
        title: "Error",
        description: "Failed to validate coupon code",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    onCouponApplied(null);
    toast({
      title: "Coupon Removed",
      description: "Coupon discount has been removed",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      validateCoupon();
    }
  };

  return (
    <Card className="border-2 border-dashed border-gray-600 bg-gray-800/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4 text-cyan-400" />
          <Label className="text-sm font-medium text-gray-200">
            Have a coupon code?
          </Label>
        </div>

        {appliedCoupon ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-900/30 border border-green-600 rounded-lg">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-600 text-white">
                      {appliedCoupon.coupon.code}
                    </Badge>
                    <span className="text-sm text-green-400">
                      {appliedCoupon.coupon.discountType === 'percentage' 
                        ? `${appliedCoupon.coupon.discountValue}% off` 
                        : `$${appliedCoupon.coupon.discountValue} off`}
                    </span>
                  </div>
                  {appliedCoupon.coupon.description && (
                    <p className="text-xs text-gray-400 mt-1">
                      {appliedCoupon.coupon.description}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeCoupon}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="text-sm space-y-1">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal:</span>
                <span>${orderAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-400">
                <span>Discount:</span>
                <span>-${appliedCoupon.discountAmount.toFixed(2)}</span>
              </div>
              <div className="h-px bg-gray-600 my-2" />
              <div className="flex justify-between text-white font-medium">
                <span>Total:</span>
                <span>${appliedCoupon.finalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
              />
            </div>
            <Button
              onClick={validateCoupon}
              disabled={isValidating || !couponCode.trim()}
              variant="outline"
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-6"
            >
              {isValidating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Apply'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}