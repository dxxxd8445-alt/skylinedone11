"use client";

import { useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";

const AFFILIATE_STORAGE_KEY = "skyline_affiliate_ref";
const AFFILIATE_EXPIRY_KEY = "skyline_affiliate_expiry";
const AFFILIATE_EXPIRY_DAYS = 30; // Affiliate cookie lasts 30 days

export function AffiliateTracker() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const refCode = searchParams.get("ref");

    if (refCode) {
      // Store affiliate code in localStorage with expiry
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + AFFILIATE_EXPIRY_DAYS);
      
      localStorage.setItem(AFFILIATE_STORAGE_KEY, refCode);
      localStorage.setItem(AFFILIATE_EXPIRY_KEY, expiryDate.toISOString());

      // Track the click
      fetch("/api/affiliate/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          affiliate_code: refCode,
          landing_page: pathname,
          referrer: document.referrer || null,
        }),
      }).catch((error) => {
        console.error("Failed to track affiliate click:", error);
      });

      console.log(`[Affiliate] Stored ref code: ${refCode} (expires in ${AFFILIATE_EXPIRY_DAYS} days)`);
    }
  }, [searchParams, pathname]);

  return null;
}

// Helper function to get stored affiliate code
export function getStoredAffiliateCode(): string | null {
  if (typeof window === "undefined") return null;

  const refCode = localStorage.getItem(AFFILIATE_STORAGE_KEY);
  const expiryStr = localStorage.getItem(AFFILIATE_EXPIRY_KEY);

  if (!refCode || !expiryStr) return null;

  // Check if expired
  const expiryDate = new Date(expiryStr);
  if (expiryDate < new Date()) {
    // Expired, clear storage
    localStorage.removeItem(AFFILIATE_STORAGE_KEY);
    localStorage.removeItem(AFFILIATE_EXPIRY_KEY);
    return null;
  }

  return refCode;
}

// Helper function to clear affiliate code
export function clearAffiliateCode(): void {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem(AFFILIATE_STORAGE_KEY);
  localStorage.removeItem(AFFILIATE_EXPIRY_KEY);
}
