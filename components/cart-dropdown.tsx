"use client";

import { useCart } from "@/lib/cart-context";
import { ShoppingCart, X, Trash2, Sparkles, ArrowRight, Package, Tag, Percent } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useCurrency } from "@/lib/currency-context";
import { useI18n } from "@/lib/i18n-context";
import { formatMoney } from "@/lib/money";

export function CartDropdown() {
  const { items, removeFromCart, getSubtotal, getDiscount, getTotal, getItemCount, appliedCoupon } = useCart();
  const { currency } = useCurrency();
  const { locale, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [removingItem, setRemovingItem] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cartCount = getItemCount();

  // Shake animation when item is added
  useEffect(() => {
    if (cartCount > 0) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  }, [cartCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleRemove = (id: string) => {
    setRemovingItem(id);
    setTimeout(() => {
      removeFromCart(id);
      setRemovingItem(null);
    }, 300);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Cart Button with Epic Effects */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={
          `
          relative p-2.5 text-white/70 hover:text-white transition-all duration-300
          hover:scale-110 active:scale-95
          ${isShaking ? "animate-bounce" : ""}
          group
        `
        }
      >
        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />

        <ShoppingCart className="w-6 h-6 relative z-10 transition-transform group-hover:rotate-12" />

        {/* Animated Counter Badge */}
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 bg-gradient-to-br from-[#2563eb] to-[#b91c1c] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50 animate-pulse border-2 border-black">
            {cartCount > 9 ? "9+" : cartCount}
            {/* Ping Effect */}
            <span className="absolute inset-0 rounded-full bg-[#2563eb] animate-ping opacity-75" />
          </span>
        )}

        {/* Sparkle Effect */}
        {cartCount > 0 && (
          <Sparkles className="w-3 h-3 text-yellow-400 absolute -top-1 -left-1 animate-pulse" />
        )}
      </button>

      {/* Dropdown with Entrance Animation */}
      {isOpen && (
        <>
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 top-full mt-3 w-[420px] bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Animated Border Glow */}
            <div
              className="absolute inset-0 rounded-2xl opacity-50 blur-xl bg-gradient-to-r from-[#2563eb] via-[#3b82f6] to-[#2563eb] animate-pulse"
              style={{ zIndex: -1 }}
            />

            {/* Header with Gradient */}
            <div className="relative flex items-center justify-between p-5 border-b border-[#1a1a1a] bg-gradient-to-r from-[#2563eb]/10 to-transparent">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563eb] to-[#b91c1c] flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <ShoppingCart className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  {t("your_cart")}
                </h3>
                {cartCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-[#2563eb]/20 text-[#2563eb] text-xs font-bold rounded-full border border-[#2563eb]/30">
                    {cartCount} {cartCount === 1 ? "item" : "items"}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all duration-200 hover:rotate-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            {items.length === 0 ? (
              <div className="p-12 text-center">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] rounded-full blur-2xl opacity-20 animate-pulse" />
                  <Package className="w-16 h-16 text-white/20 relative" />
                </div>
                <p className="text-white/60 text-sm font-medium mb-2">{t("cart_empty")}</p>
                <p className="text-white/40 text-xs">Add some amazing items to get started!</p>
              </div>
            ) : (
              <>
                <div className="max-h-[400px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className={
                        `
                        flex gap-3 bg-gradient-to-br from-[#0a0a0a] to-[#151515] border border-[#1a1a1a] rounded-xl p-3 
                        hover:border-[#2563eb]/50 transition-all duration-300 group
                        ${removingItem === item.id ? "animate-out fade-out slide-out-to-right duration-300" : "animate-in fade-in slide-in-from-left"}
                      `
                      }
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Product Image with Hover Effect */}
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#1a1a1a] flex-shrink-0 group-hover:shadow-lg group-hover:shadow-[#2563eb]/20 transition-all duration-300">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.productName}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {/* Gradient Overlay on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2563eb]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm truncate group-hover:text-[#2563eb] transition-colors">
                          {item.productName}
                        </h4>
                        <p className="text-white/50 text-xs mt-0.5 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-[#2563eb]" />
                          {item.duration}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="px-2 py-1 bg-[#1a1a1a] text-white/60 text-xs rounded-md border border-[#2a2a2a]">
                            Qty: <span className="text-white font-semibold">{item.quantity}</span>
                          </span>
                          <span className="text-transparent bg-gradient-to-r from-[#2563eb] to-[#3b82f6] bg-clip-text font-bold text-base">
                            {formatMoney({ amountUsd: item.price * item.quantity, currency, locale })}
                          </span>
                        </div>
                      </div>

                      {/* Remove Button with Animation */}
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-white/30 hover:text-blue-400 hover:bg-blue-500/10 p-2 rounded-lg transition-all duration-200 self-start hover:scale-110 active:scale-95 group/btn"
                      >
                        <Trash2 className="w-4 h-4 group-hover/btn:animate-pulse" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Footer with Gradient Background */}
                <div className="p-5 border-t border-[#1a1a1a] space-y-4 bg-gradient-to-b from-transparent to-[#0a0a0a]">
                  {/* Coupon Display */}
                  {appliedCoupon && (
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-green-400" />
                        <div>
                          <p className="text-green-400 font-semibold text-sm">{appliedCoupon.code}</p>
                          <p className="text-green-400/70 text-xs">
                            {appliedCoupon.type === "percentage" ? `${appliedCoupon.discount}% off` : `$${appliedCoupon.discount} off`}
                          </p>
                        </div>
                      </div>
                      <span className="text-green-400 font-bold text-sm">
                        -{formatMoney({ amountUsd: getDiscount(), currency, locale })}
                      </span>
                    </div>
                  )}

                  {/* Subtotal with Animation */}
                  <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl border border-[#1a1a1a]">
                    <span className="text-white/60 text-sm font-medium">
                      {appliedCoupon ? "Total" : "Subtotal"}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-transparent bg-gradient-to-r from-[#2563eb] via-[#3b82f6] to-[#2563eb] bg-clip-text font-bold text-2xl animate-pulse">
                        {formatMoney({ amountUsd: getTotal(), currency, locale })}
                      </span>
                    </div>
                  </div>

                  {/* Epic Checkout Button */}
                  <Link
                    href="/cart"
                    onClick={() => setIsOpen(false)}
                    className="group/link relative block w-full overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#2563eb] via-[#3b82f6] to-[#2563eb] animate-gradient-x" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/link:translate-x-full transition-transform duration-1000" />

                    <div className="relative py-4 px-6 text-white text-center rounded-xl font-bold transition-all duration-300 group-hover/link:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                      <span>{t("review_checkout")}</span>
                      <ArrowRight className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" />
                    </div>

                    {/* Glow Effect */}
                    <div className="absolute inset-0 -z-10 blur-xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] opacity-50 group-hover/link:opacity-75 transition-opacity" />
                  </Link>

                  {/* Continue Shopping Link */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full text-white/50 hover:text-white text-sm font-medium transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}

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

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0a0a0a;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #2563eb, #b91c1c);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #3b82f6, #2563eb);
        }

        @keyframes animate-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in {
          animation: animate-in 0.3s ease-out forwards;
        }

        @keyframes slide-in-from-left {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .slide-in-from-left {
          animation: slide-in-from-left 0.4s ease-out;
        }

        @keyframes slide-out-to-right {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100px);
          }
        }

        .animate-out {
          animation: slide-out-to-right 0.3s ease-in forwards;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .fade-in {
          animation: fade-in 0.2s ease-out;
        }

        @keyframes fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        .fade-out {
          animation: fade-out 0.2s ease-out;
        }

        @keyframes slide-in-from-top-2 {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .slide-in-from-top-2 {
          animation: slide-in-from-top-2 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
