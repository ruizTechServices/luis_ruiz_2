// =============================================================================
// NUCLEUS BOT API - /api/nucleus/credits/purchase
// Create Stripe checkout session for credit package purchase
// =============================================================================

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/clients/supabase/server';
import { stripe } from '@/lib/clients/stripe/client';
import { authenticateBearer, errorResponse, successResponse } from '@/lib/nucleus/auth';
import { getProfile, updateProfile } from '@/lib/nucleus/credits';
import type { CreditPackage, PurchaseRequest } from '@/lib/nucleus/types';

/**
 * POST /api/nucleus/credits/purchase
 * Create a Stripe checkout session for credit purchase
 * Body: { package_id: string, success_url?: string, cancel_url?: string }
 */
export async function POST(request: NextRequest) {
  const { user, error } = await authenticateBearer(request);
  if (error) return error;
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);

  try {
    const body: PurchaseRequest = await request.json();
    const { package_id, success_url, cancel_url } = body;

    if (!package_id) {
      return errorResponse('package_id is required', 'MISSING_PACKAGE_ID', 400);
    }

    const supabase = await createClient();

    // Get the credit package
    const { data: pkg, error: pkgError } = await supabase
      .from('nucleus_credit_packages')
      .select('*')
      .eq('id', package_id)
      .eq('is_active', true)
      .single();

    if (pkgError || !pkg) {
      return errorResponse('Package not found', 'PACKAGE_NOT_FOUND', 404);
    }

    const creditPackage = pkg as CreditPackage;

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
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luis-ruiz.com';
    const defaultSuccessUrl = `${baseUrl}/nucleus/purchase/success?session_id={CHECKOUT_SESSION_ID}`;
    const defaultCancelUrl = `${baseUrl}/nucleus/purchase/cancel`;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${creditPackage.name} - ${creditPackage.credits} Credits`,
              description: `Nucleus Bot credit package: ${creditPackage.credits} credits`,
            },
            unit_amount: creditPackage.price_cents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        package_id: creditPackage.id,
        credits: creditPackage.credits.toString(),
        type: 'credit_purchase',
      },
      success_url: success_url || defaultSuccessUrl,
      cancel_url: cancel_url || defaultCancelUrl,
    });

    return successResponse({
      checkout_url: session.url,
      session_id: session.id,
    });
  } catch (err) {
    console.error('Purchase error:', err);
    return errorResponse('Failed to create checkout session', 'CHECKOUT_ERROR', 500);
  }
}
