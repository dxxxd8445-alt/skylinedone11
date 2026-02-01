"use client";

import { getStripe } from './stripe-client';

export interface CheckoutItem {
  id: string;
  productId: string;
  productName: string;
  game: string;
  duration: string;
  price: number;
  quantity: number;
  variantId?: string;
}

export interface CheckoutOptions {
  items: CheckoutItem[];
  customerEmail: string;
  couponCode?: string;
  couponDiscountAmount?: number;
  successUrl?: string;
  cancelUrl?: string;
  guestCheckout?: boolean;
  guestInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    address?: string;
    city?: string;
    zipCode?: string;
    country?: string;
    phone?: string;
  };
}

export async function redirectToStripeCheckout(options: CheckoutOptions) {
  // Ensure this only runs on the client side
  if (typeof window === 'undefined') {
    return { 
      success: false, 
      error: 'This function can only be called on the client side' 
    };
  }

  try {
    console.log('🚀 Starting Stripe checkout with options:', options);

    // Create checkout session
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: options.items,
        customer_email: options.customerEmail,
        coupon_code: options.couponCode,
        coupon_discount_amount: options.couponDiscountAmount,
        success_url: options.successUrl,
        cancel_url: options.cancelUrl,
        guest_checkout: options.guestCheckout,
        guest_info: options.guestInfo,
      }),
    });

    console.log('📡 Checkout API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Checkout API error:', errorText);
      
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.error || 'Failed to create checkout session');
      } catch (parseError) {
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
    }

    const { sessionId, url } = await response.json();
    console.log('✅ Checkout session created:', { sessionId, url });

    // Redirect to Stripe Checkout
    if (url) {
      console.log('🔄 Redirecting to Stripe checkout...');
      window.location.href = url;
      return { success: true };
    }

    // Fallback: use Stripe.js to redirect
    console.log('🔄 Using Stripe.js fallback redirect...');
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error('Failed to load Stripe');
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });
    
    if (error) {
      throw new Error(error.message);
    }

    return { success: true };

  } catch (error: any) {
    console.error('❌ Stripe checkout error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to redirect to checkout' 
    };
  }
}

// Helper function to validate checkout data
export function validateCheckoutData(options: CheckoutOptions): string | null {
  if (!options.items || options.items.length === 0) {
    return 'No items in cart';
  }

  if (!options.customerEmail || !options.customerEmail.includes('@')) {
    return 'Valid email address is required';
  }

  for (const item of options.items) {
    if (!item.productId || !item.productName || !item.price || item.quantity <= 0) {
      return 'Invalid item data';
    }
  }

  return null;
}