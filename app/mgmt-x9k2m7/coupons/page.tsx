"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Edit, Copy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number;
  current_uses: number;
  status: string;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: 0,
    maxUses: 100,
    selectedProducts: [] as string[],
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    loadCoupons();
    loadProducts();
  }, []);

  const loadCoupons = async () => {
    try {
      const response = await fetch("/api/admin/coupons");
      if (response.ok) {
        const data = await response.json();
        setCoupons(data.coupons || []);
      } else {
        throw new Error("Failed to load coupons");
      }
    } catch (error) {
      console.error("Failed to load coupons:", error);
      toast({
        title: "Error",
        description: "Failed to load coupons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  };

  const handleCreateCoupon = async () => {
    if (!formData.code || formData.discountValue <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code,
          discountType: formData.discountType,
          discountValue: formData.discountValue,
          maxUses: formData.maxUses,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create coupon");
      }

      toast({
        title: "Success",
        description: "Coupon created successfully",
      });

      setFormData({
        code: "",
        discountType: "percentage",
        discountValue: 0,
        maxUses: 100,
        selectedProducts: [],
        startDate: "",
        endDate: "",
      });
      setShowCreateModal(false);
      loadCoupons();
    } catch (error) {
      console.error("Failed to create coupon:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create coupon",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete coupon");
      }

      toast({
        title: "Success",
        description: "Coupon deleted successfully",
      });
      loadCoupons();
    } catch (error) {
      console.error("Failed to delete coupon:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete coupon",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <AdminShell title="Coupons" subtitle="Create and manage discount coupons">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Coupons</h1>
            <p className="text-white/60 mt-1">Create and manage discount codes</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Coupon
          </Button>
        </div>

        {/* Coupons Table */}
        <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
          <CardHeader>
            <CardTitle className="text-white">Active Coupons ({coupons.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-[#1a1a1a] rounded-full animate-spin" />
                  <div className="w-12 h-12 border-t-4 border-[#2563eb] rounded-full animate-spin absolute top-0 left-0" />
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#1a1a1a] hover:bg-transparent">
                      <TableHead className="text-white/60">Code</TableHead>
                      <TableHead className="text-white/60">Discount</TableHead>
                      <TableHead className="text-white/60">Uses</TableHead>
                      <TableHead className="text-white/60">Status</TableHead>
                      <TableHead className="text-white/60">Created</TableHead>
                      <TableHead className="text-white/60 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((coupon) => (
                      <TableRow key={coupon.id} className="border-[#1a1a1a] hover:bg-[#0a0a0a]/50">
                        <TableCell className="font-mono text-white font-semibold">{coupon.code}</TableCell>
                        <TableCell className="text-white/80">
                          {coupon.discount_type === "percentage"
                            ? `${coupon.discount_value}%`
                            : `$${coupon.discount_value}`}
                        </TableCell>
                        <TableCell className="text-white/70">
                          {coupon.current_uses} / {coupon.max_uses}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            coupon.status === "active"
                              ? "bg-emerald-500/20 text-emerald-400 border-0"
                              : "bg-blue-500/20 text-blue-400 border-0"
                          }>
                            {coupon.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white/60 text-sm">
                          {new Date(coupon.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(coupon.code)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteCoupon(coupon.id)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {coupons.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-16 text-center">
                          <p className="text-white/60">No coupons yet. Create one to get started!</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Coupon Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create Coupon</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* Coupon Code */}
            <div>
              <Label className="text-white font-medium mb-2 block">Coupon Code</Label>
              <Input
                placeholder="e.g. SAVE10OFF"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="bg-[#1a1a1a] border-[#262626] text-white"
              />
              <p className="text-xs text-white/40 mt-1">This is the code customers will enter to use coupon</p>
            </div>

            {/* Select Products */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-white font-medium">Select Products</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setFormData({
                      ...formData,
                      selectedProducts: products.map(p => p.id)
                    })}
                    className="h-7 text-xs border-[#2563eb] text-[#2563eb] hover:bg-[#2563eb]/10"
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setFormData({
                      ...formData,
                      selectedProducts: []
                    })}
                    className="h-7 text-xs border-[#262626] text-white/60 hover:bg-[#1a1a1a]"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
              <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-3 max-h-48 overflow-y-auto">
                <div className="space-y-2">
                  {products.map(product => (
                    <label
                      key={product.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#0a0a0a] cursor-pointer transition-colors group"
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedProducts.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              selectedProducts: [...formData.selectedProducts, product.id]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              selectedProducts: formData.selectedProducts.filter(id => id !== product.id)
                            });
                          }
                        }}
                        className="w-4 h-4 rounded border-[#262626] bg-[#0a0a0a] text-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 focus:ring-offset-0"
                      />
                      <span className="text-white text-sm group-hover:text-[#2563eb] transition-colors">
                        {product.name}
                      </span>
                    </label>
                  ))}
                  {products.length === 0 && (
                    <p className="text-white/40 text-sm text-center py-4">No products available</p>
                  )}
                </div>
              </div>
              <p className="text-xs text-white/40 mt-2">
                {formData.selectedProducts.length === 0 
                  ? "Select products to limit coupon usage, or leave empty for all products"
                  : `${formData.selectedProducts.length} product${formData.selectedProducts.length !== 1 ? 's' : ''} selected`
                }
              </p>
            </div>

            {/* Start & End Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white font-medium mb-2 block">Start Date</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="bg-[#1a1a1a] border-[#262626] text-white"
                />
                <p className="text-xs text-white/40 mt-1">Specify the release date for this coupon</p>
              </div>
              <div>
                <Label className="text-white font-medium mb-2 block">Expire Date</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="bg-[#1a1a1a] border-[#262626] text-white"
                />
                <p className="text-xs text-white/40 mt-1">Specify an expiration date for this coupon</p>
              </div>
            </div>

            {/* Coupon Value */}
            <div>
              <Label className="text-white font-medium mb-2 block">Coupon Value</Label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg p-2 text-white mb-2"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
              <Input
                type="number"
                placeholder="Enter discount value"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                className="bg-[#1a1a1a] border-[#262626] text-white"
              />
              <p className="text-xs text-white/40 mt-1">Specify the value of the coupon code</p>
            </div>

            {/* Limit Quantity */}
            <div>
              <Label className="text-white font-medium mb-2 block">Limit Quantity</Label>
              <Input
                type="number"
                placeholder="Maximum uses"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) || 0 })}
                className="bg-[#1a1a1a] border-[#262626] text-white"
              />
              <p className="text-xs text-white/40 mt-1">Limit amount of coupons available</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              className="border-[#262626] text-white hover:bg-[#1a1a1a]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCoupon}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
