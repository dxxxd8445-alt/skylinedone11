"use client";

import { useEffect } from 'react';

export function TawkToChat() {
  useEffect(() => {
    // Simple check to prevent multiple loads
    if (typeof window === 'undefined' || window.Tawk_API) {
      return;
    }

    // Initialize Tawk.to
    window.Tawk_API = {};
    window.Tawk_LoadStart = new Date();

    // Create and load script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://embed.tawk.to/697e7d248885d11c394b3299/1jgb1hlrc';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    
    document.head.appendChild(script);
  }, []);

  return null;
}

declare global {
  interface Window {
    Tawk_API: any;
    Tawk_LoadStart: Date;
  }
}