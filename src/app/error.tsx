'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[VoteSaathi Error]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)' }}>
        <AlertTriangle size={28} style={{ color: '#f97316' }} />
      </div>
      <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
        Something went wrong
      </h2>
      <p className="text-sm mb-8 max-w-sm" style={{ color: 'var(--foreground-muted)' }}>
        An unexpected error occurred. Your data is safe. You can try again or call the ECI helpline at{' '}
        <strong style={{ color: '#f97316' }}>1950</strong>.
      </p>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
        style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316' }}
      >
        <RefreshCw size={16} />
        Try Again
      </button>
    </div>
  );
}
