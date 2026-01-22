// =============================================================================
// NUCLEUS BOT OAUTH CALLBACK - luis-ruiz.com
// Handles OAuth redirect from Supabase, exchanges code for session,
// then redirects to Electron app via custom protocol
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    const errorUrl = new URL('/nucleus/auth/callback/error', request.url);
    errorUrl.searchParams.set('error', error);
    if (errorDescription) {
      errorUrl.searchParams.set('error_description', errorDescription);
    }
    return NextResponse.redirect(errorUrl);
  }

  // No code means something went wrong
  if (!code) {
    return NextResponse.redirect(
      new URL('/nucleus/auth/callback/error?error=missing_code', request.url)
    );
  }

  // Create Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(
      new URL('/nucleus/auth/callback/error?error=server_misconfigured', request.url)
    );
  }

  // Create response that we can attach cookies to
  const response = NextResponse.redirect(
    new URL('/nucleus/auth/callback/success', request.url)
  );

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Exchange code for session
  const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

  if (sessionError || !data.session) {
    console.error('[Nucleus Callback] Session exchange failed:', sessionError);
    return NextResponse.redirect(
      new URL(
        `/nucleus/auth/callback/error?error=${encodeURIComponent(sessionError?.message || 'session_exchange_failed')}`,
        request.url
      )
    );
  }

  // Success! Redirect to success page with tokens in URL for Electron to extract
  // We use a page (not custom protocol) so the Electron BrowserWindow can detect it
  const successUrl = new URL('/nucleus/auth/callback/success', request.url);
  successUrl.searchParams.set('access_token', data.session.access_token);
  successUrl.searchParams.set('refresh_token', data.session.refresh_token);
  if (data.session.expires_at) {
    successUrl.searchParams.set('expires_at', data.session.expires_at.toString());
  }

  // Update the redirect URL with tokens
  response.headers.set('Location', successUrl.toString());

  return response;
}
