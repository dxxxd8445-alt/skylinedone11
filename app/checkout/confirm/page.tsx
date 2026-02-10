"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useCurrency } from "@/lib/currency-context";
import { formatMoney } from "@/lib/money";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { 
  ArrowLeft, 
  Lock, 
  Shield, 
  Zap, 
  Tag, 
  Check,
  Mail,
  Loader2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CheckoutConfirmPage() {
  const router = useRouter();
  const { items, getSubtotal, getDiscount, getTotal, appliedCoupon, applyCoupon, removeCoupon } = useCart();
  const { user } = useAuth();
  const { currency } = useCurrency();
  
  const [guestEmail, setGuestEmail] = useState("");
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const total = getTotal();

  // If user is logged in, automatically confirm email
  useEffect(() => {
    if (user?.email) {
      setGuestEmail(user.email);
      setEmailConfirmed(true);
    }
  }, [user]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  const handleEmailSubmit = () => {
    if (!guestEmail || !guestEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    setEmailConfirmed(true);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setCouponLoading(true);
    setCouponError(null);
    
    const result = await applyCoupon(couponCode.trim());
    
    if (result.success) {
      setCouponCode("");
    } else {
      setCouponError(result.error || "Invalid coupon code");
    }
    
    setCouponLoading(false);
  };

  const handleCompletePayment = async () => {
    if (!emailConfirmed) {
      alert('Please confirm your email first');
      return;
    }

    try {
      setCheckoutLoading(true);
      console.log("[Checkout] Creating order with items:", items);
      
      // Create order in database
      const response = await fetch('/api/storrik/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items,
          customerEmail: guestEmail,
          customerName: guestEmail.split('@')[0],
          couponCode: appliedCoupon?.code,
          subtotal: subtotal,
          discount: discount,
          total: total,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create order');
      }

      const data = await response.json();
      
      if (!data.orderId) {
        throw new Error('No order ID returned');
      }

      console.log("[Checkout] Order created, redirecting to payment:", data.orderId);
      
      // Redirect to Storrik payment page
      router.push(`/payment/storrik?order_id=${data.orderId}`);
      
    } catch (error) {
      console.error("[Checkout] Error:", error);
      setCheckoutLoading(false);
      alert(error instanceof Error ? error.message : 'Payment system error. Please try again or contact support.');
      return;
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Confirm & Pay</h1>
              <p className="text-white/60 text-sm">Review your order and complete payment securely.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Order Items & Customer Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Order Items</h2>
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <Check className="w-4 h-4" />
                    <span>Instant delivery after payment</span>
                  </div>
                </div>

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
                        <p className="text-white/60 text-sm">{item.duration}</p>
                        <p className="text-white/40 text-xs">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#2563eb] font-bold text-xl">
                          {formatMoney({ amountUsd: item.price * item.quantity, currency, locale: 'en-US' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Customer Information</h2>

                {!emailConfirmed ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/80 text-sm mb-2">Email</label>
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                          <input
                            type="email"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="w-full pl-11 pr-4 py-3 bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-xl text-white placeholder:text-white/40 focus:border-[#2563eb] focus:outline-none"
                            onKeyPress={(e) => e.key === 'Enter' && handleEmailSubmit()}
                          />
                        </div>
                        <button
                          onClick={handleEmailSubmit}
                          className="px-6 py-3 bg-[#2563eb] hover:bg-[#3b82f6] text-white rounded-xl font-semibold transition-all"
                        >
                          Apply
                        </button>
                      </div>
                      <p className="text-white/50 text-xs mt-2">Your license key will be sent to this email</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl border border-[#1a1a1a]">
                    <div>
                      <p className="text-white/60 text-sm mb-1">Email</p>
                      <p className="text-white font-semibold">{guestEmail}</p>
                    </div>
                    {!user && (
                      <button
                        onClick={() => setEmailConfirmed(false)}
                        className="text-[#2563eb] hover:text-[#3b82f6] text-sm font-medium transition-colors"
                      >
                        Change
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Payment Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 sticky top-24">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[#2563eb]/10 flex items-center justify-center">
                    <Tag className="w-5 h-5 text-[#2563eb]" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Payment</h2>
                </div>

                {/* Coupon Code */}
                {!appliedCoupon && emailConfirmed && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-4 h-4 text-[#2563eb]" />
                      <span className="text-white/80 text-sm font-medium">Have a coupon code?</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError(null);
                        }}
                        placeholder="SAVE10"
                        className="flex-1 px-4 py-2.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-white placeholder:text-white/40 focus:border-[#2563eb] focus:outline-none text-sm font-mono uppercase"
                        onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-5 py-2.5 bg-[#2563eb] hover:bg-[#3b82f6] disabled:bg-[#2563eb]/50 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-sm transition-all whitespace-nowrap flex items-center justify-center shrink-0"
                      >
                        {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-blue-400 text-xs mt-2">{couponError}</p>
                    )}
                  </div>
                )}

                {appliedCoupon && (
                  <div className="mb-6 p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        <div>
                          <p className="text-green-400 font-semibold text-sm">{appliedCoupon.code}</p>
                          <p className="text-green-400/70 text-xs">
                            {appliedCoupon.type === "percentage" ? `${appliedCoupon.discount}% off` : `$${appliedCoupon.discount} off`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeCoupon()}
                        className="text-white/40 hover:text-blue-400 text-xs transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                {/* Price Summary */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-white/60">
                    <span>Subtotal</span>
                    <span className="text-white font-semibold">
                      {formatMoney({ amountUsd: subtotal, currency, locale: 'en-US' })}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex items-center justify-between text-green-400">
                      <span>Discount</span>
                      <span className="font-semibold">
                        -{formatMoney({ amountUsd: discount, currency, locale: 'en-US' })}
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-[#1a1a1a]">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold text-lg">Total</span>
                      <span className="text-[#2563eb] font-bold text-2xl">
                        {formatMoney({ amountUsd: total, currency, locale: 'en-US' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Complete Payment Button */}
                <button
                  onClick={handleCompletePayment}
                  disabled={!emailConfirmed || checkoutLoading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#3b82f6] hover:to-[#2563eb] disabled:from-[#2563eb]/50 disabled:to-[#3b82f6]/50 disabled:cursor-not-allowed text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Complete Secure Payment
                    </>
                  )}
                </button>

                {/* Security Badges */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-white/40 text-xs">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span>256-bit SSL encryption • PCI compliant</span>
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
                      <Shield className="w-4 h-4 text-green-400" />
                      <span className="text-white/60 text-xs font-medium">Secure Payment</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
                      <Zap className="w-4 h-4 text-yellow-400" />
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
        </div>
      </div>

      <Footer />
    </main>
  );
}
