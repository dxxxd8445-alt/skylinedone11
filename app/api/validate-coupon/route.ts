import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { valid: false, message: "Coupon code is required" },
        { status: 400 }
      );
    }

    // Use admin client instead of server client to bypass RLS
    const supabase = createAdminClient();

    // Query the coupon
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("status", "active")
      .single();

    if (error || !coupon) {
      console.log("[API] Coupon validation - not found:", { code: code.toUpperCase(), error: error?.message });
      return NextResponse.json({
        valid: false,
        message: "Invalid coupon code",
      });
    }

    // Check if coupon has reached max uses
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return NextResponse.json({
        valid: false,
        message: "Coupon has been fully redeemed",
      });
    }

    // Check start date
    if (coupon.starts_at && new Date(coupon.starts_at) > new Date()) {
      return NextResponse.json({
        valid: false,
        message: "Coupon is not yet active",
      });
    }

    // Check expiry
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({
        valid: false,
        message: "Coupon has expired",
      });
    }

    console.log("[API] Coupon validation - success:", { code: coupon.code, discount: coupon.discount_value });

    return NextResponse.json({
      valid: true,
      discount: coupon.discount_value,
      type: coupon.discount_type === 'percentage' ? "percentage" : "fixed",
    });

  } catch (error) {
    console.error("[API] Coupon validation error:", error);
    return NextResponse.json(
      { valid: false, message: "Error validating coupon" },
      { status: 500 }
    );
  }
}