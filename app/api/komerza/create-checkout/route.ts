import { NextRequest, NextResponse } from "next/server";
import { createKomerzaCheckout } from "@/lib/komerza";

interface CheckoutRequest {
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    productSlug: string;
    duration: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  customerEmail: string;
  customerName: string;
  couponCode?: string;
  subtotal: number;
  discount: number;
  total: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();
    const { items, customerEmail, couponCode, total } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    if (!customerEmail) {
      return NextResponse.json({ error: "Customer email required" }, { status: 400 });
    }

    // Convert cart items to Komerza format
    const komerzaItems = items.map(item => ({
      productId: item.productId,
      variantId: item.productId, // Use product ID as variant ID for now
      quantity: item.quantity,
    }));

    const result = await createKomerzaCheckout({
      items: komerzaItems,
      theme: 'auto',
      returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/confirm`,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create Komerza checkout" },
        { status: 500 }
      );
    }

    console.log("[Komerza Checkout] Created checkout:", result);

    return NextResponse.json({
      success: true,
      orderNumber: result.orderNumber,
      checkoutConfig: result.checkoutConfig,
    });

  } catch (error) {
    console.error("[Komerza Checkout] Error:", error);
    return NextResponse.json(
      { error: "Failed to process checkout" },
      { status: 500 }
    );
  }
}
