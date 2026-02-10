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
    const body: CheckoutRequest = await request.json();
    const { items, customerEmail, couponCode, total } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    if (!customerEmail) {
      return NextResponse.json({ error: "Customer email required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Generate order number
    const year = new Date().getFullYear();
    const orderNum = Math.floor(Math.random() * 9000) + 1000;
    const orderNumber = `ST-${year}-${orderNum}`;

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
          coupon_code: couponCode,
        })
        .select()
        .single();

      if (orderError) {
        console.error("[Storrik Checkout] Order creation error:", orderError);
        console.error("[Storrik Checkout] Failed order data:", {
          order_number: `${orderNumber}-${item.id}`,
          customer_email: customerEmail,
          product_id: realProductId,
          product_name: item.productName,
          duration: item.duration,
          amount: item.price * item.quantity,
        });
        // Return detailed error instead of continuing
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
    
    const lineItems = items.map(item => ({
      name: item.productName,
      description: `${item.productName} - ${item.duration}`,
      pricePerItemInCents: Math.round(item.price * 100),
      quantity: item.quantity,
    }));

    const result = await createCheckoutSession({
      description: `Order ${orderNumber}`,
      successUrl: `${baseUrl}/payment/success?order=${orderNumber}`,
      cancelUrl: `${baseUrl}/checkout/confirm`,
      failureUrl: `${baseUrl}/checkout/confirm`,
      customerEmail,
      lineItems,
    });

    if (!result.success || !result.checkoutUrl) {
      // Delete created orders on failure
      for (const orderId of orderIds) {
        await supabase.from("orders").delete().eq("id", orderId);
      }
      
      return NextResponse.json(
        { error: result.error || "Failed to create Storrik checkout session" },
        { status: 500 }
      );
    }

    console.log("[Storrik Checkout] Created checkout session:", {
      orderNumber,
      checkoutUrl: result.checkoutUrl,
      sessionId: result.checkoutSessionId,
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      sessionId: result.checkoutSessionId,
      orderNumber,
    });

  } catch (error) {
    console.error("[Storrik Checkout] Error:", error);
    return NextResponse.json(
      { error: "Failed to process checkout" },
      { status: 500 }
    );
  }
}
