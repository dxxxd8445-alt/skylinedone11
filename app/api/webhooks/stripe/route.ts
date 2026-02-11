import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPurchaseEmail } from "@/lib/email";
import { triggerWebhooks } from "@/lib/discord-webhook";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("[Stripe Webhook] Event type:", event.type);

  try {
    const supabase = createAdminClient();

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { orderNumber, orderIds, couponCode } = session.metadata || {};

      if (!orderIds) {
        console.error("[Stripe Webhook] No order IDs in metadata");
        return NextResponse.json({ error: "No order IDs" }, { status: 400 });
      }

      const orderIdArray = orderIds.split(',');

      // Update all orders to completed
      for (const orderId of orderIdArray) {
        const { data: order, error: fetchError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        if (fetchError || !order) {
          console.error(`[Stripe Webhook] Order ${orderId} not found:`, fetchError);
          continue;
        }

        // Generate license key
        const licenseKey = `MC-${Date.now()}-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;

        // Update order
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            status: "completed",
            license_key: licenseKey,
            stripe_session_id: session.id,
            stripe_payment_intent: session.payment_intent as string,
          })
          .eq("id", orderId);

        if (updateError) {
          console.error(`[Stripe Webhook] Failed to update order ${orderId}:`, updateError);
          continue;
        }

        // Send email
        try {
          await sendPurchaseEmail({
            to: order.customer_email,
            orderNumber: order.order_number,
            productName: order.product_name,
            duration: order.duration,
            licenseKey,
            amount: order.amount_cents / 100,
          });
        } catch (emailError) {
          console.error("[Stripe Webhook] Email send failed:", emailError);
        }

        // Trigger Discord webhook
        try {
          await triggerWebhooks({
            event: 'purchase',
            data: {
              orderNumber: order.order_number,
              productName: order.product_name,
              amount: order.amount_cents / 100,
              customerEmail: order.customer_email,
              paymentMethod: 'stripe',
            },
          });
        } catch (webhookError) {
          console.error("[Stripe Webhook] Discord webhook failed:", webhookError);
        }
      }

      console.log(`[Stripe Webhook] Successfully processed ${orderIdArray.length} orders`);
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      console.log("[Stripe Webhook] Payment failed:", paymentIntent.id);
      
      // Update orders to failed if we can find them
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("stripe_payment_intent", paymentIntent.id);

      if (orders) {
        for (const order of orders) {
          await supabase
            .from("orders")
            .update({ status: "failed" })
            .eq("id", order.id);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
