import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/storrik";
import { createClient } from "@/lib/supabase/server";

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  duration: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CheckoutRequest {
  items: CartItem[];
  customerEmail: string;
  customerName: string;
  couponCode?: string;
  subtotal: number;
  discount: number;
  total: number;
}

export async function POST(request: NextRequest) {
  try {
    console.log("[Storrik API] Received checkout request");
    
    const body: CheckoutRequest = await request.json();
    const { items, customerEmail, couponCode, total } = body;

    console.log("[Storrik API] Request details:", {
      itemCount: items?.length,
      customerEmail,
      couponCode,
      total,
    });

    if (!items || items.length === 0) {
      console.error("[Storrik API] No items in cart");
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    if (!customerEmail) {
      console.error("[Storrik API] No customer email");
      return NextResponse.json({ error: "Customer email required" }, { status: 400 });
    }

    // Check if Storrik API key is configured
    const storrikKey = process.env.STORRIK_SECRET_KEY;
    if (!storrikKey) {
      console.error("[Storrik API] STORRIK_SECRET_KEY not configured in environment");
      return NextResponse.json({ 
        error: "Payment processor not configured. Please contact support." 
      }, { status: 500 });
    }

    console.log("[Storrik API] Environment check passed");

    const supabase = await createClient();

    // Generate order number
    const year = new Date().getFullYear();
    const orderNum = Math.floor(Math.random() * 9000) + 1000;
    const orderNumber = `MC-${year}-${orderNum}`;

    // Create orders for each item
    const orderIds: string[] = [];
    
    for (const item of items) {
      // Look up real product UUID by slug if needed
      let realProductId = item.productId;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (!uuidRegex.test(item.productId)) {
        const { data: product } = await supabase
          .from("products")
          .select("id")
          .eq("slug", item.productSlug)
          .single();
        
        if (product) {
          realProductId = product.id;
        }
      }

      // Create pending order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: `${orderNumber}-${item.id}`,
          customer_email: customerEmail,
          product_id: realProductId,
          product_name: item.productName,
          duration: item.duration,
          amount_cents: Math.round(item.price * item.quantity * 100),
          status: "pending",
          payment_method: "storrik",
        })
        .select()
        .single();

      if (orderError) {
        console.error("[Checkout] Order creation error:", orderError);
        return NextResponse.json(
          { error: `Database error: ${orderError.message || 'Failed to create order'}` },
          { status: 500 }
        );
      }

      if (order) {
        orderIds.push(order.id);
      }
    }

    if (orderIds.length === 0) {
      return NextResponse.json({ error: "Failed to create orders" }, { status: 500 });
    }

    // Create Storrik checkout session
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    
    console.log("[Storrik API] Creating checkout session with base URL:", baseUrl);
    
    const lineItems = items.map(item => ({
      name: item.productName,
      description: `${item.productName} - ${item.duration}`,
      pricePerItemInCents: Math.round(item.price * 100),
      quantity: item.quantity,
    }));

    console.log("[Storrik API] Line items:", lineItems);

    const result = await createCheckoutSession({
      description: `Order ${orderNumber}`,
      successUrl: `${baseUrl}/payment/success?order=${orderNumber}`,
      cancelUrl: `${baseUrl}/checkout/confirm`,
      failureUrl: `${baseUrl}/checkout/confirm`,
      customerEmail,
      lineItems,
    });

    console.log("[Storrik API] Checkout session result:", {
      success: result.success,
      hasCheckoutUrl: !!result.checkoutUrl,
      error: result.error,
    });

    if (!result.success || !result.checkoutUrl) {
      // Delete created orders on failure
      console.log("[Storrik API] Checkout failed, deleting orders:", orderIds);
      for (const orderId of orderIds) {
        await supabase.from("orders").delete().eq("id", orderId);
      }
      
      return NextResponse.json(
        { error: result.error || "Failed to create checkout session" },
        { status: 500 }
      );
    }

    console.log("[Storrik API] Checkout session created successfully");

    return NextResponse.json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      sessionId: result.checkoutSessionId,
      orderNumber,
    });

  } catch (error) {
    console.error("[Checkout] Error:", error);
    return NextResponse.json(
      { error: "Failed to process checkout" },
      { status: 500 }
    );
  }
}
