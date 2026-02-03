'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';

interface Visitor {
  id: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  device_type: string;
  browser: string;
  is_active: boolean;
}

// Simplified world map data - major countries and coastlines
const WORLD_MAP_DATA = {
  countries: [
    // North America
    { name: 'USA', points: [[[-125, 49], [-125, 25], [-66, 25], [-66, 49], [-125, 49]]] },
    { name: 'Canada', points: [[[-141, 60], [-141, 83], [-52, 83], [-52, 60], [-141, 60]]] },
    { name: 'Mexico', points: [[[-117, 32], [-117, 14], [-87, 14], [-87, 32], [-117, 32]]] },
    
    // South America
    { name: 'Brazil', points: [[[-74, 5], [-74, -33], [-35, -33], [-35, 5], [-74, 5]]] },
    { name: 'Argentina', points: [[[-76, -22], [-76, -56], [-53, -56], [-53, -22], [-76, -22]]] },
    
    // Europe
    { name: 'Russia', points: [[[20, 70], [20, 41], [169, 41], [169, 70], [20, 70]]] },
    { name: 'Europe', points: [[[-10, 70], [-10, 35], [40, 35], [40, 70], [-10, 70]]] },
    { name: 'UK', points: [[[-8, 59], [-8, 50], [2, 50], [2, 59], [-8, 59]]] },
    
    // Africa
    { name: 'Africa', points: [[[20, 37], [20, -35], [55, -35], [55, 37], [20, 37]]] },
    
    // Asia
    { name: 'China', points: [[[73, 54], [73, 18], [135, 18], [135, 54], [73, 54]]] },
    { name: 'India', points: [[[68, 35], [68, 8], [97, 8], [97, 35], [68, 35]]] },
    { name: 'Japan', points: [[[130, 45], [130, 30], [145, 30], [145, 45], [130, 45]]] },
    { name: 'Australia', points: [[[113, -10], [113, -44], [154, -44], [154, -10], [113, -10]]] },
  ],
  
  coastlines: [
    // US East Coast
    [[-75, 40], [-74, 38], [-73, 36], [-72, 34], [-71, 32], [-70, 30]],
    // US West Coast
    [[-125, 49], [-124, 47], [-123, 45], [-122, 43], [-121, 41], [-120, 39]],
    // Europe
    [[-10, 60], [-5, 58], [0, 56], [5, 54], [10, 52], [15, 50]],
    // Africa
    [[20, 35], [25, 33], [30, 31], [35, 29], [40, 27]],
  ]
};

