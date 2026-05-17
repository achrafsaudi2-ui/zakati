'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useZakatStore } from '@/lib/store';

const CURRENCIES = [
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.' },
];

export default function SetupPage() {
  const router = useRouter();
  const primaryCurrency = useZakatStore((s) => s.primaryCurrency);
  const setPrimaryCurrency = useZakatStore((s) => s.setPrimaryCurrency);
  const zakatDate = useZakatStore((s) => s.zakatDate);
  const setZakatDate = useZakatStore((s) => s.setZakatDate);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1
          className="text-[22px] font-medium tracking-tight text-charcoal-900 leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Setup
        </h1>
        <p className="text-[13px] text-charcoal-500 mt-1">
          Pick your home currency and zakat date. Everything else converts automatically.
        </p>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-2"
      >
        <p className="text-[11px] uppercase tracking-wider text-charcoal-400 font-medium">
          Your primary currency
        </p>
        <div className="grid grid-cols-3 gap-2">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => setPrimaryCurrency(c.code)}
              className={
                'flex flex-col items-center gap-1 py-3 rounded-xl border transition-colors ' +
                (primaryCurrency === c.code
                  ? 'border-emerald-500 bg-emerald-500/8 text-emerald-500'
                  : 'border-cream-200 bg-cream-50 text-charcoal-900 hover:border-emerald-500/40')
              }
            >
              <span className="text-[15px] font-medium">{c.code}</span>
              <span className="text-[10px] opacity-60">{c.symbol}</span>
            </button>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="flex flex-col gap-2"
      >
        <p className="text-[11px] uppercase tracking-wider text-charcoal-400 font-medium">
          Your zakat date
        </p>
        <Input
          type="date"
          value={zakatDate}
          onChange={(e) => setZakatDate(e.target.value)}
          trailing={<Calendar className="w-4 h-4" aria-hidden />}
        />
        <p className="text-[11px] text-charcoal-400 leading-relaxed">
          The same Hijri date each year — when one lunar year (haul) passes on your wealth.
          Many pay on Ramadan 1 or Eid Al-Adha.
        </p>
      </motion.section>

      <div className="mt-2">
        <Button size="xl" fullWidth onClick={() => router.push('/categories')}>
          Continue
        </Button>
      </div>
    </div>
  );
}
