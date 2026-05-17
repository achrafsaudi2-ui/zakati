'use client';

import { useState } from 'react';
import { CheckCircle2, HelpCircle, XCircle } from 'lucide-react';
import { EntryShell } from './EntryShell';
import { AmountInput, CurrencyPicker, ToggleRow } from '@/components/fields';
import { useZakatStore } from '@/lib/store';
import { generateId, cn } from '@/lib/utils';
import type { Receivable } from '@zakati/engine';

const STATUSES = [
  {
    key: 'good_debt' as const,
    label: 'Likely to recover',
    hint: 'Borrower is reliable',
    icon: CheckCircle2,
    color: 'emerald',
  },
  {
    key: 'doubtful' as const,
    label: 'Doubtful',
    hint: 'Half counted (Strict)',
    icon: HelpCircle,
    color: 'gold',
  },
  {
    key: 'lost' as const,
    label: 'Considered lost',
    hint: 'Excluded from zakat base',
    icon: XCircle,
    color: 'charcoal',
  },
];

export function ReceivableForm() {
  const primaryCurrency = useZakatStore((s) => s.primaryCurrency);
  const upsertAsset = useZakatStore((s) => s.upsertAsset);
  const existing = useZakatStore((s) =>
    s.assets.filter((a): a is Receivable => a.kind === 'receivable'),
  );

  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState<number>();
  const [currency, setCurrency] = useState(primaryCurrency);
  const [status, setStatus] = useState<Receivable['status']>('good_debt');
  const [heldOverYear, setHeldOverYear] = useState(true);

  const canSave = label.trim().length > 0 && amount !== undefined && amount > 0;

  const save = (resetForm: boolean) => {
    if (!canSave) return;
    upsertAsset({
      kind: 'receivable',
      id: generateId('receivable'),
      label: label.trim(),
      amount: amount!,
      currency,
      status,
      heldOverYear,
    });
    if (resetForm) {
      setLabel('');
      setAmount(undefined);
      setStatus('good_debt');
      setHeldOverYear(true);
    }
  };

  return (
    <EntryShell
      categoryLabel="Money owed to you"
      entryCount={existing.length}
      canSave={canSave}
      onSave={() => save(false)}
      onAddAnother={() => save(true)}
      nextRoute="/liabilities"
    >
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-charcoal-500">Who owes you?</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Name or description"
          className="w-full h-11 rounded-xl px-3.5 text-[15px] bg-cream-50 border border-cream-200 text-charcoal-900 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div className="grid grid-cols-[1fr,120px] gap-2">
        <AmountInput label="Amount owed to you" value={amount} onChange={setAmount} currency={currency} />
        <CurrencyPicker value={currency} onChange={setCurrency} />
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-[13px] font-medium text-charcoal-900">How likely is recovery?</p>
        <div className="flex flex-col gap-1.5">
          {STATUSES.map(({ key, label: l, hint, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatus(key)}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border text-left transition-colors',
                status === key
                  ? 'bg-emerald-500 border-emerald-500 text-cream-50'
                  : 'bg-cream-50 border-cream-200 text-charcoal-900 hover:border-emerald-500/40',
              )}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium leading-tight">{l}</p>
                <p
                  className={cn(
                    'text-[10.5px] leading-tight mt-0.5',
                    status === key ? 'text-cream-50/80' : 'text-charcoal-500',
                  )}
                >
                  {hint}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <ToggleRow
        label="Has this debt been outstanding ≥ 1 lunar year?"
        value={heldOverYear}
        onChange={setHeldOverYear}
      />
    </EntryShell>
  );
}
