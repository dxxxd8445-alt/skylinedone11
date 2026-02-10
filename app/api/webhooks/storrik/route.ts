import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/storrik";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPurchaseEmail } from "@/lib/email";
import { sendDiscordNotification } from "@/lib/discord-webhook";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("storrik-signature") || "";
    const webhookSecret = process.env.STORRIK_WEBHOOK_SECRET || "";

    console.log("[Storrik Webhook] Received webhook");
    console.log("[Storrik Webhook] Signature:", signature);

    // Verify webhook signature
    if (webhookSecret) {
      const isValid = await verifyWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.error("[Storrik Webhook] Invalid signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);
    console.log("[Storrik Webhook] Event type:", event.type);
    console.log("[Storrik Webhook] Event data:", JSON.stringify(event, null, 2));

    const supabase = createAdminClient();

    // Handle payment success
    if (event.type === "payment.succeeded" || event.type === "checkout.completed") {
      const { transaction, customer } = event.data;
      
      const customerEmail = customer?.email || transaction?.email;
      const amountCents = transaction?.amount || 0;
      const transactionId = transaction?.id;

      console.log("[Storrik Webhook] Payment succeeded");
      console.log("[Storrik Webhook] Customer email:", customerEmail);
      console.log("[Storrik Webhook] Amount (cents):", amountCents);
      console.log("[Storrik Webhook] Transaction ID:", transactionId);

      if (!customerEmail) {
        console.error("[Storrik Webhook] No customer email found");
        return NextResponse.json({ error: "No customer email" }, { status: 400 });
      }

      // Find pending orders for this customer
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_email", customerEmail)
        .eq("status", "pending")
        .eq("payment_method", "storrik")
        .order("created_at", { ascending: false })
        .limit(10);

      if (ordersError) {
        console.error("[Storrik Webhook] Error fetching orders:", ordersError);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }

      if (!orders || orders.length === 0) {
        console.log("[Storrik Webhook] No pending orders found for:", customerEmail);
        return NextResponse.json({ received: true, message: "No orders to process" });
      }

      console.log("[Storrik Webhook] Found", orders.length, "pending orders");

      // Process each order
      for (const order of orders) {
        // Generate license key
        const licenseKey = `SK-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

        // Update order status
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            status: "completed",
            license_key: licenseKey,
            transaction_id: transactionId,
          })
          .eq("id", order.id);

        if (updateError) {
          console.error("[Storrik Webhook] Error updating order:", updateError);
          continue;
        }

        console.log("[Storrik Webhook] Order completed:", order.order_number);
        console.log("[Storrik Webhook] License key:", licenseKey);

        // Calculate expiration date based on duration
        const expiresAt = new Date();
        if (order.duration.includes("Day")) {
          const days = parseInt(order.duration);
          expiresAt.setDate(expiresAt.getDate() + days);
        } else if (order.duration.includes("Week")) {
          const weeks = parseInt(order.duration);
          expiresAt.setDate(expiresAt.getDate() + (weeks * 7));
        } else if (order.duration.includes("Month")) {
          const months = parseInt(order.duration);
          expiresAt.setMonth(expiresAt.getMonth() + months);
        } else {
          // Default to 30 days
          expiresAt.setDate(expiresAt.getDate() + 30);
        }

        // Send purchase email
        try {
          await sendPurchaseEmail({
            customerEmail: customerEmail,
            orderNumber: order.order_number,
            productName: order.product_name,
            duration: order.duration,
            licenseKey: licenseKey,
            expiresAt: expiresAt,
            totalPaid: order.amount_cents / 100,
          });
          console.log("[Storrik Webhook] Email sent to:", customerEmail);
        } catch (emailError) {
          console.error("[Storrik Webhook] Email error:", emailError);
        }

        // Send Discord notification
        try {
          await sendDiscordNotification({
            type: "sale",
            productName: order.product_name,
            amount: order.amount_cents / 100,
            customerEmail: customerEmail,
            orderNumber: order.order_number,
          });
          console.log("[Storrik Webhook] Discord notification sent");
        } catch (discordError) {
          console.error("[Storrik Webhook] Discord error:", discordError);
        }
      }

      return NextResponse.json({ received: true, processed: orders.length });
    }

    // Handle payment failed
    if (event.type === "payment.failed") {
      const { transaction, customer } = event.data;
      const customerEmail = customer?.email || transaction?.email;

      console.log("[Storrik Webhook] Payment failed for:", customerEmail);

      if (customerEmail) {
        // Update orders to failed status
        await supabase
          .from("orders")
          .update({ status: "failed" })
          .eq("customer_email", customerEmail)
          .eq("status", "pending")
          .eq("payment_method", "storrik");
      }

      return NextResponse.json({ received: true });
    }

    // Unknown event type
    console.log("[Storrik Webhook] Unhandled event type:", event.type);
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("[Storrik Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
