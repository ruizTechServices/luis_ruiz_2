// =============================================================================
// STRIPE CLIENT - luis-ruiz.com
// Stripe SDK initialization for Nucleus Bot payments
// =============================================================================

import Stripe from 'stripe';

// Don't throw at module load time - check at runtime instead
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// Lazy initialization - only create client when first used
let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
  }
  
  if (!stripeClient) {
    stripeClient = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    });
  }
  
  return stripeClient;
}

// Export a getter that throws if not configured
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    const client = getStripe();
    return (client as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// Webhook secret for verifying Stripe events
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// Public key for client-side (if needed)
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

// Check if Stripe is configured
export function isStripeConfigured(): boolean {
  return Boolean(STRIPE_SECRET_KEY);
}
