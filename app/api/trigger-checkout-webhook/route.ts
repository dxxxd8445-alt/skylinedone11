import { NextRequest, NextResponse } from "next/server";
import { triggerWebhooks } from "@/lib/discord-webhook";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      customer_email,
      customer_name,
      items,
      subtotal,
      discount,
      total,
      currency = "USD"
    } = body;

    // Trigger checkout started webhook
    await triggerWebhooks('checkout.started', {
      customer_email: customer_email || 'guest@example.com',
      customer_name: customer_name || 'Guest',
      session_id: `CART-${Date.now()}`,
      items: items || [],
      subtotal: subtotal || 0,
      discount: discount || 0,
      total: total || 0,
      currency: currency,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Checkout webhook error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to trigger webhook" },
      { status: 500 }
    );
  }
}
