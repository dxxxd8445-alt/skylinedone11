"use client";

import React from "react"
import { useState } from "react";
import { User, LogOut, ShoppingCart } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/cart-context";
import Link from "next/link";
import Image from "next/image";

export function MobileAuth() {
  const { user, isLoading, signOut } = useAuth();
  const { toast } = useToast();
  const { items } = useCart();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-12">
        <div className="w-6 h-6 rounded-full bg-[#262626] animate-pulse" />
      </div>
    );
  }

  // User is logged in - Show profile and cart
  if (user) {
    return (
      <div className="space-y-3">
        {/* User Profile */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563eb] to-[#3b82f6] flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl || "/placeholder.svg"}
                  alt={user.username}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                user.username[0].toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.username}</p>
              <p className="text-white/50 text-xs truncate">Signed in</p>
            </div>
          </div>
          <button
            onClick={() => {
              signOut();
              toast({
                title: "Signed out",
                description: "See you next time!",
              });
            }}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all min-h-[32px] min-w-[32px]"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* My Account Button */}
        <Link
          href="/account"
          className="flex items-center justify-between p-3 bg-[#2563eb]/10 hover:bg-[#2563eb]/20 border border-[#2563eb]/30 hover:border-[#2563eb]/50 rounded-lg transition-all"
        >
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#2563eb]" />
            <span className="text-white/90 text-sm font-medium">My Account</span>
          </div>
          <div className="text-[#2563eb] text-xs font-medium">
            Dashboard ?
          </div>
        </Link>

        {/* Cart Section */}
        <Link
          href="/cart"
          className="flex items-center justify-between p-3 bg-[#262626] hover:bg-[#333333] rounded-lg transition-all"
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-white/70" />
            <span className="text-white/80 text-sm font-medium">Shopping Cart</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-semibold">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
            {items.length > 0 && (
              <div className="w-2 h-2 bg-[#2563eb] rounded-full" />
            )}
          </div>
        </Link>
      </div>
    );
  }

  // User is not logged in - Show cart only (auth buttons are now in header)
  return (
    <Link
      href="/cart"
      className="flex items-center justify-between p-3 bg-[#262626] hover:bg-[#333333] rounded-lg transition-all"
    >
      <div className="flex items-center gap-2">
        <ShoppingCart className="w-5 h-5 text-white/70" />
        <span className="text-white/80 text-sm font-medium">Shopping Cart</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-white text-sm font-semibold">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
        {items.length > 0 && (
          <div className="w-2 h-2 bg-[#2563eb] rounded-full" />
        )}
      </div>
    </Link>
  );
}