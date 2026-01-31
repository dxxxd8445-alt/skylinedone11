"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  game: string;
  image: string;
  duration: string;
  price: number;
  quantity: number;
  variantId?: string;
}

export interface AppliedCoupon {
  code: string;
  discount: number;
  type: "percentage" | "fixed";
}

interface CartContextType {
  items: CartItem[];
  appliedCoupon: AppliedCoupon | null;
  isHydrated: boolean;
  addToCart: (item: Omit<CartItem, "id">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; error?: string }>;
  removeCoupon: () => void;
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("cart");
    const savedCoupon = localStorage.getItem("cart-coupon");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        setItems([]);
      }
    }
    if (savedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(savedCoupon));
      } catch {
        setAppliedCoupon(null);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, mounted]);

  useEffect(() => {
    if (mounted) {
      if (appliedCoupon) {
        localStorage.setItem("cart-coupon", JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem("cart-coupon");
      }
    }
  }, [appliedCoupon, mounted]);

  const addToCart = (item: Omit<CartItem, "id">) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) =>
          i.productId === item.productId &&
          i.duration === item.duration &&
          i.variantId === item.variantId
      );
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, { ...item, id: `${Date.now()}-${Math.random()}` }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();

      if (result.valid) {
        setAppliedCoupon({
          code: code.toUpperCase(),
          discount: result.discount,
          type: result.type,
        });
        return { success: true };
      } else {
        return { success: false, error: result.message || 'Invalid coupon code' };
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      return { success: false, error: 'Failed to validate coupon' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const getSubtotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = getSubtotal();
    if (appliedCoupon.type === "percentage") {
      return (subtotal * appliedCoupon.discount) / 100;
    } else {
      return Math.min(appliedCoupon.discount, subtotal);
    }
  };

  const getTotal = () => {
    return Math.max(0, getSubtotal() - getDiscount());
  };

  const getItemCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        appliedCoupon,
        isHydrated: mounted,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        getSubtotal,
        getDiscount,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
