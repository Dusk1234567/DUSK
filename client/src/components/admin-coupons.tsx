import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Plus, Tag, Calendar, DollarSign, Percent } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderAmount?: number;
  maxUsages?: number;
  currentUsages: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
}

export function AdminCoupons() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minimumOrderAmount: '',
    maxUsages: '',
    validFrom: '',
    validUntil: '',
    description: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['/api/admin/coupons'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/coupons');
      return await response.json();
    }
  });

  const createCouponMutation = useMutation({
    mutationFn: async (couponData: any) => {
      const response = await apiRequest('POST', '/api/admin/coupons', couponData);
      if (!response.ok) throw new Error('Failed to create coupon');
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coupons'] });
      setIsCreateModalOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Coupon created successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create coupon',
        variant: 'destructive'
      });
    }
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (couponId: string) => {
      const response = await apiRequest('DELETE', `/api/admin/coupons/${couponId}`);
      if (!response.ok) throw new Error('Failed to delete coupon');
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coupons'] });
      toast({
        title: 'Success',
        description: 'Coupon deleted successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete coupon',
        variant: 'destructive'
      });
    }
  });

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minimumOrderAmount: '',
      maxUsages: '',
      validFrom: '',
      validUntil: '',
      description: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const couponData = {
      code: formData.code.toUpperCase().trim(),
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      minimumOrderAmount: formData.minimumOrderAmount ? parseFloat(formData.minimumOrderAmount) : undefined,
      maxUsages: formData.maxUsages ? parseInt(formData.maxUsages) : undefined,
      validFrom: new Date(formData.validFrom),
      validUntil: new Date(formData.validUntil),
      description: formData.description.trim() || undefined,
      isActive: true
    };

    createCouponMutation.mutate(couponData);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (coupon: Coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);

    if (!coupon.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (now < validFrom) {
      return <Badge className="bg-blue-600">Pending</Badge>;
    }
    if (now > validUntil) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (coupon.maxUsages && coupon.currentUsages >= coupon.maxUsages) {
      return <Badge variant="outline">Used Up</Badge>;
    }
    return <Badge className="bg-green-600">Active</Badge>;
  };

  return (
    <Card className="bg-black/40 backdrop-blur-lg border-green-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Coupon Management
          </CardTitle>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 text-white border-green-500/20 max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Coupon</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Coupon Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="SAVE20"
                      className="bg-gray-800 border-gray-600"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="discountType">Discount Type *</Label>
                    <Select value={formData.discountType} onValueChange={(value: 'percentage' | 'fixed') => setFormData({ ...formData, discountType: value })}>
                      <SelectTrigger className="bg-gray-800 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discountValue">
                      Discount Value * {formData.discountType === 'percentage' ? '(%)' : '($)'}
                    </Label>
                    <Input
                      id="discountValue"
                      type="number"
                      step="0.01"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      placeholder={formData.discountType === 'percentage' ? '20' : '5.00'}
                      className="bg-gray-800 border-gray-600"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimumOrderAmount">Minimum Order Amount ($)</Label>
                    <Input
                      id="minimumOrderAmount"
                      type="number"
                      step="0.01"
                      value={formData.minimumOrderAmount}
                      onChange={(e) => setFormData({ ...formData, minimumOrderAmount: e.target.value })}
                      placeholder="50.00"
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxUsages">Maximum Uses</Label>
                    <Input
                      id="maxUsages"
                      type="number"
                      value={formData.maxUsages}
                      onChange={(e) => setFormData({ ...formData, maxUsages: e.target.value })}
                      placeholder="100"
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="validFrom">Valid From *</Label>
                    <Input
                      id="validFrom"
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      className="bg-gray-800 border-gray-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="validUntil">Valid Until *</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="bg-gray-800 border-gray-600"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="20% off all ranks - Limited time offer!"
                    className="bg-gray-800 border-gray-600"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createCouponMutation.isPending} className="bg-green-600 hover:bg-green-700">
                    {createCouponMutation.isPending ? 'Creating...' : 'Create Coupon'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No coupons created yet</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-300">Code</TableHead>
                <TableHead className="text-gray-300">Discount</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Usage</TableHead>
                <TableHead className="text-gray-300">Valid Period</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon: Coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono text-cyan-400 font-bold">
                    {coupon.code}
                    {coupon.description && (
                      <div className="text-xs text-gray-400 mt-1">{coupon.description}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-white">
                    <div className="flex items-center gap-1">
                      {coupon.discountType === 'percentage' ? (
                        <>
                          <Percent className="w-3 h-3" />
                          {coupon.discountValue}%
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-3 h-3" />
                          {coupon.discountValue}
                        </>
                      )}
                    </div>
                    {coupon.minimumOrderAmount && (
                      <div className="text-xs text-gray-400">Min: ${coupon.minimumOrderAmount}</div>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(coupon)}</TableCell>
                  <TableCell className="text-white">
                    {coupon.currentUsages}{coupon.maxUsages ? ` / ${coupon.maxUsages}` : ''}
                  </TableCell>
                  <TableCell className="text-white">
                    <div className="flex items-center gap-1 text-xs">
                      <Calendar className="w-3 h-3" />
                      {formatDate(coupon.validFrom)} - {formatDate(coupon.validUntil)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteCouponMutation.mutate(coupon.id)}
                      disabled={deleteCouponMutation.isPending}
                      className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}