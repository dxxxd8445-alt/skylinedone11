import { NextRequest, NextResponse } from "next/server";
import { stripe, formatAmountForStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { triggerWebhooks } from "@/lib/discord-webhook";

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
          payment_method: "stripe",
        })
        .select()
        .single();

      if (orderError) {
        console.error("[Stripe Checkout] Order creation error:", orderError);
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

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://skylinecheats.org";
    
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.productName,
          description: `${item.productName} - ${item.duration}`,
          images: item.image ? [item.image] : [],
        },
        unit_amount: formatAmountForStripe(item.price),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&order=${orderNumber}`,
      cancel_url: `${baseUrl}/checkout/confirm`,
      customer_email: customerEmail,
      metadata: {
        orderNumber,
        orderIds: orderIds.join(','),
        couponCode: couponCode || '',
      },
    });

    // Trigger Discord webhook for checkout started
    try {
      await triggerWebhooks('checkout.started', {
        customer_email: customerEmail,
        customer_name: customerEmail.split('@')[0],
        session_id: session.id,
        items: items.map(item => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: body.subtotal,
        discount: body.discount,
        total: total,
        currency: 'usd',
      });
      console.log(`[Stripe Checkout] Discord webhook triggered for checkout ${session.id}`);
    } catch (webhookError) {
      console.error("[Stripe Checkout] Discord webhook failed:", webhookError);
      // Don't fail the checkout if webhook fails
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url,
      orderNumber,
    });

  } catch (error) {
    console.error("[Stripe Checkout] Error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
