"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Activity,
  RefreshCw,
  LogIn,
  LogOut,
  Shield,
  Users,
  Calendar,
  MapPin,
  Monitor,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Clock,
  Globe,
  Smartphone,
  Trash2,
  Eye,
  Settings,
  BarChart3,
  TrendingUp,
  UserX,
  Power,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, isToday, isYesterday, subDays, startOfDay, endOfDay } from "date-fns";
import { useRouter } from "next/navigation";

interface AuditLog {
  id: string;
  event_type: "login" | "logout" | "action" | "error" | "security";
  actor_role: "admin" | "staff";
  actor_identifier: string;
  ip_address: string | null;
  user_agent: string | null;
  details?: string;
  severity?: "low" | "medium" | "high" | "critical";
  created_at: string;
}

interface LogStats {
  totalLogs: number;
  todayLogs: number;
  loginCount: number;
  logoutCount: number;
  adminSessions: number;
  staffSessions: number;
  uniqueIPs: number;
  securityEvents: number;
}

interface ActiveSession {
  id: string;
  actor_role: "admin" | "staff";
  actor_identifier: string;
  ip_address: string | null;
  user_agent: string | null;
  login_time: string;
  session_duration: number; // in minutes
}

export default function LogsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [stats, setStats] = useState<LogStats>({
    totalLogs: 0,
    todayLogs: 0,
    loginCount: 0,
    logoutCount: 0,
    adminSessions: 0,
    staffSessions: 0,
    uniqueIPs: 0,
    securityEvents: 0,
  });

  const loadLogs = async () => {
    try {
      const response = await fetch("/api/admin/audit-log");
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Authentication Required",
            description: "Please make sure you're logged in as admin or have the proper permissions",
            variant: "destructive",
          });
          return;
        }
        throw new Error(data.error || "Failed to load logs");
      }

      const logsData = data.logs || [];
      setLogs(logsData);
      setFilteredLogs(logsData);
      calculateStats(logsData);
    } catch (error: any) {
      console.error("Failed to load logs:", error);
      
      if (error.message?.includes("admin_audit_logs") || error.message?.includes("table")) {
        toast({
          title: "Database Setup Required",
          description: "The audit logs table needs to be created. Please run the SQL setup script in your Supabase dashboard.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to load audit logs",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadActiveSessions = async () => {
    setSessionsLoading(true);
    try {
      const response = await fetch("/api/admin/active-sessions");
      const data = await response.json();

      if (response.ok) {
        setActiveSessions(data.sessions || []);
      } else {
        console.error("Failed to load active sessions:", data.error);
      }
    } catch (error) {
      console.error("Failed to load active sessions:", error);
    } finally {
      setSessionsLoading(false);
    }
  };

  const forceLogout = async (session: ActiveSession) => {
    if (!confirm(`Are you sure you want to force logout ${session.actor_identifier}?`)) {
      return;
    }

    try {
      const response = await fetch("/api/admin/active-sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actor_role: session.actor_role,
          actor_identifier: session.actor_identifier,
        }),
      });

      if (response.ok) {
        toast({
          title: "Session Terminated",
          description: `Successfully logged out ${session.actor_identifier}`,
        });
        await loadActiveSessions();
        await loadLogs();
      } else {
        throw new Error("Failed to force logout");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to force logout session",
        variant: "destructive",
      });
    }
  };

  const calculateStats = (logsData: AuditLog[]) => {
    const today = new Date();
    const todayStart = startOfDay(today);
    
    const todayLogs = logsData.filter(log => 
      new Date(log.created_at) >= todayStart
    );

    const uniqueIPs = new Set(logsData.map(log => log.ip_address).filter(Boolean));

    setStats({
      totalLogs: logsData.length,
      todayLogs: todayLogs.length,
      loginCount: logsData.filter(log => log.event_type === "login").length,
      logoutCount: logsData.filter(log => log.event_type === "logout").length,
      adminSessions: logsData.filter(log => log.actor_role === "admin").length,
      staffSessions: logsData.filter(log => log.actor_role === "staff").length,
      uniqueIPs: uniqueIPs.size,
      securityEvents: logsData.filter(log => log.event_type === "security" || log.severity === "high" || log.severity === "critical").length,
    });
  };

  const handleLogout = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;

    try {
      console.log("?? Logout button clicked");
      
      // Show loading state
      toast({
        title: "Logging out...",
        description: "Please wait while we log you out.",
      });

      const response = await fetch("/api/admin/logout", {
        method: "POST",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("?? Logout response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("?? Logout response data:", data);
        
        toast({
          title: "Successfully Logged Out",
          description: "You have been logged out successfully. Redirecting...",
        });
        
        // Clear all storage
        try {
          localStorage.clear();
          sessionStorage.clear();
          
          // Clear any cookies client-side
          document.cookie.split(";").forEach((c) => {
            const eqPos = c.indexOf("=");
            const name = eqPos > -1 ? c.substr(0, eqPos) : c;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
          });
        } catch (storageError) {
          console.log("Storage clear error (non-critical):", storageError);
        }
        
        // Force redirect with replace to prevent back button
        setTimeout(() => {
          window.location.replace("/mgmt-x9k2m7/login");
        }, 1500);
        
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("? Logout error:", error);
      
      toast({
        title: "Logout Error",
        description: "There was an issue logging out. Clearing session anyway...",
        variant: "destructive",
      });
      
      // Force logout even if API fails
      try {
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear cookies
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substr(0, eqPos) : c;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        });
      } catch (storageError) {
        console.log("Storage clear error:", storageError);
      }
      
      setTimeout(() => {
        window.location.replace("/mgmt-x9k2m7/login");
      }, 2000);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadLogs(), loadActiveSessions()]);
  };

  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to clear all audit logs? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch("/api/admin/audit-log", {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Logs Cleared",
          description: "All audit logs have been cleared successfully.",
        });
        setLogs([]);
        setFilteredLogs([]);
        calculateStats([]);
      } else {
        throw new Error("Failed to clear logs");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear audit logs.",
        variant: "destructive",
      });
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ["Event", "User", "Role", "IP Address", "Browser", "Details", "Date & Time"],
      ...filteredLogs.map(log => [
        log.event_type,
        log.actor_identifier,
        log.actor_role,
        log.ip_address || "Unknown",
        parseUserAgent(log.user_agent),
        log.details || "",
        format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")
      ])
    ].map(row => row.map(field => `"${field}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Export Complete",
      description: "Audit logs have been exported successfully.",
    });
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.actor_identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ip_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Event type filter
    if (eventFilter !== "all") {
      filtered = filtered.filter(log => log.event_type === eventFilter);
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(log => log.actor_role === roleFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      let startDate: Date;

      switch (dateFilter) {
        case "today":
          startDate = startOfDay(now);
          break;
        case "yesterday":
          startDate = startOfDay(subDays(now, 1));
          const endOfYesterday = endOfDay(subDays(now, 1));
          filtered = filtered.filter(log => {
            const logDate = new Date(log.created_at);
            return logDate >= startDate && logDate <= endOfYesterday;
          });
          setFilteredLogs(filtered);
          return;
        case "week":
          startDate = subDays(now, 7);
          break;
        case "month":
          startDate = subDays(now, 30);
          break;
        default:
          setFilteredLogs(filtered);
          return;
      }

      filtered = filtered.filter(log => new Date(log.created_at) >= startDate);
    }

    setFilteredLogs(filtered);
  };

  useEffect(() => {
    loadLogs();
    loadActiveSessions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, eventFilter, roleFilter, dateFilter, logs]);

  const getEventIcon = (eventType: string, severity?: string) => {
    switch (eventType) {
      case "login":
        return <LogIn className="h-4 w-4 text-green-500" />;
      case "logout":
        return <LogOut className="h-4 w-4 text-orange-500" />;
      case "security":
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4 text-blue-500" />;
      case "staff":
        return <Users className="h-4 w-4 text-blue-500" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getEventBadge = (eventType: string, severity?: string) => {
    const getSeverityColor = (sev?: string) => {
      switch (sev) {
        case "critical":
          return "text-blue-700 border-blue-200 bg-blue-50";
        case "high":
          return "text-orange-700 border-orange-200 bg-orange-50";
        case "medium":
          return "text-yellow-700 border-yellow-200 bg-yellow-50";
        case "low":
          return "text-blue-700 border-blue-200 bg-blue-50";
        default:
          return "";
      }
    };

    switch (eventType) {
      case "login":
        return (
          <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
            Login
          </Badge>
        );
      case "logout":
        return (
          <Badge variant="outline" className="text-orange-700 border-orange-200 bg-orange-50">
            Logout
          </Badge>
        );
      case "security":
        return (
          <Badge variant="outline" className={`text-blue-700 border-blue-200 bg-blue-50 ${getSeverityColor(severity)}`}>
            Security
          </Badge>
        );
      case "error":
        return (
          <Badge variant="outline" className="text-yellow-700 border-yellow-200 bg-yellow-50">
            Error
          </Badge>
        );
      default:
        return <Badge variant="outline">{eventType}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
            Admin
          </Badge>
        );
      case "staff":
        return (
          <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
            Staff
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const parseUserAgent = (userAgent: string | null) => {
    if (!userAgent) return "Unknown";
    
    if (userAgent.includes("Mobile") || userAgent.includes("Android") || userAgent.includes("iPhone")) {
      return "Mobile";
    }
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Other";
  };

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return <Monitor className="h-3 w-3 text-muted-foreground" />;
    
    if (userAgent.includes("Mobile") || userAgent.includes("Android") || userAgent.includes("iPhone")) {
      return <Smartphone className="h-3 w-3 text-muted-foreground" />;
    }
    return <Monitor className="h-3 w-3 text-muted-foreground" />;
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return `Today at ${format(date, "HH:mm")}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, "HH:mm")}`;
    } else {
      return format(date, "MMM dd, yyyy 'at' HH:mm");
    }
  };

  return (
    <AdminShell
      title="Audit Logs"
      subtitle="Advanced security monitoring and activity tracking"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              onClick={exportLogs}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              onClick={handleClearLogs}
              variant="outline"
              size="sm"
              className="text-blue-600 hover:text-blue-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Logs
            </Button>
          </div>
          
          <Button
            onClick={handleLogout}
            variant="destructive"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Power className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Active Sessions Card */}
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-[#262626]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="h-5 w-5 text-[#2563eb]" />
                  Active Sessions
                  <Badge variant="outline" className="ml-2 bg-[#2563eb]/20 text-[#2563eb] border-[#2563eb]/30">
                    {activeSessions.length} online
                  </Badge>
                </CardTitle>
                <p className="text-white/60 text-sm mt-1">Currently logged in admin and staff members</p>
              </div>
              <Button
                onClick={loadActiveSessions}
                disabled={sessionsLoading}
                variant="outline"
                size="sm"
                className="border-[#262626] text-white hover:bg-[#262626]"
              >
                <RefreshCw className={`h-4 w-4 ${sessionsLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-[#2563eb]" />
              </div>
            ) : activeSessions.length === 0 ? (
              <div className="text-center py-8">
                <UserX className="h-12 w-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/60">No active sessions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-[#0a0a0a] border border-[#262626] hover:border-[#2563eb]/30 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Role Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        session.actor_role === "admin" 
                          ? "bg-[#2563eb]/20 border-2 border-[#2563eb]/30" 
                          : "bg-blue-500/20 border-2 border-blue-500/30"
                      }`}>
                        {session.actor_role === "admin" ? (
                          <Shield className="h-5 w-5 text-[#2563eb]" />
                        ) : (
                          <Users className="h-5 w-5 text-blue-400" />
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white">{session.actor_identifier}</span>
                          <Badge 
                            variant="outline" 
                            className={
                              session.actor_role === "admin"
                                ? "bg-[#2563eb]/20 text-[#2563eb] border-[#2563eb]/30"
                                : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            }
                          >
                            {session.actor_role}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="font-mono">{session.ip_address || "Unknown"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {getDeviceIcon(session.user_agent)}
                            <span>{parseUserAgent(session.user_agent)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{session.session_duration}m ago</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <Button
                        onClick={() => forceLogout(session)}
                        size="sm"
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Power className="h-4 w-4 mr-1" />
                        Force Logout
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Logs</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{stats.totalLogs}</div>
              <p className="text-xs text-blue-600 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Today</CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">{stats.todayLogs}</div>
              <p className="text-xs text-green-600 mt-1">Last 24h</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">Logins</CardTitle>
              <LogIn className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-800">{stats.loginCount}</div>
              <p className="text-xs text-emerald-600 mt-1">Successful</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Logouts</CardTitle>
              <LogOut className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-800">{stats.logoutCount}</div>
              <p className="text-xs text-orange-600 mt-1">Sessions ended</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Admin</CardTitle>
              <Shield className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{stats.adminSessions}</div>
              <p className="text-xs text-blue-600 mt-1">Sessions</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Staff</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{stats.staffSessions}</div>
              <p className="text-xs text-blue-600 mt-1">Sessions</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Unique IPs</CardTitle>
              <Globe className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800">{stats.uniqueIPs}</div>
              <p className="text-xs text-purple-600 mt-1">Locations</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">Security</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-800">{stats.securityEvents}</div>
              <p className="text-xs text-yellow-600 mt-1">Events</p>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Advanced Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users, IPs, details..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Event Type</label>
                <Select value={eventFilter} onValueChange={setEventFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="logout">Logout</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Time Period</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Results</label>
                <div className="flex items-center h-10 px-3 py-2 border border-input bg-background rounded-md">
                  <BarChart3 className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium">{filteredLogs.length} logs</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Logs Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Activity Log
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Comprehensive audit trail of all admin and staff activities
                </p>
              </div>
              <Badge variant="outline" className="text-sm">
                {filteredLogs.length} of {logs.length} logs
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mr-3 text-primary" />
                <span className="text-lg">Loading audit logs...</span>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No logs found</h3>
                <p className="text-sm text-muted-foreground">
                  {logs.length === 0 ? "No audit logs have been recorded yet." : "Try adjusting your filters to see more results."}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Event</TableHead>
                      <TableHead className="font-semibold">User</TableHead>
                      <TableHead className="font-semibold">Role</TableHead>
                      <TableHead className="font-semibold">Location</TableHead>
                      <TableHead className="font-semibold">Device</TableHead>
                      <TableHead className="font-semibold">Details</TableHead>
                      <TableHead className="font-semibold">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getEventIcon(log.event_type, log.severity)}
                            {getEventBadge(log.event_type, log.severity)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-foreground">{log.actor_identifier}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRoleIcon(log.actor_role)}
                            {getRoleBadge(log.actor_role)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="font-mono text-sm text-muted-foreground">
                              {log.ip_address || "Unknown"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(log.user_agent)}
                            <span className="text-sm text-muted-foreground">
                              {parseUserAgent(log.user_agent)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {log.details || "No additional details"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {formatRelativeTime(log.created_at)}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}