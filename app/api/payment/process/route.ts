import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendDiscordWebhook } from "@/lib/discord-webhook";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, cardNumber, expiryDate, cvv, cardName } = body;

    console.log("[Payment Process] Processing payment for order:", orderId);

    if (!orderId || !cardNumber || !expiryDate || !cvv || !cardName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Get order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // In a real implementation, you would:
    // 1. Validate card details
    // 2. Process payment with payment gateway
    // 3. Handle payment response
    
    // For now, we'll simulate successful payment
    console.log("[Payment Process] Simulating payment processing...");

    // Update order status to completed
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "completed",
        payment_intent_id: `pi_${Date.now()}`,
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("[Payment Process] Failed to update order:", updateError);
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 500 }
      );
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
          order_id: orderId,
        });

      if (!licenseError) {
        licenseKeys.push(licenseKey);
      }
    }

    console.log("[Payment Process] Generated license keys:", licenseKeys.length);

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
            <p><strong>Order ID:</strong> ${orderId}</p>
            
            <p>You can manage your licenses and download your product from your account dashboard.</p>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
              Skyline Cheats - Premium Gaming Solutions
            </p>
          </div>
        `,
      });
      console.log("[Payment Process] Email sent to:", order.customer_email);
    } catch (emailError) {
      console.error("[Payment Process] Email error:", emailError);
    }

    // Send Discord notification
    try {
      await sendDiscordWebhook({
        type: "purchase",
        data: {
          customerEmail: order.customer_email,
          customerName: order.customer_name,
          productName: order.product_name,
          amount: (order.amount_cents / 100).toFixed(2),
          currency: "USD",
          orderId: orderId,
          licenseKey: licenseKeys[0] || "N/A",
        },
      });
      console.log("[Payment Process] Discord notification sent");
    } catch (discordError) {
      console.error("[Payment Process] Discord error:", discordError);
    }

    return NextResponse.json({
      success: true,
      sessionId: orderId,
      licenseKeys: licenseKeys,
    });

  } catch (error) {
    console.error("[Payment Process] Error:", error);
    return NextResponse.json(
      { error: "Payment processing failed" },
      { status: 500 }
    );
  }
}
