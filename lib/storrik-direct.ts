"use client";

// Direct Storrik integration without CDN dependency
export async function openStorrikCheckout(productId: string, apiKey: string) {
  try {
    // Create checkout session via Storrik API
    const response = await fetch('https://api.storrik.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        product_id: productId,
        success_url: `${window.location.origin}/payment/success`,
        cancel_url: `${window.location.origin}/checkout/confirm`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Storrik API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Redirect to Storrik checkout page
    if (data.checkout_url) {
      window.location.href = data.checkout_url;
      return { success: true };
    }

    throw new Error('No checkout URL returned');
  } catch (error) {
    console.error('[Storrik Direct] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create checkout',
    };
  }
}
