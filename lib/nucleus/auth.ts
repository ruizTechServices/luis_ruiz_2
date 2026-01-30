//C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\lib\nucleus\auth.ts
// =============================================================================
// NUCLEUS BOT AUTH HELPERS - luis-ruiz.com
// Authentication utilities for API routes
// =============================================================================

import { createClient } from '@/lib/clients/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import type { NucleusProfile } from './types';
import { getOrCreateProfile } from './credits';

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
// JWT Verification
// -----------------------------------------------------------------------------

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  '';

const SUPABASE_JWT_ISSUER =
  process.env.SUPABASE_JWT_ISSUER ||
  (SUPABASE_URL ? `${SUPABASE_URL}/auth/v1` : '');

const SUPABASE_JWT_AUDIENCE =
  process.env.SUPABASE_JWT_AUDIENCE || 'authenticated';

const SUPABASE_JWKS_URL =
  process.env.SUPABASE_JWKS_URL ||
  (SUPABASE_URL ? `${SUPABASE_URL}/auth/v1/keys` : '');

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getSupabaseJwks() {
  if (!SUPABASE_JWKS_URL) return null;
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(SUPABASE_JWKS_URL));
  }
  return jwks;
}

async function verifySupabaseJwt(token: string): Promise<JWTPayload> {
  const jwksClient = getSupabaseJwks();
  if (!jwksClient || !SUPABASE_JWT_ISSUER) {
    throw new Error('Supabase JWT verification is not configured');
  }

  const { payload } = await jwtVerify(token, jwksClient, {
    issuer: SUPABASE_JWT_ISSUER,
    audience: SUPABASE_JWT_AUDIENCE,
  });

  return payload;
}

// -----------------------------------------------------------------------------
// Auth Functions
// -----------------------------------------------------------------------------

/**
 * Authenticate request and get user info
 * Returns user data or error response
 */
export async function authenticateRequest(): Promise<AuthResult> {
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
    const payload = await verifySupabaseJwt(token);
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
    const emailFromToken = typeof payload.email === 'string' ? payload.email : '';
    const profile = await getOrCreateProfile(
      supabase,
      user.id,
      user.email || emailFromToken
    );

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
 * Create error response helper
 */
export function errorResponse(
  message: string,
  code: string,
  status: number,
  details?: Record<string, unknown>,
  headers?: HeadersInit
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      code,
      ...(details && { details }),
    },
    { status, headers }
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
