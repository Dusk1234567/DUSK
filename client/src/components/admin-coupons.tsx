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
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, Tag, Calendar, DollarSign, Percent, Power, PowerOff, Edit, Package, Filter } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderAmount?: number;
  maximumOrderAmount?: number;
  maxUsages?: number;
  currentUsages: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  description?: string;
  applicableProducts?: string[];
  applicableCategories?: string[];
  excludedProducts?: string[];
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
}

export function AdminCoupons() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minimumOrderAmount: '',
    maximumOrderAmount: '',
    maxUsages: '',
    validFrom: '',
    validUntil: '',
    description: '',
    applicableProducts: [] as string[],
    applicableCategories: [] as string[],
    excludedProducts: [] as string[]
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

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/products');
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

  const toggleCouponMutation = useMutation({
    mutationFn: async (couponId: string) => {
      const response = await apiRequest('PATCH', `/api/admin/coupons/${couponId}/toggle`);
      if (!response.ok) throw new Error('Failed to toggle coupon status');
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coupons'] });
      toast({
        title: 'Success',
        description: 'Coupon status updated successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to toggle coupon status',
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
      maximumOrderAmount: '',
      maxUsages: '',
      validFrom: '',
      validUntil: '',
      description: '',
      applicableProducts: [],
      applicableCategories: [],
      excludedProducts: []
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const couponData = {
      code: formData.code.toUpperCase().trim(),
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      minimumOrderAmount: formData.minimumOrderAmount ? parseFloat(formData.minimumOrderAmount) : undefined,
      maximumOrderAmount: formData.maximumOrderAmount ? parseFloat(formData.maximumOrderAmount) : undefined,
      maxUsages: formData.maxUsages ? parseInt(formData.maxUsages) : undefined,
      validFrom: new Date(formData.validFrom),
      validUntil: new Date(formData.validUntil),
      description: formData.description.trim() || undefined,
      applicableProducts: formData.applicableProducts.length > 0 ? formData.applicableProducts : undefined,
      applicableCategories: formData.applicableCategories.length > 0 ? formData.applicableCategories : undefined,
      excludedProducts: formData.excludedProducts.length > 0 ? formData.excludedProducts : undefined,
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
                  <div>
                    <Label htmlFor="maximumOrderAmount">Maximum Order Amount ($)</Label>
                    <Input
                      id="maximumOrderAmount"
                      type="number"
                      step="0.01"
                      value={formData.maximumOrderAmount}
                      onChange={(e) => setFormData({ ...formData, maximumOrderAmount: e.target.value })}
                      placeholder="500.00"
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

                {/* Product and Category Restrictions */}
                <div className="space-y-4 p-4 border border-gray-600 rounded-lg">
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Product Restrictions (Optional)
                  </Label>
                  
                  <div>
                    <Label htmlFor="applicableCategories">Apply to Categories</Label>
                    <div className="flex gap-2 mt-2">
                      <label className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.applicableCategories.includes('ranks')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                applicableCategories: [...formData.applicableCategories, 'ranks']
                              });
                            } else {
                              setFormData({
                                ...formData,
                                applicableCategories: formData.applicableCategories.filter(c => c !== 'ranks')
                              });
                            }
                          }}
                        />
                        <span className="text-white">Ranks Only</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.applicableCategories.includes('coins')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                applicableCategories: [...formData.applicableCategories, 'coins']
                              });
                            } else {
                              setFormData({
                                ...formData,
                                applicableCategories: formData.applicableCategories.filter(c => c !== 'coins')
                              });
                            }
                          }}
                        />
                        <span className="text-white">Coins Only</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label>Apply to Specific Products</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                      {products.map((product: Product) => (
                        <label key={product.id} className="flex items-center space-x-2 text-sm">
                          <Checkbox
                            checked={formData.applicableProducts.includes(product.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  applicableProducts: [...formData.applicableProducts, product.id]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  applicableProducts: formData.applicableProducts.filter(p => p !== product.id)
                                });
                              }
                            }}
                          />
                          <span className="text-white truncate">{product.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Exclude Specific Products</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                      {products.map((product: Product) => (
                        <label key={product.id} className="flex items-center space-x-2 text-sm">
                          <Checkbox
                            checked={formData.excludedProducts.includes(product.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  excludedProducts: [...formData.excludedProducts, product.id]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  excludedProducts: formData.excludedProducts.filter(p => p !== product.id)
                                });
                              }
                            }}
                          />
                          <span className="text-white truncate">{product.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
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
                    {(coupon.applicableCategories?.length || coupon.applicableProducts?.length || coupon.excludedProducts?.length) && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {coupon.applicableCategories?.map(cat => (
                          <Badge key={cat} className="bg-blue-600 text-white text-xs">
                            {cat}
                          </Badge>
                        ))}
                        {coupon.applicableProducts?.length > 0 && (
                          <Badge className="bg-purple-600 text-white text-xs">
                            +{coupon.applicableProducts.length} products
                          </Badge>
                        )}
                        {coupon.excludedProducts?.length > 0 && (
                          <Badge className="bg-red-600 text-white text-xs">
                            -{coupon.excludedProducts.length} excluded
                          </Badge>
                        )}
                      </div>
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
                    {coupon.maximumOrderAmount && (
                      <div className="text-xs text-gray-400">Max: ${coupon.maximumOrderAmount}</div>
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
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCouponMutation.mutate(coupon.id)}
                        disabled={toggleCouponMutation.isPending}
                        className={`${
                          coupon.isActive 
                            ? 'text-orange-400 border-orange-400 hover:bg-orange-400 hover:text-white'
                            : 'text-green-400 border-green-400 hover:bg-green-400 hover:text-white'
                        }`}
                        title={coupon.isActive ? 'Disable coupon' : 'Enable coupon'}
                      >
                        {coupon.isActive ? <PowerOff className="w-3 h-3" /> : <Power className="w-3 h-3" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteCouponMutation.mutate(coupon.id)}
                        disabled={deleteCouponMutation.isPending}
                        className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
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