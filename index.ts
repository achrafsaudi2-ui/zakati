'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { EntryShell } from './EntryShell';
import { AmountInput, ToggleRow } from '@/components/fields';
import { useZakatStore } from '@/lib/store';
import { generateId, formatMoney } from '@/lib/utils';
import type { Crypto } from '@zakati/engine';
import { useShallow } from 'zustand/shallow';

export function CryptoForm() {
  const primaryCurrency = useZakatStore((s) => s.primaryCurrency);
  const upsertAsset = useZakatStore((s) => s.upsertAsset);
  const existing = useZakatStore(useShallow((s) => s.assets.filter((a): a is Crypto => a.kind === 'crypto')));

  const [token, setToken] = useState('');
  const [quantity, setQuantity] = useState<number>();
  const [priceInBase, setPriceInBase] = useState<number>();
  const [isStablecoin, setIsStablecoin] = useState(false);
  const [heldOverYear, setHeldOverYear] = useState(false);

  const canSave =
    token.trim().length > 0 &&
    quantity !== undefined &&
    quantity > 0 &&
    priceInBase !== undefined &&
    priceInBase > 0;

  const totalValue =
    quantity !== undefined && priceInBase !== undefined ? quantity * priceInBase : 0;

  const save = (resetForm: boolean) => {
    if (!canSave) return;
    const asset: Crypto = {
      kind: 'crypto',
      id: generateId('crypto'),
      token: token.trim().toUpperCase(),
      quantity: quantity!,
      priceInBase: priceInBase!,
      isStablecoin,
      heldOverYear,
    };
    upsertAsset(asset);
    if (resetForm) {
      setToken('');
      setQuantity(undefined);
      setPriceInBase(undefined);
      setIsStablecoin(false);
      setHeldOverYear(false);
    }
  };

  return (
    <EntryShell
      categoryLabel="Crypto"
      entryCount={existing.length}
      canSave={canSave}
      onSave={() => save(false)}
      onAddAnother={() => save(true)}
      nextRoute="/liabilities"
    >
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-charcoal-500">Token symbol</label>
        <input
          value={token}
          onChange={(e) => setToken(e.target.value.toUpperCase())}
          placeholder="BTC, ETH, USDC…"
          className="w-full h-11 rounded-xl px-3.5 text-[15px] uppercase tracking-wider bg-cream-50 border border-cream-200 text-charcoal-900 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <AmountInput
        label="Quantity"
        hint="how many coins/tokens"
        value={quantity}
        onChange={setQuantity}
      />

      <AmountInput
        label="Price per coin/token"
        hint={`in ${primaryCurrency}`}
        value={priceInBase}
        onChange={setPriceInBase}
        currency={primaryCurrency}
        tooltip="Look up the spot price on your zakat date. We don't fetch live prices to keep this 100% offline."
      />

      {totalValue > 0 && (
        <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/20 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wider text-emerald-700 font-medium">
            Position value
          </p>
          <p
            className="text-[18px] font-medium text-emerald-700 mt-0.5"
            style={{ fontFamily: 'var(--font-serif)' }}
            data-numeric
          >
            {formatMoney(totalValue, primaryCurrency)}
          </p>
        </div>
      )}

      <ToggleRow
        label="Is this a stablecoin?"
        hint="USDC, USDT, DAI, etc. — zakatable like cash."
        value={isStablecoin}
        onChange={setIsStablecoin}
      />

      <ToggleRow
        label="Held this token for ≥ 1 lunar year?"
        hint="Strict view ignores this gate. Moderate and Lenient require it."
        value={heldOverYear}
        onChange={setHeldOverYear}
      />

      {!isStablecoin && !heldOverYear && (
        <div className="rounded-xl bg-gold-500/10 border border-gold-500/30 px-3 py-2.5 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-gold-700 shrink-0 mt-0.5" />
          <p className="text-[11.5px] text-gold-900 leading-relaxed">
            Volatile holdings under one haul are <strong>excluded</strong> from Moderate &amp; Lenient
            views, but the Strict view still counts them.
          </p>
        </div>
      )}
    </EntryShell>
  );
}
