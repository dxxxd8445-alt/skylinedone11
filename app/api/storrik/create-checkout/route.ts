import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customerEmail, customerName, couponCode, subtotal, discount, total } = body;

    console.log("[Storrik Checkout] Request received:", { 
      customerEmail, 
      total, 
      itemCount: items?.length 
    });

    if (!items || items.length === 0 || !customerEmail || !total) {
      console.error("[Storrik Checkout] Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

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
        customer_email: customerEmail,
      },
    };

    console.log("[Storrik Checkout] Creating order...");

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error("[Storrik Checkout] Order creation error:", orderError);
      return NextResponse.json(
        { error: `Failed to create order: ${orderError.message}` },
        { status: 500 }
      );
    }

    console.log("[Storrik Checkout] Order created:", order.id);

    // Return order ID for Storrik embed to use
    // The frontend will use Storrik embed to handle payment
    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: orderNumber,
      amount: total,
      customerEmail: customerEmail,
    });

  } catch (error) {
    console.error("[Storrik Checkout] Unexpected error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
