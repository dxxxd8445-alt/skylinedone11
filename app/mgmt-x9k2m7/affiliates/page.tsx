"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  DollarSign,
  TrendingUp,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Edit,
  Trash2,
  Plus,
  MousePointer,
  BarChart,
  Calendar,
  Mail,
} from "lucide-react";

interface Affiliate {
  id: string;
  user_id: string;
  affiliate_code: string;
  commission_rate: number;
  total_earnings: number;
  pending_earnings: number;
  paid_earnings: number;
  total_referrals: number;
  total_sales: number;
  status: string;
  payment_email: string;
  payment_method: string;
  crypto_type?: string;
  cashapp_tag?: string;
  minimum_payout: number;
  created_at: string;
  updated_at: string;
  store_users?: {
    username: string;
    email: string;
  };
}

interface AffiliateReferral {
  id: string;
  referred_email: string;
  commission_amount: number;
  order_amount: number;
  status: string;
  created_at: string;
  order_id: string;
}

interface AffiliateClick {
  id: string;
  ip_address: string;
  landing_page: string;
  referrer: string;
  converted: boolean;
  created_at: string;
}

export default function AffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [affiliateReferrals, setAffiliateReferrals] = useState<AffiliateReferral[]>([]);
  const [affiliateClicks, setAffiliateClicks] = useState<AffiliateClick[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    commission_rate: 0,
    status: '',
    payment_email: '',
    payment_method: '',
    crypto_type: '',
    cashapp_tag: '',
    minimum_payout: 0
  });

  useEffect(() => {
    loadAffiliates();
  }, []);

  const loadAffiliates = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/affiliates");
      if (response.ok) {
        const data = await response.json();
        setAffiliates(data.affiliates || []);
      }
    } catch (error) {
      console.error("Failed to load affiliates:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateAffiliateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/affiliates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        await loadAffiliates();
      } else {
        alert("Failed to update affiliate status");
      }
    } catch (error) {
      console.error("Failed to update affiliate:", error);
      alert("Failed to update affiliate status");
    }
  };

  const viewAffiliateDetails = async (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setDetailsLoading(true);
    setViewModalOpen(true);
    
    try {
      // Load referrals
      const referralsResponse = await fetch(`/api/admin/affiliates/${affiliate.id}/referrals`);
      if (referralsResponse.ok) {
        const referralsData = await referralsResponse.json();
        setAffiliateReferrals(referralsData.referrals || []);
      }
      
      // Load clicks
      const clicksResponse = await fetch(`/api/admin/affiliates/${affiliate.id}/clicks`);
      if (clicksResponse.ok) {
        const clicksData = await clicksResponse.json();
        setAffiliateClicks(clicksData.clicks || []);
      }
    } catch (error) {
      console.error("Failed to load affiliate details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const editAffiliate = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setEditForm({
      commission_rate: affiliate.commission_rate,
      status: affiliate.status,
      payment_email: affiliate.payment_email,
      payment_method: affiliate.payment_method,
      crypto_type: affiliate.crypto_type || '',
      cashapp_tag: affiliate.cashapp_tag || '',
      minimum_payout: affiliate.minimum_payout || 50
    });
    setEditModalOpen(true);
  };

  const saveAffiliateChanges = async () => {
    if (!selectedAffiliate) return;
    
    try {
      const response = await fetch(`/api/admin/affiliates/${selectedAffiliate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        await loadAffiliates();
        setEditModalOpen(false);
        alert("Affiliate updated successfully!");
      } else {
        alert("Failed to update affiliate");
      }
    } catch (error) {
      console.error("Failed to update affiliate:", error);
      alert("Failed to update affiliate");
    }
  };

  const deleteAffiliate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this affiliate? This action cannot be undone.")) {
      return;
    }
    
    try {
      console.log(`[Delete] Attempting to delete affiliate: ${id}`);
      
      const response = await fetch(`/api/admin/affiliates/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();
      console.log(`[Delete] Response status: ${response.status}`, data);

      if (response.ok) {
        console.log(`[Delete] Success! Reloading affiliates...`);
        await loadAffiliates();
        alert("✅ Affiliate deleted successfully!");
      } else {
        console.error(`[Delete] Failed with status ${response.status}:`, data);
        alert(`❌ Failed to delete affiliate: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("[Delete] Exception:", error);
      alert(`❌ Error deleting affiliate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const filteredAffiliates = affiliates.filter(affiliate =>
    affiliate.affiliate_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    affiliate.store_users?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    affiliate.store_users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    affiliate.payment_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStats = affiliates.reduce((acc, affiliate) => ({
    totalAffiliates: acc.totalAffiliates + 1,
    totalEarnings: acc.totalEarnings + parseFloat(affiliate.total_earnings.toString()),
    totalReferrals: acc.totalReferrals + affiliate.total_referrals,
    pendingPayouts: acc.pendingPayouts + parseFloat(affiliate.pending_earnings.toString())
  }), { totalAffiliates: 0, totalEarnings: 0, totalReferrals: 0, pendingPayouts: 0 });

  return (
    <AdminShell title="Affiliate Management" subtitle="Manage affiliate partners and commissions">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Affiliate Management</h1>
            <p className="text-white/60 mt-1">Manage affiliate partners and commissions</p>
          </div>
          <Button
            onClick={loadAffiliates}
            disabled={loading}
            className="bg-[#dc2626] hover:bg-[#ef4444] text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Affiliates</p>
                  <p className="text-2xl font-bold text-white">{totalStats.totalAffiliates}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#dc2626]/10">
                  <Users className="w-6 h-6 text-[#dc2626]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Earnings</p>
                  <p className="text-2xl font-bold text-white">${totalStats.totalEarnings.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-500/10">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Referrals</p>
                  <p className="text-2xl font-bold text-white">{totalStats.totalReferrals}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Pending Payouts</p>
                  <p className="text-2xl font-bold text-white">${totalStats.pendingPayouts.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-xl bg-yellow-500/10">
                  <DollarSign className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                placeholder="Search affiliates by code, username, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#0a0a0a] border-[#1a1a1a] text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Affiliates Table */}
        <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
          <CardHeader>
            <CardTitle className="text-white">Affiliates ({filteredAffiliates.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-[#1a1a1a] rounded-full animate-spin" />
                  <div className="w-12 h-12 border-t-4 border-[#dc2626] rounded-full animate-spin absolute top-0 left-0" />
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#1a1a1a] hover:bg-transparent">
                      <TableHead className="text-white/60">User</TableHead>
                      <TableHead className="text-white/60">Code</TableHead>
                      <TableHead className="text-white/60">Commission</TableHead>
                      <TableHead className="text-white/60">Earnings</TableHead>
                      <TableHead className="text-white/60">Referrals</TableHead>
                      <TableHead className="text-white/60">Status</TableHead>
                      <TableHead className="text-white/60">Payment</TableHead>
                      <TableHead className="text-white/60">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAffiliates.map((affiliate) => (
                      <TableRow key={affiliate.id} className="border-[#1a1a1a] hover:bg-[#0a0a0a]/50">
                        <TableCell>
                          <div>
                            <p className="font-semibold text-white">
                              {affiliate.store_users?.username || 'Unknown'}
                            </p>
                            <p className="text-sm text-white/60">
                              {affiliate.store_users?.email || 'No email'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="font-mono text-sm bg-[#0a0a0a] px-2 py-1 rounded text-white">
                            {affiliate.affiliate_code}
                          </code>
                        </TableCell>
                        <TableCell className="text-white">
                          {affiliate.commission_rate}%
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-white">
                              ${parseFloat(affiliate.total_earnings.toString()).toFixed(2)}
                            </p>
                            <p className="text-sm text-yellow-400">
                              ${parseFloat(affiliate.pending_earnings.toString()).toFixed(2)} pending
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-white">
                          {affiliate.total_referrals}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            affiliate.status === 'active' ? "bg-green-500/20 text-green-400 border-0" :
                            affiliate.status === 'suspended' ? "bg-red-500/20 text-red-400 border-0" :
                            "bg-yellow-500/20 text-yellow-400 border-0"
                          }>
                            {affiliate.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {affiliate.payment_method === 'paypal' && (
                                <div className="flex items-center gap-1">
                                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-xs text-white font-bold">P</span>
                                  </div>
                                  <span className="text-white text-sm font-medium">PayPal</span>
                                </div>
                              )}
                              {affiliate.payment_method === 'cashapp' && (
                                <div className="flex items-center gap-1">
                                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-xs text-white font-bold">$</span>
                                  </div>
                                  <span className="text-white text-sm font-medium">Cash App</span>
                                </div>
                              )}
                              {affiliate.payment_method === 'crypto' && (
                                <div className="flex items-center gap-1">
                                  <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                                    <span className="text-xs text-white font-bold">₿</span>
                                  </div>
                                  <span className="text-white text-sm font-medium">
                                    {affiliate.crypto_type ? affiliate.crypto_type.toUpperCase() : 'Crypto'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <p className="text-white/60 text-xs font-mono">
                              {affiliate.payment_method === 'cashapp' 
                                ? affiliate.cashapp_tag || affiliate.payment_email
                                : affiliate.payment_email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => viewAffiliateDetails(affiliate)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => editAffiliate(affiliate)}
                              className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                              title="Edit Affiliate"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {affiliate.status === 'active' ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateAffiliateStatus(affiliate.id, 'suspended')}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                title="Suspend Affiliate"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateAffiliateStatus(affiliate.id, 'active')}
                                className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                                title="Activate Affiliate"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteAffiliate(affiliate.id)}
                              className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                              title="Delete Affiliate"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredAffiliates.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={8} className="py-16 text-center">
                          <div className="w-16 h-16 rounded-full bg-[#dc2626]/10 flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-[#dc2626]" />
                          </div>
                          <p className="text-white/60">No affiliates found</p>
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

      {/* View Affiliate Details Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-2 border-[#1a1a1a] max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedAffiliate && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                  <Users className="w-6 h-6 text-[#dc2626]" />
                  Affiliate Details - {selectedAffiliate.store_users?.username || 'Unknown'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 p-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-white/60">Username</Label>
                        <p className="text-white font-semibold">{selectedAffiliate.store_users?.username || 'Unknown'}</p>
                      </div>
                      <div>
                        <Label className="text-white/60">Email</Label>
                        <p className="text-white font-semibold">{selectedAffiliate.store_users?.email || 'Unknown'}</p>
                      </div>
                      <div>
                        <Label className="text-white/60">Affiliate Code</Label>
                        <code className="font-mono text-sm bg-[#1a1a1a] px-2 py-1 rounded text-[#dc2626]">
                          {selectedAffiliate.affiliate_code}
                        </code>
                      </div>
                      <div>
                        <Label className="text-white/60">Status</Label>
                        <Badge className={
                          selectedAffiliate.status === 'active' ? "bg-green-500/20 text-green-400 border-0" :
                          selectedAffiliate.status === 'suspended' ? "bg-red-500/20 text-red-400 border-0" :
                          "bg-yellow-500/20 text-yellow-400 border-0"
                        }>
                          {selectedAffiliate.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Payment Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-white/60">Payment Method</Label>
                        <div className="flex items-center gap-2 mt-1">
                          {selectedAffiliate.payment_method === 'paypal' && (
                            <>
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-bold">P</span>
                              </div>
                              <span className="text-white font-semibold">PayPal</span>
                            </>
                          )}
                          {selectedAffiliate.payment_method === 'cashapp' && (
                            <>
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-bold">$</span>
                              </div>
                              <span className="text-white font-semibold">Cash App</span>
                            </>
                          )}
                          {selectedAffiliate.payment_method === 'crypto' && (
                            <>
                              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-bold">₿</span>
                              </div>
                              <span className="text-white font-semibold">
                                {selectedAffiliate.crypto_type ? selectedAffiliate.crypto_type.toUpperCase() : 'Cryptocurrency'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-white/60">
                          {selectedAffiliate.payment_method === 'paypal' ? 'PayPal Email' :
                           selectedAffiliate.payment_method === 'cashapp' ? 'Cash App Tag' :
                           selectedAffiliate.payment_method === 'crypto' ? `${selectedAffiliate.crypto_type?.toUpperCase() || 'Crypto'} Address` :
                           'Payment Details'}
                        </Label>
                        <p className="text-white font-semibold font-mono text-sm bg-[#1a1a1a] px-2 py-1 rounded mt-1">
                          {selectedAffiliate.payment_method === 'cashapp' 
                            ? selectedAffiliate.cashapp_tag || selectedAffiliate.payment_email
                            : selectedAffiliate.payment_email}
                        </p>
                      </div>
                      <div>
                        <Label className="text-white/60">Commission Rate</Label>
                        <p className="text-white font-semibold">{selectedAffiliate.commission_rate}%</p>
                      </div>
                      <div>
                        <Label className="text-white/60">Minimum Payout</Label>
                        <p className="text-white font-semibold">${selectedAffiliate.minimum_payout || 50}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
                    <CardContent className="p-4 text-center">
                      <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">${parseFloat(selectedAffiliate.total_earnings.toString()).toFixed(2)}</p>
                      <p className="text-white/60 text-sm">Total Earnings</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
                    <CardContent className="p-4 text-center">
                      <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{selectedAffiliate.total_referrals}</p>
                      <p className="text-white/60 text-sm">Total Referrals</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{selectedAffiliate.total_sales}</p>
                      <p className="text-white/60 text-sm">Total Sales</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
                    <CardContent className="p-4 text-center">
                      <MousePointer className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{affiliateClicks.length}</p>
                      <p className="text-white/60 text-sm">Recent Clicks</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Referrals */}
                <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Recent Referrals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {detailsLoading ? (
                      <div className="py-8 flex justify-center">
                        <div className="w-8 h-8 border-4 border-[#1a1a1a] border-t-[#dc2626] rounded-full animate-spin" />
                      </div>
                    ) : affiliateReferrals.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-[#1a1a1a]">
                              <TableHead className="text-white/60">Customer</TableHead>
                              <TableHead className="text-white/60">Order Amount</TableHead>
                              <TableHead className="text-white/60">Commission</TableHead>
                              <TableHead className="text-white/60">Status</TableHead>
                              <TableHead className="text-white/60">Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {affiliateReferrals.slice(0, 10).map((referral) => (
                              <TableRow key={referral.id} className="border-[#1a1a1a]">
                                <TableCell className="text-white">{referral.referred_email}</TableCell>
                                <TableCell className="text-white">${referral.order_amount.toFixed(2)}</TableCell>
                                <TableCell className="text-green-400">${referral.commission_amount.toFixed(2)}</TableCell>
                                <TableCell>
                                  <Badge className={
                                    referral.status === 'paid' ? "bg-green-500/20 text-green-400 border-0" :
                                    referral.status === 'approved' ? "bg-blue-500/20 text-blue-400 border-0" :
                                    "bg-yellow-500/20 text-yellow-400 border-0"
                                  }>
                                    {referral.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-white/70">
                                  {new Date(referral.created_at).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-white/60 text-center py-8">No referrals yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Affiliate Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-2 border-[#1a1a1a] max-w-md">
          {selectedAffiliate && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
                  <Edit className="w-5 h-5 text-[#dc2626]" />
                  Edit Affiliate
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 p-6">
                <div>
                  <Label className="text-white font-medium">Commission Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={editForm.commission_rate}
                    onChange={(e) => setEditForm({ ...editForm, commission_rate: parseFloat(e.target.value) || 0 })}
                    className="bg-[#0a0a0a] border-[#1a1a1a] text-white"
                  />
                </div>

                <div>
                  <Label className="text-white font-medium">Status</Label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#1a1a1a] text-white rounded-md"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div>
                  <Label className="text-white font-medium">Payment Method</Label>
                  <select
                    value={editForm.payment_method}
                    onChange={(e) => setEditForm({ ...editForm, payment_method: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#1a1a1a] text-white rounded-md"
                  >
                    <option value="paypal">PayPal</option>
                    <option value="cashapp">Cash App</option>
                    <option value="crypto">Cryptocurrency</option>
                  </select>
                </div>

                {editForm.payment_method === 'paypal' && (
                  <div>
                    <Label className="text-white font-medium">PayPal Email</Label>
                    <Input
                      type="email"
                      value={editForm.payment_email}
                      onChange={(e) => setEditForm({ ...editForm, payment_email: e.target.value })}
                      className="bg-[#0a0a0a] border-[#1a1a1a] text-white"
                      placeholder="your-paypal@email.com"
                    />
                  </div>
                )}

                {editForm.payment_method === 'cashapp' && (
                  <div>
                    <Label className="text-white font-medium">Cash App Tag</Label>
                    <Input
                      type="text"
                      value={editForm.cashapp_tag}
                      onChange={(e) => setEditForm({ ...editForm, cashapp_tag: e.target.value, payment_email: e.target.value })}
                      className="bg-[#0a0a0a] border-[#1a1a1a] text-white"
                      placeholder="$YourCashAppTag"
                    />
                  </div>
                )}

                {editForm.payment_method === 'crypto' && (
                  <>
                    <div>
                      <Label className="text-white font-medium">Cryptocurrency Type</Label>
                      <select
                        value={editForm.crypto_type}
                        onChange={(e) => setEditForm({ ...editForm, crypto_type: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#1a1a1a] text-white rounded-md"
                      >
                        <option value="">Select Cryptocurrency</option>
                        <option value="btc">Bitcoin (BTC)</option>
                        <option value="eth">Ethereum (ETH)</option>
                        <option value="ltc">Litecoin (LTC)</option>
                        <option value="bch">Bitcoin Cash (BCH)</option>
                        <option value="xrp">Ripple (XRP)</option>
                        <option value="ada">Cardano (ADA)</option>
                        <option value="dot">Polkadot (DOT)</option>
                        <option value="matic">Polygon (MATIC)</option>
                        <option value="sol">Solana (SOL)</option>
                        <option value="usdt">Tether (USDT)</option>
                        <option value="usdc">USD Coin (USDC)</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-white font-medium">
                        {editForm.crypto_type ? `${editForm.crypto_type.toUpperCase()} Address` : 'Crypto Address'}
                      </Label>
                      <Input
                        type="text"
                        value={editForm.payment_email}
                        onChange={(e) => setEditForm({ ...editForm, payment_email: e.target.value })}
                        className="bg-[#0a0a0a] border-[#1a1a1a] text-white font-mono text-sm"
                        placeholder={`Enter your ${editForm.crypto_type?.toUpperCase() || 'crypto'} address`}
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label className="text-white font-medium">Minimum Payout ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.minimum_payout}
                    onChange={(e) => setEditForm({ ...editForm, minimum_payout: parseFloat(e.target.value) || 0 })}
                    className="bg-[#0a0a0a] border-[#1a1a1a] text-white"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={saveAffiliateChanges}
                    className="flex-1 bg-[#dc2626] hover:bg-[#ef4444] text-white"
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => setEditModalOpen(false)}
                    variant="outline"
                    className="flex-1 border-[#1a1a1a] text-white hover:bg-[#1a1a1a]"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}