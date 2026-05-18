'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { EntryShell } from './EntryShell';
import { AmountInput, CurrencyPicker, ToggleRow } from '@/components/fields';
import { UploadSheet } from '@/components/upload/UploadSheet';
import { Button } from '@/components/ui/Button';
import { useZakatStore } from '@/lib/store';
import { generateId, cn } from '@/lib/utils';
import type { Stock } from '@zakati/engine';
import type { ExtractedAccount } from '@zakati/document-pipeline';
import { useShallow } from 'zustand/shallow';

export function StockForm() {
  const primaryCurrency = useZakatStore((s) => s.primaryCurrency);
  const upsertAsset = useZakatStore((s) => s.upsertAsset);
  const existing = useZakatStore(useShallow((s) => s.assets.filter((a): a is Stock => a.kind === 'stock')));

  const [uploadOpen, setUploadOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [currency, setCurrency] = useState(primaryCurrency);
  const [marketValue, setMarketValue] = useState<number>();
  const [averageMarketValue, setAverageMarketValue] = useState<number>();
  const [haulCompletedMarketValue, setHaulCompletedMarketValue] = useState<number>();
  const [intent, setIntent] = useState<'long_term' | 'trading'>('long_term');
  const [heldOverYear, setHeldOverYear] = useState(true);

  const canSave = label.trim().length > 0 && marketValue !== undefined && marketValue > 0;

  const save = (resetForm: boolean) => {
    if (!canSave) return;
    const asset: Stock = {
      kind: 'stock',
      id: generateId('stock'),
      label: label.trim(),
      currency,
      marketValue: marketValue!,
      averageMarketValue,
      haulCompletedMarketValue,
      intent,
      heldOverYear,
    };
    upsertAsset(asset);
    if (resetForm) {
      setLabel('');
      setMarketValue(undefined);
      setAverageMarketValue(undefined);
      setHaulCompletedMarketValue(undefined);
      setIntent('long_term');
      setHeldOverYear(true);
    }
  };

  const acceptExtracted = (accounts: ExtractedAccount[]) => {
    for (const acc of accounts) {
      if (acc.category !== 'stock_holdings' || !acc.positions) continue;
      // Aggregate positions into one Stock asset per currency
      const byCurrency = new Map<string, number>();
      for (const pos of acc.positions) {
        byCurrency.set(pos.currency, (byCurrency.get(pos.currency) ?? 0) + pos.marketValue);
      }
      for (const [ccy, total] of byCurrency) {
        upsertAsset({
          kind: 'stock',
          id: generateId('stock'),
          label: `${acc.label} (${ccy})`,
          currency: ccy,
          marketValue: total,
          intent: 'long_term',
          heldOverYear: acc.haulCompleted ?? true,
        });
      }
    }
  };

  return (
    <>
      <EntryShell
        categoryLabel="Stocks & ETFs"
        entryCount={existing.length}
        canSave={canSave}
        onSave={() => save(false)}
        onAddAnother={() => save(true)}
        nextRoute="/liabilities"
      >
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => setUploadOpen(true)}
          className="border-dashed border-gold-500/60 hover:border-gold-500 bg-gold-500/4"
        >
          <Upload className="w-4 h-4" />
          Upload a broker statement
        </Button>

        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-cream-200" /></div>
          <div className="relative flex justify-center"><span className="bg-cream-100 px-2 text-[10px] uppercase tracking-wider text-charcoal-400">or enter manually</span></div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-charcoal-500">Account / broker label</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. IBKR portfolio"
            className="w-full h-11 rounded-xl px-3.5 text-[15px] bg-cream-50 border border-cream-200 text-charcoal-900 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <CurrencyPicker value={currency} onChange={setCurrency} />

        {/* Intent toggle */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[13px] font-medium text-charcoal-900">How do you hold these?</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIntent('long_term')}
              className={cn(
                'flex flex-col items-start gap-0.5 p-3 rounded-xl border text-left transition-colors',
                intent === 'long_term'
                  ? 'bg-emerald-500 border-emerald-500 text-cream-50'
                  : 'bg-cream-50 border-cream-200 text-charcoal-900',
              )}
            >
              <span className="text-[12.5px] font-medium">Long-term</span>
              <span className={cn('text-[10px]', intent === 'long_term' ? 'text-cream-50/80' : 'text-charcoal-500')}>25% of value (AAOIFI)</span>
            </button>
            <button
              type="button"
              onClick={() => setIntent('trading')}
              className={cn(
                'flex flex-col items-start gap-0.5 p-3 rounded-xl border text-left transition-colors',
                intent === 'trading'
                  ? 'bg-emerald-500 border-emerald-500 text-cream-50'
                  : 'bg-cream-50 border-cream-200 text-charcoal-900',
              )}
            >
              <span className="text-[12.5px] font-medium">Trading</span>
              <span className={cn('text-[10px]', intent === 'trading' ? 'text-cream-50/80' : 'text-charcoal-500')}>100% of value</span>
            </button>
          </div>
        </div>

        <AmountInput
          label="Market value today"
          value={marketValue}
          onChange={setMarketValue}
          currency={currency}
        />

        <AmountInput
          label="Average over haul"
          value={averageMarketValue}
          onChange={setAverageMarketValue}
          currency={currency}
          optional
          tooltip="Used by Moderate view. Defaults to current."
        />

        <AmountInput
          label="Haul-completed value at current prices"
          value={haulCompletedMarketValue}
          onChange={setHaulCompletedMarketValue}
          currency={currency}
          optional
          tooltip="Strict view: positions you've held the full lunar year, priced today."
        />

        <ToggleRow
          label="Held this position for ≥ 1 lunar year?"
          value={heldOverYear}
          onChange={setHeldOverYear}
        />
      </EntryShell>

      <UploadSheet open={uploadOpen} onOpenChange={setUploadOpen} onAccept={acceptExtracted} />
    </>
  );
}
