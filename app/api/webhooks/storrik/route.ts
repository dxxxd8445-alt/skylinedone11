import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendDiscordWebhook } from "@/lib/discord-webhook";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    console.log("[Storrik Webhook] Received webhook");
    
    const body = await request.json();
    console.log("[Storrik Webhook] Body:", JSON.stringify(body, null, 2));

    // Storrik webhook structure (adjust based on actual Storrik webhook format)
    const {
      event,
      data,
    } = body;

    // Handle different event types
    if (event === "checkout.completed" || event === "payment.succeeded") {
      const {
        checkoutId,
        productId,
        variantId,
        customerEmail,
        customerName,
        amount,
        currency,
        productName,
        variantName,
      } = data;

      console.log("[Storrik Webhook] Processing completed checkout:", checkoutId);

      const supabase = createAdminClient();

      // Create order
      const orderData = {
        customer_email: customerEmail,
        customer_name: customerName || customerEmail.split("@")[0],
        product_name: variantName ? `${productName} - ${variantName}` : productName,
        amount_cents: Math.round(amount * 100), // Convert to cents
        status: "completed",
        payment_method: "storrik",
        payment_intent_id: checkoutId,
      };

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error("[Storrik Webhook] Order creation error:", orderError);
        return NextResponse.json(
          { error: "Failed to create order" },
          { status: 500 }
        );
      }

      console.log("[Storrik Webhook] Order created:", order.id);

      // Generate license key
      const licenseKey = `SKY-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      // Create license
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days default

      const { data: license, error: licenseError } = await supabase
        .from("licenses")
        .insert({
          license_key: licenseKey,
          product_name: orderData.product_name,
          customer_email: customerEmail,
          status: "active",
          expires_at: expiresAt.toISOString(),
          order_id: order.id,
        })
        .select()
        .single();

      if (licenseError) {
        console.error("[Storrik Webhook] License creation error:", licenseError);
      } else {
        console.log("[Storrik Webhook] License created:", license.license_key);
      }

      // Send email with license key
      try {
        await resend.emails.send({
          from: "Skyline Cheats <orders@skylinecheats.org>",
          to: customerEmail,
          subject: `Your ${orderData.product_name} License Key`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #2563eb;">Thank you for your purchase!</h1>
              <p>Your order has been completed successfully.</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="margin-top: 0;">Your License Key:</h2>
                <p style="font-size: 24px; font-weight: bold; color: #2563eb; font-family: monospace;">
                  ${licenseKey}
                </p>
              </div>
              
              <p><strong>Product:</strong> ${orderData.product_name}</p>
              <p><strong>Order ID:</strong> ${order.id}</p>
              
              <p>You can manage your licenses and download your product from your account dashboard.</p>
              
              <p>If you have any questions, please contact our support team.</p>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
                Skyline Cheats - Premium Gaming Solutions
              </p>
            </div>
          `,
        });
        console.log("[Storrik Webhook] Email sent to:", customerEmail);
      } catch (emailError) {
        console.error("[Storrik Webhook] Email error:", emailError);
      }

      // Send Discord notification
      try {
        await sendDiscordWebhook({
          type: "purchase",
          data: {
            customerEmail,
            customerName: orderData.customer_name,
            productName: orderData.product_name,
            amount: (orderData.amount_cents / 100).toFixed(2),
            currency: currency || "USD",
            orderId: order.id,
            licenseKey,
          },
        });
        console.log("[Storrik Webhook] Discord notification sent");
      } catch (discordError) {
        console.error("[Storrik Webhook] Discord error:", discordError);
      }

      return NextResponse.json({ success: true, orderId: order.id });
    }

    // Handle other event types
    console.log("[Storrik Webhook] Unhandled event type:", event);
    return NextResponse.json({ success: true, message: "Event received" });

  } catch (error) {
    console.error("[Storrik Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
