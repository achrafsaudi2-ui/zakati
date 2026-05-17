'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { AmountInput, CurrencyPicker } from '@/components/fields';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useZakatStore } from '@/lib/store';
import { generateId, formatMoney } from '@/lib/utils';
import type { PrepaidZakat } from '@zakati/engine';

export default function PrepaidPage() {
  const router = useRouter();
  const primaryCurrency = useZakatStore((s) => s.primaryCurrency);
  const prepaid = useZakatStore((s) => s.prepaid);
  const upsertPrepaid = useZakatStore((s) => s.upsertPrepaid);
  const removePrepaid = useZakatStore((s) => s.removePrepaid);

  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1
          className="text-[22px] font-medium tracking-tight text-charcoal-900 leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Prepaid zakat
        </h1>
        <p className="text-[13px] text-charcoal-500 mt-1">
          Money you&apos;ve already given <em>with the intention</em> (niya) of zakat during this lunar
          year. We&apos;ll deduct it from what you owe.
        </p>
      </header>

      {prepaid.length === 0 && !showForm && (
        <div className="rounded-2xl bg-cream-50 border border-cream-200 p-5 flex flex-col items-center text-center gap-2">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-[13px] text-charcoal-900 font-medium">No prepayments yet</p>
          <p className="text-[11px] text-charcoal-500 leading-relaxed max-w-[28ch]">
            Most people skip this — it&apos;s for advanced givers who pay zakat regularly across
            the year.
          </p>
        </div>
      )}

      {prepaid.length > 0 && (
        <div className="flex flex-col gap-2">
          {prepaid.map((p) => (
            <Card key={p.id}>
              <div className="flex justify-between items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-charcoal-900 truncate">
                    {p.note || 'Prepaid zakat'}
                  </p>
                  <p className="text-[10px] text-charcoal-500 mt-0.5">Already paid with niya</p>
                </div>
                <span
                  className="text-[14px] font-medium text-emerald-500"
                  style={{ fontFamily: 'var(--font-serif)' }}
                  data-numeric
                >
                  {formatMoney(p.amount, p.currency)}
                </span>
                <button
                  onClick={() => removePrepaid(p.id)}
                  className="p-1 text-charcoal-400 hover:text-danger"
                  aria-label="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showForm ? (
        <PrepaidForm
          defaultCurrency={primaryCurrency}
          onSave={(p) => {
            upsertPrepaid(p);
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
          Add a prepayment
        </button>
      )}

      <div className="mt-2">
        <Button size="xl" fullWidth onClick={() => router.push('/review')}>
          {prepaid.length === 0 ? 'Continue — none' : 'Continue to review'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function PrepaidForm({
  defaultCurrency,
  onSave,
  onCancel,
}: {
  defaultCurrency: string;
  onSave: (p: PrepaidZakat) => void;
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState<number>();
  const [currency, setCurrency] = useState(defaultCurrency);
  const [note, setNote] = useState('');

  const canSave = amount !== undefined && amount > 0;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-cream-200 bg-cream-50 p-4">
      <div className="grid grid-cols-[1fr,120px] gap-2">
        <AmountInput label="Amount paid" value={amount} onChange={setAmount} currency={currency} />
        <CurrencyPicker value={currency} onChange={setCurrency} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-charcoal-500">Note (optional)</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Ramadan donation"
          className="w-full h-11 rounded-xl px-3.5 text-[15px] bg-cream-50 border border-cream-200 text-charcoal-900 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 mt-1">
        <Button variant="ghost" size="md" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="md"
          disabled={!canSave}
          onClick={() => {
            onSave({
              id: generateId('prepaid'),
              amount: amount!,
              currency,
              note: note.trim() || undefined,
            });
          }}
        >
          Save prepayment
        </Button>
      </div>
    </div>
  );
}
