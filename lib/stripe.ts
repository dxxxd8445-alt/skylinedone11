import Stripe from 'stripe';

// Initialize Stripe with your secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Helper to format amount for Stripe (convert dollars to cents)
export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100);
}

// Helper to format amount from Stripe (convert cents to dollars)
export function formatAmountFromStripe(amount: number): number {
  return amount / 100;
}
