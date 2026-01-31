"use client";

import { useEffect } from 'react';

export function TawkToChat() {
  useEffect(() => {
    // Only load Tawk.to script once and ensure we're in browser environment
    if (typeof window === 'undefined') return;
    
    // Check if Tawk.to is already loaded
    if (window.Tawk_API) return;

    try {
      // Initialize Tawk_API
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_LoadStart = new Date();

      // Create and inject the script
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://embed.tawk.to/697e7d248885d11c394b3299/1jgb1hlrc';
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');

      // Add error handling for script loading
      script.onerror = function() {
        console.warn('Failed to load Tawk.to script');
      };

      // Insert the script
      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        // Fallback: append to head
        document.head.appendChild(script);
      }

      // Optional: Add event listeners for Tawk.to events
      window.Tawk_API.onLoad = function() {
        console.log('Tawk.to chat loaded successfully');
      };

      window.Tawk_API.onStatusChange = function(status: string) {
        console.log('Tawk.to status:', status);
      };
    } catch (error) {
      console.warn('Error initializing Tawk.to:', error);
    }
  }, []);

  // This component doesn't render anything visible
  // The Tawk.to widget is injected by the script
  return null;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    Tawk_API: any;
    Tawk_LoadStart: Date;
  }
}