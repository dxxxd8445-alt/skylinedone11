"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { GlobeViewerMaps } from "@/components/admin/globe-viewer-maps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  RefreshCw,
  Users,
  Eye,
  ShoppingCart,
  MousePointer,
  Clock,
  MapPin,
  Monitor,
  Smartphone,
  Globe,
  TrendingUp,
  Package,
  CreditCard,
  CheckCircle,
  Wifi,
  WifiOff,
  AlertCircle,
  Calendar,
  Filter,
  Download,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Target,
  Percent,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface LiveVisitor {
  id: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  country: string;
  city: string;
  timezone?: string;
  currentPage: string;
  currentProduct?: string;
  activity: 'browsing' | 'viewing-product' | 'in-cart' | 'checkout' | 'completed';
  timeOnSite: number;
  pageViews: number;
  lastActivity: string;
  device: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  browserVersion?: string;
  os: string;
  osVersion?: string;
  screenResolution?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  secondsSinceLastActivity: number;

  isBot?: boolean;
  entryPage?: string;
}
interface SiteStats {
  totalVisitors: number;
  uniqueVisitors: number;
  activeVisitors: number;
  browsing: number;
  viewingProducts: number;
  inCart: number;
  inCheckout: number;
  completedPurchases: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: { page: string; views: number }[];
  topProducts: { product: string; views: number }[];
  trafficSources: { source: string; count: number }[];
  deviceBreakdown: { device: string; count: number }[];
  countryBreakdown: { country: string; count: number }[];
}

interface DateRange {
  label: string;
  value: string;
  startDate: Date;
  endDate: Date;
}

const DATE_RANGES: DateRange[] = [
  {
    label: "Today",
    value: "today",
    startDate: new Date(new Date().setHours(0, 0, 0, 0)),
    endDate: new Date()
  },
  {
    label: "Yesterday", 
    value: "yesterday",
    startDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    endDate: new Date(new Date().setHours(0, 0, 0, 0))
  },
  {
    label: "Last 7 Days",
    value: "7days",
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    endDate: new Date()
  },
  {
    label: "Last 30 Days",
    value: "30days", 
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  },
  {
    label: "This Month",
    value: "thismonth",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  },
  {
    label: "Last Month",
    value: "lastmonth",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
  },
  {
    label: "This Year",
    value: "thisyear",
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date()
  },
  {
    label: "All Time",
    value: "alltime",
    startDate: new Date(2020, 0, 1),
    endDate: new Date()
  }
];

