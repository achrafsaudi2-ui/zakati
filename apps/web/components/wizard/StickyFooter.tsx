'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';
import { useCurrentResult, useZakatStore } from '@/lib/store';
import { formatMoney } from '@/lib/utils';

interface StickyFooterProps {
  /** Optional primary action button to slot in on the right. */
  cta?: React.ReactNode;
}

/**
 * Always-visible footer showing the running zakat total for the current view.
 * Inspired by Revolut's running-balance bar.
 */
export function StickyFooter({ cta }: StickyFooterProps) {
  const view = useZakatStore((s) => s.view);
  const primaryCurrency = useZakatStore((s) => s.primaryCurrency);
  const result = useCurrentResult();

  const amount = result?.zakatNetInPrimary ?? 0;
  const isAboveNisab = result?.isAboveNisab ?? false;

  return (
    <div
      className="
        sticky bottom-0 left-0 right-0 z-30
        bg-cream-50/95 backdrop-blur-md
        border-t border-cream-200
        pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)]
        px-5
      "
    >
      <div className="flex justify-between items-center gap-3">
        <div className="flex flex-col min-w-0">
          <span className="text-[9px] uppercase tracking-wider text-charcoal-400 font-medium">
            Zakat — {view.toLowerCase()} view
          </span>
          <AnimatePresence mode="popLayout">
            <motion.span
              key={amount}
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -6, opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="text-xl font-medium leading-tight text-emerald-500"
              style={{ fontFamily: 'var(--font-serif)' }}
              data-numeric
            >
              {formatMoney(amount, primaryCurrency, { compact: amount >= 100_000 })}
            </motion.span>
          </AnimatePresence>
          {!isAboveNisab && amount === 0 && (
            <span className="flex items-center gap-1 text-[10px] text-charcoal-400 mt-0.5">
              <Info className="w-3 h-3" aria-hidden /> Updates as you add
            </span>
          )}
        </div>
        {cta && <div className="shrink-0">{cta}</div>}
      </div>
    </div>
  );
}
