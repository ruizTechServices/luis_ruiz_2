// =============================================================================
// NUCLEUS BOT AUTH HELPERS - luis-ruiz.com
// Authentication utilities for API routes
// =============================================================================

import { createClient } from '@/lib/clients/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { NucleusProfile } from './types';
import { getOrCreateProfile, getProfile } from './credits';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface AuthenticatedUser {
  id: string;
  email: string;
  profile: NucleusProfile;
}

export interface AuthResult {
  user: AuthenticatedUser | null;
  error: NextResponse | null;
}

// -----------------------------------------------------------------------------
// Auth Functions
// -----------------------------------------------------------------------------

/**
 * Authenticate request and get user info
 * Returns user data or error response
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthResult> {
  try {
    const supabase = await createClient();

    // Get session from Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'Unauthorized', code: 'UNAUTHORIZED' },
          { status: 401 }
        ),
      };
    }

    // Get or create nucleus profile
    const profile = await getOrCreateProfile(supabase, user.id, user.email || '');

    return {
      user: {
        id: user.id,
        email: user.email || '',
        profile,
      },
      error: null,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Authentication failed', code: 'AUTH_ERROR' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Get user from bearer token (for Electron app)
 */
export async function authenticateBearer(
  request: NextRequest
): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Missing or invalid authorization header', code: 'MISSING_AUTH' },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.substring(7); // Remove 'Bearer '

  try {
    const supabase = await createClient();

    // Verify the token by getting user
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
          { status: 401 }
        ),
      };
    }

    // Get profile
    const profile = await getOrCreateProfile(supabase, user.id, user.email || '');

    return {
      user: {
        id: user.id,
        email: user.email || '',
        profile,
      },
      error: null,
    };
  } catch (error) {
    console.error('Bearer auth error:', error);
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Authentication failed', code: 'AUTH_ERROR' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Higher-order function to wrap API routes with authentication
 */
export function withAuth(
  handler: (
    request: NextRequest,
    user: AuthenticatedUser
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { user, error } = await authenticateBearer(request);

    if (error) {
      return error;
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    return handler(request, user);
  };
}

/**
 * Extract user ID from request (doesn't validate)
 */
export function getUserIdFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  // For now, just return null - actual extraction happens in authenticateBearer
  return null;
}

/**
 * Create error response helper
 */
export function errorResponse(
  message: string,
  code: string,
  status: number,
  details?: Record<string, unknown>
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      code,
      ...(details && { details }),
    },
    { status }
  );
}

/**
 * Create success response helper
 */
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json(data, { status });
}
