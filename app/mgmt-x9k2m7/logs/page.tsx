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
  Activity,
  RefreshCw,
  LogIn,
  LogOut,
  Shield,
  Users,
  Calendar,
  MapPin,
  Monitor,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface AuditLog {
  id: string;
  event_type: "login" | "logout";
  actor_role: "admin" | "staff";
  actor_identifier: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export default function LogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

      setLogs(data.logs || []);
    } catch (error: any) {
      console.error("Failed to load logs:", error);
      
      // If it's a table not found error, show helpful message
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "login":
        return <LogIn className="h-4 w-4 text-green-500" />;
      case "logout":
        return <LogOut className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4 text-red-500" />;
      case "staff":
        return <Users className="h-4 w-4 text-blue-500" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getEventBadge = (eventType: string) => {
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
      default:
        return <Badge variant="outline">{eventType}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50">
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
    
    // Simple user agent parsing
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Other";
  };

  return (
    <AdminShell
      title="Audit Logs"
      subtitle="Track admin and staff login activity"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logs.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Logins</CardTitle>
              <LogIn className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {logs.filter(log => log.event_type === "login").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Sessions</CardTitle>
              <Shield className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {logs.filter(log => log.actor_role === "admin").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staff Sessions</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {logs.filter(log => log.actor_role === "staff").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Login and logout events for admin and staff users
                </p>
              </div>
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                Loading logs...
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No audit logs found
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Browser</TableHead>
                      <TableHead>Date & Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getEventIcon(log.event_type)}
                            {getEventBadge(log.event_type)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{log.actor_identifier}</div>
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
                            <span className="font-mono text-sm">
                              {log.ip_address || "Unknown"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Monitor className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {parseUserAgent(log.user_agent)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {format(new Date(log.created_at), "MMM dd, yyyy 'at' HH:mm:ss")}
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