"use server";

import { createClient } from "@/lib/supabase/server";

interface KomerzaCheckoutParams {
  items: Array<{
    productId: string;
    variantId: string;
    quantity: number;
  }>;
  theme?: 'light' | 'dark' | 'auto';
  returnUrl?: string;
  cancelUrl?: string;
}

interface KomerzaProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  variant_id?: string;
  image?: string;
}

// Get product information from database
export async function getProductInfo(productSlug: string): Promise<KomerzaProduct | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", productSlug)
    .single();

  if (error || !data) {
    console.error("[Komerza] Error fetching product:", error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    price: data.price || 0,
    variant_id: data.variant_id,
    image: data.image,
  };
}

// Create checkout session for Komerza
export async function createKomerzaCheckout(params: KomerzaCheckoutParams) {
  try {
    console.log("[Komerza] Creating checkout session");
    
    // Generate order number
    const year = new Date().getFullYear();
    const orderNum = Math.floor(Math.random() * 9000) + 1000;
    const orderNumber = `KZ-${year}-${orderNum}`;

    const supabase = await createClient();

    // Create orders for each item
    const orderIds: string[] = [];
    
    for (const item of params.items) {
      const productInfo = await getProductInfo(item.productId);
      
      if (!productInfo) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      // Create pending order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: `${orderNumber}-${item.productId}`,
          customer_email: "", // Will be filled by webhook
          product_id: productInfo.id,
          product_name: productInfo.name,
          duration: "Digital Product", // Default duration
          amount_cents: Math.round(productInfo.price * item.quantity * 100),
          status: "pending",
          payment_method: "komerza",
          quantity: item.quantity,
        })
        .select()
        .single();

      if (orderError) {
        console.error("[Komerza] Order creation error:", orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      if (order) {
        orderIds.push(order.id);
      }
    }

    if (orderIds.length === 0) {
      throw new Error("Failed to create orders");
    }

    // Return checkout configuration for frontend
    return {
      success: true,
      orderNumber,
      orderIds,
      checkoutConfig: {
        items: params.items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        theme: params.theme || 'auto',
        returnUrl: params.returnUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?order=${orderNumber}`,
        cancelUrl: params.cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/confirm`,
      }
    };

  } catch (error) {
    console.error("[Komerza] Error creating checkout:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create checkout",
    };
  }
}

// Get Komerza API key from settings
export async function getKomerzaApiKey(): Promise<string | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "komerza_api_key")
    .single();

  if (error || !data) {
    console.error("[Komerza] Error fetching API key:", error);
    return null;
  }

  let apiKey = null;
  try {
    apiKey = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
  } catch (e) {
    console.error("[Komerza] Error parsing API key:", e);
    apiKey = data.value;
  }

  return apiKey;
}
