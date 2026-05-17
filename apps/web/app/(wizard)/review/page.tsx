'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Edit3, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useZakatStore } from '@/lib/store';
import { formatMoney } from '@/lib/utils';
import type { Asset } from '@zakati/engine';

const CATEGORY_LABELS: Record<string, string> = {
  cash_account: 'Cash & banks',
  stock: 'Stocks & ETFs',
  precious_metal: 'Gold & silver',
  crypto: 'Crypto',
  cash_on_hand: 'Cash on hand',
  receivable: 'Money owed to you',
  islamic_deposit: 'Islamic deposits',
  p2p_investment: 'P2P / crowdlending',
  business: 'Business assets',
  rental_income_cash: 'Retained rent',
  pension: 'Pensions',
  other: 'Other',
};

export default function ReviewPage() {
  const router = useRouter();
  const primaryCurrency = useZakatStore((s) => s.primaryCurrency);
  const view = useZakatStore((s) => s.view);
  const zakatDate = useZakatStore((s) => s.zakatDate);
  const assets = useZakatStore((s) => s.assets);
  const liabilities = useZakatStore((s) => s.liabilities);
  const prepaid = useZakatStore((s) => s.prepaid);
  const removeAsset = useZakatStore((s) => s.removeAsset);

  // Group assets by kind
  const grouped = useMemo(() => {
    const map = new Map<string, Asset[]>();
    for (const a of assets) {
      const list = map.get(a.kind) ?? [];
      list.push(a);
      map.set(a.kind, list);
    }
    return Array.from(map.entries());
  }, [assets]);

  const totalCategories = grouped.length;
  const totalAssets = assets.length;
  const hasAnyData = totalAssets > 0 || liabilities.length > 0 || prepaid.length > 0;

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1
          className="text-[22px] font-medium tracking-tight text-charcoal-900 leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Review
        </h1>
        <p className="text-[13px] text-charcoal-500 mt-1">
          Take one last look before we calculate your zakat for {new Date(zakatDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}.
        </p>
      </header>

      {/* Summary stats */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-3 gap-2"
      >
        <SummaryStat label="Assets" value={String(totalAssets)} />
        <SummaryStat label="Liabilities" value={String(liabilities.length)} />
        <SummaryStat label="Prepayments" value={String(prepaid.length)} />
      </motion.div>

      {!hasAnyData && (
        <div className="rounded-2xl bg-cream-50 border border-cream-200 p-5 text-center">
          <p className="text-[13px] text-charcoal-900 font-medium">Nothing to review yet</p>
          <p className="text-[11px] text-charcoal-500 mt-1">
            Go back and add at least one asset.
          </p>
          <Link href="/categories" className="text-[12px] text-emerald-500 font-medium mt-3 inline-block">
            Add assets →
          </Link>
        </div>
      )}

      {/* Asset groups */}
      {grouped.length > 0 && (
        <section className="flex flex-col gap-3">
          <p className="text-[10px] uppercase tracking-wider text-charcoal-400 font-medium px-1">
            Assets · {totalCategories} {totalCategories === 1 ? 'category' : 'categories'}
          </p>
          {grouped.map(([kind, items]) => (
            <CategoryGroup
              key={kind}
              kind={kind}
              items={items}
              primaryCurrency={primaryCurrency}
              onRemove={removeAsset}
              onEdit={() => router.push(`/category/${kind}`)}
            />
          ))}
        </section>
      )}

      {/* Liabilities summary */}
      {liabilities.length > 0 && (
        <section className="flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <p className="text-[10px] uppercase tracking-wider text-charcoal-400 font-medium">
              Liabilities
            </p>
            <Link href="/liabilities" className="text-[11px] text-emerald-500 font-medium">
              Edit →
            </Link>
          </div>
          <Card>
            <div className="flex flex-col gap-1.5">
              {liabilities.map((l) => (
                <div key={l.id} className="flex justify-between items-baseline text-[12px]">
                  <span className="text-charcoal-900 truncate pr-3">{l.label}</span>
                  <span className="text-charcoal-900 shrink-0" data-numeric>
                    {l.dueWithin12Months ? '−' : ''}
                    {formatMoney(l.amount, l.currency)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      {/* Prepaid summary */}
      {prepaid.length > 0 && (
        <section className="flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <p className="text-[10px] uppercase tracking-wider text-charcoal-400 font-medium">
              Prepayments
            </p>
            <Link href="/prepaid" className="text-[11px] text-emerald-500 font-medium">
              Edit →
            </Link>
          </div>
          <Card>
            <div className="flex flex-col gap-1.5">
              {prepaid.map((p) => (
                <div key={p.id} className="flex justify-between items-baseline text-[12px]">
                  <span className="text-charcoal-900 truncate pr-3">{p.note || 'Prepaid'}</span>
                  <span className="text-emerald-500" data-numeric>
                    −{formatMoney(p.amount, p.currency)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      <div className="mt-2 flex flex-col gap-2">
        <Button
          size="xl"
          fullWidth
          disabled={!hasAnyData}
          onClick={() => router.push('/result')}
        >
          <Sparkles className="w-4 h-4" />
          Calculate my zakat
        </Button>
        <p className="text-center text-[11px] text-charcoal-400 mt-1">
          You picked the <strong className="text-charcoal-900 font-medium">{view}</strong> view. You can switch on the result page.
        </p>
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="text-center p-3">
      <p
        className="text-[20px] font-medium text-emerald-500 leading-none"
        style={{ fontFamily: 'var(--font-serif)' }}
        data-numeric
      >
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wider text-charcoal-400 mt-1.5">{label}</p>
    </Card>
  );
}

function CategoryGroup({
  kind,
  items,
  primaryCurrency,
  onRemove,
  onEdit,
}: {
  kind: string;
  items: Asset[];
  primaryCurrency: string;
  onRemove: (id: string) => void;
  onEdit: () => void;
}) {
  return (
    <Card>
      <div className="flex justify-between items-center mb-2">
        <p className="text-[12.5px] font-medium text-charcoal-900">
          {CATEGORY_LABELS[kind] ?? kind} <span className="text-charcoal-400 font-normal">· {items.length}</span>
        </p>
        <button
          onClick={onEdit}
          className="flex items-center gap-0.5 text-[11px] text-emerald-500 font-medium"
        >
          <Edit3 className="w-3 h-3" /> Edit
          <ChevronRight className="w-3 h-3 -ml-0.5" />
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        {items.map((a) => (
          <AssetLine
            key={a.id}
            asset={a}
            primaryCurrency={primaryCurrency}
            onRemove={() => onRemove(a.id)}
          />
        ))}
      </div>
    </Card>
  );
}

function AssetLine({
  asset,
  primaryCurrency,
  onRemove,
}: {
  asset: Asset;
  primaryCurrency: string;
  onRemove: () => void;
}) {
  let label: string;
  let value: string;

  switch (asset.kind) {
    case 'cash_account':
      label = asset.label;
      value = formatMoney(asset.currentBalance, asset.currency);
      break;
    case 'stock':
      label = `${asset.label} (${asset.intent === 'long_term' ? 'LT' : 'trading'})`;
      value = formatMoney(asset.marketValue, asset.currency);
      break;
    case 'precious_metal':
      label = `${asset.pureGrams.toFixed(2)}g pure ${asset.type}${asset.isRegularlyWorn ? ' · worn' : ''}`;
      value = `${asset.pureGrams.toFixed(2)}g`;
      break;
    case 'crypto':
      label = `${asset.quantity} ${asset.token}${asset.isStablecoin ? ' (stable)' : ''}`;
      value = formatMoney(asset.quantity * asset.priceInBase, primaryCurrency);
      break;
    default:
      label = ('label' in asset && typeof asset.label === 'string') ? asset.label : asset.kind;
      value = '—';
  }

  return (
    <div className="flex justify-between items-baseline text-[12px]">
      <span className="text-charcoal-900 truncate pr-3">{label}</span>
      <span className="flex items-center gap-2 shrink-0">
        <span className="text-charcoal-900" data-numeric>{value}</span>
        <button
          onClick={onRemove}
          className="p-0.5 text-charcoal-400 hover:text-danger"
          aria-label="Remove"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </span>
    </div>
  );
}
