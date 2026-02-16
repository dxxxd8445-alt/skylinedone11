"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/lib/currency-context";
import { useI18n } from "@/lib/i18n-context";
import { formatMoney } from "@/lib/money";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, ArrowLeft, X, Sparkles, Shield, Zap, Package, Trash2, Tag, Percent } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { CryptoPaymentModal } from "@/components/crypto-payment-modal";

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, getSubtotal, getDiscount, getTotal, clearCart, isHydrated, appliedCoupon, applyCoupon, removeCoupon } = useCart();
  const { currency } = useCurrency();
  const { locale } = useI18n();
  const { user } = useAuth();
  const [removingItem, setRemovingItem] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showCryptoModal, setShowCryptoModal] = useState(false);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const total = getTotal();

  const handleCheckout = async () => {
    // Trigger checkout webhook
    try {
      await fetch('/api/trigger-checkout-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_email: user?.email || 'guest@example.com',
          customer_name: user?.email?.split('@')[0] || 'Guest',
          items: items.map(item => ({
            name: `${item.productName} - ${item.duration}`,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal: subtotal,
          discount: discount,
          total: total,
          currency: 'USD',
        }),
      });
    } catch (error) {
      console.error('Failed to trigger checkout webhook:', error);
      // Don't block checkout if webhook fails
    }

    // Redirect to checkout/confirm page for both logged in and guest users
    router.push('/checkout/confirm');
  };

  const handleRemove = (id: string) => {
    setRemovingItem(id);
    setTimeout(() => {
      removeFromCart(id);
      setRemovingItem(null);
    }, 400);
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

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponError(null);
  };

  if (!isHydrated) return null;

  return (
    <main className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6b7280]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#9ca3af]/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Header />

      <div className="pt-24 pb-16 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8">
            <Link
              href="/store"
              className="group inline-flex items-center gap-2 text-white/60 hover:text-white transition-all duration-300 hover:gap-3"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">Continue shopping</span>
            </Link>

            <div className="mt-6 flex items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6b7280] to-[#b91c1c] flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-gradient-to-r from-white via-white to-white/70 bg-clip-text">
                    Your Cart
                  </h1>
                </div>
                <p className="text-white/50 text-sm sm:text-base mt-2 ml-1">Review items and checkout when you're ready.</p>
              </div>

              {items.length > 0 && (
                <div className="hidden sm:flex flex-col items-end gap-2">
                  <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-[#6b7280]/20 to-[#9ca3af]/20 rounded-xl border border-[#6b7280]/30">
                    <Package className="w-4 h-4 text-[#6b7280]" />
                    <span className="text-white/60 text-sm">Items:</span>
                    <span className="text-white font-bold text-lg">{items.reduce((n, i) => n + i.quantity, 0)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="relative overflow-hidden bg-gradient-to-br from-[#111111] via-[#0a0a0a] to-[#111111] border border-[#1a1a1a] rounded-3xl p-12 sm:p-20 text-center animate-in fade-in duration-500">
              <div className="absolute inset-0 rounded-3xl opacity-30">
                <div className="absolute inset-0 bg-gradient-to-r from-[#6b7280] via-[#9ca3af] to-[#6b7280] animate-gradient-rotate blur-xl" />
              </div>
              <div className="absolute inset-0 opacity-5">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: "radial-gradient(circle, #6b7280 1px, transparent 1px)",
                    backgroundSize: "30px 30px",
                  }}
                />
              </div>

              <div className="relative">
                <div className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-[#6b7280]/20 to-[#b91c1c]/20 border border-[#6b7280]/30 flex items-center justify-center mb-6 animate-bounce-slow">
                  <ShoppingCart className="w-12 h-12 text-[#6b7280]" />
                  <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Your cart is empty</h2>
                <p className="text-white/60 text-base sm:text-lg mb-8 max-w-md mx-auto">
                  Discover amazing products and start your journey with us today.
                </p>
                <Link
                  href="/store"
                  className="group relative inline-flex items-center justify-center px-8 py-4 rounded-xl overflow-hidden font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#6b7280] via-[#9ca3af] to-[#6b7280] animate-gradient-x" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="relative flex items-center gap-2">
                    Browse Products
                    <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 -z-10 blur-xl bg-gradient-to-r from-[#6b7280] to-[#9ca3af] opacity-50 group-hover:opacity-75 transition-opacity" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-2 space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className={
                      `
                      group relative bg-gradient-to-br from-[#111111] via-[#0a0a0a] to-[#111111] border border-[#1a1a1a] rounded-2xl p-5 sm:p-7 
                      hover:border-[#6b7280]/50 transition-all duration-500 hover:shadow-xl hover:shadow-[#6b7280]/10
                      ${removingItem === item.id ? "animate-out fade-out slide-out-to-right-full duration-400" : "animate-in fade-in slide-in-from-left duration-400"}
                    `
                    }
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#6b7280]/0 via-[#6b7280]/5 to-[#6b7280]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative flex flex-col sm:flex-row gap-5 sm:gap-6">
                      <div className="relative w-full sm:w-36 h-44 sm:h-36 rounded-xl overflow-hidden bg-[#1a1a1a] flex-shrink-0 shadow-lg group-hover:shadow-[#6b7280]/20 transition-all duration-500">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.productName}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-2"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#6b7280]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute top-2 right-2 px-2.5 py-1 bg-black/80 backdrop-blur-sm rounded-lg border border-[#6b7280]/30">
                          <span className="text-white text-xs font-bold">x{item.quantity}</span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-bold text-xl sm:text-2xl mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#6b7280] group-hover:bg-clip-text transition-all">
                              {item.productName}
                            </p>
                            <div className="flex items-center gap-2 text-white/60 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#6b7280] animate-pulse" />
                              <span>{item.duration}</span>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <p className="text-white/40 text-xs uppercase font-semibold tracking-wider mb-1">Total</p>
                            <p className="text-transparent bg-gradient-to-r from-[#6b7280] via-[#9ca3af] to-[#6b7280] bg-clip-text font-bold text-2xl sm:text-3xl animate-gradient-x">
                              {formatMoney({ amountUsd: item.price * item.quantity, currency, locale })}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-3 bg-[#0a0a0a] rounded-xl p-1.5 border border-[#1a1a1a] w-fit shadow-inner">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="group/btn w-10 h-10 rounded-lg bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] hover:from-[#6b7280] hover:to-[#b91c1c] text-white transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95 shadow-lg"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            </button>

                            <div className="px-3 py-1 bg-[#6b7280]/10 rounded-lg border border-[#6b7280]/20">
                              <span className="text-white font-bold text-lg min-w-[2ch] inline-block text-center">{item.quantity}</span>
                            </div>

                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="group/btn w-10 h-10 rounded-lg bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] hover:from-[#6b7280] hover:to-[#b91c1c] text-white transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95 shadow-lg"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemove(item.id)}
                            className="group/remove inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/20 hover:border-gray-500/40 text-gray-400 hover:text-gray-300 transition-all duration-300 text-sm font-semibold hover:scale-105 active:scale-95"
                          >
                            <Trash2 className="w-4 h-4 group-hover/remove:animate-pulse" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-1">
                <div className="relative bg-gradient-to-br from-[#111111] via-[#0a0a0a] to-[#111111] border border-[#1a1a1a] rounded-2xl p-6 sm:p-7 sticky top-24 shadow-2xl">
                  <div className="absolute inset-0 rounded-2xl opacity-20 blur-xl bg-gradient-to-r from-[#6b7280] via-[#9ca3af] to-[#6b7280] animate-gradient-rotate" />

                  <div className="relative">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1a1a1a]">
                      <h2 className="text-white font-bold text-2xl flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#6b7280]" />
                        Summary
                      </h2>
                      <span className="px-3 py-1 bg-[#6b7280]/10 text-[#6b7280] text-sm font-bold rounded-lg border border-[#6b7280]/30">
                        {items.length} item{items.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="space-y-4 pb-6 border-b border-[#1a1a1a]">
                      <div className="flex items-center justify-between text-white/60">
                        <span className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Subtotal
                        </span>
                        <span className="text-white font-semibold">{formatMoney({ amountUsd: subtotal, currency, locale })}</span>
                      </div>

                      {/* Coupon Section */}
                      {!appliedCoupon ? (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                              <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                placeholder="Enter coupon code"
                                className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-white placeholder:text-white/40 focus:border-[#6b7280] focus:outline-none text-sm font-mono uppercase"
                                onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                              />
                            </div>
                            <button
                              onClick={handleApplyCoupon}
                              disabled={couponLoading || !couponCode.trim()}
                              className="px-4 py-2.5 bg-[#6b7280] hover:bg-[#9ca3af] disabled:bg-[#6b7280]/50 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-sm transition-all flex items-center gap-2"
                            >
                              {couponLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <Tag className="w-4 h-4" />
                              )}
                              Apply
                            </button>
                          </div>
                          {couponError && (
                            <p className="text-gray-400 text-xs flex items-center gap-1">
                              <X className="w-3 h-3" />
                              {couponError}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                              <Tag className="w-3 h-3 text-green-400" />
                            </div>
                            <div>
                              <p className="text-green-400 font-semibold text-sm">{appliedCoupon.code}</p>
                              <p className="text-green-400/70 text-xs">
                                {appliedCoupon.type === "percentage" ? `${appliedCoupon.discount}% off` : `$${appliedCoupon.discount} off`}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={handleRemoveCoupon}
                            className="text-white/40 hover:text-gray-400 p-1 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Discount Display */}
                      {discount > 0 && (
                        <div className="flex items-center justify-between text-green-400">
                          <span className="flex items-center gap-2">
                            <Percent className="w-4 h-4" />
                            Discount ({appliedCoupon?.code})
                          </span>
                          <span className="font-semibold">-{formatMoney({ amountUsd: discount, currency, locale })}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                        <Zap className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-xs font-medium">Instant digital delivery</span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl border border-[#6b7280]/20">
                        <span className="text-white font-bold text-lg">Total</span>
                        <span className="text-transparent bg-gradient-to-r from-[#6b7280] via-[#9ca3af] to-[#6b7280] bg-clip-text font-bold text-3xl animate-pulse">
                          {formatMoney({ amountUsd: total, currency, locale })}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <button
                        onClick={handleCheckout}
                        disabled={checkoutLoading}
                        className="group/checkout relative w-full py-4 rounded-xl overflow-hidden font-bold text-white transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#6b7280] via-[#9ca3af] to-[#6b7280] animate-gradient-x" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/checkout:translate-x-full transition-transform duration-1000" />
                        <span className="relative flex items-center justify-center gap-2 text-base">
                          {checkoutLoading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              {user ? 'Proceed to Purchase' : 'Continue as Guest'}
                              <ArrowLeft className="w-5 h-5 rotate-180 group-hover/checkout:translate-x-1 transition-transform" />
                            </>
                          )}
                        </span>
                        <div className="absolute inset-0 -z-10 blur-xl bg-gradient-to-r from-[#6b7280] to-[#9ca3af] opacity-50 group-hover/checkout:opacity-75 transition-opacity" />
                      </button>

                      {/* Sign In Option for Guest Users */}
                      {!user && (
                        <button
                          onClick={() => router.push("/checkout/login")}
                          className="group/signin w-full py-3 rounded-xl bg-[#1a1a1a] hover:bg-[#262626] border border-[#262626] hover:border-[#6b7280]/30 text-white/80 hover:text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                        >
                          <span className="text-sm sm:text-base">Sign In (Recommended)</span>
                          <ArrowLeft className="w-4 h-4 rotate-180 group-hover/signin:translate-x-1 transition-transform" />
                        </button>
                      )}

                      <button
                        onClick={clearCart}
                        className="group/clear w-full py-3 rounded-xl bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/20 hover:border-gray-500/40 text-gray-400 hover:text-gray-300 font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                      >
                        <X className="w-5 h-5 group-hover/clear:rotate-90 transition-transform" />
                        Empty cart
                      </button>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2 text-white/40 text-xs">
                      <Shield className="w-4 h-4 text-green-400" />
                      <span>Secure checkout with instant delivery</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Crypto Payment Modal */}
      <CryptoPaymentModal
        isOpen={showCryptoModal}
        onClose={() => setShowCryptoModal(false)}
        totalUsd={total}
        productName={items.map(i => i.productName).join(", ")}
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

        @keyframes gradient-rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }

        .animate-gradient-rotate {
          animation: gradient-rotate 8s linear infinite;
        }

        .animate-bounce-slow {
          animation: bounce 3s ease-in-out infinite;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in {
          animation: fade-in 0.4s ease-out forwards;
        }

        @keyframes slide-in-from-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .slide-in-from-left {
          animation: slide-in-from-left 0.4s ease-out;
        }

        @keyframes slide-out-to-right-full {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }

        .animate-out {
          animation: slide-out-to-right-full 0.4s ease-in forwards;
        }

        .fade-out {
          animation: fade-out 0.4s ease-out;
        }

        .slide-out-to-right-full {
          animation: slide-out-to-right-full 0.4s ease-in;
        }
      `}</style>
    </main>
  );
}
