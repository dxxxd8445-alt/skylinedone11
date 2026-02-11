"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function TawkToChat() {
  const pathname = usePathname();

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

  // Adjust Tawk.to position on account page for mobile
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const adjustTawkPosition = () => {
      const tawkWidget = document.querySelector('#tawkchat-minified-box, #tawkchat-container') as HTMLElement;
      if (tawkWidget && pathname === '/account') {
        // Move chat widget up on mobile to avoid bottom navigation
        if (window.innerWidth < 1024) {
          tawkWidget.style.bottom = '80px';
        } else {
          tawkWidget.style.bottom = '20px';
        }
      }
    };

    // Wait for Tawk.to to load and adjust position
    const interval = setInterval(() => {
      if (window.Tawk_API?.onLoad) {
        window.Tawk_API.onLoad = function() {
          adjustTawkPosition();
        };
        clearInterval(interval);
      }
      adjustTawkPosition();
    }, 500);

    // Also adjust on resize
    window.addEventListener('resize', adjustTawkPosition);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', adjustTawkPosition);
    };
  }, [pathname]);

  return null;
}

declare global {
  interface Window {
    Tawk_API: any;
    Tawk_LoadStart: Date;
  }
}