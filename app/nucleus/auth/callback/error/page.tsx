// =============================================================================
// NUCLEUS BOT OAUTH ERROR PAGE - luis-ruiz.com
// Displays error when OAuth fails
// =============================================================================

import { Suspense } from 'react';
import ErrorContent from './ErrorContent';

export default function NucleusAuthErrorPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ErrorContent />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center p-8">
        <div className="animate-spin h-12 w-12 border-4 border-red-500 border-t-transparent rounded-full mx-auto" />
      </div>
    </div>
  );
}
