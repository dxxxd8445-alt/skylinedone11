"use server";

import crypto from 'crypto';

const STORRIK_API_URL = "https://api.storrik.com";

interface LineItem {
  name: string;
  description: string;
  pricePerItemInCents: number;
  quantity: number;
}

interface CreatePaymentIntentParams {
  amount: number; // in cents
  currency: string;
  customerEmail?: string;
  description?: string;
  type?: 'hosted' | 'embed';
}

interface PaymentIntentResponse {
  ok: boolean;
  clientSecret: string;
  pk: string;
}

interface TransactionResponse {
  id: string;
  status: string;
  amount: number;
  currency: string;
  customer_email?: string;
  created_at: string;
  updated_at: string;
}

// Create payment intent
export async function createPaymentIntent(params: CreatePaymentIntentParams) {
  try {
    const apiKey = process.env.STORRIK_SECRET_KEY;
    
    console.log("[Storrik] Starting payment intent creation");
    console.log("[Storrik] API Key exists:", !!apiKey);
    console.log("[Storrik] Amount (cents):", params.amount);
    console.log("[Storrik] Currency:", params.currency);
    
    if (!apiKey) {
      console.error("[Storrik] API key is missing!");
      return { success: false, error: "Storrik API key not configured" };
    }

    const requestBody = {
      amount: params.amount,
      currency: params.currency || 'USD',
      payment_method: 'card',
      type: params.type || 'hosted',
      email: params.customerEmail,
    };

    console.log("[Storrik] Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${STORRIK_API_URL}/v1/payments/intents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log("[Storrik] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Storrik] Error response:", errorText);
      return {
        success: false,
        error: `Storrik API error: ${response.status} - ${errorText}`,
      };
    }

    const data: PaymentIntentResponse = await response.json();
    console.log("[Storrik] Success response:", data);

    if (!data.ok || !data.clientSecret) {
      console.error("[Storrik] Invalid response:", data);
      return {
        success: false,
        error: "Invalid response from Storrik API",
      };
    }

    // For hosted checkout, we need to construct the checkout URL
    const checkoutUrl = `https://checkout.storrik.com/pay/${data.clientSecret}?pk=${data.pk}`;

    return {
      success: true,
      clientSecret: data.clientSecret,
      pk: data.pk,
      checkoutUrl,
    };
  } catch (error) {
    console.error("[Storrik] Exception:", error);
    return {
      success: false,
      error: `Exception: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// Get transaction status
export async function getTransaction(transactionId: string) {
  try {
    const apiKey = process.env.STORRIK_SECRET_KEY;
    
    if (!apiKey) {
      return { success: false, error: "Storrik API key not configured" };
    }

    const response = await fetch(`${STORRIK_API_URL}/v1/payments/transactions/${transactionId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Storrik] Get transaction error:", response.status, errorText);
      return {
        success: false,
        error: `API error: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("[Storrik] Get transaction exception:", error);
    return {
      success: false,
      error: "Failed to get transaction status",
    };
  }
}

// Webhook signature verification
export async function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string
): Promise<boolean> {
  try {
    // Storrik uses format: t=timestamp,v1=signature
    if (!signatureHeader || !signatureHeader.includes(',')) {
      console.log("[Storrik] Invalid signature format");
      return false;
    }

    const parts = signatureHeader.split(',');
    const signaturePart = parts.find(part => part.startsWith('v1='));
    
    if (!signaturePart) {
      console.log("[Storrik] No v1 signature found");
      return false;
    }

    const signature = signaturePart.split('=')[1];
    
    if (!signature) {
      console.log("[Storrik] No signature value found");
      return false;
    }

    const computedHash = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");
    
    const isValid = crypto.timingSafeEqual(
      Buffer.from(computedHash, 'hex'),
      Buffer.from(signature, 'hex')
    );

    console.log("[Storrik] Signature verification:", isValid);
    return isValid;
  } catch (error) {
    console.error("[Storrik] Signature verification error:", error);
    return false;
  }
}

// Create checkout session (compatible with existing checkout flow)
export async function createCheckoutSession(params: {
  description: string;
  successUrl: string;
  cancelUrl: string;
  failureUrl: string;
  customerEmail: string;
  lineItems: LineItem[];
}) {
  try {
    // Calculate total amount from line items
    const totalAmount = params.lineItems.reduce(
      (sum, item) => sum + (item.pricePerItemInCents * item.quantity),
      0
    );

    console.log("[Storrik] Creating checkout session");
    console.log("[Storrik] Total amount (cents):", totalAmount);
    console.log("[Storrik] Customer email:", params.customerEmail);

    const result = await createPaymentIntent({
      amount: totalAmount,
      currency: 'USD',
      customerEmail: params.customerEmail,
      description: params.description,
      type: 'hosted',
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to create payment intent",
      };
    }

    return {
      success: true,
      checkoutUrl: result.checkoutUrl,
      checkoutSessionId: result.clientSecret,
    };
  } catch (error) {
    console.error("[Storrik] Checkout session error:", error);
    return {
      success: false,
      error: "Failed to create checkout session",
    };
  }
}
