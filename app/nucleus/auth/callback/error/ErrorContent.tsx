'use client';
// =============================================================================
// NUCLEUS BOT OAUTH ERROR CONTENT - luis-ruiz.com
// Client component that shows error state
// =============================================================================

import { useSearchParams } from 'next/navigation';

const ERROR_MESSAGES: Record<string, string> = {
  missing_code: 'Authorization code was not received. Please try signing in again.',
  server_misconfigured: 'Server configuration error. Please contact support.',
  session_exchange_failed: 'Failed to complete sign-in. Please try again.',
  access_denied: 'Access was denied. Please try again or use a different account.',
  default: 'An unexpected error occurred during sign-in.',
};

export default function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'default';
  const errorDescription = searchParams.get('error_description');

  const errorMessage = errorDescription || ERROR_MESSAGES[error] || ERROR_MESSAGES.default;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        {/* Error Icon */}
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-2">
          Sign-in Failed
        </h1>

        {/* Error message */}
        <p className="text-white/70 mb-6">{errorMessage}</p>

        {/* Error code (for debugging) */}
        {error !== 'default' && (
          <p className="text-xs text-white/30 mb-6 font-mono">
            Error code: {error}
          </p>
        )}

        {/* Retry button */}
        <button
          onClick={() => window.close()}
          className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
        >
          Close Window
        </button>

        {/* Nucleus Bot branding */}
        <div className="mt-8 flex items-center justify-center gap-2 text-white/40 text-sm">
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="4" fill="currentColor" className="text-slate-800" />
          </svg>
          <span>Nucleus Bot</span>
        </div>
      </div>
    </div>
  );
}