export function GlobeViewerMaps({ visitors }: { visitors: Visitor[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 0.5, y: 0.5 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = 600;
    }

    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2.5 * zoom;

      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#0a0a0a');
      gradient.addColorStop(0.5, '#1a1a1a');
      gradient.addColorStop(1, '#0a0a0a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw stars in background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 1.5;
        ctx.fillRect(x, y, size, size);
      }

      // Draw globe
      ctx.save();
      ctx.translate(centerX, centerY);

      // Draw rotating globe background glow
      const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius + 30);
      glowGradient.addColorStop(0, 'rgba(220, 38, 38, 0.15)');
      glowGradient.addColorStop(0.7, 'rgba(220, 38, 38, 0.05)');
      glowGradient.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(0, 0, radius + 30, 0, Math.PI * 2);
      ctx.fill();

      // Draw globe sphere background
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw ocean
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw continents
      ctx.fillStyle = '#166534';
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 1;

      WORLD_MAP_DATA.countries.forEach(country => {
        country.points.forEach(polygon => {
          ctx.beginPath();
          let firstPoint = true;
          polygon.forEach(([lon, lat]) => {
            const adjustedLon = lon - rotation.y * 360;
            const x = (adjustedLon / 180) * radius;
            const y = (lat / 90) * radius;

            if (firstPoint) {
              ctx.moveTo(x, y);
              firstPoint = false;
            } else {
              ctx.lineTo(x, y);
            }
          });
          ctx.fill();
          ctx.stroke();
        });
      });

      // Draw coastlines
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
      ctx.lineWidth = 0.5;
      WORLD_MAP_DATA.coastlines.forEach(line => {
        ctx.beginPath();
        let firstPoint = true;
        line.forEach(([lon, lat]) => {
          const adjustedLon = lon - rotation.y * 360;
          const x = (adjustedLon / 180) * radius;
          const y = (lat / 90) * radius;

          if (firstPoint) {
            ctx.moveTo(x, y);
            firstPoint = false;
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      });

      // Draw grid lines
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.08)';
      ctx.lineWidth = 0.5;

      // Latitude lines
      for (let lat = -80; lat <= 80; lat += 20) {
        const y = (lat / 90) * radius;
        const scale = Math.cos((lat * Math.PI) / 180);
        ctx.beginPath();
        ctx.ellipse(0, y, radius * scale, 3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Longitude lines
      for (let lon = -180; lon <= 180; lon += 30) {
        const angle = ((lon - rotation.y * 360) * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * radius, -radius);
        ctx.lineTo(Math.cos(angle) * radius, radius);
        ctx.stroke();
      }

      // Draw visitor markers with enhanced styling
      visitors.forEach((visitor, index) => {
        if (!visitor.latitude || !visitor.longitude) return;

        const lat = visitor.latitude;
        const lon = visitor.longitude;
        const adjustedLon = lon - rotation.y * 360;

        // Only draw if visible on current rotation
        if (Math.abs(adjustedLon) > 90) return;

        const x = (adjustedLon / 180) * radius;
        const y = (lat / 90) * radius;

        // Draw marker glow - larger and more vibrant
        const markerGlow = ctx.createRadialGradient(x, y, 0, x, y, 20);
        markerGlow.addColorStop(0, visitor.is_active ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.6)');
        markerGlow.addColorStop(0.5, visitor.is_active ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.2)');
        markerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = markerGlow;
        ctx.fillRect(x - 20, y - 20, 40, 40);

        // Draw marker dot
        ctx.fillStyle = visitor.is_active ? '#22c55e' : '#ef4444';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();

        // Draw marker border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.stroke();

        // Draw inner circle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw pulse animation for active visitors
        if (visitor.is_active) {
          const pulse = (Math.sin(Date.now() / 500 + index) + 1) / 2;
          ctx.strokeStyle = `rgba(34, 197, 94, ${0.6 - pulse * 0.4})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, 10 + pulse * 8, 0, Math.PI * 2);
          ctx.stroke();

          // Second pulse ring
          ctx.strokeStyle = `rgba(34, 197, 94, ${0.3 - pulse * 0.2})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, 16 + pulse * 10, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      ctx.restore();

      // Draw stats panel
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, 280, 80);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 10, 280, 80);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`🌍 Active Visitors: ${visitors.filter(v => v.is_active).length}`, 20, 30);
      ctx.fillText(`👥 Total Visitors: ${visitors.length}`, 20, 50);
      ctx.fillText(`🌐 Countries: ${new Set(visitors.map(v => v.country)).size}`, 20, 70);

      // Draw rotation hint
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '11px sans-serif';
      ctx.fillText('Drag to rotate • Scroll to zoom', 20, height - 20);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom(prev => Math.max(0.5, Math.min(2, prev + (e.deltaY > 0 ? -0.1 : 0.1))));
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [visitors, rotation, zoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = (e.clientX - dragStart.x) * 0.005;
    const deltaY = (e.clientY - dragStart.y) * 0.005;

    setRotation(prev => ({
      x: Math.max(-1, Math.min(1, prev.x + deltaY)),
      y: (prev.y + deltaX) % 1
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a] overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-2">🌍 Live Visitor Globe</h2>
        <p className="text-white/60 text-sm mb-4">Real-time geolocation tracking with interactive world map</p>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full border border-[#1a1a1a] rounded-lg cursor-grab active:cursor-grabbing bg-black"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] p-4 rounded border border-[#dc2626]/20 hover:border-[#dc2626]/50 transition-all">
            <p className="text-white/60 text-sm">🟢 Active Now</p>
            <p className="text-3xl font-bold text-green-500 mt-1">
              {visitors.filter(v => v.is_active).length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] p-4 rounded border border-[#dc2626]/20 hover:border-[#dc2626]/50 transition-all">
            <p className="text-white/60 text-sm">👥 Total Visitors</p>
            <p className="text-3xl font-bold text-white mt-1">{visitors.length}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] p-4 rounded border border-[#dc2626]/20 hover:border-[#dc2626]/50 transition-all">
            <p className="text-white/60 text-sm">🌐 Countries</p>
            <p className="text-3xl font-bold text-blue-500 mt-1">
              {new Set(visitors.map(v => v.country)).size}
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] p-4 rounded border border-[#dc2626]/20 hover:border-[#dc2626]/50 transition-all">
            <p className="text-white/60 text-sm">🏙️ Cities</p>
            <p className="text-3xl font-bold text-purple-500 mt-1">
              {new Set(visitors.map(v => v.city)).size}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
