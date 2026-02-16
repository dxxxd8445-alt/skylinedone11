"use client";

import { useCart } from "@/lib/cart-context";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

export function CartCounter() {
  const { getItemCount } = useCart();
  const cartCount = getItemCount();

  return (
    <Link
      href="/cart"
      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
    >
      <div className="relative">
        <ShoppingCart className="w-5 h-5 text-white/60" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#6b7280] text-white text-xs font-bold rounded-full flex items-center justify-center">
            {cartCount > 9 ? "9+" : cartCount}
          </span>
        )}
      </div>
      <span className="text-white/80 font-medium">Cart ({cartCount})</span>
    </Link>
  );
}