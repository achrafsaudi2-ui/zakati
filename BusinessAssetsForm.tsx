'use client';

import { useState } from 'react';
import { EntryShell } from './EntryShell';
import { AmountInput, CurrencyPicker, ToggleRow } from '@/components/fields';
import { useZakatStore } from '@/lib/store';
import { generateId } from '@/lib/utils';
import type { CashOnHand } from '@zakati/engine';
import { useShallow } from 'zustand/shallow';

export function CashOnHandForm() {
  const primaryCurrency = useZakatStore((s) => s.primaryCurrency);
  const upsertAsset = useZakatStore((s) => s.upsertAsset);
  const existing = useZakatStore(
    useShallow((s) => s.assets.filter((a): a is CashOnHand => a.kind === 'cash_on_hand')),
  );

  const [amount, setAmount] = useState<number>();
  const [currency, setCurrency] = useState(primaryCurrency);
  const [heldOverYear, setHeldOverYear] = useState(true);

  const canSave = amount !== undefined && amount > 0;

  const save = (resetForm: boolean) => {
    if (!canSave) return;
    upsertAsset({
      kind: 'cash_on_hand',
      id: generateId('cash_on_hand'),
      amount: amount!,
      currency,
      heldOverYear,
    });
    if (resetForm) {
      setAmount(undefined);
      setHeldOverYear(true);
    }
  };

  return (
    <EntryShell
      categoryLabel="Cash on hand"
      entryCount={existing.length}
      canSave={canSave}
      onSave={() => save(false)}
      onAddAnother={() => save(true)}
      nextRoute="/liabilities"
    >
      <div className="grid grid-cols-[1fr,120px] gap-2">
        <AmountInput label="Amount" value={amount} onChange={setAmount} currency={currency} />
        <CurrencyPicker value={currency} onChange={setCurrency} />
      </div>

      <ToggleRow
        label="Held this cash for ≥ 1 lunar year?"
        hint="Strict view ignores this. Moderate & Lenient require it."
        value={heldOverYear}
        onChange={setHeldOverYear}
      />
    </EntryShell>
  );
}
