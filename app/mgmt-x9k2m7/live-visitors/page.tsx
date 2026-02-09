"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Activity,
  RefreshCw,
  Zap,
  Globe,
  ExternalLink,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LiveVisitorsPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Refresh the iframe
  const refreshClicky = () => {
    const iframe = document.getElementById('clicky-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
      setLastRefresh(new Date());
    }
  };

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshClicky();
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return (
    <AdminShell title="Live Visitors" subtitle="Real-time visitor tracking powered by Clicky">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Live Visitors</h1>
            <p className="text-white/60 mt-1">Real-time analytics powered by Clicky Web Analytics</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={cn(
                "transition-all",
                autoRefresh
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-[#1a1a1a] hover:bg-[#262626]"
              )}
            >
              <Zap className="w-4 h-4 mr-2" />
              {autoRefresh ? "Auto-Refresh On" : "Auto-Refresh Off"}
            </Button>
            <Button
              onClick={refreshClicky}
              className="bg-[#2563eb] hover:bg-[#3b82f6] text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Now
            </Button>
            <Button
              onClick={() => window.open('https://clicky.com/101500977', '_blank')}
              className="bg-[#1a1a1a] hover:bg-[#262626] text-white border border-[#2563eb]/30"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Full Dashboard
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Live Tracking</p>
                  <p className="text-2xl font-bold text-white mt-2">Active</p>
                </div>
                <div className="p-3 rounded-xl bg-[#2563eb]/10">
                  <Users className="w-6 h-6 text-[#2563eb] animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Analytics</p>
                  <p className="text-2xl font-bold text-white mt-2">Clicky</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <Globe className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Real-Time</p>
                  <p className="text-2xl font-bold text-white mt-2">Live</p>
                </div>
                <div className="p-3 rounded-xl bg-green-500/10">
                  <Activity className="w-6 h-6 text-green-400 animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Last Update</p>
                  <p className="text-sm font-bold text-white mt-2">
                    {lastRefresh.toLocaleTimeString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <Card className="bg-gradient-to-r from-[#2563eb]/10 to-transparent border-[#2563eb]/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#2563eb]/20">
                <BarChart3 className="w-5 h-5 text-[#2563eb]" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">Clicky Web Analytics Integration</h3>
                <p className="text-white/60 text-sm">
                  This page displays real-time visitor data from Clicky. The dashboard shows live visitors, 
                  page views, locations, and more. Data refreshes automatically every 30 seconds.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clicky Dashboard Embed */}
        <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#2563eb]" />
              Live Visitor Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative w-full" style={{ height: '800px' }}>
              <iframe
                id="clicky-iframe"
                src="https://clicky.com/stats/wp-iframe?site_id=101500977&sitekey=&type=pages-live&date=today"
                className="w-full h-full border-0 rounded-b-lg"
                title="Clicky Live Visitors"
                loading="lazy"
              />
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
          <CardHeader>
            <CardTitle className="text-white text-sm">About Clicky Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-white/60">
              <p>
                <strong className="text-white">Site ID:</strong> 101500977
              </p>
              <p>
                <strong className="text-white">Features:</strong> Real-time visitor tracking, 
                heatmaps, individual visitor sessions, goal tracking, and detailed analytics.
              </p>
              <p>
                <strong className="text-white">Privacy:</strong> Clicky is GDPR compliant and 
                respects visitor privacy while providing detailed analytics.
              </p>
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => window.open('https://clicky.com/101500977', '_blank')}
                  size="sm"
                  className="bg-[#2563eb] hover:bg-[#3b82f6] text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Full Dashboard
                </Button>
                <Button
                  onClick={() => window.open('https://clicky.com/help', '_blank')}
                  size="sm"
                  variant="outline"
                  className="border-[#1a1a1a] hover:bg-[#1a1a1a]"
                >
                  View Documentation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
