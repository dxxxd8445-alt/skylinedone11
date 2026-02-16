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
import { getDashboardStats } from "@/app/actions/admin-dashboard";

const DATE_RANGES = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7days", label: "Last 7 Days" },
  { value: "last30days", label: "Last 30 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "thisYear", label: "This Year" },
  { value: "all", label: "All Time" },
  { value: "custom", label: "Custom Range" },
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
  const [customDateOpen, setCustomDateOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);

  const loadStats = async () => {
    try {
      let rangeToUse = dateRange;
      
      // If custom range, pass the custom dates
      if (dateRange === "custom" && customStartDate && customEndDate) {
        rangeToUse = `custom:${customStartDate}:${customEndDate}`;
      }
      
      const result = await getDashboardStats(rangeToUse);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      setStats(result.data);
      setRecentActivity(result.data.recentActivity);
    } catch (error) {
      console.error("Failed to load stats:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
    }
  };

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
  }, [dateRange, customStartDate, customEndDate]);

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
            <div className="w-16 h-16 rounded-full border-4 border-[#6b7280]/20 border-t-[#6b7280] animate-spin" />
            <div className="absolute inset-2 w-12 h-12 rounded-full bg-gradient-to-r from-[#6b7280] to-[#9ca3af] blur-xl animate-pulse" />
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
                      if (range.value === "custom") {
                        setCustomDateOpen(true);
                        setDateRangeOpen(false);
                      } else {
                        setDateRange(range.value);
                        setDateRangeOpen(false);
                      }
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm transition-colors",
                      dateRange === range.value ? "bg-[#6b7280]/20 text-[#6b7280]" : "text-white/80 hover:bg-white/5"
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
            className="flex items-center gap-2 px-4 py-2 bg-[#6b7280] hover:bg-[#b91c1c] border border-[#6b7280] rounded-lg text-white transition-colors disabled:opacity-50"
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
                  stats.growthRate > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-500/10 text-gray-400"
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
          <div className="absolute top-0 right-0 w-20 h-20 bg-gray-500/10 rounded-full blur-xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gray-500/10 border border-gray-500/20 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-gray-400" />
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
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#6b7280]/10 rounded-full blur-xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-[#6b7280]/10 border border-[#6b7280]/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#6b7280]" />
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
                <div className="w-3 h-3 rounded-full bg-[#6b7280]" />
                <span className="text-white/60">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                <span className="text-white/60">Orders</span>
              </div>
            </div>
          </div>
          
          {/* Chart with Real Data */}
          <div className="h-64 relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-white/40 pr-2">
              <span>${Math.round(stats.revenue * 1.2)}</span>
              <span>${Math.round(stats.revenue * 0.9)}</span>
              <span>${Math.round(stats.revenue * 0.6)}</span>
              <span>${Math.round(stats.revenue * 0.3)}</span>
              <span>$0</span>
            </div>

            {/* Chart area */}
            <div className="ml-12 h-full border-l border-b border-[#262626] relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="border-t border-[#262626]/30" />
                ))}
              </div>

              {/* Bars */}
              <div className="absolute inset-0 flex items-end justify-around px-4 pb-8">
                {/* Revenue Bar */}
                <div className="flex-1 flex flex-col items-center gap-2 max-w-[120px]">
                  <div className="w-full relative group">
                    <div 
                      className="w-full bg-gradient-to-t from-[#6b7280] to-[#9ca3af] rounded-t-lg transition-all duration-500 hover:from-[#9ca3af] hover:to-[#6b7280] cursor-pointer"
                      style={{ height: `${Math.min((stats.revenue / (stats.revenue * 1.2)) * 100, 100)}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1a1a1a] border border-[#6b7280] rounded px-2 py-1 text-xs text-white whitespace-nowrap">
                        ${stats.revenue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-white">Revenue</p>
                    <p className="text-[10px] text-white/40">${stats.revenue.toFixed(2)}</p>
                  </div>
                </div>

                {/* Orders Bar */}
                <div className="flex-1 flex flex-col items-center gap-2 max-w-[120px]">
                  <div className="w-full relative group">
                    <div 
                      className="w-full bg-gradient-to-t from-gray-500 to-gray-400 rounded-t-lg transition-all duration-500 hover:from-gray-400 hover:to-gray-300 cursor-pointer"
                      style={{ height: `${Math.min((stats.orders / Math.max(stats.orders, 10)) * 100, 100)}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1a1a1a] border border-gray-500 rounded px-2 py-1 text-xs text-white whitespace-nowrap">
                        {stats.orders} orders
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-white">Orders</p>
                    <p className="text-[10px] text-white/40">{stats.orders} total</p>
                  </div>
                </div>

                {/* Avg Order Value Bar */}
                <div className="flex-1 flex flex-col items-center gap-2 max-w-[120px]">
                  <div className="w-full relative group">
                    <div 
                      className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg transition-all duration-500 hover:from-purple-400 hover:to-purple-300 cursor-pointer"
                      style={{ height: `${Math.min(((stats.revenue / Math.max(stats.orders, 1)) / (stats.revenue * 1.2)) * 100, 100)}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1a1a1a] border border-purple-500 rounded px-2 py-1 text-xs text-white whitespace-nowrap">
                        ${(stats.revenue / Math.max(stats.orders, 1)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-white">Avg Order</p>
                    <p className="text-[10px] text-white/40">${(stats.revenue / Math.max(stats.orders, 1)).toFixed(2)}</p>
                  </div>
                </div>

                {/* Conversion Rate Bar */}
                <div className="flex-1 flex flex-col items-center gap-2 max-w-[120px]">
                  <div className="w-full relative group">
                    <div 
                      className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all duration-500 hover:from-emerald-400 hover:to-emerald-300 cursor-pointer"
                      style={{ height: `${Math.min(stats.conversionRate, 100)}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1a1a1a] border border-emerald-500 rounded px-2 py-1 text-xs text-white whitespace-nowrap">
                        {stats.conversionRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-white">Conversion</p>
                    <p className="text-[10px] text-white/40">{stats.conversionRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
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
            <Activity className="w-5 h-5 text-[#6b7280]" />
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
            <Target className="w-5 h-5 text-[#6b7280]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {topCustomers.map((customer: any, index) => (
              <div key={customer.email} className="p-4 rounded-lg bg-[#0a0a0a]/50 border border-[#262626]/50">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-[#6b7280]/10 border border-[#6b7280]/20 flex items-center justify-center mx-auto mb-2">
                    <span className="text-[#6b7280] font-semibold text-sm">#{index + 1}</span>
                  </div>
                  <p className="text-white text-sm font-medium truncate">{customer.email}</p>
                  <p className="text-[#6b7280] text-lg font-bold">${customer.spent.toFixed(2)}</p>
                  <p className="text-white/40 text-xs">{customer.orders} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    
      {/* Custom Date Range Modal */}
      {customDateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Custom Date Range</h3>
                <p className="text-sm text-white/50">Select start and end dates</p>
              </div>
              <button
                onClick={() => setCustomDateOpen(false)}
                className="text-white/50 hover:text-white p-1 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  max={customEndDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#6b7280] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  min={customStartDate}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#6b7280] transition-colors"
                />
              </div>

              {customStartDate && customEndDate && (
                <div className="p-3 rounded-lg bg-[#6b7280]/10 border border-[#6b7280]/20">
                  <p className="text-sm text-[#6b7280]">
                    <strong>Selected Range:</strong> {new Date(customStartDate).toLocaleDateString()} - {new Date(customEndDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-[#6b7280]/70 mt-1">
                    {Math.ceil((new Date(customEndDate).getTime() - new Date(customStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setCustomStartDate("");
                    setCustomEndDate("");
                    setCustomDateOpen(false);
                    setDateRange("last30days");
                  }}
                  className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-[#262626] rounded-lg text-white hover:bg-[#262626] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (customStartDate && customEndDate) {
                      setDateRange("custom");
                      setCustomDateOpen(false);
                      toast({
                        title: "Custom Range Applied",
                        description: `Showing data from ${new Date(customStartDate).toLocaleDateString()} to ${new Date(customEndDate).toLocaleDateString()}`,
                      });
                    } else {
                      toast({
                        title: "Error",
                        description: "Please select both start and end dates",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={!customStartDate || !customEndDate}
                  className="flex-1 px-4 py-2 bg-[#6b7280] hover:bg-[#9ca3af] disabled:bg-[#6b7280]/50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                >
                  Apply Range
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </AdminShell>
  );
}