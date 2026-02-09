"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Lock, CreditCard, Loader2, Shield, Check } from "lucide-react";
import Image from "next/image";

export default function PaymentCheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id");
  
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    // Fetch order details
    async function fetchOrder() {
      try {
        console.log("[Payment Checkout] Fetching order:", orderId);
        const response = await fetch(`/api/orders/${orderId}`);
        
        console.log("[Payment Checkout] Response status:", response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log("[Payment Checkout] Order data:", data);
          setOrderData(data);
        } else {
          const errorData = await response.json();
          console.error("[Payment Checkout] Error fetching order:", errorData);
          setError(`Order not found: ${errorData.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error("[Payment Checkout] Failed to fetch order:", error);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    }

    // Add a small delay to ensure database commit
    setTimeout(fetchOrder, 500);
  }, [orderId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Process payment
      const response = await fetch("/api/payment/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          cardNumber,
          expiryDate,
          cvv,
          cardName,
        }),
      });

      if (!response.ok) {
        throw new Error("Payment failed");
      }

      const data = await response.json();

      // Redirect to success page
      router.push(`/payment/success?session_id=${data.sessionId || orderId}`);
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a]">
        <Header />
        <div className="pt-24 pb-16">
          <div className="max-w-2xl mx-auto px-4 text-center py-20">
            <Loader2 className="w-16 h-16 text-[#2563eb] animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-white mb-2">Loading...</h1>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0a0a0a]">
        <Header />
        <div className="pt-24 pb-16">
          <div className="max-w-2xl mx-auto px-4 text-center py-20">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">❌</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Invalid Payment Link</h1>
            <p className="text-white/60 mb-2">{error}</p>
            <p className="text-white/40 text-sm mb-8">Order ID: {orderId}</p>
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563eb] hover:bg-[#3b82f6] text-white rounded-xl font-semibold transition-all"
            >
              Return to Cart
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />

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

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="w-6 h-6 text-[#2563eb]" />
              <h2 className="text-xl font-bold text-white">Card Details</h2>
            </div>

            <div className="space-y-4">
              {/* Card Number */}
              <div>
                <label className="block text-white/80 text-sm mb-2">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim())}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  required
                  className="w-full px-4 py-3 bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-xl text-white placeholder:text-white/40 focus:border-[#2563eb] focus:outline-none"
                />
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="block text-white/80 text-sm mb-2">Cardholder Name</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full px-4 py-3 bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-xl text-white placeholder:text-white/40 focus:border-[#2563eb] focus:outline-none"
                />
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">Expiry Date</label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length >= 2) {
                        value = value.slice(0, 2) + '/' + value.slice(2, 4);
                      }
                      setExpiryDate(value);
                    }}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                    className="w-full px-4 py-3 bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-xl text-white placeholder:text-white/40 focus:border-[#2563eb] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm mb-2">CVV</label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    placeholder="123"
                    maxLength={4}
                    required
                    className="w-full px-4 py-3 bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-xl text-white placeholder:text-white/40 focus:border-[#2563eb] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={processing}
              className="w-full mt-8 py-4 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#3b82f6] hover:to-[#2563eb] disabled:from-[#2563eb]/50 disabled:to-[#3b82f6]/50 disabled:cursor-not-allowed text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Payment...
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
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </main>
  );
}
