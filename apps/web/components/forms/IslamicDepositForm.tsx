'use client';

import { useState } from 'react';
import { Building2, FileText, PiggyBank } from 'lucide-react';
import { EntryShell } from './EntryShell';
import { AmountInput, CurrencyPicker, ToggleRow } from '@/components/fields';
import { useZakatStore } from '@/lib/store';
import { generateId, cn } from '@/lib/utils';
import type { IslamicDeposit } from '@zakati/engine';

const DEPOSIT_TYPES = [
  { key: 'murabaha' as const, label: 'Murabaha', icon: PiggyBank, hint: 'Cost-plus deposit' },
  { key: 'sukuk' as const, label: 'Sukuk', icon: FileText, hint: 'Islamic bond' },
  { key: 'other' as const, label: 'Other', icon: Building2, hint: 'Wakala, Mudaraba…' },
];

export function IslamicDepositForm() {
  const primaryCurrency = useZakatStore((s) => s.primaryCurrency);
  const upsertAsset = useZakatStore((s) => s.upsertAsset);
  const existing = useZakatStore((s) =>
    s.assets.filter((a): a is IslamicDeposit => a.kind === 'islamic_deposit'),
  );

  const [label, setLabel] = useState('');
  const [depositType, setDepositType] = useState<IslamicDeposit['depositType']>('murabaha');
  const [currency, setCurrency] = useState(primaryCurrency);
  const [principal, setPrincipal] = useState<number>();
  const [accruedProfit, setAccruedProfit] = useState<number>();
  const [heldOverHaul, setHeldOverHaul] = useState(true);
  const [daysHeldInHaul, setDaysHeldInHaul] = useState<number>();

  const canSave = label.trim().length > 0 && principal !== undefined && principal > 0;

  const save = (resetForm: boolean) => {
    if (!canSave) return;
    upsertAsset({
      kind: 'islamic_deposit',
      id: generateId('deposit'),
      label: label.trim(),
      depositType,
      currency,
      principal: principal!,
      accruedProfit,
      heldOverHaul,
      daysHeldInHaul,
    });
    if (resetForm) {
      setLabel('');
      setDepositType('murabaha');
      setPrincipal(undefined);
      setAccruedProfit(undefined);
      setHeldOverHaul(true);
      setDaysHeldInHaul(undefined);
    }
  };

  return (
    <EntryShell
      categoryLabel="Islamic deposits"
      entryCount={existing.length}
      canSave={canSave}
      onSave={() => save(false)}
      onAddAnother={() => save(true)}
      nextRoute="/liabilities"
    >
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-charcoal-500">Product or institution</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. D360 Murabaha, Meem Sukuk"
          className="w-full h-11 rounded-xl px-3.5 text-[15px] bg-cream-50 border border-cream-200 text-charcoal-900 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-[13px] font-medium text-charcoal-900">Deposit type</p>
        <div className="grid grid-cols-3 gap-2">
          {DEPOSIT_TYPES.map(({ key, label: l, icon: Icon, hint }) => (
            <button
              key={key}
              type="button"
              onClick={() => setDepositType(key)}
              className={cn(
                'flex flex-col items-center gap-1 py-3 rounded-xl border text-center transition-colors',
                depositType === key
                  ? 'bg-emerald-500 border-emerald-500 text-cream-50'
                  : 'bg-cream-50 border-cream-200 text-charcoal-900 hover:border-emerald-500/40',
              )}
            >
              <Icon className="w-4 h-4" strokeWidth={1.75} />
              <span className="text-[11.5px] font-medium">{l}</span>
              <span
                className={cn(
                  'text-[9px]',
                  depositType === key ? 'text-cream-50/80' : 'text-charcoal-500',
                )}
              >
                {hint}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[1fr,120px] gap-2">
        <AmountInput label="Principal" value={principal} onChange={setPrincipal} currency={currency} />
        <CurrencyPicker value={currency} onChange={setCurrency} />
      </div>

      <AmountInput
        label="Accrued profit"
        hint="if any"
        value={accruedProfit}
        onChange={setAccruedProfit}
        currency={currency}
        optional
      />

      <ToggleRow
        label="Held continuously through the full haul?"
        hint="Strict view requires this. Moderate weights by days held."
        value={heldOverHaul}
        onChange={setHeldOverHaul}
      />

      {!heldOverHaul && (
        <AmountInput
          label="Days funded during the haul"
          hint="of 354 lunar days"
          value={daysHeldInHaul}
          onChange={setDaysHeldInHaul}
          optional
          tooltip="Moderate view scales the deposit by days_held / 354."
        />
      )}
    </EntryShell>
  );
}
