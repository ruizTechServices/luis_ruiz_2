// =============================================================================
// NUCLEUS BOT API - /api/nucleus/webhooks/stripe
// Stripe webhook handler for payment and subscription events
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/clients/stripe/client';
import { createClient } from '@/lib/clients/supabase/server';
import { 
  addCredits, 
  activateSubscription, 
  cancelSubscription,
  expireSubscription,
  getProfileByStripeCustomer,
  updateProfile 
} from '@/lib/nucleus/credits';
import type Stripe from 'stripe';

/**
 * POST /api/nucleus/webhooks/stripe
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    console.error('Missing stripe-signature header');
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    );
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      // -------------------------------------------------------------------------
      // Checkout completed (one-time purchase or new subscription)
      // -------------------------------------------------------------------------
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        const userId = session.metadata?.user_id;
        const type = session.metadata?.type;

        if (!userId) {
          console.error('No user_id in checkout session metadata');
          break;
        }

        if (type === 'credit_purchase') {
          // Credit package purchase
          const credits = parseInt(session.metadata?.credits || '0', 10);

          if (credits > 0) {
            await addCredits(supabase, userId, credits, {
              type: 'purchase',
              description: `Purchased ${credits} credits`,
              amount_cents: session.amount_total || undefined,
              stripe_payment_intent_id: session.payment_intent as string,
              stripe_checkout_session_id: session.id,
            });
            console.log(`Added ${credits} credits to user ${userId}`);
          }
        } else if (type === 'subscription') {
          // New subscription
          const stripeCustomerId = session.customer as string;
          
          await activateSubscription(supabase, userId, stripeCustomerId);
          console.log(`Activated subscription for user ${userId}`);
        }
        break;
      }

      // -------------------------------------------------------------------------
      // Invoice paid (subscription renewal)
      // -------------------------------------------------------------------------
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Only process subscription invoices (not one-time payments)
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );
          
          const userId = subscription.metadata?.user_id;
          
          if (userId) {
            // Ensure subscription is active
            await activateSubscription(
              supabase, 
              userId, 
              invoice.customer as string
            );
            console.log(`Subscription renewed for user ${userId}`);
          }
        }
        break;
      }

      // -------------------------------------------------------------------------
      // Invoice payment failed
      // -------------------------------------------------------------------------
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );
          
          const userId = subscription.metadata?.user_id;
          
          if (userId) {
            await updateProfile(supabase, userId, {
              subscription_status: 'past_due',
            });
            console.log(`Payment failed for user ${userId}`);
          }
        }
        break;
      }

      // -------------------------------------------------------------------------
      // Subscription updated (canceled, plan changed, etc.)
      // -------------------------------------------------------------------------
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (!userId) {
          // Try to find user by customer ID
          const profile = await getProfileByStripeCustomer(
            supabase, 
            subscription.customer as string
          );
          if (!profile) break;
        }

        const effectiveUserId = userId || (await getProfileByStripeCustomer(
          supabase, 
          subscription.customer as string
        ))?.id;

        if (!effectiveUserId) break;

        if (subscription.cancel_at_period_end) {
          // Subscription will be canceled at period end
          const endsAt = new Date(subscription.current_period_end * 1000).toISOString();
          await cancelSubscription(supabase, effectiveUserId, endsAt);
          console.log(`Subscription will cancel for user ${effectiveUserId} at ${endsAt}`);
        } else if (subscription.status === 'active') {
          // Subscription reactivated
          await activateSubscription(
            supabase, 
            effectiveUserId, 
            subscription.customer as string
          );
        }
        break;
      }

      // -------------------------------------------------------------------------
      // Subscription deleted/canceled
      // -------------------------------------------------------------------------
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        let userId = subscription.metadata?.user_id;

        if (!userId) {
          // Find by customer ID
          const profile = await getProfileByStripeCustomer(
            supabase, 
            subscription.customer as string
          );
          if (profile) {
            userId = profile.id;
          }
        }

        if (userId) {
          await expireSubscription(supabase, userId);
          console.log(`Subscription expired for user ${userId}`);
        }
        break;
      }

      // -------------------------------------------------------------------------
      // Customer deleted
      // -------------------------------------------------------------------------
      case 'customer.deleted': {
        const customer = event.data.object as Stripe.Customer;
        
        const profile = await getProfileByStripeCustomer(supabase, customer.id);
        if (profile) {
          await updateProfile(supabase, profile.id, {
            stripe_customer_id: null,
            subscription_tier: 'credits',
            subscription_status: null,
            subscription_ends_at: null,
          });
          console.log(`Cleared Stripe data for user ${profile.id}`);
        }
        break;
      }

      // -------------------------------------------------------------------------
      // Payment intent succeeded (for one-time payments not through checkout)
      // -------------------------------------------------------------------------
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Handle if metadata has credit purchase info
        const userId = paymentIntent.metadata?.user_id;
        const credits = parseInt(paymentIntent.metadata?.credits || '0', 10);

        if (userId && credits > 0) {
          await addCredits(supabase, userId, credits, {
            type: 'purchase',
            description: `Purchased ${credits} credits via payment intent`,
            amount_cents: paymentIntent.amount,
            stripe_payment_intent_id: paymentIntent.id,
          });
          console.log(`Added ${credits} credits to user ${userId} via payment intent`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error(`Error processing webhook ${event.type}:`, err);
    return NextResponse.json(
      { error: 'Webhook handler error' },
      { status: 500 }
    );
  }
}

// Disable body parsing - we need the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};
