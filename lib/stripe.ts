import Stripe from 'stripe';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Client-side Stripe configuration
export const getStripePublishableKey = () => {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable');
  }
  return key;
};

// Stripe configuration constants
export const STRIPE_CONFIG = {
  currency: 'usd',
  payment_method_types: ['card'],
  mode: 'payment' as const,
  billing_address_collection: 'required' as const,
  shipping_address_collection: {
    allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'SE', 'NO', 'DK', 'FI'],
  },
  automatic_tax: {
    enabled: false, // Set to true if you want Stripe to handle tax calculation
  },
};

// Helper function to format amount for Stripe (convert dollars to cents)
export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100);
};

// Helper function to format amount from Stripe (convert cents to dollars)
export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100;
};

// Product metadata for Stripe
export interface StripeProductMetadata {
  product_id: string;
  product_name: string;
  variant_id?: string;
  duration: string;
  game: string;
  customer_email?: string;
  coupon_code?: string;
  coupon_discount?: string;
}

// Create line items for Stripe checkout
export const createStripeLineItems = (
  cartItems: Array<{
    id: string;
    productId: string;
    productName: string;
    game: string;
    duration: string;
    price: number;
    quantity: number;
    variantId?: string;
  }>
): Stripe.Checkout.SessionCreateParams.LineItem[] => {
  return cartItems.map((item) => ({
    price_data: {
      currency: STRIPE_CONFIG.currency,
      product_data: {
        name: `${item.productName} - ${item.duration}`,
        description: `${item.game} cheat for ${item.duration}`,
        metadata: {
          product_id: item.productId,
          variant_id: item.variantId || '',
          game: item.game,
        },
      },
      unit_amount: formatAmountForStripe(item.price),
    },
    quantity: item.quantity,
  }));
};