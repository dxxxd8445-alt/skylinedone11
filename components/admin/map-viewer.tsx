"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LocationStat {
  country: string;
  city: string;
  count: number;
  latitude: number;
  longitude: number;
}

interface MapViewerProps {
  visitors: LocationStat[];
}

export default function MapViewer({ visitors }: MapViewerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    // Initialize map only once
    if (!mapRef.current) {
      mapRef.current = L.map("map", {
        center: [20, 0],
        zoom: 2,
        zoomControl: true,
        attributionControl: true,
      });

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);

      // Custom styles for the map
      const style = document.createElement("style");
      style.textContent = `
        #map {
          background-color: #0a0a0a;
          border-radius: 0.5rem;
        }
        .leaflet-container {
          background-color: #0a0a0a;
          border-radius: 0.5rem;
        }
        .leaflet-control-attribution {
          background-color: rgba(10, 10, 10, 0.8) !important;
          color: rgba(255, 255, 255, 0.6) !important;
        }
        .leaflet-control-zoom {
          border: 1px solid #1a1a1a !important;
          border-radius: 0.375rem !important;
        }
        .leaflet-control-zoom a {
          background-color: #1a1a1a !important;
          color: #2563eb !important;
          border-bottom: 1px solid #1a1a1a !important;
        }
        .leaflet-control-zoom a:hover {
          background-color: #262626 !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers for each visitor location
    if (mapRef.current && visitors.length > 0) {
      visitors.forEach((location) => {
        // Create custom icon
        const iconSize = Math.min(Math.max(location.count * 8, 20), 50);
        const customIcon = L.divIcon({
          html: `
            <div style="
              width: ${iconSize}px;
              height: ${iconSize}px;
              background: radial-gradient(circle, rgba(220, 38, 38, 0.8) 0%, rgba(220, 38, 38, 0.4) 70%, rgba(220, 38, 38, 0) 100%);
              border: 2px solid #2563eb;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              font-weight: bold;
              color: white;
              box-shadow: 0 0 20px rgba(220, 38, 38, 0.6);
            ">
              ${location.count}
            </div>
          `,
          iconSize: [iconSize, iconSize],
          className: "custom-marker",
        });

        const marker = L.marker([location.latitude, location.longitude], {
          icon: customIcon,
        })
          .bindPopup(
            `
            <div style="background-color: #0a0a0a; color: white; padding: 8px; border-radius: 4px; border: 1px solid #1a1a1a;">
              <strong>${location.city}, ${location.country}</strong><br/>
              <small>Visitors: ${location.count}</small><br/>
              <small>${location.latitude.toFixed(2)}°, ${location.longitude.toFixed(2)}°</small>
            </div>
          `,
            {
              className: "custom-popup",
            }
          )
          .addTo(mapRef.current);

        markersRef.current.push(marker);
      });

      // Auto-fit bounds if there are markers
      if (markersRef.current.length > 0) {
        const group = new L.FeatureGroup(markersRef.current);
        mapRef.current.fitBounds(group.getBounds().pad(0.1), {
          maxZoom: 6,
          animate: true,
        });
      }
    }
  }, [visitors]);

  return (
    <div
      id="map"
      style={{
        width: "100%",
        height: "400px",
        borderRadius: "0.5rem",
        backgroundColor: "#0a0a0a",
      }}
    />
  );
}
