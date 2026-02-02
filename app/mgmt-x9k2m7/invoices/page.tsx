"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Search,
  Filter,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  order_number: string;
  customer_email: string;
  amount_cents: number;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  product_name: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setInvoices(data || []);
    } catch (error) {
      console.error("Failed to load invoices:", error);
      toast({
        title: "Error",
        description: "Failed to load invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || invoice.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalRevenue: invoices.reduce((sum, inv) => sum + (inv.amount_cents ? inv.amount_cents / 100 : inv.amount || 0), 0),
    completedInvoices: invoices.filter(inv => inv.status === "completed").length,
    pendingInvoices: invoices.filter(inv => inv.status === "pending" || inv.status === "processing").length,
    expiredInvoices: invoices.filter(inv => inv.status === "expired").length,
    refundedInvoices: invoices.filter(inv => inv.status === "refunded").length,
    disruptedInvoices: invoices.filter(inv => inv.status === "failed" || inv.status === "disputed").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/20";
      case "pending":
      case "processing":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/20";
      case "expired":
        return "bg-purple-500/20 text-purple-400 border-purple-500/20";
      case "refunded":
        return "bg-blue-500/20 text-blue-400 border-blue-500/20";
      case "failed":
      case "disputed":
        return "bg-red-500/20 text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <AdminShell title="Invoices" subtitle="Manage and track all customer invoices">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Invoices</h1>
            <p className="text-white/60 mt-1">Track all customer transactions and payments</p>
          </div>
          <Button
            onClick={loadInvoices}
            disabled={loading}
            className="bg-[#dc2626] hover:bg-[#ef4444] text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-white/60 text-xs mb-1">Total Revenue</p>
              <p className="text-xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-white/60 text-xs mb-1">Completed</p>
              <p className="text-xl font-bold text-white">{stats.completedInvoices}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-white/60 text-xs mb-1">Pending</p>
              <p className="text-xl font-bold text-white">{stats.pendingInvoices}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-white/60 text-xs mb-1">Expired</p>
              <p className="text-xl font-bold text-white">{stats.expiredInvoices}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-white/60 text-xs mb-1">Refunded</p>
              <p className="text-xl font-bold text-white">{stats.refundedInvoices}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-white/60 text-xs mb-1">Disrupted</p>
              <p className="text-xl font-bold text-white">{stats.disruptedInvoices}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="Search by invoice ID or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#1a1a1a] border-[#262626] text-white"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-[#1a1a1a] border border-[#262626] rounded-lg text-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
            </select>
            <Button
              variant="outline"
              className="border-[#262626] text-white hover:bg-[#1a1a1a]"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Invoices Table */}
        <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
          <CardHeader>
            <CardTitle className="text-white">Invoices ({filteredInvoices.length})</CardTitle>
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
                      <TableHead className="text-white/60">Order</TableHead>
                      <TableHead className="text-white/60">Email</TableHead>
                      <TableHead className="text-white/60">Total</TableHead>
                      <TableHead className="text-white/60">Payment Method</TableHead>
                      <TableHead className="text-white/60">Status</TableHead>
                      <TableHead className="text-white/60">Time</TableHead>
                      <TableHead className="text-white/60 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className="border-[#1a1a1a] hover:bg-[#0a0a0a]/50">
                        <TableCell className="font-mono text-white/80 text-sm">{invoice.order_number}</TableCell>
                        <TableCell className="text-white/80">{invoice.customer_email}</TableCell>
                        <TableCell className="text-emerald-400 font-semibold">
                          ${(invoice.amount_cents ? invoice.amount_cents / 100 : invoice.amount || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-white/70 text-sm">{invoice.payment_method}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(invoice.status)} border`}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white/60 text-sm">
                          {new Date(invoice.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredInvoices.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="py-16 text-center">
                          <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-3" />
                          <p className="text-white/60">No invoices found</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {filteredInvoices.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-white/60 text-sm">
              Showing {filteredInvoices.length} of {invoices.length} invoices
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="border-[#262626] text-white hover:bg-[#1a1a1a]">
                Previous
              </Button>
              <Button variant="outline" className="border-[#262626] text-white hover:bg-[#1a1a1a]">
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
