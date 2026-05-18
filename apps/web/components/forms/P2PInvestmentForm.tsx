'use client';

import { useState } from 'react';
import { Users, AlertCircle } from 'lucide-react';
import { EntryShell } from './EntryShell';
import { AmountInput, CurrencyPicker } from '@/components/fields';
import { useZakatStore } from '@/lib/store';
import { generateId, formatMoney } from '@/lib/utils';
import type { P2PInvestment } from '@zakati/engine';
import { useShallow } from 'zustand/shallow';

export function P2PInvestmentForm() {
  const primaryCurrency = useZakatStore((s) => s.primaryCurrency);
  const upsertAsset = useZakatStore((s) => s.upsertAsset);
  const existing = useZakatStore(
    useShallow((s) => s.assets.filter((a): a is P2PInvestment => a.kind === 'p2p_investment')),
  );

  const [platform, setPlatform] = useState('');
  const [currency, setCurrency] = useState(primaryCurrency);
  const [walletBalance, setWalletBalance] = useState<number>();
  const [averageWalletBalance, setAverageWalletBalance] = useState<number>();
  const [outstandingPrincipal, setOutstandingPrincipal] = useState<number>();
  const [averageOutstanding, setAverageOutstanding] = useState<number>();
  const [defaultRiskPercent, setDefaultRiskPercent] = useState<number>(0);
  const [defaultedAmount, setDefaultedAmount] = useState<number>(0);
  const [expectedProfit, setExpectedProfit] = useState<number>();

  const canSave =
    platform.trim().length > 0 &&
    (walletBalance !== undefined || outstandingPrincipal !== undefined);

  const grossExposure = (walletBalance ?? 0) + (outstandingPrincipal ?? 0);
  const adjustedExposure =
    grossExposure -
    (defaultedAmount ?? 0) -
    ((outstandingPrincipal ?? 0) * (defaultRiskPercent / 100));

  const save = (resetForm: boolean) => {
    if (!canSave) return;
    upsertAsset({
      kind: 'p2p_investment',
      id: generateId('p2p'),
      platform: platform.trim(),
      currency,
      walletBalance: walletBalance ?? 0,
      averageWalletBalance,
      outstandingPrincipal: outstandingPrincipal ?? 0,
      averageOutstanding,
      defaultRiskPercent,
      defaultedAmount: defaultedAmount ?? 0,
      expectedProfit,
    });
    if (resetForm) {
      setPlatform('');
      setWalletBalance(undefined);
      setAverageWalletBalance(undefined);
      setOutstandingPrincipal(undefined);
      setAverageOutstanding(undefined);
      setDefaultRiskPercent(0);
      setDefaultedAmount(0);
      setExpectedProfit(undefined);
    }
  };

  return (
    <EntryShell
      categoryLabel="P2P / crowdlending"
      entryCount={existing.length}
      canSave={canSave}
      onSave={() => save(false)}
      onAddAnother={() => save(true)}
      nextRoute="/liabilities"
    >
      <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/20 px-3 py-2.5 flex items-start gap-2">
        <Users className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <p className="text-[11.5px] text-charcoal-700 leading-relaxed">
          Lendo, Funding Souq, Beehive, etc. We separate <strong className="font-medium">idle wallet cash</strong> from
          <strong className="font-medium"> deployed principal</strong> — they get different scholarly treatment.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-charcoal-500">Platform</label>
        <input
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          placeholder="Lendo, Funding Souq…"
          className="w-full h-11 rounded-xl px-3.5 text-[15px] bg-cream-50 border border-cream-200 text-charcoal-900 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <CurrencyPicker value={currency} onChange={setCurrency} />

      {/* Wallet cash */}
      <div className="rounded-xl border border-cream-200 bg-cream-50 p-3 flex flex-col gap-3">
        <p className="text-[12px] font-medium text-charcoal-900">Idle wallet cash</p>
        <AmountInput
          label="Current wallet balance"
          value={walletBalance}
          onChange={setWalletBalance}
          currency={currency}
        />
        <AmountInput
          label="Average wallet balance"
          hint="during haul"
          value={averageWalletBalance}
          onChange={setAverageWalletBalance}
          currency={currency}
          optional
        />
      </div>

      {/* Deployed principal */}
      <div className="rounded-xl border border-cream-200 bg-cream-50 p-3 flex flex-col gap-3">
        <p className="text-[12px] font-medium text-charcoal-900">Money deployed to borrowers</p>
        <AmountInput
          label="Outstanding principal"
          value={outstandingPrincipal}
          onChange={setOutstandingPrincipal}
          currency={currency}
        />
        <AmountInput
          label="Average outstanding"
          hint="during haul"
          value={averageOutstanding}
          onChange={setAverageOutstanding}
          currency={currency}
          optional
        />
        <AmountInput
          label="Expected profit (sukuk-style return)"
          value={expectedProfit}
          onChange={setExpectedProfit}
          currency={currency}
          optional
        />
      </div>

      {/* Default risk */}
      <div className="rounded-xl border border-cream-200 bg-cream-50 p-3 flex flex-col gap-3">
        <p className="text-[12px] font-medium text-charcoal-900">Default & risk</p>
        <AmountInput
          label="Already defaulted (write-off)"
          value={defaultedAmount}
          onChange={(v) => setDefaultedAmount(v ?? 0)}
          currency={currency}
          optional
        />
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-charcoal-500">
            Platform default risk · <strong className="text-charcoal-900" data-numeric>{defaultRiskPercent}%</strong>
          </label>
          <input
            type="range"
            min={0}
            max={20}
            step={0.5}
            value={defaultRiskPercent}
            onChange={(e) => setDefaultRiskPercent(parseFloat(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <p className="text-[10px] text-charcoal-400 leading-relaxed">
            Used to deduct expected losses from outstanding principal in Moderate &amp; Lenient
            views. Typical: 1–3% for Lendo, 2–5% for international P2P.
          </p>
        </div>
      </div>

      {grossExposure > 0 && (
        <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/20 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wider text-emerald-700 font-medium">
            Net P2P exposure (after risk + defaults)
          </p>
          <p
            className="text-[18px] font-medium text-emerald-700 mt-0.5"
            style={{ fontFamily: 'var(--font-serif)' }}
            data-numeric
          >
            {formatMoney(Math.max(0, adjustedExposure), currency)}
          </p>
          {defaultedAmount > 0 && (
            <p className="text-[10px] text-gold-700 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {formatMoney(defaultedAmount, currency)} already written off
            </p>
          )}
        </div>
      )}
    </EntryShell>
  );
}
