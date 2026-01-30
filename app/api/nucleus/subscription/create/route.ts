// =============================================================================
// NUCLEUS BOT API - /api/nucleus/subscription/create
// Create Stripe checkout session for subscription
// =============================================================================

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/clients/supabase/server';
import { stripe } from '@/lib/clients/stripe/client';
import { authenticateBearer, errorResponse, successResponse } from '@/lib/nucleus/auth';
import { updateProfile } from '@/lib/nucleus/credits';
import type { SubscriptionPlan, SubscriptionCreateRequest } from '@/lib/nucleus/types';

/**
 * POST /api/nucleus/subscription/create
 * Create a Stripe checkout session for subscription
 * Body: { plan_id?: string, success_url?: string, cancel_url?: string }
 */
export async function POST(request: NextRequest) {
  const { user, error } = await authenticateBearer(request);
  if (error) return error;
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);

  try {
    const body: SubscriptionCreateRequest = await request.json();
    const { plan_id, success_url, cancel_url } = body;

    const supabase = await createClient();

    // Get the subscription plan (default to 'pro' if not specified)
    let query = supabase
      .from('nucleus_subscription_plans')
      .select('*')
      .eq('is_active', true);

    if (plan_id) {
      query = query.eq('id', plan_id);
    } else {
      query = query.eq('tier', 'pro');
    }

    const { data: plan, error: planError } = await query.single();

    if (planError || !plan) {
      return errorResponse('Subscription plan not found', 'PLAN_NOT_FOUND', 404);
    }

    const subscriptionPlan = plan as SubscriptionPlan;

    // Check if user already has active subscription
    if (user.profile.subscription_tier === 'pro' && 
        user.profile.subscription_status === 'active') {
      return errorResponse(
        'You already have an active subscription', 
        'ALREADY_SUBSCRIBED', 
        400
      );
    }

    // Get or create Stripe customer
    let stripeCustomerId = user.profile.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      stripeCustomerId = customer.id;

      // Save Stripe customer ID to profile
      await updateProfile(supabase, user.id, {
        stripe_customer_id: stripeCustomerId,
      });
    }

    // Default URLs
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000';
    const defaultSuccessUrl = `${baseUrl}/nucleus/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
    const defaultCancelUrl = `${baseUrl}/nucleus/subscription/cancel`;

    // Create checkout session with price_data (dynamic) or stripe_price_id if set
    let lineItems;
    
    if (subscriptionPlan.stripe_price_id) {
      lineItems = [
        {
          price: subscriptionPlan.stripe_price_id,
          quantity: 1,
        },
      ];
    } else {
      // Create price dynamically
      lineItems = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: subscriptionPlan.name,
              description: subscriptionPlan.description || 'Nucleus Bot Pro Subscription',
            },
            unit_amount: subscriptionPlan.price_cents,
            recurring: {
              interval: subscriptionPlan.billing_period === 'yearly' ? 'year' as const : 'month' as const,
            },
          },
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: lineItems,
      metadata: {
        user_id: user.id,
        plan_id: subscriptionPlan.id,
        tier: subscriptionPlan.tier,
        type: 'subscription',
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_id: subscriptionPlan.id,
          tier: subscriptionPlan.tier,
        },
      },
      success_url: success_url || defaultSuccessUrl,
      cancel_url: cancel_url || defaultCancelUrl,
    });

    return successResponse({
      checkout_url: session.url,
      session_id: session.id,
    });
  } catch (err) {
    console.error('Subscription creation error:', err);
    return errorResponse('Failed to create checkout session', 'CHECKOUT_ERROR', 500);
  }
}
