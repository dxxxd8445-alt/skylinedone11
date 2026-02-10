"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Lock, Loader2, Shield, Check } from "lucide-react";
import Script from "next/script";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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

function StorrikPaymentContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [storrikReady, setStorrikReady] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    // Fetch order details
    async function fetchOrder() {
      try {
        console.log("[Storrik Payment] Fetching order:", orderId);
        const response = await fetch(`/api/orders/${orderId}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log("[Storrik Payment] Order data:", data);
          console.log("[Storrik Payment] Order product_name:", data.product_name);
          console.log("[Storrik Payment] Order amount_cents:", data.amount_cents);
          console.log("[Storrik Payment] Order status:", data.status);
          setOrderData(data);
        } else {
          const errorData = await response.json();
          console.error("[Storrik Payment] Error fetching order:", errorData);
          setError(`Order not found: ${errorData.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error("[Storrik Payment] Failed to fetch order:", error);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  // Separate timeout for Storrik loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!storrikReady) {
        console.error("[Storrik Payment] Timeout - Storrik script failed to load after 15 seconds");
        setError("Payment system is taking too long to load. Please refresh the page.");
      }
    }, 15000); // 15 seconds

    return () => clearTimeout(timeout);
  }, [storrikReady]);

  const handleStorrikLoad = () => {
    console.log("[Storrik Payment] Storrik script loaded");
    if (window.storrik) {
      const publicKey = process.env.NEXT_PUBLIC_STORRIK_PUBLIC_KEY || "pk_live_UcQGVDAT8aH-M-NTV4UaVrY4IlNLKVXVUPEJ-4ya3D4";
      console.log("[Storrik Payment] Configuring with key:", publicKey.substring(0, 15) + "...");
      try {
        window.storrik.configure({
          pk: publicKey,
        });
        setStorrikReady(true);
        console.log("[Storrik Payment] ✅ Configuration successful");
      } catch (error) {
        console.error("[Storrik Payment] Configuration error:", error);
        setError("Failed to initialize payment system. Please refresh the page.");
      }
    } else {
      console.error("[Storrik Payment] window.storrik not available");
      setError("Payment system not available. Please refresh the page.");
    }
  };

  const handlePayNow = async () => {
    if (!window.storrik || !orderData) {
      alert("Payment system not ready. Please refresh the page.");
      return;
    }

    try {
      // Map product names to Storrik product IDs
      const productMapping: Record<string, string> = {
        "valorant": "prod_a2e53754827a304bb8cf2d53f9f096f1",
        "fortnite": "prod_5b4f8e15dbe4669f5765070eea478d21",
      };

      // Get the product name from order and find matching Storrik product ID
      const productName = orderData.product_name.toLowerCase();
      let storrikProductId = null;

      // Check if order contains Valorant or Fortnite
      if (productName.includes("valorant")) {
        storrikProductId = productMapping["valorant"];
      } else if (productName.includes("fortnite")) {
        storrikProductId = productMapping["fortnite"];
      }

      if (!storrikProductId) {
        alert(`Payment not yet configured for ${orderData.product_name}. Please contact support.`);
        return;
      }

      console.log("[Storrik Payment] Opening Storrik checkout for product:", storrikProductId);

      // Open Storrik embed checkout
      await window.storrik.pay(storrikProductId, undefined, {
        style: "expanded",
        colors: {
          primary: "#2563eb",
          buttonText: "#ffffff"
        }
      });

      // After successful payment, Storrik will send webhook to our server
      // The webhook will generate license keys and send email
      // Then redirect to success page
      console.log("[Storrik Payment] Storrik checkout opened successfully");
      
    } catch (error) {
      console.error("[Storrik Payment] Payment error:", error);
      alert("Payment failed. Please try again or contact support.");
    }
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 text-center py-20">
          <Loader2 className="w-16 h-16 text-[#2563eb] animate-spin mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-2">Loading...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 text-center py-20">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Invalid Payment Link</h1>
          <p className="text-white/60 mb-2">{error}</p>
          <p className="text-white/40 text-sm mb-8">Order ID: {orderId}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://cdn.storrik.com/embed.js"
        strategy="afterInteractive"
        onLoad={handleStorrikLoad}
        onError={(e) => {
          console.error("[Storrik Payment] Script failed to load:", e);
          setError("Failed to load payment system. Please refresh the page.");
        }}
      />
      
      <div className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563eb] to-[#3b82f6] flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Secure Payment</h1>
              <p className="text-white/60 text-sm">Complete your purchase securely</p>
            </div>
          </div>

          {/* Order Summary */}
          {orderData && (
            <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-white/60">
                  <span>Order ID</span>
                  <span className="text-[#2563eb] font-mono text-sm">{orderId}</span>
                </div>
                <div className="flex items-center justify-between text-white/60">
                  <span>Product</span>
                  <span className="text-white font-semibold">{orderData.product_name}</span>
                </div>
                <div className="pt-3 border-t border-[#1a1a1a]">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-lg">Total</span>
                    <span className="text-[#2563eb] font-bold text-2xl">
                      ${(orderData.amount_cents / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Button */}
          <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8">
            <button
              onClick={handlePayNow}
              disabled={!storrikReady}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#3b82f6] hover:to-[#2563eb] disabled:from-[#2563eb]/50 disabled:to-[#3b82f6]/50 disabled:cursor-not-allowed text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              {!storrikReady ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading Payment System...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Pay ${orderData ? (orderData.amount_cents / 100).toFixed(2) : '0.00'}
                </>
              )}
            </button>

            {/* Debug info - remove after testing */}
            {!storrikReady && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-400 text-xs text-center">
                  If this doesn't load, check browser console (F12) for errors
                </p>
              </div>
            )}

            {/* Security Badges */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-white/40 text-xs justify-center">
                <Shield className="w-4 h-4 text-green-400" />
                <span>256-bit SSL encryption • PCI compliant</span>
              </div>
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-white/60 text-xs font-medium">Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-white/60 text-xs font-medium">Instant Delivery</span>
                </div>
              </div>
              <p className="text-center text-white/40 text-xs">
                Powered by <span className="text-[#2563eb]">Storrik</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function StorrikPaymentPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <Suspense fallback={
        <div className="pt-24 pb-16">
          <div className="max-w-2xl mx-auto px-4 text-center py-20">
            <Loader2 className="w-16 h-16 text-[#2563eb] animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-white mb-2">Loading...</h1>
          </div>
        </div>
      }>
        <StorrikPaymentContent />
      </Suspense>
      <Footer />
    </main>
  );
}