export default function StoreViewersPage() {
  const { toast } = useToast();
  const [visitors, setVisitors] = useState<LiveVisitor[]>([]);
  const [stats, setStats] = useState<SiteStats>({
    totalVisitors: 0,
    uniqueVisitors: 0,
    activeVisitors: 0,
    browsing: 0,
    viewingProducts: 0,
    inCart: 0,
    inCheckout: 0,
    completedPurchases: 0,
    bounceRate: 0,
    avgSessionDuration: 0,
    topPages: [],
    topProducts: [],
    trafficSources: [],
    deviceBreakdown: [],
    countryBreakdown: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isConnected, setIsConnected] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>(DATE_RANGES[3]); // Last 30 Days
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [viewMode, setViewMode] = useState<'realtime' | 'analytics'>('realtime');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const loadRealTimeData = async () => {
    try {
      setError(null);
      const response = await fetch('/api/analytics/realtime', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setVisitors(data.visitors || []);
      setStats(prevStats => ({
        ...prevStats,
        activeVisitors: data.visitors?.length || 0,
        browsing: data.stats?.browsing || 0,
        viewingProducts: data.stats?.viewingProducts || 0,
        inCart: data.stats?.inCart || 0,
        inCheckout: data.stats?.inCheckout || 0,
        completedPurchases: data.stats?.completedPurchases || 0,
        topPages: data.stats?.topPages || [],
        topProducts: data.stats?.topProducts || [],
      }));
      setLastUpdate(new Date());
      setIsConnected(true);
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to load real-time data:', error);
      setError(error.message || 'Failed to load analytics data');
      setIsConnected(false);
      setLoading(false);
      
      toast({
        title: "Connection Error",
        description: "Failed to load real-time analytics. Check your database setup.",
        variant: "destructive",
      });
    }
  };

  const loadAnalyticsData = async (dateRange: DateRange) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/analytics/historical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setStats(data.stats || stats);
      setLastUpdate(new Date());
      setIsConnected(true);
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to load analytics data:', error);
      setError(error.message || 'Failed to load analytics data');
      setIsConnected(false);
      setLoading(false);
      
      toast({
        title: "Analytics Error",
        description: "Failed to load historical analytics data.",
        variant: "destructive",
      });
    }
  };

  const cleanupInactiveSessions = async () => {
    try {
      await fetch('/api/analytics/track', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to cleanup sessions:', error);
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: selectedDateRange.startDate.toISOString(),
          endDate: selectedDateRange.endDate.toISOString(),
          format: 'csv'
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${selectedDateRange.value}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Complete",
        description: "Analytics data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export analytics data.",
        variant: "destructive",
      });
    }
  };
  useEffect(() => {
    if (viewMode === 'realtime') {
      loadRealTimeData();
      
      if (autoRefresh) {
        const interval = setInterval(() => {
          loadRealTimeData();
        }, 5000); // Update every 5 seconds for real-time
        
        return () => clearInterval(interval);
      }
    } else {
      loadAnalyticsData(selectedDateRange);
    }
    
    // Cleanup inactive sessions every 5 minutes
    const cleanupInterval = setInterval(() => {
      cleanupInactiveSessions();
    }, 5 * 60 * 1000);
    
    return () => {
      clearInterval(cleanupInterval);
    };
  }, [viewMode, selectedDateRange, autoRefresh]);

  const handleDateRangeChange = (range: DateRange) => {
    setSelectedDateRange(range);
    setShowDatePicker(false);
    if (viewMode === 'analytics') {
      loadAnalyticsData(range);
    }
  };

  const handleCustomDateRange = () => {
    if (customStartDate && customEndDate) {
      const customRange: DateRange = {
        label: "Custom Range",
        value: "custom",
        startDate: new Date(customStartDate),
        endDate: new Date(customEndDate)
      };
      setSelectedDateRange(customRange);
      setShowDatePicker(false);
      if (viewMode === 'analytics') {
        loadAnalyticsData(customRange);
      }
    }
  };

  const getActivityIcon = (activity: LiveVisitor['activity']) => {
    switch (activity) {
      case 'browsing':
        return <Globe className="w-4 h-4 text-blue-400" />;
      case 'viewing-product':
        return <Eye className="w-4 h-4 text-purple-400" />;
      case 'in-cart':
        return <ShoppingCart className="w-4 h-4 text-yellow-400" />;
      case 'checkout':
        return <CreditCard className="w-4 h-4 text-orange-400" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityBadge = (activity: LiveVisitor['activity']) => {
    const configs = {
      browsing: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", label: "Browsing" },
      'viewing-product': { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", label: "Viewing Product" },
      'in-cart': { bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-400", label: "In Cart" },
      checkout: { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", label: "Checkout" },
      completed: { bg: "bg-green-500/10", border: "border-green-500/20", text: "text-green-400", label: "Completed" },
    };
    
    const config = configs[activity];
    return (
      <Badge className={`${config.bg} ${config.border} ${config.text} border font-medium px-2.5 py-1 flex items-center gap-1.5 w-fit`}>
        {getActivityIcon(activity)}
        <span>{config.label}</span>
      </Badge>
    );
  };

  const getDeviceIcon = (device: LiveVisitor['device']) => {
    switch (device) {
      case 'mobile':
        return <Smartphone className="w-4 h-4 text-white/40" />;
      case 'tablet':
        return <Monitor className="w-4 h-4 text-white/40" />;
      default:
        return <Monitor className="w-4 h-4 text-white/40" />;
    }
  };

  const formatTimeOnSite = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getTimeSinceLastActivity = (seconds: number) => {
    if (seconds < 60) return `${Math.floor(seconds)}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getConnectionStatus = () => {
    if (loading) return { icon: RefreshCw, color: "text-yellow-400", label: "Loading..." };
    if (!isConnected || error) return { icon: WifiOff, color: "text-red-400", label: "Disconnected" };
    return { icon: Wifi, color: "text-green-400", label: viewMode === 'realtime' ? "Live" : "Connected" };
  };

  const connectionStatus = getConnectionStatus();
  const ConnectionIcon = connectionStatus.icon;
  return (
    <AdminShell
      title="Store Viewers"
      subtitle="Advanced real-time visitor analytics and comprehensive site insights"
    >
      <div className="space-y-6">
        {/* Enhanced Header with Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <ConnectionIcon className={cn("w-5 h-5", connectionStatus.color, loading && "animate-spin")} />
            <span className="text-white/70 text-sm">
              {connectionStatus.label} • Last updated {lastUpdate.toLocaleTimeString()}
            </span>
            {viewMode === 'realtime' && (
              <Badge className="bg-red-500/10 border-red-500/20 text-red-400 animate-pulse">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-2" />
                LIVE
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#111111] border border-[#1a1a1a] rounded-lg p-1">
              <button
                onClick={() => setViewMode('realtime')}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  viewMode === 'realtime'
                    ? "bg-[#dc2626] text-white"
                    : "text-white/60 hover:text-white"
                )}
              >
                <Activity className="w-4 h-4 mr-1.5 inline" />
                Real-time
              </button>
              <button
                onClick={() => setViewMode('analytics')}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  viewMode === 'analytics'
                    ? "bg-[#dc2626] text-white"
                    : "text-white/60 hover:text-white"
                )}
              >
                <BarChart3 className="w-4 h-4 mr-1.5 inline" />
                Analytics
              </button>
            </div>

            {/* Date Range Picker */}
            {viewMode === 'analytics' && (
              <div className="relative">
                <Button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  variant="outline"
                  size="sm"
                  className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626] hover:border-[#dc2626]/30"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {selectedDateRange.label}
                </Button>
                
                {showDatePicker && (
                  <div className="absolute top-full mt-2 right-0 z-50 bg-[#111111] border border-[#262626] rounded-xl p-4 shadow-2xl min-w-[280px]">
                    <div className="space-y-2 mb-4">
                      {DATE_RANGES.map((range) => (
                        <button
                          key={range.value}
                          onClick={() => handleDateRangeChange(range)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                            selectedDateRange.value === range.value
                              ? "bg-[#dc2626] text-white"
                              : "text-white/70 hover:text-white hover:bg-[#1a1a1a]"
                          )}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                    
                    <div className="border-t border-[#262626] pt-4">
                      <p className="text-white/60 text-xs mb-3">Custom Range</p>
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#262626] rounded-lg text-white text-sm"
                        />
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#262626] rounded-lg text-white text-sm"
                        />
                        <Button
                          onClick={handleCustomDateRange}
                          size="sm"
                          className="w-full bg-[#dc2626] hover:bg-[#ef4444]"
                          disabled={!customStartDate || !customEndDate}
                        >
                          Apply Custom Range
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Auto Refresh Toggle */}
            {viewMode === 'realtime' && (
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant="outline"
                size="sm"
                className={cn(
                  "bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626]",
                  autoRefresh && "border-[#dc2626]/30 bg-[#dc2626]/10"
                )}
              >
                <Zap className={cn("w-4 h-4 mr-2", autoRefresh && "text-[#dc2626]")} />
                Auto Refresh
              </Button>
            )}

            {/* Export Button */}
            <Button
              onClick={exportData}
              variant="outline"
              size="sm"
              className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626] hover:border-[#dc2626]/30"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>

            {/* Manual Refresh */}
            <Button
              onClick={viewMode === 'realtime' ? loadRealTimeData : () => loadAnalyticsData(selectedDateRange)}
              variant="outline"
              size="sm"
              disabled={loading}
              className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626] hover:border-[#dc2626]/30"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
        {/* Error State */}
        {error && (
          <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <div>
                  <h3 className="text-red-400 font-semibold">Analytics Error</h3>
                  <p className="text-red-300/80 text-sm mt-1">{error}</p>
                  <p className="text-red-300/60 text-xs mt-2">
                    Make sure you've run the database setup SQL and the analytics tracking is properly configured.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-[#262626] hover:border-[#dc2626]/30 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">
                {viewMode === 'realtime' ? 'Active Visitors' : 'Total Visitors'}
              </CardTitle>
              <Users className="h-4 w-4 text-[#dc2626]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatNumber(viewMode === 'realtime' ? stats.activeVisitors : stats.totalVisitors)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-green-400 animate-pulse" : "bg-red-400")} />
                <span className={cn("text-xs", isConnected ? "text-green-400" : "text-red-400")}>
                  {isConnected ? (viewMode === 'realtime' ? "Live" : "Connected") : "Offline"}
                </span>
              </div>
            </CardContent>
          </Card>

          {viewMode === 'analytics' && (
            <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-[#262626] hover:border-blue-500/30 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">Unique Visitors</CardTitle>
                <Eye className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">{formatNumber(stats.uniqueVisitors)}</div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-[#262626] hover:border-blue-500/30 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Browsing</CardTitle>
              <Globe className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{stats.browsing}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-[#262626] hover:border-purple-500/30 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Viewing Products</CardTitle>
              <Eye className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">{stats.viewingProducts}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-[#262626] hover:border-yellow-500/30 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">In Cart</CardTitle>
              <ShoppingCart className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{stats.inCart}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-[#262626] hover:border-orange-500/30 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">In Checkout</CardTitle>
              <CreditCard className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">{stats.inCheckout}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-[#262626] hover:border-green-500/30 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{stats.completedPurchases}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-[#262626] hover:border-emerald-500/30 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Conversion</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">
                {stats.activeVisitors > 0 ? `${Math.round((stats.completedPurchases / stats.activeVisitors) * 100)}%` : '0%'}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Main Content Area */}
        <div className="grid grid-cols-1 gap-6">
          {/* Globe Viewer */}
          {viewMode === 'realtime' && (
            <GlobeViewerMaps 
              visitors={visitors
                .filter(v => v.country && v.city)
                .map(v => ({
                  id: v.id,
                  country: v.country,
                  city: v.city,
                  latitude: (v as any).latitude || 0,
                  longitude: (v as any).longitude || 0,
                  device_type: v.device,
                  browser: v.browser,
                  is_active: v.secondsSinceLastActivity < 60
                }))}
            />
          )}
        </div>

        {/* Live Visitors / Analytics Data */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Visitors / Analytics Data */}
          <div className="lg:col-span-2">
            {viewMode === 'realtime' ? (
              <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-[#262626]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Activity className="w-5 h-5 text-[#dc2626]" />
                    Live Visitor Activity
                    <Badge className={cn(
                      "border ml-2",
                      isConnected 
                        ? "bg-green-500/10 border-green-500/20 text-green-400" 
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    )}>
                      {visitors.length} active
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mr-2 text-[#dc2626]" />
                      <span className="text-white/60">Loading real-time data...</span>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                      <p className="text-red-400 font-medium">Failed to load visitor data</p>
                      <p className="text-red-300/60 text-sm mt-1">Check database setup and try again</p>
                    </div>
                  ) : visitors.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
                      <p className="text-white/40">No active visitors right now</p>
                      <p className="text-white/30 text-sm mt-1">Visitors will appear here when they browse your site</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {visitors.map((visitor) => (
                        <div
                          key={visitor.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-[#0a0a0a]/50 border border-[#262626] hover:border-[#dc2626]/30 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              {getDeviceIcon(visitor.device)}
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                visitor.secondsSinceLastActivity < 60 ? "bg-green-400 animate-pulse" : "bg-yellow-400"
                              )} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-medium truncate">
                                  {visitor.currentProduct || visitor.currentPage}
                                </span>
                                {getActivityBadge(visitor.activity)}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-white/50">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {visitor.city}, {visitor.country}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTimeOnSite(visitor.timeOnSite)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MousePointer className="w-3 h-3" />
                                  {visitor.pageViews} pages
                                </span>
                                <span className="text-white/40">
                                  IP: {visitor.ipAddress}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-xs text-white/40 flex-shrink-0">
                            <div>{visitor.browser} • {visitor.os}</div>
                            <div>{getTimeSinceLastActivity(visitor.secondsSinceLastActivity)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              /* Analytics View */
              <div className="space-y-6">
                {/* Additional Analytics Cards */}
                {viewMode === 'analytics' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-[#262626]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-white/70 flex items-center gap-2">
                          <Percent className="w-4 h-4 text-yellow-400" />
                          Bounce Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-yellow-400">
                          {stats.bounceRate ? `${stats.bounceRate.toFixed(1)}%` : '0%'}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-[#262626]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-white/70 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-400" />
                          Avg. Session
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-400">
                          {stats.avgSessionDuration ? formatTimeOnSite(Math.round(stats.avgSessionDuration)) : '0s'}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-[#262626]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-white/70 flex items-center gap-2">
                          <Target className="w-4 h-4 text-purple-400" />
                          Page Views
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-400">
                          {formatNumber(stats.topPages.reduce((sum, page) => sum + page.views, 0))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Traffic Sources */}
                {stats.trafficSources && stats.trafficSources.length > 0 && (
                  <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-[#262626]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        Traffic Sources
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {stats.trafficSources.map((source, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-white/40 text-sm">#{index + 1}</span>
                              <span className="text-white font-medium text-sm capitalize">{source.source}</span>
                            </div>
                            <Badge variant="secondary" className="bg-green-500/10 border-green-500/20 text-green-400">
                              {source.count}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Top Pages & Products */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-[#262626]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Top Pages {viewMode === 'analytics' ? `(${selectedDateRange.label})` : '(24h)'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topPages.length === 0 ? (
                    <p className="text-white/40 text-sm text-center py-4">No page data yet</p>
                  ) : (
                    stats.topPages.map((page, index) => (
                      <div key={page.page} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-white/40 text-sm">#{index + 1}</span>
                          <span className="text-white font-medium text-sm truncate">{page.page}</span>
                        </div>
                        <Badge variant="secondary" className="bg-blue-500/10 border-blue-500/20 text-blue-400">
                          {page.views}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-[#262626]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Package className="w-5 h-5 text-purple-400" />
                  Top Products {viewMode === 'analytics' ? `(${selectedDateRange.label})` : '(24h)'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topProducts.length === 0 ? (
                    <p className="text-white/40 text-sm text-center py-4">No product data yet</p>
                  ) : (
                    stats.topProducts.map((product, index) => (
                      <div key={product.product} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-white/40 text-sm">#{index + 1}</span>
                          <span className="text-white font-medium text-sm truncate">{product.product}</span>
                        </div>
                        <Badge variant="secondary" className="bg-purple-500/10 border-purple-500/20 text-purple-400">
                          {product.views}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Device Breakdown */}
            {viewMode === 'analytics' && stats.deviceBreakdown && stats.deviceBreakdown.length > 0 && (
              <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-[#262626]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Monitor className="w-5 h-5 text-cyan-400" />
                    Device Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.deviceBreakdown.map((device, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {device.device === 'mobile' ? <Smartphone className="w-4 h-4 text-cyan-400" /> : <Monitor className="w-4 h-4 text-cyan-400" />}
                          <span className="text-white font-medium text-sm capitalize">{device.device}</span>
                        </div>
                        <Badge variant="secondary" className="bg-cyan-500/10 border-cyan-500/20 text-cyan-400">
                          {device.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Country Breakdown */}
            {viewMode === 'analytics' && stats.countryBreakdown && stats.countryBreakdown.length > 0 && (
              <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-[#262626]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Globe className="w-5 h-5 text-orange-400" />
                    Top Countries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.countryBreakdown.slice(0, 5).map((country, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-white/40 text-sm">#{index + 1}</span>
                          <span className="text-white font-medium text-sm">{country.country}</span>
                        </div>
                        <Badge variant="secondary" className="bg-orange-500/10 border-orange-500/20 text-orange-400">
                          {country.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}