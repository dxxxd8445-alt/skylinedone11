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

    // Create Storrik Payment Intent
    const storrikSecretKey = process.env.STORRIK_SECRET_KEY;
    if (!storrikSecretKey) {
      console.error("[Storrik Checkout] STORRIK_SECRET_KEY not configured");
      return NextResponse.json(
        { error: "Payment system not configured" },
        { status: 500 }
      );
    }

    console.log("[Storrik Checkout] Creating Storrik payment intent...");

    const storrikResponse = await fetch("https://api.storrik.com/v1/payments/intents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${storrikSecretKey}`,
      },
      body: JSON.stringify({
        type: "hosted", // Use hosted checkout (returns URL)
        amount: Math.round(total * 100), // Amount in cents
        currency: "USD",
        email: customerEmail,
        receipt_email: customerEmail,
        description: `Order ${orderNumber} - ${items.map((item: any) => item.productName).join(", ")}`,
        metadata: {
          order_id: order.id,
          order_number: orderNumber,
          customer_email: customerEmail,
          customer_name: customerName,
        },
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?order_id=${order.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
      }),
    });

    if (!storrikResponse.ok) {
      const errorData = await storrikResponse.text();
      console.error("[Storrik Checkout] Storrik API error:", storrikResponse.status, errorData);
      
      // Delete the order since payment intent creation failed
      await supabase.from("orders").delete().eq("id", order.id);
      
      return NextResponse.json(
        { error: `Payment system error: ${errorData}` },
        { status: 500 }
      );
    }

    const storrikData = await storrikResponse.json();
    console.log("[Storrik Checkout] Payment intent created:", storrikData);

    // Update order with payment intent ID
    await supabase
      .from("orders")
      .update({
        payment_intent_id: storrikData.id,
      })
      .eq("id", order.id);

    // Return the hosted checkout URL
    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: orderNumber,
      checkoutUrl: storrikData.url, // Storrik hosted checkout URL
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
