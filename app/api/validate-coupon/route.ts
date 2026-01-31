import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { valid: false, message: "Coupon code is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Query the coupon
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !coupon) {
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

    // Check expiry (using expires_at column)
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({
        valid: false,
        message: "Coupon has expired",
      });
    }

    return NextResponse.json({
      valid: true,
      discount: coupon.discount_value,
      type: coupon.discount_type === 'percent' ? "percentage" : "fixed",
    });

  } catch (error) {
    console.error("[API] Coupon validation error:", error);
    return NextResponse.json(
      { valid: false, message: "Error validating coupon" },
      { status: 500 }
    );
  }
}