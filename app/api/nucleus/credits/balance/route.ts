// =============================================================================
// NUCLEUS BOT API - /api/nucleus/credits/balance
// Get user's credit balance
// =============================================================================

import { NextRequest } from 'next/server';
import { authenticateBearer, errorResponse, successResponse } from '@/lib/nucleus/auth';

/**
 * GET /api/nucleus/credits/balance
 * Get current credit balance and subscription status
 */
export async function GET(request: NextRequest) {
  const { user, error } = await authenticateBearer(request);
  if (error) return error;
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);

  const profile = user.profile;

  // Check if subscription is active
  const subscriptionActive = 
    profile.subscription_tier === 'pro' &&
    profile.subscription_status === 'active' &&
    (profile.subscription_ends_at === null || 
     new Date(profile.subscription_ends_at) > new Date());

  return successResponse({
    credit_balance: profile.credit_balance,
    subscription_tier: profile.subscription_tier,
    subscription_status: profile.subscription_status,
    subscription_ends_at: profile.subscription_ends_at,
    subscription_active: subscriptionActive,
    // If pro subscriber, they have unlimited credits effectively
    effective_credits: subscriptionActive ? 'unlimited' : profile.credit_balance,
  });
}
