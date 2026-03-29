'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-[#E23232]/10 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-[#E23232]" />
        </div>
        <h1 className="text-2xl font-display text-foreground mb-2">Something went wrong</h1>
        <p className="text-foreground/50 text-sm mb-8">
          An unexpected error occurred. Our team has been notified.
        </p>
        <button
          onClick={reset}
          className="bg-[#E23232] hover:bg-[#E23232]/80 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
