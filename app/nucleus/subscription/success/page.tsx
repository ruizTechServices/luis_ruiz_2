// =============================================================================
// NUCLEUS BOT SUBSCRIPTION SUCCESS PAGE - luis-ruiz.com
// Displayed after successful Pro subscription via Stripe
// =============================================================================

export default function NucleusSubscriptionSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        {/* Success Icon with Pro badge */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-emerald-500"
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
          {/* Pro badge */}
          <div className="absolute -top-1 -right-1 bg-amber-500 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
            PRO
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome to Nucleus Pro! 🎉
        </h1>

        {/* Description */}
        <p className="text-white/70 mb-6">
          Your Pro subscription is now active. Enjoy unlimited access to all AI models!
        </p>

        {/* Features unlocked */}
        <div className="bg-slate-800/50 rounded-lg p-4 mb-6 text-left">
          <p className="text-white/80 text-sm font-semibold mb-2">
            ✨ You now have access to:
          </p>
          <ul className="text-white/60 text-sm space-y-1">
            <li>• Unlimited requests per month</li>
            <li>• All AI models (Claude Opus, GPT-4, etc.)</li>
            <li>• Priority support</li>
            <li>• Usage analytics</li>
            <li>• Early access to new features</li>
          </ul>
        </div>

        {/* Close button */}
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.close();
            }
          }}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
        >
          Return to Nucleus Bot
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
          <span>Nucleus Bot Pro</span>
        </div>
      </div>
    </div>
  );
}
