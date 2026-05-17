'use client';

import { useState } from 'react';
import { Home } from 'lucide-react';
import { EntryShell } from './EntryShell';
import { AmountInput, CurrencyPicker, ToggleRow } from '@/components/fields';
import { useZakatStore } from '@/lib/store';
import { generateId } from '@/lib/utils';
import type { RentalIncomeCash } from '@zakati/engine';

export function RentalIncomeForm() {
  const primaryCurrency = useZakatStore((s) => s.primaryCurrency);
  const upsertAsset = useZakatStore((s) => s.upsertAsset);
  const existing = useZakatStore((s) =>
    s.assets.filter((a): a is RentalIncomeCash => a.kind === 'rental_income_cash'),
  );

  const [label, setLabel] = useState('');
  const [retainedCash, setRetainedCash] = useState<number>();
  const [currency, setCurrency] = useState(primaryCurrency);
  const [heldOverYear, setHeldOverYear] = useState(true);

  const canSave = label.trim().length > 0 && retainedCash !== undefined && retainedCash > 0;

  const save = (resetForm: boolean) => {
    if (!canSave) return;
    upsertAsset({
      kind: 'rental_income_cash',
      id: generateId('rental'),
      label: label.trim(),
      retainedCash: retainedCash!,
      currency,
      heldOverYear,
    });
    if (resetForm) {
      setLabel('');
      setRetainedCash(undefined);
      setHeldOverYear(true);
    }
  };

  return (
    <EntryShell
      categoryLabel="Retained rent"
      entryCount={existing.length}
      canSave={canSave}
      onSave={() => save(false)}
      onAddAnother={() => save(true)}
      nextRoute="/liabilities"
    >
      <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/20 px-3 py-2.5 flex items-start gap-2">
        <Home className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <p className="text-[11.5px] text-charcoal-700 leading-relaxed">
          Only <strong className="font-medium">cash you&apos;ve accumulated</strong> from rent counts. The
          property itself doesn&apos;t — it&apos;s a fixed asset.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-charcoal-500">Property or source</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Riyadh apartment"
          className="w-full h-11 rounded-xl px-3.5 text-[15px] bg-cream-50 border border-cream-200 text-charcoal-900 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div className="grid grid-cols-[1fr,120px] gap-2">
        <AmountInput
          label="Cash accumulated so far"
          hint="that's still in your account"
          value={retainedCash}
          onChange={setRetainedCash}
          currency={currency}
        />
        <CurrencyPicker value={currency} onChange={setCurrency} />
      </div>

      <ToggleRow
        label="Has this cash sat for ≥ 1 lunar year?"
        hint="Recently received rent doesn't yet meet the haul requirement."
        value={heldOverYear}
        onChange={setHeldOverYear}
      />
    </EntryShell>
  );
}
