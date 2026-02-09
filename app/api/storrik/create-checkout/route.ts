import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customerEmail, customerName, couponCode, subtotal, discount, total } = body;

    console.log("[Custom Checkout] Request received:", { 
      customerEmail, 
      total, 
      itemCount: items?.length,
      hasItems: !!items,
      items: items 
    });

    if (!items || items.length === 0 || !customerEmail || !total) {
      console.error("[Custom Checkout] Missing required fields:", { items: !!items, customerEmail: !!customerEmail, total: !!total });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    console.log("[Custom Checkout] Creating order...");

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Create pending order in database
    const orderData = {
      order_number: orderNumber,
      customer_email: customerEmail,
      customer_name: customerName || customerEmail.split("@")[0],
      product_name: items.map((item: any) => item.productName).join(", "),
      amount_cents: Math.round(total * 100),
      status: "pending",
      payment_method: "card",
      coupon_code: couponCode || null,
      metadata: {
        items: items,
        subtotal: subtotal,
        discount: discount,
        total: total,
      },
    };

    console.log("[Custom Checkout] Order data:", orderData);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error("[Custom Checkout] Order creation error:", orderError);
      return NextResponse.json(
        { error: `Failed to create order: ${orderError.message}` },
        { status: 500 }
      );
    }

    console.log("[Custom Checkout] Order created successfully:", order.id);

    // Generate checkout URL with order ID
    const checkoutUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/payment/checkout?order_id=${order.id}`;

    console.log("[Custom Checkout] Checkout URL:", checkoutUrl);

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutUrl,
      orderId: order.id,
    });

  } catch (error) {
    console.error("[Custom Checkout] Unexpected error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
