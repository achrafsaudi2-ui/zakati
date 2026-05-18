'use client';

import { useState } from 'react';
import { Gem, Coins } from 'lucide-react';
import { EntryShell } from './EntryShell';
import { AmountInput, KaratInput, ToggleRow } from '@/components/fields';
import { useZakatStore } from '@/lib/store';
import { generateId, cn } from '@/lib/utils';
import type { PreciousMetal } from '@zakati/engine';
import { useShallow } from 'zustand/shallow';

export function GoldSilverForm() {
  const upsertAsset = useZakatStore((s) => s.upsertAsset);
  const existing = useZakatStore(
    useShallow((s) => s.assets.filter((a): a is PreciousMetal => a.kind === 'precious_metal')),
  );

  const [type, setType] = useState<'gold' | 'silver'>('gold');
  const [pureGrams, setPureGrams] = useState<number>();
  const [isRegularlyWorn, setIsRegularlyWorn] = useState(false);

  const canSave = pureGrams !== undefined && pureGrams > 0;

  const save = (resetForm: boolean) => {
    if (!canSave) return;
    const asset: PreciousMetal = {
      kind: 'precious_metal',
      id: generateId('metal'),
      type,
      pureGrams: pureGrams!,
      isRegularlyWorn,
    };
    upsertAsset(asset);
    if (resetForm) {
      setPureGrams(undefined);
      setIsRegularlyWorn(false);
    }
  };

  return (
    <EntryShell
      categoryLabel="Gold & silver"
      entryCount={existing.length}
      canSave={canSave}
      onSave={() => save(false)}
      onAddAnother={() => save(true)}
      nextRoute="/liabilities"
    >
      {/* Type picker */}
      <div className="flex flex-col gap-1.5">
        <p className="text-[13px] font-medium text-charcoal-900">Which one?</p>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { key: 'gold' as const, label: 'Gold', icon: Gem },
              { key: 'silver' as const, label: 'Silver', icon: Coins },
            ]
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setType(key)}
              className={cn(
                'flex items-center justify-center gap-2 h-12 rounded-xl border text-[13px] font-medium transition-colors',
                type === key
                  ? key === 'gold'
                    ? 'bg-gold-500 border-gold-500 text-charcoal-900'
                    : 'bg-charcoal-700 border-charcoal-700 text-cream-50'
                  : 'bg-cream-50 border-cream-200 text-charcoal-900 hover:border-emerald-500/40',
              )}
            >
              <Icon className="w-4 h-4" strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* For gold: karat input. For silver: plain grams (assumed pure). */}
      {type === 'gold' ? (
        <div className="flex flex-col gap-1">
          <p className="text-[11px] uppercase tracking-wider text-charcoal-400 font-medium mb-1">
            Your gold
          </p>
          <KaratInput pureGrams={pureGrams} onChange={setPureGrams} />
        </div>
      ) : (
        <AmountInput
          label="Pure silver weight"
          hint="grams"
          value={pureGrams}
          onChange={setPureGrams}
          tooltip="Silver bullion is typically .999 fine — enter the gross weight."
        />
      )}

      <ToggleRow
        label="Is this jewellery you wear regularly?"
        hint={
          type === 'gold'
            ? 'Hanafi (Strict view) includes worn gold. Maliki/Shafiʿi/Hanbali (Moderate, Lenient) exclude it. We follow each view automatically.'
            : 'Same rule applies as for gold.'
        }
        value={isRegularlyWorn}
        onChange={setIsRegularlyWorn}
        yesLabel="Yes, worn regularly"
        noLabel="No, stored"
      />
    </EntryShell>
  );
}
