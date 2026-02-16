"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, MapPin, Monitor } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SecurityLog {
  id: string;
  event_type: string;
  ip_address: string;
  user_agent: string;
  details: string;
  severity: string;
  created_at: string;
}

export default function SecurityPage() {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadSecurityLogs();
  }, []);

  async function loadSecurityLogs() {
    try {
      setLoading(true);
      const supabase = createClient();
      
      let query = supabase
        .from("security_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (filter !== "all") {
        query = query.eq("severity", filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Failed to load security logs:", error);
    } finally {
      setLoading(false);
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-400 bg-red-500/10 border-red-500/20";
      case "high": return "text-orange-400 bg-orange-500/10 border-orange-500/20";
      case "medium": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "low": return "text-gray-400 bg-gray-500/10 border-gray-500/20";
      default: return "text-white/60 bg-white/5 border-white/10";
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "login_success": return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "login_failed": return <XCircle className="w-4 h-4 text-red-400" />;
      case "lockout": return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case "password_change": return <Shield className="w-4 h-4 text-gray-400" />;
      case "suspicious_activity": return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-white/40" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <AdminShell title="Security Logs" subtitle="Monitor admin access and security events">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-500/10 border border-gray-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-white/60 text-xs">Total Events</p>
                <p className="text-white text-xl font-bold">{logs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-white/60 text-xs">Critical</p>
                <p className="text-white text-xl font-bold">
                  {logs.filter(l => l.severity === "critical").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-white/60 text-xs">Successful Logins</p>
                <p className="text-white text-xl font-bold">
                  {logs.filter(l => l.event_type === "login_success").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-white/60 text-xs">Failed Attempts</p>
                <p className="text-white text-xl font-bold">
                  {logs.filter(l => l.event_type === "login_failed").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          {["all", "critical", "high", "medium", "low"].map((severity) => (
            <button
              key={severity}
              onClick={() => {
                setFilter(severity);
                loadSecurityLogs();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === severity
                  ? "bg-[#6b7280] text-white"
                  : "bg-[#1a1a1a] text-white/60 hover:bg-[#262626]"
              }`}
            >
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </button>
          ))}
        </div>

        {/* Security Logs Table */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#111111] border-b border-[#1a1a1a]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase">Event</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase">IP Address</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase">Details</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase">Severity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-[#6b7280] border-t-transparent rounded-full animate-spin" />
                        <span className="text-white/60">Loading security logs...</span>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-white/40">
                      No security logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#111111] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getEventIcon(log.event_type)}
                          <span className="text-white text-sm font-medium">
                            {log.event_type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-white/40" />
                          <span className="text-white/80 text-sm font-mono">{log.ip_address}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-md">
                          <p className="text-white/80 text-sm truncate">{log.details}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Monitor className="w-3 h-3 text-white/40" />
                            <p className="text-white/40 text-xs truncate">{log.user_agent}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold border ${getSeverityColor(log.severity)}`}>
                          {log.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-white/40" />
                          <span className="text-white/60 text-sm">{formatDate(log.created_at)}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Tips */}
        <div className="bg-gray-500/10 border border-gray-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-gray-400 font-semibold mb-1">Security Best Practices</h3>
              <ul className="text-gray-400/80 text-sm space-y-1">
                <li>• Monitor failed login attempts regularly</li>
                <li>• Change your admin password every 30 days</li>
                <li>• Use a strong password with 12+ characters</li>
                <li>• Review security logs for suspicious activity</li>
                <li>• Enable 2FA when available</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
