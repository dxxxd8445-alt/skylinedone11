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

    // Get Storrik secret key from environment
    const storrikSecretKey = process.env.STORRIK_SECRET_KEY;
    
    if (!storrikSecretKey) {
      console.error("[Storrik Checkout] Missing STORRIK_SECRET_KEY environment variable");
      return NextResponse.json(
        { error: "Payment system not configured" },
        { status: 500 }
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

    // Create Storrik payment intent
    console.log("[Storrik Checkout] Creating Storrik payment intent...");
    
    const storrikResponse = await fetch("https://api.storrik.io/v1/payments/intents", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${storrikSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "hosted",
        amount: Math.round(total * 100), // Amount in cents
        currency: "usd",
        email: customerEmail,
        metadata: {
          order_id: order.id,
          order_number: orderNumber,
          customer_name: customerName,
        },
      }),
    });

    if (!storrikResponse.ok) {
      const errorText = await storrikResponse.text();
      console.error("[Storrik Checkout] Storrik API error:", errorText);
      
      // Delete the pending order since payment intent failed
      await supabase.from("orders").delete().eq("id", order.id);
      
      return NextResponse.json(
        { error: "Failed to create payment session" },
        { status: 500 }
      );
    }

    const storrikData = await storrikResponse.json();
    
    if (!storrikData.ok || !storrikData.url) {
      console.error("[Storrik Checkout] Invalid Storrik response:", storrikData);
      
      // Delete the pending order
      await supabase.from("orders").delete().eq("id", order.id);
      
      return NextResponse.json(
        { error: "Failed to create payment session" },
        { status: 500 }
      );
    }

    console.log("[Storrik Checkout] Storrik checkout URL:", storrikData.url);

    // Update order with Storrik payment intent ID
    await supabase
      .from("orders")
      .update({ payment_intent_id: storrikData.url.split("/").pop() })
      .eq("id", order.id);

    return NextResponse.json({
      success: true,
      checkoutUrl: storrikData.url,
      orderId: order.id,
    });

  } catch (error) {
    console.error("[Storrik Checkout] Unexpected error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
