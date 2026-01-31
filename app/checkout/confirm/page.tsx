"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ArrowRight,
  CreditCard,
  Tag,
  ArrowLeft,
  ShieldCheck,
  Lock,
  Zap,
  Gift,
  CheckCircle2,
  Sparkles,
  Package,
  Mail,
} from "lucide-react";
import Image from "next/image";
import { redirectToStripeCheckout, validateCheckoutData } from "@/lib/stripe-checkout";
import { validateCoupon } from "@/lib/purchase-actions";
import { useCurrency } from "@/lib/currency-context";
import { useI18n } from "@/lib/i18n-context";
import { formatMoney } from "@/lib/money";

type TrustBadgeColor = "green" | "yellow" | "blue";

const trustBadgeStyles: Record<TrustBadgeColor, { box: string; border: string; icon: string }> = {
  green: { box: "bg-green-500/10", border: "border-green-500/20", icon: "text-green-400" },
  yellow: { box: "bg-yellow-500/10", border: "border-yellow-500/20", icon: "text-yellow-400" },
  blue: { box: "bg-blue-500/10", border: "border-blue-500/20", icon: "text-blue-400" },
};

export default function ConfirmCheckoutPage() {
  const router = useRouter();
  const { items, getTotal, isHydrated } = useCart();
  const { user } = useAuth();
  const { currency } = useCurrency();
  const { locale } = useI18n();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponValid, setCouponValid] = useState<boolean | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const subtotal = getTotal();
  const discount = (subtotal * couponDiscount) / 100;
  const total = subtotal - discount;

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    try {
      const result = await validateCoupon(couponCode);
      if (result.valid && result.discount) {
        setCouponDiscount(result.discount);
        setCouponValid(true);
      } else {
        setCouponDiscount(0);
        setCouponValid(false);
      }
    } catch {
      setCouponValid(false);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      setError("Your cart is empty");
      return;
    }

    if (!user?.email) {
      setError("Please sign in to complete your purchase");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Prepare checkout items for Stripe
      const checkoutItems = items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        game: item.game || 'Unknown',
        duration: item.duration,
        price: item.price,
        quantity: item.quantity,
        variantId: item.variantId,
      }));

      // Validate checkout data
      const validationError = validateCheckoutData({
        items: checkoutItems,
        customerEmail: user.email,
        couponCode: couponValid ? couponCode : undefined,
        couponDiscountAmount: discount,
      });

      if (validationError) {
        setError(validationError);
        return;
      }

      // Redirect to Stripe Checkout
      const result = await redirectToStripeCheckout({
        items: checkoutItems,
        customerEmail: user.email,
        couponCode: couponValid ? couponCode : undefined,
        couponDiscountAmount: discount,
        successUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://magmacheats.cc'}/payment/success`,
        cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://magmacheats.cc'}/payment/cancelled`,
      });

      if (!result.success) {
        setError(result.error || 'Failed to redirect to checkout');
      }
      // Note: If successful, user will be redirected to Stripe, so no need to handle success here
      
    } catch (error) {
      console.error("Checkout error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!isHydrated) return;
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [isHydrated, items.length, router]);

  if (!isHydrated) {
    return null;
  }

  if (items.length === 0) {
    return null;
  }

  const trustBadges: Array<{
    icon: React.ComponentType<{ className?: string }>;
    text: string;
    color: TrustBadgeColor;
  }> = [
    { icon: ShieldCheck, text: "Secure Payment", color: "green" },
    { icon: Zap, text: "Instant Delivery", color: "yellow" },
    { icon: Lock, text: "SSL Encrypted", color: "blue" },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#dc2626]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#ef4444]/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-[#dc2626]/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.02]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, #dc2626 1px, transparent 1px), linear-gradient(to bottom, #dc2626 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>
      </div>

      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <button
              onClick={() => router.push("/cart")}
              className="group inline-flex items-center gap-2 text-white/60 hover:text-white transition-all duration-300 hover:gap-3 mb-6"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">Back to cart</span>
            </button>

            <div className="text-center">
              <div className="inline-flex items-center justify-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#dc2626] to-[#b91c1c] flex items-center justify-center shadow-xl shadow-red-500/30">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-gradient-to-r from-white via-white to-white/70 bg-clip-text">
                  Confirm & Pay
                </h1>
              </div>
              <p className="text-white/60 text-base sm:text-lg">Review your order and complete payment securely.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cart Items */}
              <div className="bg-[#111111] border border-[#1a1a1a] rounded-2xl p-5 sm:p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Order Items</h3>
                  <div className="hidden sm:flex items-center gap-2 text-white/50 text-sm">
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                    Instant delivery after payment
                  </div>
                </div>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-bold mb-1">{item.productName}</h4>
                        <p className="text-white/60 text-sm mb-1">{item.duration}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-white/50 text-sm">Qty: {item.quantity}</span>
                          <span className="text-[#dc2626] font-bold">
                            {formatMoney({ amountUsd: item.price * item.quantity, currency, locale })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Info */}
              {user && (
                <div className="bg-[#111111] border border-[#1a1a1a] rounded-2xl p-5 sm:p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Customer Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/60">Email</span>
                      <span className="text-white">{user.email}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {trustBadges.map((badge, index) => {
                  const Icon = badge.icon;
                  const styles = trustBadgeStyles[badge.color];
                  return (
                    <div
                      key={index}
                      className="group/badge flex items-center gap-3 p-4 bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-xl hover:border-[#dc2626]/30 transition-all duration-300"
                    >
                      <div className={`w-10 h-10 rounded-lg ${styles.box} border ${styles.border} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${styles.icon}`} />
                      </div>
                      <span className="text-white/80 font-medium text-sm">{badge.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="lg:col-span-1">
              <div className="relative bg-gradient-to-br from-[#111111] via-[#0a0a0a] to-[#111111] border border-[#1a1a1a] rounded-2xl p-5 sm:p-6 sticky top-24 shadow-2xl">
                <div className="absolute inset-0 rounded-2xl opacity-20 blur-xl bg-gradient-to-r from-[#dc2626] via-[#ef4444] to-[#dc2626]" />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[#1a1a1a]">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#dc2626] to-[#b91c1c] flex items-center justify-center shadow-lg shadow-red-500/30">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-white to-white/70 bg-clip-text">
                      Payment
                    </h3>
                  </div>

                {/* Coupon Code */}
                <div className="mb-6">
                  <label className="flex items-center gap-2 text-white/80 text-sm font-semibold mb-3">
                    <Gift className="w-4 h-4 text-[#dc2626]" />
                    Have a coupon code?
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponValid(null);
                          setCouponDiscount(0);
                        }}
                        placeholder="SAVE10"
                        className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-white placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/20 text-sm font-medium transition-all"
                      />
                      {couponValid === true && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                      )}
                    </div>
                    <button
                      onClick={handleValidateCoupon}
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      className="px-5 py-3 bg-gradient-to-r from-[#1a1a1a] to-[#0a0a0a] hover:from-[#dc2626] hover:to-[#b91c1c] text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold border border-[#2a2a2a] hover:border-[#dc2626]"
                    >
                      {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                    </button>
                  </div>

                  {couponValid === true && (
                    <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-green-400" />
                        <p className="text-green-400 text-sm font-medium">Coupon applied! Save {couponDiscount}%</p>
                      </div>
                    </div>
                  )}
                  {couponValid === false && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-400 text-sm font-medium">Invalid or expired coupon code</p>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-3 mb-6 pb-6 border-b border-[#1a1a1a]">
                  <div className="flex justify-between text-white/60 text-sm">
                    <span>Subtotal</span>
                    <span>{formatMoney({ amountUsd: subtotal, currency, locale })}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-400 text-sm">
                      <span>Discount ({couponDiscount}%)</span>
                      <span>-{formatMoney({ amountUsd: discount, currency, locale })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-bold text-xl pt-2">
                    <span>Total</span>
                    <span className="text-[#dc2626]">{formatMoney({ amountUsd: total, currency, locale })}</span>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="group/checkout relative w-full py-4 rounded-xl overflow-hidden font-bold text-white transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#dc2626] via-[#ef4444] to-[#dc2626]" />
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 relative" />
                      <span className="relative">Complete Secure Payment</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-white/40 text-xs mt-4">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  <span>256-bit SSL encryption • PCI compliant</span>
                </div>

                <p className="text-white/50 text-xs text-center mt-4">
                  Powered by <span className="text-[#dc2626] font-semibold">Stripe</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </main>
  );
}
