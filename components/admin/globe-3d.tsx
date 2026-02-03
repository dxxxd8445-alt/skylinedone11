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
