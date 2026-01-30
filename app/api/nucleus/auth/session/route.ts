// =============================================================================
// NUCLEUS BOT API - /api/nucleus/auth/session
// Get current user session and profile
// =============================================================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/clients/supabase/server';
import { getOrCreateProfile } from '@/lib/nucleus/credits';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated', code: 'NOT_AUTHENTICATED' },
        { status: 401 }
      );
    }

    // Get or create nucleus profile
    const profile = await getOrCreateProfile(supabase, user.id, user.email || '');

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at,
      },
      profile: {
        id: profile.id,
        email: profile.email,
        display_name: profile.display_name,
        credit_balance: profile.credit_balance,
        subscription_tier: profile.subscription_tier,
        subscription_status: profile.subscription_status,
        subscription_ends_at: profile.subscription_ends_at,
        created_at: profile.created_at,
      },
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Failed to get session', code: 'SESSION_ERROR' },
      { status: 500 }
    );
  }
}
