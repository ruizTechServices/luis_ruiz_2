// =============================================================================
// NUCLEUS BOT OAUTH SUCCESS PAGE - luis-ruiz.com
// Displays success message - Electron app will detect this URL and extract tokens
// =============================================================================

import { Suspense } from 'react';
import SuccessContent from './SuccessContent';

export default function NucleusAuthSuccessPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SuccessContent />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-6" />
        <p className="text-white/70">Processing...</p>
      </div>
    </div>
  );
}
