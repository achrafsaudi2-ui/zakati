'use client';

import { useState } from 'react';
import { Briefcase } from 'lucide-react';
import { EntryShell } from './EntryShell';
import { AmountInput, CurrencyPicker } from '@/components/fields';
import { useZakatStore } from '@/lib/store';
import { generateId, formatMoney } from '@/lib/utils';
import type { BusinessAssets } from '@zakati/engine';

export function BusinessAssetsForm() {
  const primaryCurrency = useZakatStore((s) => s.primaryCurrency);
  const upsertAsset = useZakatStore((s) => s.upsertAsset);
  const existing = useZakatStore((s) =>
    s.assets.filter((a): a is BusinessAssets => a.kind === 'business'),
  );

  const [label, setLabel] = useState('');
  const [currency, setCurrency] = useState(primaryCurrency);
  const [inventoryValue, setInventoryValue] = useState<number>();
  const [cashBalance, setCashBalance] = useState<number>();
  const [receivables, setReceivables] = useState<number>();

  const total =
    (inventoryValue ?? 0) + (cashBalance ?? 0) + (receivables ?? 0);
  const canSave = label.trim().length > 0 && total > 0;

  const save = (resetForm: boolean) => {
    if (!canSave) return;
    upsertAsset({
      kind: 'business',
      id: generateId('business'),
      label: label.trim(),
      currency,
      inventoryValue: inventoryValue ?? 0,
      cashBalance: cashBalance ?? 0,
      receivables: receivables ?? 0,
    });
    if (resetForm) {
      setLabel('');
      setInventoryValue(undefined);
      setCashBalance(undefined);
      setReceivables(undefined);
    }
  };

  return (
    <EntryShell
      categoryLabel="Business assets"
      entryCount={existing.length}
      canSave={canSave}
      onSave={() => save(false)}
      onAddAnother={() => save(true)}
      nextRoute="/liabilities"
    >
      <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/20 px-3 py-2.5 flex items-start gap-2">
        <Briefcase className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <p className="text-[11.5px] text-charcoal-700 leading-relaxed">
          For sole traders and small businesses. We count inventory (for sale), business cash, and
          collectable receivables. Fixed assets (equipment, premises) are excluded.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-charcoal-500">Business name</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. My consultancy"
          className="w-full h-11 rounded-xl px-3.5 text-[15px] bg-cream-50 border border-cream-200 text-charcoal-900 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <CurrencyPicker value={currency} onChange={setCurrency} />

      <AmountInput
        label="Inventory at cost"
        hint="goods for sale"
        value={inventoryValue}
        onChange={setInventoryValue}
        currency={currency}
        optional
      />

      <AmountInput
        label="Business cash"
        hint="bank + petty cash"
        value={cashBalance}
        onChange={setCashBalance}
        currency={currency}
        optional
      />

      <AmountInput
        label="Trade receivables"
        hint="customer invoices likely to collect"
        value={receivables}
        onChange={setReceivables}
        currency={currency}
        optional
      />

      {total > 0 && (
        <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/20 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wider text-emerald-700 font-medium">
            Business zakatable total
          </p>
          <p
            className="text-[18px] font-medium text-emerald-700 mt-0.5"
            style={{ fontFamily: 'var(--font-serif)' }}
            data-numeric
          >
            {formatMoney(total, currency)}
          </p>
        </div>
      )}
    </EntryShell>
  );
}
