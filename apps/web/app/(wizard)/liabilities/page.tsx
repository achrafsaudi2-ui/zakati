'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import { AmountInput, CurrencyPicker, ToggleRow } from '@/components/fields';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useZakatStore } from '@/lib/store';
import { generateId, formatMoney } from '@/lib/utils';
import type { Liability } from '@zakati/engine';

export default function LiabilitiesPage() {
  const router = useRouter();
  const primaryCurrency = useZakatStore((s) => s.primaryCurrency);
  const liabilities = useZakatStore((s) => s.liabilities);
  const upsertLiability = useZakatStore((s) => s.upsertLiability);
  const removeLiability = useZakatStore((s) => s.removeLiability);

  const [showForm, setShowForm] = useState(liabilities.length === 0);

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1
          className="text-[22px] font-medium tracking-tight text-charcoal-900 leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Liabilities
        </h1>
        <p className="text-[13px] text-charcoal-500 mt-1">
          Short-term debts due within 12 months reduce your zakatable wealth. Long-term debts
          (mortgages) usually don&apos;t.
        </p>
      </header>

      {/* List of existing liabilities */}
      {liabilities.length > 0 && (
        <div className="flex flex-col gap-2">
          {liabilities.map((l) => (
            <LiabilityRow
              key={l.id}
              liability={l}
              onRemove={() => removeLiability(l.id)}
            />
          ))}
        </div>
      )}

      {/* Add form or trigger button */}
      {showForm ? (
        <LiabilityForm
          defaultCurrency={primaryCurrency}
          onSave={(l) => {
            upsertLiability(l);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-1.5 py-3 text-[13px] text-emerald-500 font-medium border border-dashed border-emerald-500/40 rounded-xl hover:bg-emerald-500/5 transition-colors"
        >
          <Plus className="w-4 h-4" aria-hidden />
          Add a liability
        </button>
      )}

      {/* Continue */}
      <div className="mt-2">
        <Button size="xl" fullWidth onClick={() => router.push('/prepaid')}>
          {liabilities.length === 0 ? 'Skip — no liabilities' : 'Continue'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function LiabilityRow({ liability, onRemove }: { liability: Liability; onRemove: () => void }) {
  return (
    <Card>
      <div className="flex justify-between items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-charcoal-900 truncate">{liability.label}</p>
          <p className="text-[10px] text-charcoal-500 mt-0.5">
            {liability.dueWithin12Months ? 'Due in 12 months · deductible' : 'Long-term · not deducted'}
          </p>
        </div>
        <span
          className="text-[14px] font-medium text-charcoal-900"
          style={{ fontFamily: 'var(--font-serif)' }}
          data-numeric
        >
          {formatMoney(liability.amount, liability.currency)}
        </span>
        <button onClick={onRemove} className="p-1 text-charcoal-400 hover:text-danger" aria-label="Remove">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}

function LiabilityForm({
  defaultCurrency,
  onSave,
  onCancel,
}: {
  defaultCurrency: string;
  onSave: (l: Liability) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState<number>();
  const [currency, setCurrency] = useState(defaultCurrency);
  const [dueWithin12Months, setDueWithin12Months] = useState(true);

  const canSave = label.trim().length > 0 && amount !== undefined && amount > 0;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-cream-200 bg-cream-50 p-4">
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-charcoal-500">What is it?</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Credit card balance, tax due…"
          className="w-full h-11 rounded-xl px-3.5 text-[15px] bg-cream-50 border border-cream-200 text-charcoal-900 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div className="grid grid-cols-[1fr,120px] gap-2">
        <AmountInput label="Amount owed" value={amount} onChange={setAmount} currency={currency} />
        <CurrencyPicker value={currency} onChange={setCurrency} />
      </div>

      <ToggleRow
        label="Due within 12 months?"
        hint="Only short-term debts reduce your zakat base."
        value={dueWithin12Months}
        onChange={setDueWithin12Months}
      />

      <div className="grid grid-cols-2 gap-2 mt-1">
        <Button variant="ghost" size="md" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="md"
          disabled={!canSave}
          onClick={() => {
            onSave({
              id: generateId('liab'),
              label: label.trim(),
              amount: amount!,
              currency,
              dueWithin12Months,
            });
          }}
        >
          Save liability
        </Button>
      </div>
    </div>
  );
}
