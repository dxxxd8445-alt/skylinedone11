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

        // Try to get a license key from stock for this product/variant
        let licenseKey: string | null = null;
        let stockLicenseId: string | null = null;
        
        // First try to find a license for the specific variant
        if (order.variant_id) {
          const { data: variantLicense } = await supabase
            .from("licenses")
            .select("id, license_key")
            .eq("variant_id", order.variant_id)
            .is("order_id", null) // Not yet assigned to an order
            .is("customer_email", null) // Not yet assigned to a customer
            .limit(1)
            .single();
          
          if (variantLicense) {
            licenseKey = variantLicense.license_key;
            stockLicenseId = variantLicense.id;
          }
        }
        
        // If no variant-specific license, try product-specific
        if (!licenseKey && order.product_id) {
          const { data: productLicense } = await supabase
            .from("licenses")
            .select("id, license_key")
            .eq("product_id", order.product_id)
            .is("variant_id", null)
            .is("order_id", null) // Not yet assigned to an order
            .is("customer_email", null) // Not yet assigned to a customer
            .limit(1)
            .single();
          
          if (productLicense) {
            licenseKey = productLicense.license_key;
            stockLicenseId = productLicense.id;
          }
        }
        
        // If no stocked license found, generate a temporary one
        if (!licenseKey) {
          licenseKey = `TEMP-${Date.now()}-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
          console.warn(`[Stripe Webhook] No stocked license found for order ${orderId}, generated temporary key`);
        }

        // Calculate expiration date based on duration
        let expiresAt: Date | null = null;
        if (order.duration) {
          const now = new Date();
          const durationLower = order.duration.toLowerCase();
          
          if (durationLower.includes('day')) {
            const days = parseInt(durationLower) || 1;
            expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
          } else if (durationLower.includes('week')) {
            const weeks = parseInt(durationLower) || 1;
            expiresAt = new Date(now.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
          } else if (durationLower.includes('month')) {
            const months = parseInt(durationLower) || 1;
            expiresAt = new Date(now.setMonth(now.getMonth() + months));
          } else if (durationLower.includes('year')) {
            const years = parseInt(durationLower) || 1;
            expiresAt = new Date(now.setFullYear(now.getFullYear() + years));
          } else if (durationLower === 'lifetime') {
            expiresAt = new Date('2099-12-31');
          }
        }

        // If we found a stocked license, update it with customer info
        if (stockLicenseId) {
          await supabase
            .from("licenses")
            .update({ 
              order_id: orderId,
              customer_email: order.customer_email,
              status: "active",
              expires_at: expiresAt?.toISOString() || null,
              assigned_at: new Date().toISOString()
            })
            .eq("id", stockLicenseId);
        } else {
          // Create new license record for temporary key
          await supabase
            .from("licenses")
            .insert({
              license_key: licenseKey,
              customer_email: order.customer_email,
              product_id: order.product_id,
              product_name: order.product_name,
              variant_id: order.variant_id,
              order_id: orderId,
              status: "active",
              expires_at: expiresAt?.toISOString() || null,
              assigned_at: new Date().toISOString()
            });
        }

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
            customerEmail: order.customer_email,
            orderNumber: order.order_number,
            productName: order.product_name,
            duration: order.duration,
            licenseKey,
            expiresAt: expiresAt || new Date('2099-12-31'),
            totalPaid: order.amount_cents / 100,
          });
          console.log(`[Stripe Webhook] Purchase email sent to ${order.customer_email}`);
        } catch (emailError) {
          console.error("[Stripe Webhook] Email send failed:", emailError);
        }

        // Trigger Discord webhook for completed order
        try {
          await triggerWebhooks('order.completed', {
            order_number: order.order_number,
            customer_email: order.customer_email,
            customer_name: order.customer_email.split('@')[0],
            amount: order.amount_cents / 100,
            currency: 'usd',
            payment_method: 'stripe',
            items: [{
              name: order.product_name,
              quantity: 1,
              price: order.amount_cents / 100,
            }],
          });
          console.log(`[Stripe Webhook] Discord webhook triggered for order ${order.order_number}`);
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
