"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  DollarSign,
  ShoppingCart,
  Key,
  TrendingUp,
  ArrowUpRight,
  Package,
  Users,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
  TrendingDown,
  Sparkles,
  Target,
  BarChart3,
  Eye,
  RefreshCw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    revenue: 0,
    revenueGrowth: 0,
    orders: 0,
    ordersGrowth: 0,
    licenses: 0,
    licensesGrowth: 0,
    overallGrowth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      const supabase = createClient();
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      // Get current period revenue (last 30 days) - only completed orders
      const { data: currentOrders } = await supabase
        .from("orders")
        .select("amount_cents, amount")
        .eq("status", "completed")
        .gte("created_at", thirtyDaysAgo.toISOString());

      const currentRevenue = currentOrders?.reduce((sum, order) => {
        // Handle both amount_cents and amount fields for backward compatibility
        const amount = order.amount_cents ? order.amount_cents / 100 : (order.amount || 0);
        return sum + amount;
      }, 0) || 0;

      // Get previous period revenue (30-60 days ago) - only completed orders
      const { data: previousOrders } = await supabase
        .from("orders")
        .select("amount_cents, amount")
        .eq("status", "completed")
        .gte("created_at", sixtyDaysAgo.toISOString())
        .lt("created_at", thirtyDaysAgo.toISOString());

      const previousRevenue = previousOrders?.reduce((sum, order) => {
        // Handle both amount_cents and amount fields for backward compatibility
        const amount = order.amount_cents ? order.amount_cents / 100 : (order.amount || 0);
        return sum + amount;
      }, 0) || 0;
      const revenueGrowth =
        previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

      // Get current period order count (completed only)
      const { count: currentOrderCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed")
        .gte("created_at", thirtyDaysAgo.toISOString());

      // Get previous period order count (completed only)
      const { count: previousOrderCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed")
        .gte("created_at", sixtyDaysAgo.toISOString())
        .lt("created_at", thirtyDaysAgo.toISOString());

      const ordersGrowth =
        previousOrderCount && previousOrderCount > 0
          ? ((currentOrderCount || 0) - previousOrderCount) / previousOrderCount * 100
          : 0;

      // Get current period license count
      const { count: currentLicenseCount } = await supabase
        .from("licenses")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgo.toISOString());

      // Get previous period license count
      const { count: previousLicenseCount } = await supabase
        .from("licenses")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sixtyDaysAgo.toISOString())
        .lt("created_at", thirtyDaysAgo.toISOString());

      const licensesGrowth =
        previousLicenseCount && previousLicenseCount > 0
          ? ((currentLicenseCount || 0) - previousLicenseCount) / previousLicenseCount * 100
          : 0;

      // Get total counts for display (completed orders only)
      const { count: totalOrderCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed");

      const { count: totalLicenseCount } = await supabase
        .from("licenses")
        .select("*", { count: "exact", head: true });

      // Get all-time revenue - only completed orders
      const { data: allOrders } = await supabase
        .from("orders")
        .select("amount_cents, amount")
        .eq("status", "completed");

      const totalRevenue = allOrders?.reduce((sum, order) => {
        // Handle both amount_cents and amount fields for backward compatibility
        const amount = order.amount_cents ? order.amount_cents / 100 : (order.amount || 0);
        return sum + amount;
      }, 0) || 0;

      // Get recent activity (last 5 orders with all statuses for admin visibility)
      const { data: recentOrders } = await supabase
        .from("orders")
        .select("id, customer_email, customer_name, amount_cents, amount, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentActivity(recentOrders || []);

      // Calculate overall growth (average of all growth metrics)
      const overallGrowth = (revenueGrowth + ordersGrowth + licensesGrowth) / 3;

      setStats({
        revenue: totalRevenue,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        orders: totalOrderCount || 0,
        ordersGrowth: Math.round(ordersGrowth * 10) / 10,
        licenses: totalLicenseCount || 0,
        licensesGrowth: Math.round(licensesGrowth * 10) / 10,
        overallGrowth: Math.round(overallGrowth * 10) / 10,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
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
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setTimeout(() => setRefreshing(false), 1000);
    toast({
      title: "Dashboard refreshed",
      description: "All statistics have been updated",
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.search.includes("error=forbidden")) {
      toast({
        title: "Access denied",
        description: "You don't have permission to view that page.",
        variant: "destructive",
      });
      window.history.replaceState({}, "", "/mgmt-x9k2m7");
    }
  }, [toast]);

  if (loading) {
    return (
      <AdminShell title="Dashboard" subtitle="Welcome back, Admin">
        <div className="flex flex-col items-center justify-center h-64 gap-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-[#dc2626]/20 border-t-[#dc2626] animate-spin" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-r-[#ef4444] animate-spin-reverse" />
            <div className="absolute inset-2 w-12 h-12 rounded-full bg-gradient-to-r from-[#dc2626] to-[#ef4444] blur-xl animate-pulse-glow" />
            <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-white animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-lg mb-1">Loading Dashboard</p>
            <p className="text-white/40 text-sm">Fetching your analytics...</p>
          </div>
        </div>
      </AdminShell>
    );
  }

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const statStyles = {
    emerald: {
      hoverBorder: "hover:border-emerald-500/50",
      hoverShadow: "hover:shadow-emerald-500/20",
      iconShadow: "shadow-emerald-500/30",
      dot: "bg-emerald-500",
    },
    blue: {
      hoverBorder: "hover:border-blue-500/50",
      hoverShadow: "hover:shadow-blue-500/20",
      iconShadow: "shadow-blue-500/30",
      dot: "bg-blue-500",
    },
    purple: {
      hoverBorder: "hover:border-purple-500/50",
      hoverShadow: "hover:shadow-purple-500/20",
      iconShadow: "shadow-purple-500/30",
      dot: "bg-purple-500",
    },
    red: {
      hoverBorder: "hover:border-[#dc2626]/50",
      hoverShadow: "hover:shadow-[#dc2626]/20",
      iconShadow: "shadow-red-500/30",
      dot: "bg-[#dc2626]",
    },
  } as const;

  const actionStyles = {
    blue: {
      hoverBorder: "hover:border-blue-500/40",
      iconText: "text-blue-400",
      iconBorder: "border-blue-500/20",
      iconShadow: "shadow-blue-500/20",
      titleHover: "group-hover:text-blue-400",
      arrowHover: "group-hover:text-blue-400",
      bottomLine: "via-blue-500/50",
    },
    purple: {
      hoverBorder: "hover:border-purple-500/40",
      iconText: "text-purple-400",
      iconBorder: "border-purple-500/20",
      iconShadow: "shadow-purple-500/20",
      titleHover: "group-hover:text-purple-400",
      arrowHover: "group-hover:text-purple-400",
      bottomLine: "via-purple-500/50",
    },
    emerald: {
      hoverBorder: "hover:border-emerald-500/40",
      iconText: "text-emerald-400",
      iconBorder: "border-emerald-500/20",
      iconShadow: "shadow-emerald-500/20",
      titleHover: "group-hover:text-emerald-400",
      arrowHover: "group-hover:text-emerald-400",
      bottomLine: "via-emerald-500/50",
    },
    orange: {
      hoverBorder: "hover:border-orange-500/40",
      iconText: "text-orange-400",
      iconBorder: "border-orange-500/20",
      iconShadow: "shadow-orange-500/20",
      titleHover: "group-hover:text-orange-400",
      arrowHover: "group-hover:text-orange-400",
      bottomLine: "via-orange-500/50",
    },
  } as const;

  const statCards = [
    {
      id: "revenue",
      title: "Total Revenue",
      value: `$${stats.revenue.toFixed(2)}`,
      growth: stats.revenueGrowth,
      Icon: DollarSign,
      styleKey: "emerald" as const,
      gradient: "from-emerald-500 to-emerald-600",
      description: "All-time earnings",
    },
    {
      id: "orders",
      title: "Total Orders",
      value: stats.orders.toString(),
      growth: stats.ordersGrowth,
      Icon: ShoppingCart,
      styleKey: "blue" as const,
      gradient: "from-blue-500 to-blue-600",
      description: "Completed purchases",
    },
    {
      id: "licenses",
      title: "Active Licenses",
      value: stats.licenses.toString(),
      growth: stats.licensesGrowth,
      Icon: Key,
      styleKey: "purple" as const,
      gradient: "from-purple-500 to-purple-600",
      description: "Generated keys",
    },
    {
      id: "growth",
      title: "Growth Rate",
      value: `${stats.overallGrowth}%`,
      growth: stats.overallGrowth,
      Icon: TrendingUp,
      styleKey: "red" as const,
      gradient: "from-[#dc2626] to-[#ef4444]",
      description: "Last 30 days avg",
    },
  ];

  const quickActions = [
    {
      title: "Team Members",
      description: "Manage your admin team",
      Icon: Users,
      styleKey: "orange" as const,
      href: "/mgmt-x9k2m7/team",
      accentGradient: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <AdminShell title="Dashboard" subtitle="Welcome back, Admin">
      <div className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top duration-500">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-white via-white to-white/70 bg-clip-text mb-2">
            Analytics Overview
          </h1>
          <p className="text-white/60">Real-time insights into your business performance</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1a1a1a] to-[#0a0a0a] hover:from-[#dc2626] hover:to-[#ef4444] border border-[#2a2a2a] hover:border-[#dc2626] rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 text-white/70 group-hover:text-white transition-colors ${
              refreshing ? "animate-spin" : ""
            }`}
          />
          <span className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">
            Refresh
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const s = statStyles[card.styleKey];
          return (
            <div
              key={card.id}
              className={`group relative bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 overflow-hidden transition-all duration-500 ${s.hoverBorder} ${s.hoverShadow} hover:shadow-2xl hover:scale-[1.02] cursor-pointer animate-in fade-in slide-in-from-bottom`}
              style={{ animationDelay: `${index * 100}ms` }}
              onMouseEnter={() => setHoveredStat(card.id)}
              onMouseLeave={() => setHoveredStat(null)}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
              />
              <div
                className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${card.gradient} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-all duration-700`}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-xl ${s.iconShadow} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                  >
                    <card.Icon className="w-7 h-7 text-white" />
                  </div>
                  {card.growth !== 0 && (
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-300 ${
                        card.growth > 0
                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                          : "bg-red-500/10 border border-red-500/20 text-red-400"
                      } group-hover:scale-110`}
                    >
                      {card.growth > 0 ? (
                        <TrendingUp className="w-4 h-4 animate-bounce-slow" />
                      ) : (
                        <TrendingDown className="w-4 h-4 animate-bounce-slow" />
                      )}
                      <span className="text-sm font-bold tabular-nums">{Math.abs(card.growth)}%</span>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2 group-hover:text-white/70 transition-colors">
                    {card.title}
                  </p>
                  <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-white to-white/70 bg-clip-text tabular-nums mb-2 group-hover:scale-105 transition-transform origin-left">
                    {card.value}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${s.dot} animate-pulse`} />
                    <p className="text-xs text-white/40 group-hover:text-white/60 transition-colors">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${card.gradient} rounded-full transition-all duration-1000 ease-out ${
                      hoveredStat === card.id ? "w-full" : "w-0"
                    }`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-[#0a0a0a] via-[#000000] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-7 animate-in fade-in slide-in-from-left duration-500 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#dc2626]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ef4444]/5 rounded-full blur-3xl" />

          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#dc2626] to-[#ef4444] flex items-center justify-center shadow-lg shadow-red-500/30">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
                </div>
                <p className="text-sm text-white/50 ml-[52px]">Shortcuts to common tasks</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#dc2626]/10 border border-[#dc2626]/20 rounded-lg">
                <Target className="w-4 h-4 text-[#dc2626]" />
                <span className="text-xs font-semibold text-[#dc2626]">Productivity</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const a = actionStyles[action.styleKey];
                return (
                  <a
                    key={action.href}
                    href={action.href}
                    className={`group relative p-6 bg-gradient-to-br from-[#111111] to-[#0a0a0a] hover:from-[#1a1a1a] hover:to-[#111111] border border-[#1a1a1a] ${a.hoverBorder} rounded-xl transition-all duration-300 overflow-hidden hover:scale-[1.02] active:scale-[0.98] animate-in fade-in slide-in-from-bottom`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${action.accentGradient} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-all duration-500`} />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                    <div className="relative flex items-start gap-4">
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.accentGradient} bg-opacity-10 border ${a.iconBorder} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg ${a.iconShadow}`}
                      >
                        <action.Icon className={`w-7 h-7 ${a.iconText}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-white mb-1.5 text-lg ${a.titleHover} transition-colors`}>{action.title}</h3>
                        <p className="text-sm text-white/50 group-hover:text-white/70 transition-colors leading-relaxed">
                          {action.description}
                        </p>
                      </div>

                      <ArrowUpRight
                        className={`w-5 h-5 text-white/20 ${a.arrowHover} group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300 flex-shrink-0`}
                      />
                    </div>

                    <div
                      className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent ${a.bottomLine} to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}
                    />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0a0a0a] via-[#000000] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-7 animate-in fade-in slide-in-from-right duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#dc2626]/5 rounded-full blur-3xl" />

          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#dc2626] to-[#ef4444] flex items-center justify-center shadow-lg shadow-red-500/30">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                </div>
                <p className="text-xs text-white/50 ml-[52px]">Latest transactions</p>
              </div>
              {recentActivity.length > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-400">Live</span>
                </div>
              )}
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {recentActivity.length > 0 ? (
                recentActivity.map((order, index) => (
                  <div
                    key={order.id}
                    className="group flex items-start gap-3 p-4 bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-xl hover:border-[#dc2626]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#dc2626]/10 cursor-pointer animate-in fade-in slide-in-from-bottom"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 ${
                        order.status === "completed"
                          ? "bg-emerald-500/10 border border-emerald-500/30 shadow-lg shadow-emerald-500/20"
                          : order.status === "pending"
                          ? "bg-yellow-500/10 border border-yellow-500/30 shadow-lg shadow-yellow-500/20"
                          : "bg-red-500/10 border border-red-500/30 shadow-lg shadow-red-500/20"
                      }`}
                    >
                      {order.status === "completed" ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : order.status === "pending" ? (
                        <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm text-white font-semibold truncate group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#dc2626] group-hover:bg-clip-text transition-all">
                          {order.customer_email}
                        </p>
                        <span
                          className={`text-sm font-bold tabular-nums flex-shrink-0 ${
                            order.status === "completed" ? "text-emerald-400" : "text-white/70"
                          }`}
                        >
                          ${(order.amount_cents / 100)?.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-md ${
                            order.status === "completed"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : order.status === "pending"
                              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {order.status}
                        </span>
                        <span className="text-xs text-white/40 font-medium">{getTimeAgo(order.created_at)}</span>
                      </div>
                    </div>

                    <Eye className="w-4 h-4 text-white/20 group-hover:text-[#dc2626] group-hover:scale-110 transition-all flex-shrink-0" />
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="relative inline-block mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
                      <Activity className="w-8 h-8 text-white/20" />
                    </div>
                    <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <p className="text-sm text-white/50 font-medium mb-1">No recent activity</p>
                  <p className="text-xs text-white/30">Orders will appear here</p>
                </div>
              )}
            </div>

            {recentActivity.length > 0 && (
              <a
                href="/mgmt-x9k2m7/orders"
                className="group flex items-center justify-center gap-2 mt-5 pt-5 border-t border-[#1a1a1a] text-sm text-[#dc2626] hover:text-[#ef4444] font-semibold transition-all hover:gap-3"
              >
                <BarChart3 className="w-4 h-4" />
                <span>View all orders</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        .animate-spin-reverse {
          animation: spin-reverse 1.5s linear infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-from-top {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-from-bottom {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-from-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-from-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        .fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .slide-in-from-top {
          animation: slide-in-from-top 0.5s ease-out;
        }

        .slide-in-from-bottom {
          animation: slide-in-from-bottom 0.5s ease-out;
        }

        .slide-in-from-left {
          animation: slide-in-from-left 0.5s ease-out;
        }

        .slide-in-from-right {
          animation: slide-in-from-right 0.5s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0a0a0a;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #dc2626, #b91c1c);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #ef4444, #dc2626);
        }
      `}</style>
    </AdminShell>
  );
}