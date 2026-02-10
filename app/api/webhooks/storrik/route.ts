import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log("[Storrik Webhook] Received webhook:", JSON.stringify(body, null, 2));

    // Storrik webhook payload structure
    // Based on the events we selected: Transaction Succeeded, Refunded, Disputes
    const { type, data } = body;

    // Handle transaction succeeded event (payment completed)
    if (type === "transaction.succeeded" || type === "transaction.completed") {
      const { 
        id: transactionId,
        customer,
        metadata 
      } = data;

      // Try to find order by customer email or metadata
      const customerEmail = customer?.email || metadata?.customer_email;
      
      if (!customerEmail) {
        console.error("[Storrik Webhook] No customer email in webhook data");
        return NextResponse.json({ error: "No customer email" }, { status: 400 });
      }

      const supabase = createAdminClient();

      // Find the most recent pending order for this customer
      const { data: orders, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_email", customerEmail)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1);

      if (orderError || !orders || orders.length === 0) {
        console.error("[Storrik Webhook] No pending order found for:", customerEmail);
        return NextResponse.json({ error: "No pending order found" }, { status: 404 });
      }

      const order = orders[0];

      // Check if already processed
      if (order.status === "completed") {
        console.log("[Storrik Webhook] Order already completed:", order.id);
        return NextResponse.json({ success: true, message: "Already processed" });
      }

      console.log("[Storrik Webhook] Processing payment for order:", order.id);

      // Update order status to completed
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "completed",
          payment_intent_id: transactionId,
        })
        .eq("id", order.id);

      if (updateError) {
        console.error("[Storrik Webhook] Failed to update order:", updateError);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
      }

      // Generate license keys for each item
      const items = order.metadata?.items || [];
      const licenseKeys: string[] = [];

      for (const item of items) {
        const licenseKey = `SKY-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

        const { error: licenseError } = await supabase
          .from("licenses")
          .insert({
            license_key: licenseKey,
            product_name: item.productName,
            customer_email: order.customer_email,
            status: "active",
            expires_at: expiresAt.toISOString(),
            order_id: order.id,
          });

        if (!licenseError) {
          licenseKeys.push(licenseKey);
        }
      }

      console.log("[Storrik Webhook] Generated license keys:", licenseKeys.length);

      // Send email with license keys
      try {
        await resend.emails.send({
          from: "Skyline Cheats <orders@skylinecheats.org>",
          to: order.customer_email,
          subject: `Your ${order.product_name} License Key${licenseKeys.length > 1 ? 's' : ''}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #2563eb;">Thank you for your purchase!</h1>
              <p>Your order has been completed successfully.</p>
              
              ${licenseKeys.map((key, index) => `
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h2 style="margin-top: 0;">License Key ${licenseKeys.length > 1 ? `#${index + 1}` : ''}:</h2>
                  <p style="font-size: 24px; font-weight: bold; color: #2563eb; font-family: monospace;">
                    ${key}
                  </p>
                </div>
              `).join('')}
              
              <p><strong>Product:</strong> ${order.product_name}</p>
              <p><strong>Order ID:</strong> ${order.id}</p>
              
              <p>You can manage your licenses and download your product from your account dashboard.</p>
              
              <p>If you have any questions, please contact our support team.</p>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
                Skyline Cheats - Premium Gaming Solutions
              </p>
            </div>
          `,
        });
        console.log("[Storrik Webhook] Email sent to:", order.customer_email);
      } catch (emailError) {
        console.error("[Storrik Webhook] Email error:", emailError);
      }

      // Send Discord notification
      try {
        const { triggerWebhooks } = await import("@/lib/discord-webhook");
        await triggerWebhooks("order.completed", {
          order_number: order.order_number || order.id,
          customer_email: order.customer_email,
          customer_name: order.customer_name,
          amount: order.amount_cents / 100,
          currency: "USD",
          items: items.map((item: any) => ({
            name: item.productName,
            quantity: item.quantity,
            price: item.price,
          })),
        });
        console.log("[Storrik Webhook] Discord notification sent");
      } catch (discordError) {
        console.error("[Storrik Webhook] Discord error:", discordError);
      }

      return NextResponse.json({ success: true });
    }

    // Handle refund events
    if (type === "refunded.created" || type === "refunded.partial") {
      console.log("[Storrik Webhook] Refund event received:", type);
      // Handle refunds - deactivate licenses, update order status, etc.
      return NextResponse.json({ success: true, message: "Refund event received" });
    }

    // Handle dispute events
    if (type === "dispute.created" || type === "dispute.won" || type === "dispute.lost") {
      console.log("[Storrik Webhook] Dispute event received:", type);
      // Handle disputes - notify admin, update order status, etc.
      return NextResponse.json({ success: true, message: "Dispute event received" });
    }

    // Handle other events
    console.log("[Storrik Webhook] Unhandled event type:", type);
    return NextResponse.json({ success: true, message: "Event received" });

  } catch (error) {
    console.error("[Storrik Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
