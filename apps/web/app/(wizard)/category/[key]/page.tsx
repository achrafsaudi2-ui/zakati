'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Wrench } from 'lucide-react';
import { CashAccountForm } from '@/components/forms/CashAccountForm';
import { StockForm } from '@/components/forms/StockForm';
import { GoldSilverForm } from '@/components/forms/GoldSilverForm';
import { CryptoForm } from '@/components/forms/CryptoForm';
import { CashOnHandForm } from '@/components/forms/CashOnHandForm';
import { ReceivableForm } from '@/components/forms/ReceivableForm';
import { IslamicDepositForm } from '@/components/forms/IslamicDepositForm';
import { P2PInvestmentForm } from '@/components/forms/P2PInvestmentForm';
import { BusinessAssetsForm } from '@/components/forms/BusinessAssetsForm';
import { RentalIncomeForm } from '@/components/forms/RentalIncomeForm';
import { Button } from '@/components/ui/Button';
import { useZakatStore } from '@/lib/store';

interface PageProps {
  params: Promise<{ key: string }>;
}

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
  other: 'Other assets',
};

export default function CategoryEntryPage({ params }: PageProps) {
  const { key } = use(params);

  // Dispatch to the right form
  switch (key) {
    case 'cash_account':
      return <CashAccountForm />;
    case 'stock':
      return <StockForm />;
    case 'precious_metal':
      return <GoldSilverForm />;
    case 'crypto':
      return <CryptoForm />;
    case 'cash_on_hand':
      return <CashOnHandForm />;
    case 'receivable':
      return <ReceivableForm />;
    case 'islamic_deposit':
      return <IslamicDepositForm />;
    case 'p2p_investment':
      return <P2PInvestmentForm />;
    case 'business':
      return <BusinessAssetsForm />;
    case 'rental_income_cash':
      return <RentalIncomeForm />;
    default:
      return <NotImplemented categoryKey={key} />;
  }
}

function NotImplemented({ categoryKey }: { categoryKey: string }) {
  const router = useRouter();
  const enabledCategories = useZakatStore((s) => s.enabledCategories);
  const label = CATEGORY_LABELS[categoryKey] ?? 'This category';

  // Skip to next enabled category or to liabilities
  const currentIdx = enabledCategories.indexOf(categoryKey as never);
  const next = enabledCategories[currentIdx + 1];
  const nextRoute = next ? `/category/${next}` : '/liabilities';

  return (
    <div className="flex flex-col gap-5 pt-4">
      <header>
        <p className="text-[10px] uppercase tracking-wider text-charcoal-400 font-medium">
          {label}
        </p>
        <h1
          className="text-[22px] font-medium tracking-tight text-charcoal-900 leading-tight mt-1"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Coming soon
        </h1>
      </header>

      <div className="rounded-2xl bg-cream-50 border border-cream-200 p-5 flex flex-col items-center text-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gold-500/15 flex items-center justify-center">
          <Wrench className="w-5 h-5 text-gold-700" />
        </div>
        <p className="text-[13px] text-charcoal-900 font-medium">
          The {label.toLowerCase()} form isn&apos;t built yet.
        </p>
        <p className="text-[11.5px] text-charcoal-500 leading-relaxed max-w-[28ch]">
          The four most-used categories — cash, stocks, gold/silver, and crypto — are ready.
          Others arrive shortly.
        </p>
        <Link href="/" className="text-[12px] text-emerald-500 font-medium mt-1">
          Suggest priority →
        </Link>
      </div>

      <Button size="xl" fullWidth onClick={() => router.push(nextRoute)}>
        Skip to {next ? CATEGORY_LABELS[next] ?? 'next category' : 'liabilities'}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
