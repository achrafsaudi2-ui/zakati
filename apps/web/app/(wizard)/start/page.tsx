'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBadge } from '@/components/ui/Card';
import { useResultsAcrossViews, useZakatStore } from '@/lib/store';
import { formatMoney } from '@/lib/utils';
import type { View } from '@zakati/engine';

interface ViewOption {
  key: View;
  name: string;
  short: string;
  long: string;
  recommended?: boolean;
}

const VIEWS: ViewOption[] = [
  {
    key: 'Strict',
    name: 'Strict',
    short: 'Most inclusive. Errs toward paying more — spiritually safer.',
    long: 'AAOIFI Standard 35 snapshot. Highest amount.',
    recommended: true,
  },
  {
    key: 'Moderate',
    name: 'Moderate',
    short: 'Time-weighted average through the haul. Each asset checked.',
    long: 'Maliki/Shafi\u2019i positions. Middle amount.',
  },
  {
    key: 'Lenient',
    name: 'Lenient',
    short: 'Only haul-completed wealth at lowest balance.',
    long: 'Strict haul-per-asset. Lowest amount.',
  },
];

export default function ViewPickerPage() {
  const router = useRouter();
  const view = useZakatStore((s) => s.view);
  const setView = useZakatStore((s) => s.setView);
  const primaryCurrency = useZakatStore((s) => s.primaryCurrency);
  const assetsCount = useZakatStore((s) => s.assets.length);
  const results = useResultsAcrossViews();

  const hasPreview = assetsCount > 0 && results;

  return (
    <div className="flex flex-col gap-4">
      <header className="mb-1">
        <h1
          className="text-[22px] font-medium tracking-tight text-charcoal-900 leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Choose your view
        </h1>
        <p className="text-[13px] text-charcoal-500 mt-1">
          {hasPreview
            ? 'See how each methodology affects your zakat. You can switch later.'
            : 'You can switch any time. We recommend Strict if unsure.'}
        </p>
      </header>

      <div className="flex flex-col gap-2.5">
        {VIEWS.map((opt, i) => (
          <motion.div
            key={opt.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <Card
              variant={opt.recommended ? 'recommended' : 'interactive'}
              selected={view === opt.key}
              onClick={() => setView(opt.key)}
              className="cursor-pointer"
            >
              {opt.recommended && <CardBadge>Recommended</CardBadge>}
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3
                      className="text-[15px] font-medium text-charcoal-900"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {opt.name}
                    </h3>
                    {view === opt.key && (
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-cream-50">
                        <Check className="w-3 h-3" strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-charcoal-500 mt-1 leading-relaxed">
                    {opt.short}
                  </p>
                </div>
                {hasPreview && results && (
                  <div className="text-right shrink-0">
                    <p className="text-[10px] uppercase tracking-wider text-charcoal-400">
                      Your zakat
                    </p>
                    <p
                      className="text-[15px] font-medium text-emerald-500 mt-0.5"
                      style={{ fontFamily: 'var(--font-serif)' }}
                      data-numeric
                    >
                      {formatMoney(results[opt.key].zakatNetInPrimary, primaryCurrency, { compact: true })}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-4">
        <Button size="xl" fullWidth onClick={() => router.push('/setup')}>
          Continue with {VIEWS.find((v) => v.key === view)?.name}
        </Button>
      </div>
    </div>
  );
}
