"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  ShoppingCart,
  Key,
  TrendingUp,
  RefreshCw,
  Users,
  Activity,
  Calendar,
  ChevronDown,
  BarChart3,
  Target,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const DATE_RANGES = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7days", label: "Last 7 Days" },
  { value: "last30days", label: "Last 30 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "thisYear", label: "This Year" },
  { value: "all", label: "All Time" },
];

export default function AdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    licenses: 0,
    growthRate: 0,
    newCustomers: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState("last30days");
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);

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
      case "thisYear":
        return {
          start: new Date(now.getFullYear(), 0, 1),
          end: now
        };
      default:
        return null;
    }
  }

  const loadStats = async () => {
    try {
      const supabase = createClient();
      const range = getDateRange(dateRange);
      
      let ordersQuery = supabase
        .from("orders")
        .select("amount_cents, amount, status, created_at, customer_email")
        .eq("status", "completed");

      if (range) {
        ordersQuery = ordersQuery
          .gte("created_at", range.start.toISOString())
          .lte("created_at", range.end.toISOString());
      }

      const { data: orders } = await ordersQuery;

      const revenue = orders?.reduce((sum, order) => {
        const amount = order.amount_cents ? order.amount_cents / 100 : (order.amount || 0);
        return sum + amount;
      }, 0) || 0;

      const orderCount = orders?.length || 0;

      // Get licenses count
      let licensesQuery = supabase
        .from("licenses")
        .select("*", { count: "exact", head: true });

      if (range) {
        licensesQuery = licensesQuery
          .gte("created_at", range.start.toISOString())
          .lte("created_at", range.end.toISOString());
      }

      const { count: licensesCount } = await licensesQuery;

      // Calculate growth rate (compare with previous period)
      const prevRange = getPreviousPeriodRange(dateRange);
      let prevRevenue = 0;
      
      if (prevRange) {
        const { data: prevOrders } = await supabase
          .from("orders")
          .select("amount_cents, amount")
          .eq("status", "completed")
          .gte("created_at", prevRange.start.toISOString())
          .lte("created_at", prevRange.end.toISOString());

        prevRevenue = prevOrders?.reduce((sum, order) => {
          const amount = order.amount_cents ? order.amount_cents / 100 : (order.amount || 0);
          return sum + amount;
        }, 0) || 0;
      }

      const growthRate = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;

      // Get unique customers
      const uniqueCustomers = new Set(orders?.map(o => o.customer_email) || []).size;

      // Get recent activity
      const { data: recentOrders } = await supabase
        .from("orders")
        .select("id, customer_email, amount_cents, amount, status, created_at, product_name")
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentActivity(recentOrders || []);

      // Get top customers
      const customerStats: Record<string, { email: string; orders: number; spent: number }> = {};
      orders?.forEach(order => {
        const email = order.customer_email;
        const amount = order.amount_cents ? order.amount_cents / 100 : (order.amount || 0);
        if (!customerStats[email]) {
          customerStats[email] = { email, orders: 0, spent: 0 };
        }
        customerStats[email].orders += 1;
        customerStats[email].spent += amount;
      });

      const topCustomersList = Object.values(customerStats)
        .sort((a: any, b: any) => b.spent - a.spent)
        .slice(0, 5);

      setTopCustomers(topCustomersList);

      setStats({
        revenue,
        orders: orderCount,
        licenses: licensesCount || 0,
        growthRate: Math.round(growthRate * 10) / 10,
        newCustomers: uniqueCustomers,
        conversionRate: orderCount > 0 ? Math.round((orderCount / (orderCount + 10)) * 100) : 0,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  function getPreviousPeriodRange(filter: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case "today":
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return {
          start: yesterday,
          end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      case "last7days":
        return {
          start: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000),
          end: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        };
      case "last30days":
        return {
          start: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000),
          end: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        };
      default:
        return null;
    }
  }

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => setLoading(false), 15000);
    const init = async () => {
      await loadStats();
      if (!cancelled) setLoading(false);
    };

    init();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [dateRange]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setTimeout(() => setRefreshing(false), 1000);
    toast({
      title: "Dashboard refreshed",
      description: "All statistics have been updated",
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <AdminShell title="Dashboard" subtitle="Welcome back, Admin">
        <div className="flex flex-col items-center justify-center h-64 gap-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-[#dc2626]/20 border-t-[#dc2626] animate-spin" />
            <div className="absolute inset-2 w-12 h-12 rounded-full bg-gradient-to-r from-[#dc2626] to-[#ef4444] blur-xl animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-lg mb-1">Loading Dashboard</p>
            <p className="text-white/40 text-sm">Fetching your analytics...</p>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Dashboard" subtitle="Welcome back, Admin">
      {/* Header with Date Range Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Overview</h1>
          <p className="text-white/60">Real-time insights into your business performance</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="relative">
            <button
              onClick={() => setDateRangeOpen(!dateRangeOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#262626] rounded-lg text-white hover:bg-[#262626] transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{DATE_RANGES.find(r => r.value === dateRange)?.label}</span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", dateRangeOpen && "rotate-180")} />
            </button>
            
            {dateRangeOpen && (
              <div className="absolute top-full right-0 mt-1 z-50 py-1 rounded-lg bg-[#1a1a1a] border border-[#262626] min-w-[160px] shadow-xl">
                {DATE_RANGES.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => {
                      setDateRange(range.value);
                      setDateRangeOpen(false);
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm transition-colors",
                      dateRange === range.value ? "bg-[#dc2626]/20 text-[#dc2626]" : "text-white/80 hover:bg-white/5"
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] border border-[#dc2626] rounded-lg text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            <span className="text-sm">Refresh</span>
          </button>

          <button
            onClick={() => {
              if (confirm("Are you sure you want to reset revenue to $0? This action cannot be undone.")) {
                setStats(prev => ({ ...prev, revenue: 0 }));
                toast({
                  title: "Revenue Reset",
                  description: "Revenue has been reset to $0",
                });
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 border border-orange-600 rounded-lg text-white transition-colors"
          >
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Reset Revenue</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-400" />
              </div>
              {stats.growthRate !== 0 && (
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold",
                  stats.growthRate > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                )}>
                  <TrendingUp className={cn("w-3 h-3", stats.growthRate < 0 && "rotate-180")} />
                  {Math.abs(stats.growthRate)}%
                </div>
              )}
            </div>
            <div>
              <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-white">${stats.revenue.toFixed(2)}</p>
              <p className="text-xs text-white/40 mt-1">All-time earnings</p>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div>
              <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-white">{stats.orders}</p>
              <p className="text-xs text-white/40 mt-1">Completed purchases</p>
            </div>
          </div>
        </div>

        {/* Active Licenses */}
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Key className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div>
              <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">Active Licenses</p>
              <p className="text-2xl font-bold text-white">{stats.licenses}</p>
              <p className="text-xs text-white/40 mt-1">Generated keys</p>
            </div>
          </div>
        </div>

        {/* New Customers */}
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#dc2626]/10 rounded-full blur-xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-[#dc2626]/10 border border-[#dc2626]/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#dc2626]" />
              </div>
            </div>
            <div>
              <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">New Customers</p>
              <p className="text-2xl font-bold text-white">{stats.newCustomers}</p>
              <p className="text-xs text-white/40 mt-1">Unique buyers</p>
            </div>
          </div>
        </div>
      </div>



      {/* Charts and Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart Placeholder */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Revenue & Orders</h3>
              <p className="text-sm text-white/50">Track your sales performance</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#dc2626]" />
                <span className="text-white/60">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-white/60">Orders</span>
              </div>
            </div>
          </div>
          
          {/* Chart Placeholder */}
          <div className="h-64 flex items-center justify-center border border-[#262626] rounded-lg bg-[#0a0a0a]/50">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">Chart visualization coming soon</p>
              <p className="text-white/20 text-xs">Revenue: ${stats.revenue.toFixed(2)} | Orders: {stats.orders}</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
              <p className="text-sm text-white/50">Latest transactions</p>
            </div>
            <Activity className="w-5 h-5 text-[#dc2626]" />
          </div>

          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((order) => (
                <div key={order.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#0a0a0a]/50 border border-[#262626]/50">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold",
                    order.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"
                  )}>
                    ${(order.amount_cents ? order.amount_cents / 100 : order.amount || 0).toFixed(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{order.customer_email}</p>
                    <p className="text-white/40 text-xs">{formatDate(order.created_at)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-white/40 text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Customers */}
      {topCustomers.length > 0 && (
        <div className="mt-6 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Top 5 Customers</h3>
              <p className="text-sm text-white/50">Highest spending customers</p>
            </div>
            <Target className="w-5 h-5 text-[#dc2626]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {topCustomers.map((customer: any, index) => (
              <div key={customer.email} className="p-4 rounded-lg bg-[#0a0a0a]/50 border border-[#262626]/50">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-[#dc2626]/10 border border-[#dc2626]/20 flex items-center justify-center mx-auto mb-2">
                    <span className="text-[#dc2626] font-semibold text-sm">#{index + 1}</span>
                  </div>
                  <p className="text-white text-sm font-medium truncate">{customer.email}</p>
                  <p className="text-[#dc2626] text-lg font-bold">${customer.spent.toFixed(2)}</p>
                  <p className="text-white/40 text-xs">{customer.orders} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminShell>
  );
}