"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { openStorrikCheckout } from "@/lib/storrik";
import { useToast } from "@/hooks/use-toast";

interface StorrikCheckoutButtonProps {
  productId: string;
  variantId?: string;
  productName: string;
  price: number;
  className?: string;
  children?: React.ReactNode;
}

export function StorrikCheckoutButton({
  productId,
  variantId,
  productName,
  price,
  className = "",
  children,
}: StorrikCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const result = await openStorrikCheckout({
        productId,
        variantId,
        style: "normal",
        colors: {
          primary: "#2563eb",
          buttonText: "#ffffff",
        },
      });

      if (!result.success) {
        toast({
          title: "❌ Checkout Error",
          description: result.error || "Failed to open checkout",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("[Storrik Button] Error:", error);
      toast({
        title: "❌ Error",
        description: "Failed to open checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={`
        group relative inline-flex items-center justify-center gap-2
        px-6 py-3 rounded-xl font-semibold text-white
        bg-gradient-to-r from-[#2563eb] to-[#3b82f6]
        hover:from-[#3b82f6] hover:to-[#2563eb]
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-lg shadow-[#2563eb]/30
        hover:shadow-xl hover:shadow-[#2563eb]/50
        hover:scale-105
        ${className}
      `}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {children || (
            <>
              <CreditCard className="w-5 h-5" />
              <span>Pay with Card</span>
            </>
          )}
        </>
      )}
    </button>
  );
}
