import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface KomerzaWebhookEvent {
  event: string;
  data: {
    order?: {
      id: string;
      status: string;
      total: number;
      currency: string;
      customer_email?: string;
      items: Array<{
        product_id: string;
        variant_id: string;
        quantity: number;
        price: number;
      }>;
    };
  };
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-komerza-signature");

    console.log("[Komerza Webhook] Received webhook");
    console.log("[Komerza Webhook] Signature:", signature);

    let event: KomerzaWebhookEvent;
    try {
      event = JSON.parse(body);
      console.log("[Komerza Webhook] Parsed event:", event);
    } catch (parseError) {
      console.error("[Komerza Webhook] Failed to parse webhook body:", parseError);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const supabase = await createClient();

    // Handle different event types
    switch (event.event) {
      case 'order.completed':
        await handleCompletedOrder(event, supabase);
        break;
      
      case 'order.failed':
        await handleFailedOrder(event, supabase);
        break;
      
      default:
        console.log(`[Komerza Webhook] Unhandled event type: ${event.event}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("[Komerza Webhook] Error processing webhook:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handleCompletedOrder(event: KomerzaWebhookEvent, supabase: any) {
  const order = event.data.order;
  
  if (!order) {
    console.error("[Komerza Webhook] No order data in completed event");
    return;
  }

  console.log("[Komerza Webhook] Processing completed order:", order);

  try {
    // Find pending orders that match this order
    const { data: orders, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "pending")
      .eq("payment_method", "komerza");

    if (fetchError) {
      console.error("[Komerza Webhook] Error fetching orders:", fetchError);
      return;
    }

    if (!orders || orders.length === 0) {
      console.log("[Komerza Webhook] No pending Komerza orders found");
      return;
    }

    // Update all pending Komerza orders to completed
    for (const orderRecord of orders) {
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "completed",
          customer_email: order.customer_email || orderRecord.customer_email,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderRecord.id);

      if (updateError) {
        console.error("[Komerza Webhook] Error updating order:", updateError);
      } else {
        console.log("[Komerza Webhook] Updated order:", orderRecord.order_number);
        
        // Trigger license key creation and Discord webhook
        try {
          await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/trigger-order-complete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: orderRecord.id,
              orderNumber: orderRecord.order_number,
              customerEmail: order.customer_email || orderRecord.customer_email,
              productName: orderRecord.product_name,
              totalAmount: orderRecord.amount_cents / 100,
            }),
          });
        } catch (webhookError) {
          console.error("[Komerza Webhook] Error triggering order complete webhook:", webhookError);
        }
      }
    }

  } catch (error) {
    console.error("[Komerza Webhook] Error in handleCompletedOrder:", error);
  }
}

async function handleFailedOrder(event: KomerzaWebhookEvent, supabase: any) {
  const order = event.data.order;
  
  if (!order) {
    console.error("[Komerza Webhook] No order data in failed event");
    return;
  }

  console.log("[Komerza Webhook] Processing failed order:", order);

  try {
    // Update orders to failed status
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("status", "pending")
      .eq("payment_method", "komerza");

    if (updateError) {
      console.error("[Komerza Webhook] Error updating orders to failed:", updateError);
    } else {
      console.log("[Komerza Webhook] Updated orders to failed status");
    }

  } catch (error) {
    console.error("[Komerza Webhook] Error in handleFailedOrder:", error);
  }
}
