// =============================================================================
// NUCLEUS BOT OAUTH CALLBACK - luis-ruiz.com
// Handles OAuth redirect from Supabase, exchanges code for session,
// then redirects to Electron app via custom protocol
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';

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

  // Success! Redirect to success page with the auth code for the Electron app to exchange via PKCE.
  // We use a page (not custom protocol) so the Electron BrowserWindow can detect it.
  const successUrl = new URL('/nucleus/auth/callback/success', request.url);
  successUrl.searchParams.set('code', code);

  return NextResponse.redirect(successUrl);
}
