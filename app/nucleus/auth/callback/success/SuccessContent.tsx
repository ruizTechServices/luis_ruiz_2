'use client';
// =============================================================================
// NUCLEUS BOT OAUTH SUCCESS CONTENT - luis-ruiz.com
// Client component that shows success state
// =============================================================================

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  
  const hasTokens = searchParams.get('access_token') && searchParams.get('refresh_token');

  useEffect(() => {
    // Auto-close countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Try to close window (works if opened by Electron)
          window.close();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-emerald-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-2">
          Successfully signed in!
        </h1>

        {/* Description */}
        <p className="text-white/70 mb-6">
          {hasTokens ? (
            <>You&apos;re now signed in to Nucleus Bot. This window will close automatically.</>
          ) : (
            <>Authentication complete. You can close this window.</>
          )}
        </p>

        {/* Countdown */}
        <div className="text-sm text-white/50">
          Closing in {countdown} second{countdown !== 1 ? 's' : ''}...
        </div>

        {/* Manual close button */}
        <button
          onClick={() => window.close()}
          className="mt-6 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
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
