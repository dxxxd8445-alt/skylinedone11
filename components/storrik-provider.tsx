"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    storrik?: {
      configure: (config: { pk: string }) => void;
      pay: (
        productId: string,
        variantId?: string,
        options?: {
          style?: "compact" | "normal" | "expanded";
          colors?: {
            overlay?: string;
            background?: string;
            surface?: string;
            surfaceElevated?: string;
            border?: string;
            text?: string;
            muted?: string;
            primary?: string;
            buttonText?: string;
            success?: string;
            warning?: string;
            danger?: string;
          };
        }
      ) => Promise<void>;
    };
  }
}

export function StorrikProvider() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Fetch Storrik API key from settings
    async function loadStorrikKey() {
      try {
        console.log("[Storrik] Fetching API key from settings...");
        const response = await fetch("/api/settings/storrik-key");
        if (response.ok) {
          const data = await response.json();
          console.log("[Storrik] API key loaded:", data.apiKey ? "Yes" : "No");
          if (data.apiKey) {
            setApiKey(data.apiKey);
          } else {
            console.warn("[Storrik] No API key configured in settings");
          }
        } else {
          console.error("[Storrik] Failed to fetch API key:", response.status);
        }
      } catch (error) {
        console.error("[Storrik] Failed to load API key:", error);
      }
    }

    loadStorrikKey();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!apiKey) return;
    if (isConfigured) return;

    // Wait for Storrik script to load
    const checkStorrik = setInterval(() => {
      if (window.storrik) {
        console.log("[Storrik] Configuring with API key:", apiKey.substring(0, 10) + "...");
        try {
          window.storrik.configure({
            pk: apiKey,
          });
          setIsConfigured(true);
          console.log("[Storrik] ✅ Successfully configured!");
          clearInterval(checkStorrik);
        } catch (error) {
          console.error("[Storrik] Configuration error:", error);
          clearInterval(checkStorrik);
        }
      }
    }, 100);

    // Stop checking after 10 seconds
    setTimeout(() => {
      clearInterval(checkStorrik);
      if (!isConfigured) {
        console.error("[Storrik] Failed to configure - script may not have loaded");
      }
    }, 10000);

    return () => clearInterval(checkStorrik);
  }, [apiKey, isConfigured]);

  return null;
}
