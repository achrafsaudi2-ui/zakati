'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production we'd report to Sentry / etc. here. For now: console only.
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-dvh container-app flex flex-col items-center justify-center text-center py-10">
      <Logo size={56} className="mb-4" />
      <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6 text-danger" />
      </div>
      <h1
        className="text-[22px] font-medium tracking-tight text-charcoal-900 leading-tight"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Something broke
      </h1>
      <p className="text-[13px] text-charcoal-500 mt-2 max-w-[28ch] leading-relaxed">
        Your data is safe — it&apos;s stored locally and untouched. Try refreshing the calculation.
      </p>

      {error.digest && (
        <p className="text-[10px] text-charcoal-400 mt-3 font-mono">Trace: {error.digest}</p>
      )}

      <div className="flex flex-col gap-2 mt-6 w-full max-w-[280px]">
        <Button size="lg" fullWidth onClick={reset}>
          <RefreshCcw className="w-4 h-4" />
          Try again
        </Button>
        <Link
          href="/"
          className="flex items-center justify-center gap-1.5 py-2 text-[13px] text-charcoal-500 font-medium hover:text-charcoal-900 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          Go home
        </Link>
      </div>
    </div>
  );
}
