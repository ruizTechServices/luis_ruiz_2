// =============================================================================
// NUCLEUS BOT API - /api/nucleus/user/profile
// Get and update user profile
// =============================================================================

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/clients/supabase/server';
import { authenticateBearer, errorResponse, successResponse } from '@/lib/nucleus/auth';
import { updateProfile } from '@/lib/nucleus/credits';

/**
 * GET /api/nucleus/user/profile
 * Get current user's profile with credit balance
 */
export async function GET(request: NextRequest) {
  const { user, error } = await authenticateBearer(request);
  if (error) return error;
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);

  return successResponse({
    profile: {
      id: user.profile.id,
      email: user.profile.email,
      display_name: user.profile.display_name,
      credit_balance: user.profile.credit_balance,
      subscription_tier: user.profile.subscription_tier,
      subscription_status: user.profile.subscription_status,
      subscription_ends_at: user.profile.subscription_ends_at,
      created_at: user.profile.created_at,
      updated_at: user.profile.updated_at,
    },
  });
}

/**
 * PATCH /api/nucleus/user/profile
 * Update user's profile (display_name only for now)
 */
export async function PATCH(request: NextRequest) {
  const { user, error } = await authenticateBearer(request);
  if (error) return error;
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);

  try {
    const body = await request.json();
    const { display_name } = body;

    if (!display_name || typeof display_name !== 'string') {
      return errorResponse('Invalid display_name', 'INVALID_INPUT', 400);
    }

    const supabase = await createClient();
    const updatedProfile = await updateProfile(supabase, user.id, {
      display_name: display_name.trim(),
    });

    return successResponse({
      profile: {
        id: updatedProfile.id,
        email: updatedProfile.email,
        display_name: updatedProfile.display_name,
        credit_balance: updatedProfile.credit_balance,
        subscription_tier: updatedProfile.subscription_tier,
        subscription_status: updatedProfile.subscription_status,
        subscription_ends_at: updatedProfile.subscription_ends_at,
        updated_at: updatedProfile.updated_at,
      },
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return errorResponse('Failed to update profile', 'UPDATE_ERROR', 500);
  }
}
