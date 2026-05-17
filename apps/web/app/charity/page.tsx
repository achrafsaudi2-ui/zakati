'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Search, Heart, Sparkles } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { TrustBadge } from '@/components/trust/TrustBadge';
import { Card } from '@/components/ui/Card';
import { CharityCard } from '@/components/charity/CharityCard';
import { fetchCharities, type Charity } from '@/lib/cms/client';
import { useCurrentResult, useZakatStore } from '@/lib/store';
import { formatMoney, cn } from '@/lib/utils';

const REGIONS = [
  { key: 'all', label: 'All regions' },
  { key: 'SA', label: 'Saudi Arabia' },
  { key: 'global', label: 'Global' },
  { key: 'middle_east', label: 'Middle East' },
  { key: 'UK', label: 'UK' },
  { key: 'US', label: 'US' },
];

const CAUSES = [
  { key: 'all', label: 'All causes' },
  { key: 'orphans', label: 'Orphans' },
  { key: 'food', label: 'Food relief' },
  { key: 'emergency', label: 'Emergency' },
  { key: 'water', label: 'Water' },
  { key: 'education', label: 'Education' },
];

export default function CharityPage() {
  const router = useRouter();
  const primaryCurrency = useZakatStore((s) => s.primaryCurrency);
  const result = useCurrentResult();

  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState('all');
  const [cause, setCause] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCharities()
      .then((list) => setCharities(list))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return charities.filter((c) => {
      if (region !== 'all' && !(c.countries ?? []).includes(region)) return false;
      if (cause !== 'all' && !(c.categories ?? []).includes(cause)) return false;
      if (search) {
        const q = search.toLowerCase();
        const desc = c.shortDescription.en?.toLowerCase() ?? '';
        if (!c.name.toLowerCase().includes(q) && !desc.includes(q)) return false;
      }
      return true;
    });
  }, [charities, region, cause, search]);

  return (
    <div className="min-h-dvh flex flex-col surface-app">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-cream-50/95 backdrop-blur-md border-b border-cream-200 pt-[calc(env(safe-area-inset-top,0px)+10px)] pb-3">
        <div className="container-app flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-charcoal-500 hover:text-charcoal-900 transition-colors -ml-1"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-[13px]">Back</span>
          </button>
          <Logo size={24} />
          <TrustBadge />
        </div>
      </header>

      <main className="flex-1 container-app pt-5 pb-6">
        {/* Hero — show user their amount as context */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-5"
          >
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-charcoal-400 font-medium">
                    Ready to give
                  </p>
                  <p
                    className="text-[18px] font-medium text-emerald-500"
                    style={{ fontFamily: 'var(--font-serif)' }}
                    data-numeric
                  >
                    {formatMoney(result.zakatNetInPrimary, primaryCurrency)}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <header className="mb-4">
          <h1
            className="text-[22px] font-medium tracking-tight text-charcoal-900 leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Find a verified charity
          </h1>
          <p className="text-[13px] text-charcoal-500 mt-1">
            Every organisation here is either zakat-verified by Islamic scholars or officially
            recognised by a regulatory body.
          </p>
        </header>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full h-11 rounded-xl pl-10 pr-3.5 text-[14px] bg-cream-50 border border-cream-200 text-charcoal-900 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 mb-4 [&::-webkit-scrollbar]:hidden">
          <FilterChip
            label="Region"
            value={region}
            options={REGIONS}
            onChange={setRegion}
          />
          <FilterChip
            label="Cause"
            value={cause}
            options={CAUSES}
            onChange={setCause}
          />
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-cream-50 border border-cream-200 animate-pulse-soft"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-[13px] font-medium text-charcoal-900">No charities match those filters</p>
            <p className="text-[11px] text-charcoal-500 mt-1">Try removing one of them.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((c, i) => (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
              >
                <CharityCard charity={c} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-[11px] text-charcoal-400 italic flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3 text-gold-500" />
            May Allah accept it from you and reward you abundantly.
          </p>
          <Link
            href="/result"
            className="text-[11.5px] text-emerald-500 font-medium mt-3 inline-block"
          >
            Back to your calculation
          </Link>
        </div>
      </main>
    </div>
  );
}

function FilterChip({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ key: string; label: string }>;
  onChange: (v: string) => void;
}) {
  const current = options.find((o) => o.key === value);
  const isActive = value !== 'all';

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'shrink-0 h-9 rounded-full px-3.5 text-[12px] font-medium appearance-none cursor-pointer',
        'border transition-colors',
        isActive
          ? 'bg-emerald-500 border-emerald-500 text-cream-50'
          : 'bg-cream-50 border-cream-200 text-charcoal-900 hover:border-emerald-500/40',
      )}
    >
      {options.map((o) => (
        <option key={o.key} value={o.key}>
          {o.key === 'all' ? label : `${label}: ${o.label}`}
        </option>
      ))}
    </select>
  );
}
