'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { EntryShell } from './EntryShell';
import { AmountInput, CurrencyPicker, ToggleRow } from '@/components/fields';
import { UploadSheet } from '@/components/upload/UploadSheet';
import { Button } from '@/components/ui/Button';
import { useZakatStore } from '@/lib/store';
import { generateId } from '@/lib/utils';
import type { CashAccount } from '@zakati/engine';
import type { ExtractedAccount } from '@zakati/document-pipeline';

const NEXT_CATEGORY_OR_LIABILITIES = '/liabilities';

export function CashAccountForm() {
  const primaryCurrency = useZakatStore((s) => s.primaryCurrency);
  const upsertAsset = useZakatStore((s) => s.upsertAsset);
  const existingCashAccounts = useZakatStore((s) =>
    s.assets.filter((a): a is CashAccount => a.kind === 'cash_account'),
  );

  const [uploadOpen, setUploadOpen] = useState(false);

  // Form state — defaults for a fresh entry
  const [label, setLabel] = useState('');
  const [currency, setCurrency] = useState(primaryCurrency);
  const [currentBalance, setCurrentBalance] = useState<number>();
  const [averageBalance, setAverageBalance] = useState<number>();
  const [lowestBalance, setLowestBalance] = useState<number>();
  const [isStable, setIsStable] = useState(false);
  const [heldOverHaul, setHeldOverHaul] = useState(true);

  const canSave = label.trim().length > 0 && currentBalance !== undefined && currentBalance > 0;

  const save = (resetForm: boolean) => {
    if (!canSave) return;
    const asset: CashAccount = {
      kind: 'cash_account',
      id: generateId('cash'),
      label: label.trim(),
      currency,
      currentBalance: currentBalance!,
      averageBalance: isStable ? undefined : averageBalance,
      lowestBalance: isStable ? undefined : lowestBalance,
      isStable,
      heldOverHaul,
    };
    upsertAsset(asset);
    if (resetForm) {
      setLabel('');
      setCurrency(primaryCurrency);
      setCurrentBalance(undefined);
      setAverageBalance(undefined);
      setLowestBalance(undefined);
      setIsStable(false);
      setHeldOverHaul(true);
    }
  };

  const acceptExtracted = (accounts: ExtractedAccount[]) => {
    for (const acc of accounts) {
      if (acc.category !== 'cash_account' || acc.currentBalance === undefined) continue;
      const asset: CashAccount = {
        kind: 'cash_account',
        id: generateId('cash'),
        label: acc.label,
        currency: acc.currency ?? primaryCurrency,
        currentBalance: acc.currentBalance,
        averageBalance: acc.averageBalance,
        lowestBalance: acc.lowestBalance,
        isStable: false,
        heldOverHaul: acc.haulCompleted ?? true,
      };
      upsertAsset(asset);
    }
  };

  return (
    <>
      <EntryShell
        categoryLabel="Cash & banks"
        entryCount={existingCashAccounts.length}
        canSave={canSave}
        onSave={() => save(false)}
        onAddAnother={() => save(true)}
        nextRoute={NEXT_CATEGORY_OR_LIABILITIES}
      >
        {/* Upload-first prompt */}
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => setUploadOpen(true)}
          className="border-dashed border-gold-500/60 hover:border-gold-500 bg-gold-500/4"
        >
          <Upload className="w-4 h-4" />
          Upload a statement to autofill
        </Button>

        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-cream-200" /></div>
          <div className="relative flex justify-center"><span className="bg-cream-100 px-2 text-[10px] uppercase tracking-wider text-charcoal-400">or enter manually</span></div>
        </div>

        {/* Manual fields */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-charcoal-500">Account label</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. SAB Current"
            className="w-full h-11 rounded-xl px-3.5 text-[15px] bg-cream-50 border border-cream-200 text-charcoal-900 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <CurrencyPicker value={currency} onChange={setCurrency} />

        <AmountInput
          label="Current balance"
          hint="on your zakat date"
          value={currentBalance}
          onChange={setCurrentBalance}
          currency={currency}
        />

        <ToggleRow
          label="Did the balance stay roughly constant all year?"
          hint="If yes, we'll use the current balance for all views."
          value={isStable}
          onChange={setIsStable}
        />

        {!isStable && (
          <>
            <AmountInput
              label="Average balance over the haul"
              hint="rough estimate is fine"
              value={averageBalance}
              onChange={setAverageBalance}
              currency={currency}
              optional
              tooltip="Used by the Moderate view. We default to current if blank."
            />

            <AmountInput
              label="Lowest balance during the haul"
              hint="Strict view uses this"
              value={lowestBalance}
              onChange={setLowestBalance}
              currency={currency}
              optional
            />
          </>
        )}

        <ToggleRow
          label="Held above zero for the full lunar year?"
          hint="The Strict view excludes accounts that dipped to zero."
          value={heldOverHaul}
          onChange={setHeldOverHaul}
        />
      </EntryShell>

      <UploadSheet
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onAccept={acceptExtracted}
      />
    </>
  );
}
