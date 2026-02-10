"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useCart } from "@/lib/cart-context";
import { useCurrency } from "@/lib/currency-context";
import { formatMoney } from "@/lib/money";
import { ArrowLeft, CreditCard, Shield, Zap, Check, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Add Komerza global type declarations
declare global {
  interface Window {
    KomerzaEmbed?: {
      init?: (options?: any) => void;
      open?: (options: any) => void;
      close?: () => void;
    };
  }
}

function KomerzaCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, getSubtotal, getDiscount, getTotal, appliedCoupon } = useCart();
  const { currency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [checkoutConfig, setCheckoutConfig] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const total = getTotal();

  useEffect(() => {
    // Get checkout config from localStorage or URL params
    const savedConfig = localStorage.getItem('komerzaCheckout');
    const orderParam = searchParams.get('order');
    
    if (savedConfig) {
      try {
        setCheckoutConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error('Failed to parse checkout config:', e);
      }
    } else if (orderParam) {
      // This is a return from payment, redirect to success
      router.push(`/payment/success?order=${orderParam}`);
      return;
    }
  }, [searchParams, router]);

  const handleCheckout = () => {
    if (!checkoutConfig) {
      setError('Checkout configuration not loaded');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Initialize Komerza embed and open checkout
      if (typeof window !== 'undefined' && window.KomerzaEmbed?.open && checkoutConfig) {
        window.KomerzaEmbed.open(checkoutConfig);
      } else {
        setError('Komerza SDK not loaded or configuration missing');
      }
    } catch (err: any) {
      console.error('Komerza checkout error:', err);
      setError(err.message || 'Failed to open checkout');
    } finally {
      setLoading(false);
    }
  };

  if (!checkoutConfig) {
    return (
      <main className="min-h-screen bg-[#0a0a0a]">
        <Header />
        <div className="pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#2563eb] mx-auto mb-4" />
            <p className="text-white/60">Loading checkout...</p>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to cart</span>
          </Link>

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563eb] to-[#3b82f6] flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Complete Your Purchase</h1>
              <p className="text-white/60 text-sm">Secure checkout powered by Komerza</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Order Summary */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-[#0a0a0a] rounded-xl border border-[#1a1a1a]">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg mb-1">{item.productName}</h3>
                        <p className="text-white/60 text-sm mb-2">{item.duration}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Qty: {item.quantity}</span>
                          <span className="text-[#2563eb] font-bold text-xl">
                            {formatMoney({ amountUsd: item.price * item.quantity, currency, locale: 'en-US' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Security badges */}
                <div className="mt-6 flex items-center gap-4 text-white/60 text-sm">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span>Secure encrypted payment</span>
                </div>
                <div className="flex items-center gap-4 text-white/60 text-sm">
                  <Zap className="w-5 h-5 text-[#2563eb]" />
                  <span>Instant digital delivery</span>
                </div>
              </div>
            </div>

            {/* Right Column - Checkout */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Payment</h2>

                {error && (
                  <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#3b82f6] hover:to-[#2563eb] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-[#2563eb]/30 hover:shadow-xl hover:shadow-[#2563eb]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Opening Checkout...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Pay with Komerza</span>
                    </>
                  )}
                </button>

                <div className="mt-6 text-center">
                  <p className="text-white/40 text-xs">
                    Powered by Komerza • Secure payment processing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Komerza Embed Script */}
      <script 
        src="https://checkout.komerza.com/embed/embed.iife.js" 
        defer 
        nonce="{{__webpack_nonce__}}"
      />
      
      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </main>
  );
}

export default function KomerzaCheckoutPage() {
