// =============================================================================
// NUCLEUS BOT PURCHASE CANCEL PAGE - luis-ruiz.com
// Displayed when user cancels Stripe checkout
// =============================================================================

export default function NucleusPurchaseCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        {/* Cancel Icon */}
        <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-amber-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-2">
          Purchase Canceled
        </h1>

        {/* Description */}
        <p className="text-white/70 mb-6">
          Your purchase was canceled. No charges were made to your account.
          You can try again anytime from the Nucleus Bot app.
        </p>

        {/* Close button */}
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.close();
            }
          }}
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
