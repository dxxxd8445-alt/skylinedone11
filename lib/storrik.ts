"use client";

export interface StorrikCheckoutOptions {
  productId: string;
  variantId?: string;
  style?: "compact" | "normal" | "expanded";
  colors?: {
    primary?: string;
    buttonText?: string;
    background?: string;
    surface?: string;
    text?: string;
  };
}

export async function openStorrikCheckout(options: StorrikCheckoutOptions) {
  if (typeof window === "undefined") {
    console.error("[Storrik] Cannot open checkout on server side");
    return { success: false, error: "Client-side only" };
  }

  if (!window.storrik) {
    console.error("[Storrik] Storrik embed not loaded");
    return { success: false, error: "Storrik embed not loaded" };
  }

  try {
    console.log("[Storrik] Opening checkout with options:", options);
    
    await window.storrik.pay(
      options.productId,
      options.variantId,
      {
        style: options.style || "normal",
        colors: options.colors || {
          primary: "#2563eb",
          buttonText: "#ffffff",
        },
      }
    );

    return { success: true };
  } catch (error) {
    console.error("[Storrik] Checkout error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to open checkout" 
    };
  }
}

// Map product slugs to Storrik product IDs
// This will be configured in the admin dashboard later
export function getStorrikProductId(productSlug: string): string | null {
  // For now, return null - admin will need to configure product mappings
  // You can store these mappings in the database settings table
  console.warn("[Storrik] Product mapping not configured for:", productSlug);
  return null;
}
