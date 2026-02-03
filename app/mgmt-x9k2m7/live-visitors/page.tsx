"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  MapPin,
  Activity,
  RefreshCw,
  Search,
  Eye,
  Clock,
  Zap,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const Globe3D = dynamic(() => import("@/components/admin/globe-3d"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-[#0a0a0a] rounded-lg flex items-center justify-center">
      <p className="text-white/40">Loading globe...</p>
    </div>
  ),
});

interface Visitor {
  id: string;
  ip: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  page: string;
  timestamp: string;
  userAgent: string;
  referer: string;
}

interface LocationStats {
  country: string;
  city: string;
  count: number;
  latitude: number;
  longitude: number;
}

export default function LiveVisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [locationStats, setLocationStats] = useState<LocationStats[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch live visitors
  const loadVisitors = async () => {
    try {
      const response = await fetch("/api/analytics/realtime");
      if (response.ok) {
        const data = await response.json();
        setVisitors(data.visitors || []);
        
        // Calculate location stats
        const stats: Record<string, LocationStats> = {};
        (data.visitors || []).forEach((visitor: Visitor) => {
          const key = `${visitor.country}-${visitor.city}`;
          if (!stats[key]) {
            stats[key] = {
              country: visitor.country,
              city: visitor.city,
              count: 0,
              latitude: visitor.latitude,
              longitude: visitor.longitude,
            };
          }
          stats[key].count++;
        });
        setLocationStats(Object.values(stats));
      }
    } catch (error) {
      console.error("Failed to load visitors:", error);
    }
  };

  useEffect(() => {
    loadVisitors();
    
    if (autoRefresh) {
      const interval = setInterval(loadVisitors, 3000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const filteredVisitors = visitors.filter(
    (v) =>
      v.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.ip.includes(searchTerm)
  );

  const topLocations = locationStats.sort((a, b) => b.count - a.count).slice(0, 5);
  const totalVisitors = visitors.length;
  const uniqueCountries = new Set(visitors.map((v) => v.country)).size;
  const avgSessionDuration = Math.floor(Math.random() * 300) + 60; // Mock data

  return (
    <AdminShell title="Live Visitors" subtitle="Real-time visitor tracking with geolocation">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Live Visitors</h1>
            <p className="text-white/60 mt-1">Real-time global visitor tracking</p>
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
              {autoRefresh ? "Live" : "Paused"}
            </Button>
            <Button
              onClick={loadVisitors}
              className="bg-[#dc2626] hover:bg-[#ef4444] text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Visitors Now</p>
                  <p className="text-3xl font-bold text-white mt-2">{totalVisitors}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#dc2626]/10">
                  <Users className="w-6 h-6 text-[#dc2626] animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Countries</p>
                  <p className="text-3xl font-bold text-white mt-2">{uniqueCountries}</p>
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
                  <p className="text-white/60 text-sm">Avg Duration</p>
                  <p className="text-3xl font-bold text-white mt-2">{avgSessionDuration}s</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Activity</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {totalVisitors > 0 ? "High" : "Low"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-green-500/10">
                  <Activity className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Globe */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#dc2626]" />
                  Global Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Globe3D visitors={locationStats} />
              </CardContent>
            </Card>
          </div>

          {/* Top Locations */}
          <div>
            <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#dc2626]" />
                  Top Locations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topLocations.length > 0 ? (
                  topLocations.map((location, idx) => (
                    <div
                      key={`${location.country}-${location.city}`}
                      className="p-3 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#dc2626]/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-white font-semibold text-sm">
                            {location.city}, {location.country}
                          </p>
                          <p className="text-white/40 text-xs">
                            {location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#dc2626] font-bold text-lg">{location.count}</p>
                          <p className="text-white/40 text-xs">visitors</p>
                        </div>
                      </div>
                      <div className="w-full bg-[#1a1a1a] rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-[#dc2626] to-[#ef4444] h-1.5 rounded-full transition-all"
                          style={{
                            width: `${(location.count / Math.max(...topLocations.map((l) => l.count), 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-white/40 text-center py-8">No visitors yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Live Feed */}
        <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#dc2626]" />
                Live Feed
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  placeholder="Search location or IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-[#0a0a0a] border-[#1a1a1a] text-white"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredVisitors.length > 0 ? (
                filteredVisitors.map((visitor, index) => (
                  <div
                    key={visitor.id}
                    className="p-3 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#dc2626]/30 transition-all animate-in fade-in slide-in-from-top-2"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <p className="text-white font-semibold text-sm">
                            {visitor.city}, {visitor.country}
                          </p>
                          <span className="text-white/40 text-xs">•</span>
                          <p className="text-white/60 text-xs font-mono">{visitor.ip}</p>
                        </div>
                        <p className="text-white/40 text-xs">
                          {visitor.page} • {new Date(visitor.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#dc2626] text-xs font-semibold">
                          {visitor.latitude.toFixed(2)}°N
                        </p>
                        <p className="text-[#dc2626] text-xs font-semibold">
                          {visitor.longitude.toFixed(2)}°E
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-white/40 text-center py-8">No visitors matching search</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
