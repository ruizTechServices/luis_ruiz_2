// =============================================================================
// NUCLEUS BOT API - /api/nucleus/subscription/cancel
// Cancel user's subscription
// =============================================================================

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/clients/supabase/server';
import { stripe } from '@/lib/clients/stripe/client';
import { authenticateBearer, errorResponse, successResponse } from '@/lib/nucleus/auth';
import { cancelSubscription } from '@/lib/nucleus/credits';

/**
 * POST /api/nucleus/subscription/cancel
 * Cancel the user's current subscription (at period end)
 */
export async function POST(request: NextRequest) {
  const { user, error } = await authenticateBearer(request);
  if (error) return error;
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);

  try {
    // Check if user has active subscription
    if (user.profile.subscription_tier !== 'pro' || 
        user.profile.subscription_status !== 'active') {
      return errorResponse(
        'No active subscription to cancel', 
        'NO_SUBSCRIPTION', 
        400
      );
    }

    if (!user.profile.stripe_customer_id) {
      return errorResponse(
        'No Stripe customer found', 
        'NO_STRIPE_CUSTOMER', 
        400
      );
    }

    // Get the customer's subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.profile.stripe_customer_id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      // No active subscription in Stripe, update local status
      const supabase = await createClient();
      await cancelSubscription(supabase, user.id, new Date().toISOString());
      
      return successResponse({
        message: 'Subscription status updated',
        subscription_ends_at: new Date().toISOString(),
      });
    }

    const subscription = subscriptions.data[0];

    // Cancel at period end (user keeps access until end of billing period)
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.id,
      { cancel_at_period_end: true }
    );

    // Update local database
    const supabase = await createClient();
    const endsAt = new Date(updatedSubscription.current_period_end * 1000).toISOString();
    await cancelSubscription(supabase, user.id, endsAt);

    return successResponse({
      message: 'Subscription will be canceled at the end of the billing period',
      subscription_ends_at: endsAt,
      current_period_end: updatedSubscription.current_period_end,
    });
  } catch (err) {
    console.error('Subscription cancellation error:', err);
    return errorResponse('Failed to cancel subscription', 'CANCEL_ERROR', 500);
  }
}
