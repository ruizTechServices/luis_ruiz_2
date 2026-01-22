// =============================================================================
// NUCLEUS BOT API - /api/nucleus/subscription/plans
// Get available subscription plans
// =============================================================================

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/clients/supabase/server';
import { successResponse, errorResponse } from '@/lib/nucleus/auth';
import type { SubscriptionPlan } from '@/lib/nucleus/types';

/**
 * GET /api/nucleus/subscription/plans
 * Get all active subscription plans
 * No authentication required - public endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: plans, error } = await supabase
      .from('nucleus_subscription_plans')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Failed to fetch subscription plans:', error);
      return errorResponse('Failed to fetch plans', 'FETCH_ERROR', 500);
    }

    // Format for client
    const formattedPlans = (plans as SubscriptionPlan[]).map(plan => ({
      id: plan.id,
      name: plan.name,
      tier: plan.tier,
      description: plan.description,
      price_cents: plan.price_cents,
      price_display: `$${(plan.price_cents / 100).toFixed(2)}`,
      billing_period: plan.billing_period,
      monthly_credits: plan.monthly_credits, // null = unlimited
      unlimited: plan.monthly_credits === null,
      features: plan.features,
    }));

    return successResponse({
      plans: formattedPlans,
    });
  } catch (err) {
    console.error('Plans error:', err);
    return errorResponse('Failed to get plans', 'PLANS_ERROR', 500);
  }
}
