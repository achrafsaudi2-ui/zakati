'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Download, Share2, Heart, Sparkles, RefreshCcw } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { TrustBadge } from '@/components/trust/TrustBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/Sheet';
import { useResultsAcrossViews, useZakatStore } from '@/lib/store';
import { formatMoney } from '@/lib/utils';
import type { View } from '@zakati/engine';

const VIEW_LABELS: Record<View, { name: string; hint: string }> = {
  Strict: { name: 'Strict', hint: 'Most inclusive · recommended' },
  Moderate: { name: 'Moderate', hint: 'Time-weighted average' },
  Lenient: { name: 'Lenient', hint: 'Haul-strict · lowest' },
};

export default function ResultPage() {
  const view = useZakatStore((s) => s.view);
  const setView = useZakatStore((s) => s.setView);
  const primaryCurrency = useZakatStore((s) => s.primaryCurrency);
  const results = useResultsAcrossViews();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  if (!results) {
    return (
      <div className="min-h-dvh container-app pt-20 text-center">
        <p className="text-charcoal-500">No data yet. Start the wizard from the home screen.</p>
        <Link href="/" className="text-emerald-500 underline mt-3 inline-block">
          Go home
        </Link>
      </div>
    );
  }

  const current = results[view];

  return (
    <div className="min-h-dvh flex flex-col surface-app">
      {/* ----- Header ----- */}
      <header className="pt-[calc(env(safe-area-inset-top,0px)+14px)] pb-3 border-b border-cream-200">
        <div className="container-app flex justify-between items-center">
          <Logo size={26} />
          <TrustBadge />
        </div>
      </header>

      {/* ----- Hero number ----- */}
      <section className="container-app pt-10 pb-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-[11px] uppercase tracking-[0.14em] text-charcoal-400 font-medium"
        >
          Your zakat to pay
        </motion.p>

        <AnimatePresence mode="wait">
          <motion.h1
            key={view}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="text-[48px] font-medium leading-none text-emerald-500 mt-3 tracking-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
            data-numeric
          >
            {formatMoney(current.zakatNetInPrimary, primaryCurrency)}
          </motion.h1>
        </AnimatePresence>

        <p className="text-[12px] text-charcoal-400 mt-3">
          {VIEW_LABELS[view].name} view · {new Date(current.zakatDate).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>

        <button
          onClick={() => setSheetOpen(true)}
          className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-emerald-500 font-medium"
        >
          <RefreshCcw className="w-3 h-3" aria-hidden /> Switch view
        </button>
      </section>

      {/* ----- Breakdown card ----- */}
      <section className="container-app">
        <Card>
          <p className="text-[10px] uppercase tracking-wider text-charcoal-400 font-medium mb-2.5">
            How we got there
          </p>
          <div className="flex flex-col gap-1.5">
            <BreakdownRow label="Gross zakatable wealth" value={formatMoney(current.totalZakatableInPrimary, primaryCurrency)} />
            <BreakdownRow label="Less short-term debts" value={`−${formatMoney(current.totalDeductibleLiabilitiesInPrimary, primaryCurrency)}`} />
            <BreakdownRow label="Net wealth" value={formatMoney(current.netZakatableInPrimary, primaryCurrency)} strong />
            <BreakdownRow label="× 2.5% zakat rate" value={formatMoney(current.zakatGrossInPrimary, primaryCurrency)} />
            {current.prepaidInPrimary > 0 && (
              <BreakdownRow label="Less prepaid" value={`−${formatMoney(current.prepaidInPrimary, primaryCurrency)}`} />
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-cream-200">
            <div className="flex items-start gap-2">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-cream-50 shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5" strokeWidth={3} />
              </span>
              <div className="flex-1">
                <p className="text-[12px] font-medium text-charcoal-900">Above nisab</p>
                <p className="text-[11px] text-charcoal-500 mt-0.5 leading-relaxed">
                  Your wealth exceeds {formatMoney(current.nisabThresholdInPrimary, primaryCurrency)} (silver nisab, 612.36g).
                </p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* ----- Actions ----- */}
      <section className="container-app mt-5 grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          size="md"
          onClick={async () => {
            setPdfBusy(true);
            try {
              const { downloadZakatReport } = await import('@/lib/pdf/report');
              await downloadZakatReport({
                result: current,
                view,
                primaryCurrency,
                generatedAt: new Date(),
              });
            } catch (err) {
              console.error('PDF generation failed:', err);
            } finally {
              setPdfBusy(false);
            }
          }}
          disabled={pdfBusy}
        >
          <Download className="w-4 h-4" aria-hidden />
          {pdfBusy ? 'Building…' : 'PDF'}
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={async () => {
            try {
              const { shareZakatSummary } = await import('@/lib/pdf/report');
              const result = await shareZakatSummary({
                result: current,
                view,
                primaryCurrency,
                generatedAt: new Date(),
              });
              setShareNotice(result === 'shared' ? 'Shared' : 'Copied to clipboard');
              setTimeout(() => setShareNotice(null), 2000);
            } catch (err) {
              console.error('Share failed:', err);
            }
          }}
        >
          <Share2 className="w-4 h-4" aria-hidden />
          {shareNotice ?? 'Share'}
        </Button>
      </section>

      <section className="container-app mt-2 pb-[calc(env(safe-area-inset-bottom,0px)+24px)]">
        <Button asChild={false} variant="primary" size="xl" fullWidth>
          <Link href="/charity" className="contents">
            <Heart className="w-4 h-4" aria-hidden />
            Find a verified charity
          </Link>
        </Button>

        <p className="text-center text-[11px] text-charcoal-400 mt-4 italic flex items-center justify-center gap-1.5">
          <Sparkles className="w-3 h-3 text-gold-500" aria-hidden />
          May Allah accept it from you.
        </p>
      </section>

      {/* ----- Switch view sheet ----- */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent maxHeight="half">
          <SheetTitle>Compare methodology views</SheetTitle>
          <SheetDescription>
            Each view reflects a different scholarly position. You can switch freely.
          </SheetDescription>
          <div className="flex flex-col gap-2 mt-2">
            {(['Strict', 'Moderate', 'Lenient'] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => {
                  setView(v);
                  setSheetOpen(false);
                }}
                className={
                  'flex justify-between items-center p-3 rounded-xl border transition-colors ' +
                  (view === v
                    ? 'border-emerald-500 bg-emerald-500/8'
                    : 'border-cream-200 bg-cream-50 hover:border-emerald-500/40')
                }
              >
                <div className="text-left">
                  <p className="text-[14px] font-medium text-charcoal-900">{VIEW_LABELS[v].name}</p>
                  <p className="text-[11px] text-charcoal-500">{VIEW_LABELS[v].hint}</p>
                </div>
                <p
                  className="text-[15px] font-medium text-emerald-500"
                  style={{ fontFamily: 'var(--font-serif)' }}
                  data-numeric
                >
                  {formatMoney(results[v].zakatNetInPrimary, primaryCurrency, { compact: true })}
                </p>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between items-baseline text-[12px]">
      <span className="text-charcoal-500">{label}</span>
      <span className={'text-charcoal-900 ' + (strong ? 'font-medium' : '')} data-numeric>
        {value}
      </span>
    </div>
  );
}
