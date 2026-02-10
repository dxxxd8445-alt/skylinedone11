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
      pay: (productId: string, variantId?: string, options?: any) => Promise<void>;
    };
  }
}

function StorrikPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
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

  const handleStorrikLoad = () => {
    console.log("[Storrik Payment] Storrik script loaded");
    if (window.storrik) {
      window.storrik.configure({
        pk: process.env.NEXT_PUBLIC_STORRIK_PUBLIC_KEY || "pk_live_UcQGVDAT8aH-M-NTV4UaVrY4IlNLKVXVUPEJ-4ya3D4",
      });
      setStorrikReady(true);
    }
  };

  const handlePayNow = async () => {
    if (!window.storrik || !orderData) {
      alert("Payment system not ready. Please refresh the page.");
      return;
    }

    try {
      // For now, we'll show an alert since we need Storrik product IDs
      // In production, you'd map your products to Storrik product IDs
      alert("Storrik embed integration requires product IDs from your Storrik dashboard. Please contact support to complete setup.");
      
      // Example of how it would work with product IDs:
      // await window.storrik.pay("PRODUCT_ID", "VARIANT_ID", {
      //   style: "expanded",
      //   colors: {
      //     primary: "#2563eb",
      //     buttonText: "#ffffff"
      //   }
      // });
    } catch (error) {
      console.error("[Storrik Payment] Payment error:", error);
      alert("Payment failed. Please try again.");
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
