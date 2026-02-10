import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/storrik";
import { createClient } from "@/lib/supabase/server";
import crypto from 'crypto';

interface StorrikWebhookEvent {
  id: string;
  type: string;
  data: {
    transaction?: {
      id: string;
      status: string;
      amount: number;
      currency: string;
      customer_email?: string;
      created_at: string;
      updated_at: string;
    };
    payment_intent?: {
      id: string;
      status: string;
      amount: number;
      currency: string;
      client_secret: string;
    };
  };
  created_at: string;
}

interface DatabaseOrder {
  id: string;
  order_number: string;
  customer_email: string;
  product_id: string;
  product_name: string;
  duration: string;
  amount_cents: number;
  status: string;
  payment_method: string;
  coupon_code?: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("storrik-signature");

    console.log("[Storrik Webhook] Received webhook");
    console.log("[Storrik Webhook] Signature:", signature);
    console.log("[Storrik Webhook] Body length:", body.length);

    // Verify webhook signature
    const webhookSecret = process.env.STORRIK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[Storrik Webhook] Webhook secret not configured");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    if (!signature) {
      console.error("[Storrik Webhook] No signature provided");
      return NextResponse.json({ error: "No signature provided" }, { status: 400 });
    }

    // Verify signature
    const isValidSignature = await verifyWebhookSignature(body, signature, webhookSecret);
    if (!isValidSignature) {
      console.error("[Storrik Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    console.log("[Storrik Webhook] Signature verified successfully");

    let event: StorrikWebhookEvent;
    try {
      event = JSON.parse(body);
      console.log("[Storrik Webhook] Parsed event:", event);
    } catch (parseError) {
      console.error("[Storrik Webhook] Failed to parse webhook body:", parseError);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const supabase = await createClient();

    // Handle different event types
    switch (event.type) {
      case 'transaction.completed':
      case 'payment_intent.succeeded':
        await handleSuccessfulPayment(event, supabase);
        break;
      
      case 'transaction.failed':
      case 'payment_intent.failed':
        await handleFailedPayment(event, supabase);
        break;
      
      default:
        console.log(`[Storrik Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("[Storrik Webhook] Error processing webhook:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handleSuccessfulPayment(event: StorrikWebhookEvent, supabase: any) {
  const transaction = event.data.transaction || event.data.payment_intent;
  
  if (!transaction) {
    console.error("[Storrik Webhook] No transaction data in successful payment event");
    return;
  }

  console.log("[Storrik Webhook] Processing successful payment:", transaction);

  try {
    // Update orders with this transaction ID or client secret
    const { data: orders, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "pending")
      .eq("payment_method", "storrik");

    if (fetchError) {
      console.error("[Storrik Webhook] Error fetching orders:", fetchError);
      return;
    }

    if (!orders || orders.length === 0) {
      console.log("[Storrik Webhook] No pending Storrik orders found");
      return;
    }

    // For now, we'll update all pending Storrik orders that match the amount
    // In a real implementation, you'd want to match by a specific identifier
    const matchingOrders = orders.filter((order: DatabaseOrder) => 
      order.amount_cents === transaction.amount * 100
    );

    if (matchingOrders.length === 0) {
      console.log("[Storrik Webhook] No orders matching transaction amount");
      return;
    }

    console.log(`[Storrik Webhook] Updating ${matchingOrders.length} orders to completed`);

    for (const order of matchingOrders) {
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "completed",
          transaction_id: transaction.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (updateError) {
        console.error("[Storrik Webhook] Error updating order:", updateError);
      } else {
        console.log("[Storrik Webhook] Updated order:", order.order_number);
        
        // Trigger license key creation and Discord webhook
        try {
          await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/trigger-order-complete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: order.id,
              orderNumber: order.order_number,
              customerEmail: order.customer_email,
              productName: order.product_name,
              totalAmount: order.amount_cents / 100,
            }),
          });
        } catch (webhookError) {
          console.error("[Storrik Webhook] Error triggering order complete webhook:", webhookError);
        }
      }
    }

  } catch (error) {
    console.error("[Storrik Webhook] Error in handleSuccessfulPayment:", error);
  }
}

async function handleFailedPayment(event: StorrikWebhookEvent, supabase: any) {
  const transaction = event.data.transaction || event.data.payment_intent;
  
  if (!transaction) {
    console.error("[Storrik Webhook] No transaction data in failed payment event");
    return;
  }

  console.log("[Storrik Webhook] Processing failed payment:", transaction);

  try {
    // Update orders to failed status
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "failed",
        transaction_id: transaction.id,
        updated_at: new Date().toISOString(),
      })
      .eq("status", "pending")
      .eq("payment_method", "storrik");

    if (updateError) {
      console.error("[Storrik Webhook] Error updating orders to failed:", updateError);
    } else {
      console.log("[Storrik Webhook] Updated orders to failed status");
    }

  } catch (error) {
    console.error("[Storrik Webhook] Error in handleFailedPayment:", error);
  }
}
