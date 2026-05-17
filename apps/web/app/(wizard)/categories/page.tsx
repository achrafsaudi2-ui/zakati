'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Wallet,
  Banknote,
  Gem,
  BarChart3,
  Bitcoin,
  PiggyBank,
  Users,
  HandCoins,
  Briefcase,
  Home,
  ShieldCheck,
  CircleHelp,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useZakatStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface Category {
  key: string;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Common categories shown initially; advanced are hidden behind "see all". */
  common: boolean;
}

const CATEGORIES: Category[] = [
  { key: 'cash_account',     label: 'Cash & banks',         hint: 'Checking, savings, e-money',         icon: Wallet,      common: true },
  { key: 'stock',            label: 'Stocks & ETFs',        hint: 'Individual stocks, index funds',     icon: BarChart3,   common: true },
  { key: 'precious_metal',   label: 'Gold & silver',        hint: 'Bars, coins, jewellery',             icon: Gem,         common: true },
  { key: 'crypto',           label: 'Crypto',               hint: 'BTC, stablecoins, tokens',           icon: Bitcoin,     common: true },
  { key: 'cash_on_hand',     label: 'Cash on hand',         hint: 'Physical cash you hold',             icon: Banknote,    common: true },
  { key: 'receivable',       label: 'Money owed to you',    hint: 'Loans you gave, refunds due',        icon: HandCoins,   common: true },
  { key: 'islamic_deposit',  label: 'Islamic deposits',     hint: 'Murabaha, Sukuk, Wakala',            icon: PiggyBank,   common: false },
  { key: 'p2p_investment',   label: 'P2P / crowdlending',   hint: 'Lendo, Funding Souq, Beehive',       icon: Users,       common: false },
  { key: 'business',         label: 'Business assets',      hint: 'Inventory, business cash',           icon: Briefcase,   common: false },
  { key: 'rental_income_cash', label: 'Retained rent',      hint: 'Accumulated rental income',          icon: Home,        common: false },
  { key: 'pension',          label: 'Pensions',             hint: 'Vested portions only',               icon: ShieldCheck, common: false },
  { key: 'other',            label: 'Other',                hint: 'Anything else',                      icon: CircleHelp,  common: false },
];

export default function CategoriesPage() {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const enabledCategories = useZakatStore((s) => s.enabledCategories);
  const toggleCategory = useZakatStore((s) => s.toggleCategory);

  const visible = showAll ? CATEGORIES : CATEGORIES.filter((c) => c.common);
  const selectedCount = enabledCategories.length;

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1
          className="text-[22px] font-medium tracking-tight text-charcoal-900 leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Which apply to you?
        </h1>
        <p className="text-[13px] text-charcoal-500 mt-1">
          Tap each you have. We&apos;ll only ask about those.
        </p>
      </header>

      <motion.div
        layout
        className="grid grid-cols-2 gap-2"
      >
        {visible.map((cat, i) => {
          const Icon = cat.icon;
          const selected = enabledCategories.includes(cat.key as never);
          return (
            <motion.button
              key={cat.key}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.02 }}
              onClick={() => toggleCategory(cat.key as never)}
              className={cn(
                'flex flex-col items-start gap-2 p-3.5 rounded-2xl border transition-all',
                selected
                  ? 'bg-emerald-500 border-emerald-500 text-cream-50'
                  : 'bg-cream-50 border-cream-200 text-charcoal-900 hover:border-emerald-500/40',
              )}
            >
              <Icon className={cn('w-5 h-5', selected ? 'text-cream-50' : 'text-emerald-500')} strokeWidth={1.75} />
              <div className="flex flex-col items-start gap-0.5 text-left">
                <span className="text-[12.5px] font-medium leading-tight">{cat.label}</span>
                <span
                  className={cn(
                    'text-[10.5px] leading-tight',
                    selected ? 'text-cream-50/80' : 'text-charcoal-500',
                  )}
                >
                  {cat.hint}
                </span>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {!showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="flex items-center justify-center gap-1.5 text-[13px] text-emerald-500 font-medium py-2"
        >
          <Plus className="w-4 h-4" aria-hidden />
          See 6 more categories
        </button>
      )}

      <div className="mt-2">
        <Button
          size="xl"
          fullWidth
          disabled={selectedCount === 0}
          onClick={() => {
            // Route to the first selected category's entry screen
            const first = enabledCategories[0];
            router.push(first ? `/category/${first}` : '/categories');
          }}
        >
          {selectedCount === 0
            ? 'Pick at least one'
            : `Continue with ${selectedCount} ${selectedCount === 1 ? 'category' : 'categories'}`}
        </Button>
      </div>
    </div>
  );
}
