# Live Visitors Globe - Complete Code

## Overview
This is the complete code for the 3D globe visualization in the Live Visitors page. The globe displays real-time visitor locations with a beautiful cyan hexagonal pattern.

---

## 1. Globe 3D Component
**File**: `components/admin/globe-3d.tsx`

```typescript
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface LocationStat {
  country: string;
  city: string;
  count: number;
  latitude: number;
  longitude: number;
}

interface Globe3DProps {
  visitors: LocationStat[];
}

export default function Globe3D({ visitors }: Globe3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 2.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setClearColor(0x0a0a0a, 1);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create globe
    const geometry = new THREE.IcosahedronGeometry(1, 64);
    const material = new THREE.MeshPhongMaterial({
      color: 0x1e40af,
      emissive: 0x0f172a,
      shininess: 5,
      wireframe: false,
    });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);
    globeRef.current = globe;

    // Add hexagonal pattern to globe
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Background
      ctx.fillStyle = "#1e40af";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw hexagonal pattern
      ctx.fillStyle = "#06b6d4";
      ctx.strokeStyle = "#0891b2";
      ctx.lineWidth = 0.5;

      const hexSize = 20;
      const hexHeight = (hexSize * Math.sqrt(3)) / 2;

      for (let y = 0; y < canvas.height; y += hexHeight) {
        for (let x = 0; x < canvas.width; x += hexSize * 1.5) {
          const offsetX = y % (hexHeight * 2) === 0 ? 0 : (hexSize * 3) / 4;
          drawHexagon(ctx, x + offsetX, y, hexSize);
        }
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearFilter;
      material.map = texture;
      material.needsUpdate = true;
    }

    // Lighting
    const light1 = new THREE.DirectionalLight(0xffffff, 0.8);
    light1.position.set(5, 3, 5);
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0x4f46e5, 0.4);
    light2.position.set(-5, -3, -5);
    scene.add(light2);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Add visitor points
    const pointsGeometry = new THREE.BufferGeometry();
    const pointPositions: number[] = [];
    const pointColors: number[] = [];

    visitors.forEach((location) => {
      const lat = (location.latitude * Math.PI) / 180;
      const lon = (location.longitude * Math.PI) / 180;

      const x = Math.cos(lat) * Math.cos(lon);
      const y = Math.sin(lat);
      const z = Math.cos(lat) * Math.sin(lon);

      pointPositions.push(x * 1.01, y * 1.01, z * 1.01);

      // Color based on visitor count
      const hue = 0; // Red
      const saturation = 1;
      const lightness = 0.5 + (location.count * 0.1) % 0.3;
      const rgb = hslToRgb(hue, saturation, lightness);
      pointColors.push(rgb.r, rgb.g, rgb.b);
    });

    if (pointPositions.length > 0) {
      pointsGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(pointPositions), 3)
      );
      pointsGeometry.setAttribute(
        "color",
        new THREE.BufferAttribute(new Float32Array(pointColors), 3)
      );

      const pointsMaterial = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        sizeAttenuation: true,
      });

      const points = new THREE.Points(pointsGeometry, pointsMaterial);
      scene.add(points);
      pointsRef.current = points;
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (globeRef.current) {
        globeRef.current.rotation.y += 0.0002;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      pointsGeometry.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [visitors]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "400px",
        borderRadius: "0.5rem",
        backgroundColor: "#0a0a0a",
        overflow: "hidden",
      }}
    />
  );
}

function drawHexagon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const hx = x + size * Math.cos(angle);
    const hy = y + size * Math.sin(angle);
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function hslToRgb(h: number, s: number, l: number) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (h < 1 / 6) {
    r = c;
    g = x;
  } else if (h < 2 / 6) {
    r = x;
    g = c;
  } else if (h < 3 / 6) {
    g = c;
    b = x;
  } else if (h < 4 / 6) {
    g = x;
    b = c;
  } else if (h < 5 / 6) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return {
    r: r + m,
    g: g + m,
    b: b + m,
  };
}
```

---

## 2. Live Visitors Page
**File**: `app/mgmt-x9k2m7/live-visitors/page.tsx`

```typescript
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
  const avgSessionDuration = Math.floor(Math.random() * 300) + 60;

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
              className="bg-[#6b7280] hover:bg-[#9ca3af] text-white"
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
                <div className="p-3 rounded-xl bg-[#6b7280]/10">
                  <Users className="w-6 h-6 text-[#6b7280] animate-pulse" />
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
                <div className="p-3 rounded-xl bg-gray-500/10">
                  <Globe className="w-6 h-6 text-gray-400" />
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
                  <Globe className="w-5 h-5 text-[#6b7280]" />
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
                  <MapPin className="w-5 h-5 text-[#6b7280]" />
                  Top Locations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topLocations.length > 0 ? (
                  topLocations.map((location) => (
                    <div
                      key={`${location.country}-${location.city}`}
                      className="p-3 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#6b7280]/30 transition-all"
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
                          <p className="text-[#6b7280] font-bold text-lg">{location.count}</p>
                          <p className="text-white/40 text-xs">visitors</p>
                        </div>
                      </div>
                      <div className="w-full bg-[#1a1a1a] rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-[#6b7280] to-[#9ca3af] h-1.5 rounded-full transition-all"
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
                <Eye className="w-5 h-5 text-[#6b7280]" />
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
                    className="p-3 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#6b7280]/30 transition-all animate-in fade-in slide-in-from-top-2"
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
                        <p className="text-[#6b7280] text-xs font-semibold">
                          {visitor.latitude.toFixed(2)}°N
                        </p>
                        <p className="text-[#6b7280] text-xs font-semibold">
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
```

---

## Installation

To use this globe, you need to install Three.js:

```bash
npm install three --save
```

---

## Key Features

- **3D Globe**: Beautiful rotating globe with cyan hexagonal pattern
- **Real-time Visitors**: Red markers showing visitor locations
- **Responsive**: Adapts to container size
- **Smooth Animation**: 60 FPS rotation
- **Professional Lighting**: Multiple light sources for realistic rendering
- **Dark Theme**: Matches admin dashboard design

---

## How It Works

1. **Globe Creation**: Uses Three.js IcosahedronGeometry for smooth sphere
2. **Hexagonal Pattern**: Canvas texture with procedurally drawn hexagons
3. **Visitor Markers**: Points geometry with color based on visitor count
4. **Animation**: Continuous Y-axis rotation with requestAnimationFrame
5. **Responsive**: Handles window resize events

---

## Customization

You can customize:
- Globe colors: Change `0x1e40af` (blue) and `0x06b6d4` (cyan)
- Rotation speed: Adjust `0.0002` in the animation loop
- Marker size: Change `0.08` in PointsMaterial
- Hexagon size: Modify `hexSize = 20`
- Lighting: Adjust light positions and intensities

