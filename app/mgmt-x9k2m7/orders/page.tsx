"use client";

import { useEffect, useState, useRef } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOrders, getOrderDetail, updateOrderStatus, markAllOrdersCompleted, type OrderRow, type OrderDetail, type OrderStatus } from "@/app/actions/admin-orders";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Eye,
  Mail,
  Package,
  Hash,
  CreditCard,
  Calendar,
  Key,
  Copy,
  ChevronDown,
  Filter,
  CalendarDays,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  BarChart3,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const DATE_FILTERS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7days", label: "Last 7 Days" },
  { value: "last30days", label: "Last 30 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "all", label: "All Time" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [detailModal, setDetailModal] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const dateFilterRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Date filter stats
  const [dateStats, setDateStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    completedOrders: 0,
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
      if (dateFilterRef.current && !dateFilterRef.current.contains(e.target as Node)) setDateFilterOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  useEffect(() => {
    applyDateFilter();
  }, [orders, dateFilter]);

  function getDateRange(filter: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case "today":
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      case "yesterday":
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return {
          start: yesterday,
          end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      case "last7days":
        return {
          start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
          end: now
        };
      case "last30days":
        return {
          start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
          end: now
        };
      case "thisMonth":
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: now
        };
      case "lastMonth":
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        return {
          start: lastMonth,
          end: lastMonthEnd
        };
      default:
        return null;
    }
  }

  function applyDateFilter() {
    if (dateFilter === "all") {
      setFilteredOrders(orders);
      calculateStats(orders);
      return;
    }

    const range = getDateRange(dateFilter);
    if (!range) {
      setFilteredOrders(orders);
      calculateStats(orders);
      return;
    }

    const filtered = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= range.start && orderDate <= range.end;
    });

    setFilteredOrders(filtered);
    calculateStats(filtered);
  }

  function calculateStats(orderList: OrderRow[]) {
    const totalOrders = orderList.length;
    const completedOrders = orderList.filter(o => o.status === "completed").length;
    const totalRevenue = orderList
      .filter(o => o.status === "completed")
      .reduce((sum, o) => sum + o.amount, 0);
    const avgOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

    setDateStats({
      totalOrders,
      totalRevenue,
      avgOrderValue,
      completedOrders,
    });
  }

  async function loadOrders() {
    try {
      setLoading(true);
      const res = await getOrders(statusFilter);
      if (!res.success) throw new Error(res.error);
      setOrders(res.data ?? []);
    } catch (e: unknown) {
      const err = e as Error;
      toast({ title: "Error", description: err?.message ?? "Failed to load orders", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(order: OrderRow) {
    setDetailModal(null);
    setDetailLoading(true);
    try {
      const res = await getOrderDetail(order.id);
      if (!res.success) throw new Error(res.error);
      setDetailModal(res.data ?? null);
    } catch (e: unknown) {
      const err = e as Error;
      toast({ title: "Error", description: err?.message ?? "Failed to load order", variant: "destructive" });
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleMarkAllCompleted() {
    if (!confirm("Are you sure you want to mark ALL pending/failed orders as completed? This will create licenses for all orders.")) {
      return;
    }
    
    try {
      setBulkUpdating(true);
      const res = await markAllOrdersCompleted();
      if (!res.success) throw new Error(res.error);
      
      toast({
        title: "Success",
        description: `${res.count} order(s) marked as completed.`,
        className: "border-green-500/20 bg-green-500/10",
      });
      
      await loadOrders();
    } catch (e: unknown) {
      const err = e as Error;
      toast({ 
        title: "Error", 
        description: err?.message ?? "Failed to update orders", 
        variant: "destructive" 
      });
    } finally {
      setBulkUpdating(false);
    }
  }

  async function handleUpdateStatus(orderId: string, newStatus: string) {
    try {
      setUpdating(orderId);
      const res = await updateOrderStatus(orderId, newStatus);
      if (!res.success) throw new Error(res.error);
      toast({
        title: "Updated",
        description: `Order status set to ${newStatus}.`,
        className: "border-green-500/20 bg-green-500/10",
      });
      await loadOrders();
      if (detailModal && detailModal.id === orderId) {
        const next = await getOrderDetail(orderId);
        if (next.success && next.data) setDetailModal(next.data);
      }
    } catch (e: unknown) {
      const err = e as Error;
      toast({ title: "Error", description: err?.message ?? "Failed to update", variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  }

  function copyLicense(key: string) {
    navigator.clipboard.writeText(key);
    toast({ title: "Copied", description: "License key copied to clipboard." });
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    paid: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    completed: "bg-green-500/10 text-green-400 border-green-500/20",
    failed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    refunded: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };

  const columns = [
    {
      key: "order_number",
      label: "Order #",
      sortable: true,
      render: (o: OrderRow) => (
        <span className="font-mono text-white text-sm">{o.order_number}</span>
      ),
    },
    {
      key: "customer_email",
      label: "Customer",
      sortable: true,
      render: (o: OrderRow) => (
        <span className="text-white/70 text-sm">{o.customer_email}</span>
      ),
    },
    {
      key: "product_name",
      label: "Product",
      sortable: true,
      render: (o: OrderRow) => (
        <div>
          <p className="text-white font-medium text-sm">{o.product_name}</p>
          <p className="text-xs text-white/50">{o.duration}</p>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (o: OrderRow) => (
        <span className="text-white font-semibold text-sm">${o.amount.toFixed(2)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (o: OrderRow) => (
        <Badge className={`text-xs ${statusColors[o.status] ?? "bg-white/10 text-white/70"}`}>
          {o.status}
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      sortable: true,
      render: (o: OrderRow) => (
        <div className="text-white/50 text-sm">
          <div>{new Date(o.created_at).toLocaleDateString()}</div>
          <div className="text-xs text-white/30">{new Date(o.created_at).toLocaleTimeString()}</div>
        </div>
      ),
    },
  ];

  return (
    <AdminShell title="Orders" subtitle="Track and manage customer orders with date filtering">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">Total Orders</p>
              <p className="text-xl font-bold text-white">{dateStats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">Revenue</p>
              <p className="text-xl font-bold text-white">${dateStats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">Avg Order</p>
              <p className="text-xl font-bold text-white">${dateStats.avgOrderValue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2563eb] to-[#3b82f6] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">Completed</p>
              <p className="text-xl font-bold text-white">{dateStats.completedOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {/* Mark All Completed Button */}
        <Button
          variant="default"
          size="sm"
          onClick={handleMarkAllCompleted}
          disabled={bulkUpdating || loading}
          className="bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#1e40af] hover:to-[#2563eb] text-white border-0"
        >
          {bulkUpdating ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CheckCheck className="w-4 h-4 mr-2" />
          )}
          Mark All Completed
        </Button>

        {/* Date Filter */}
        <div className="relative" ref={dateFilterRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDateFilterOpen(!dateFilterOpen)}
            className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626]"
          >
            <CalendarDays className="w-4 h-4 mr-2" />
            {DATE_FILTERS.find((d) => d.value === dateFilter)?.label ?? "Date Range"}
            <ChevronDown className={cn("w-4 h-4 ml-2 transition-transform", dateFilterOpen && "rotate-180")} />
          </Button>
          {dateFilterOpen && (
            <div className="absolute top-full left-0 mt-1 z-10 py-1 rounded-lg bg-[#1a1a1a] border border-[#262626] min-w-[160px] shadow-xl">
              {DATE_FILTERS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setDateFilter(opt.value);
                    setDateFilterOpen(false);
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm transition-colors",
                    dateFilter === opt.value ? "bg-[#2563eb]/20 text-[#2563eb]" : "text-white/80 hover:bg-white/5"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="relative" ref={filterRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterOpen(!filterOpen)}
            className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626]"
          >
            <Filter className="w-4 h-4 mr-2" />
            {STATUS_OPTIONS.find((s) => s.value === statusFilter)?.label ?? "Status"}
            <ChevronDown className={cn("w-4 h-4 ml-2 transition-transform", filterOpen && "rotate-180")} />
          </Button>
          {filterOpen && (
            <div className="absolute top-full left-0 mt-1 z-10 py-1 rounded-lg bg-[#1a1a1a] border border-[#262626] min-w-[140px] shadow-xl">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setStatusFilter(opt.value);
                    setFilterOpen(false);
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm transition-colors",
                    statusFilter === opt.value ? "bg-[#2563eb]/20 text-[#2563eb]" : "text-white/80 hover:bg-white/5"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => loadOrders()}
          disabled={loading}
          className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626]"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center h-64 items-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#2563eb]/30 border-t-[#2563eb] animate-spin" />
        </div>
      ) : (
        <DataTable
          data={filteredOrders}
          columns={columns}
          searchKey="customer_email"
          searchPlaceholder="Search by customer email..."
          actions={(order) => (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openDetail(order)}
                className="text-white/70 hover:text-white hover:bg-white/10 h-8 px-2"
              >
                <Eye className="w-4 h-4" />
              </Button>
              {order.status === "pending" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleUpdateStatus(order.id, "completed")}
                  disabled={updating === order.id}
                  className="text-green-400 hover:bg-green-500/10 h-8 px-2"
                >
                  {updating === order.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                </Button>
              )}
              {order.status === "completed" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleUpdateStatus(order.id, "refunded")}
                  disabled={updating === order.id}
                  className="text-blue-400 hover:bg-blue-500/10 h-8 px-2"
                >
                  {updating === order.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                </Button>
              )}
              {order.status === "failed" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleUpdateStatus(order.id, "pending")}
                  disabled={updating === order.id}
                  className="text-yellow-400 hover:bg-yellow-500/10 h-8 px-2"
                >
                  {updating === order.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                </Button>
              )}
            </div>
          )}
        />
      )}

      {detailLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-10 h-10 rounded-full border-2 border-[#2563eb]/30 border-t-[#2563eb] animate-spin" />
        </div>
      )}

      {detailModal && !detailLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] shadow-xl overflow-hidden">
            <div className="p-6 border-b border-[#262626] bg-gradient-to-r from-[#2563eb]/10 to-transparent">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Order details</h3>
                  <p className="font-mono text-sm text-white/50 mt-0.5">{detailModal.order_number}</p>
                </div>
                <button
                  onClick={() => setDetailModal(null)}
                  className="text-white/50 hover:text-white p-1 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <Mail className="w-5 h-5 text-white/40" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/40">Customer</p>
                    <p className="text-white font-medium truncate text-sm">{detailModal.customer_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <CreditCard className="w-5 h-5 text-white/40" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/40">Payment</p>
                    <p className="text-white font-medium text-sm">{detailModal.payment_method || "—"}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <Package className="w-5 h-5 text-white/40" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-white/40">Product</p>
                  <p className="text-white font-medium text-sm">{detailModal.product_name}</p>
                  <p className="text-sm text-white/50">{detailModal.duration}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-white/40">Amount</p>
                  <p className="text-white font-semibold">${detailModal.amount.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-white/40" />
                  <span className="text-white/50 text-sm">Status</span>
                </div>
                <Badge className={`text-xs ${statusColors[detailModal.status] ?? "bg-white/10"}`}>{detailModal.status}</Badge>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <Calendar className="w-5 h-5 text-white/40" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/40">Created</p>
                  <p className="text-white text-sm">{new Date(detailModal.created_at).toLocaleString()}</p>
                </div>
              </div>
              {detailModal.license && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-[#2563eb]/10 to-transparent border border-[#2563eb]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="w-4 h-4 text-[#2563eb]" />
                    <span className="text-xs uppercase tracking-wider text-[#2563eb]">License</span>
                    <Badge className="ml-auto text-xs">{detailModal.license.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 rounded-lg bg-black/30 text-white/90 font-mono text-sm break-all">
                      {detailModal.license.license_key}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyLicense(detailModal.license!.license_key)}
                      className="text-white/70 hover:text-white shrink-0 h-8 px-2"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  {detailModal.license.expires_at && (
                    <p className="text-xs text-white/40 mt-2">
                      Expires {new Date(detailModal.license.expires_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                {detailModal.status === "pending" && (
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(detailModal.id, "completed")}
                    disabled={updating === detailModal.id}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {updating === detailModal.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                    Complete
                  </Button>
                )}
                {detailModal.status === "completed" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus(detailModal.id, "refunded")}
                    disabled={updating === detailModal.id}
                    className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                  >
                    {updating === detailModal.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-1" />}
                    Refund
                  </Button>
                )}
                {detailModal.status === "failed" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus(detailModal.id, "pending")}
                    disabled={updating === detailModal.id}
                    className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                  >
                    {updating === detailModal.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4 mr-1" />}
                    Retry
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setDetailModal(null)} className="border-[#262626] text-white/70">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
