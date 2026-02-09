import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      orderId, 
      customerEmail, 
      items, 
      subtotal, 
      discount, 
      total, 
      couponCode,
      paymentMethod, // "litecoin" or "bitcoin"
      cryptoAmount,
      cryptoAddress
    } = body;

    // Use admin client to bypass RLS
    const supabase = createAdminClient();

    // Create order with pending status
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderId,
        customer_email: customerEmail,
        product_id: items[0]?.productId || null,
        product_name: items.map((i: any) => i.productName).join(", "),
        duration: items[0]?.duration || "N/A",
        amount_cents: Math.round(total * 100),
        currency: "USD",
        status: "pending", // IMPORTANT: Set to pending for crypto
        payment_method: paymentMethod, // "litecoin" or "bitcoin"
        coupon_code: couponCode || null,
        coupon_discount_amount: discount,
        crypto_amount: cryptoAmount,
        crypto_address: cryptoAddress,
        metadata: {
          items: items,
          subtotal_usd: subtotal,
          discount_usd: discount,
          total_usd: total,
        },
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return NextResponse.json(
        { success: false, error: orderError.message || "Failed to create order", details: orderError },
        { status: 500 }
      );
    }

    // If there are multiple items, we need to handle them
    // For now, the main order record captures the first product
    // You can extend this to create order_items if needed

    return NextResponse.json({
      success: true,
      orderId: orderId,
      message: "Order created successfully with pending status",
    });
  } catch (error: any) {
    console.error("Crypto order error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
