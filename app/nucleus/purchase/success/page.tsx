// =============================================================================
// NUCLEUS BOT PURCHASE SUCCESS PAGE
// Shows after successful credit purchase via Stripe
// =============================================================================

export default function PurchaseSuccessPage() {
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
          Purchase Complete!
        </h1>

        {/* Description */}
        <p className="text-white/70 mb-6">
          Your credits have been added to your account. You can now return to Nucleus Bot and start using them.
        </p>

        {/* Instructions */}
        <div className="bg-slate-800/50 rounded-lg p-4 mb-6 text-left">
          <p className="text-white/60 text-sm">
            <strong className="text-white">Next steps:</strong>
          </p>
          <ol className="text-white/60 text-sm mt-2 list-decimal list-inside space-y-1">
            <li>Return to Nucleus Bot</li>
            <li>Your credit balance will update automatically</li>
            <li>Start chatting with AI models!</li>
          </ol>
        </div>

        {/* Close button */}
        <button
          onClick={() => window.close()}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
        >
          Close This Window
        </button>

        {/* Nucleus Bot branding */}
        <div className="mt-8 flex items-center justify-center gap-2 text-white/40 text-sm">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="4" fill="currentColor" className="text-slate-800" />
          </svg>
          <span>Nucleus Bot</span>
        </div>
      </div>
    </div>
  );
}
