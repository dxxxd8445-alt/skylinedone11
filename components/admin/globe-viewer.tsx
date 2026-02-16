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

export function GlobeViewer({ visitors }: { visitors: Visitor[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 0.5, y: 0.5 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
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
      const radius = Math.min(width, height) / 2.5;

      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#0a0a0a');
      gradient.addColorStop(1, '#1a1a1a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw globe
      ctx.save();
      ctx.translate(centerX, centerY);

      // Draw rotating globe background
      const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      glowGradient.addColorStop(0, 'rgba(220, 38, 38, 0.1)');
      glowGradient.addColorStop(0.7, 'rgba(220, 38, 38, 0.05)');
      glowGradient.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(-radius - 20, -radius - 20, (radius + 20) * 2, (radius + 20) * 2);

      // Draw globe sphere
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw globe border
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw grid lines
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.1)';
      ctx.lineWidth = 1;

      // Latitude lines
      for (let lat = -80; lat <= 80; lat += 20) {
        const y = (lat / 90) * radius;
        const scale = Math.cos((lat * Math.PI) / 180);
        ctx.beginPath();
        ctx.ellipse(0, y, radius * scale, 5, 0, 0, Math.PI * 2);
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

      // Draw visitor markers
      visitors.forEach((visitor, index) => {
        if (!visitor.latitude || !visitor.longitude) return;

        // Convert lat/lon to canvas coordinates
        const lat = visitor.latitude;
        const lon = visitor.longitude;
        const adjustedLon = lon - rotation.y * 360;

        // Only draw if visible on current rotation
        if (Math.abs(adjustedLon) > 90) return;

        const x = (adjustedLon / 180) * radius;
        const y = (lat / 90) * radius;

        // Draw marker glow
        const markerGlow = ctx.createRadialGradient(x, y, 0, x, y, 15);
        markerGlow.addColorStop(0, 'rgba(34, 197, 94, 0.6)');
        markerGlow.addColorStop(1, 'rgba(34, 197, 94, 0)');
        ctx.fillStyle = markerGlow;
        ctx.fillRect(x - 15, y - 15, 30, 30);

        // Draw marker dot
        ctx.fillStyle = visitor.is_active ? '#22c55e' : '#9ca3af';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Draw marker border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.stroke();

        // Draw pulse animation for active visitors
        if (visitor.is_active) {
          const pulse = (Math.sin(Date.now() / 500 + index) + 1) / 2;
          ctx.strokeStyle = `rgba(34, 197, 94, ${0.5 - pulse * 0.3})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, 8 + pulse * 5, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      ctx.restore();

      // Draw stats
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`Active Visitors: ${visitors.filter(v => v.is_active).length}`, 20, 30);
      ctx.fillText(`Total Visitors: ${visitors.length}`, 20, 50);

      // Draw rotation hint
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '12px sans-serif';
      ctx.fillText('Drag to rotate • Scroll to zoom', 20, height - 20);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [visitors, rotation]);

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
        <h2 className="text-2xl font-bold text-white mb-4">🌍 Live Visitor Globe</h2>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full border border-[#1a1a1a] rounded-lg cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0a0a0a] p-3 rounded border border-[#1a1a1a]">
            <p className="text-white/60 text-sm">Active Now</p>
            <p className="text-2xl font-bold text-green-500">
              {visitors.filter(v => v.is_active).length}
            </p>
          </div>
          <div className="bg-[#0a0a0a] p-3 rounded border border-[#1a1a1a]">
            <p className="text-white/60 text-sm">Total Visitors</p>
            <p className="text-2xl font-bold text-white">{visitors.length}</p>
          </div>
          <div className="bg-[#0a0a0a] p-3 rounded border border-[#1a1a1a]">
            <p className="text-white/60 text-sm">Countries</p>
            <p className="text-2xl font-bold text-gray-500">
              {new Set(visitors.map(v => v.country)).size}
            </p>
          </div>
          <div className="bg-[#0a0a0a] p-3 rounded border border-[#1a1a1a]">
            <p className="text-white/60 text-sm">Cities</p>
            <p className="text-2xl font-bold text-purple-500">
              {new Set(visitors.map(v => v.city)).size}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
